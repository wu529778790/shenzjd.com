import { setStorage, type StorageInterface } from 'ocache'
import { LRUCache } from 'lru-cache'

/**
 * ocache storage shape (StorageInterface): get returns T|null|Promise<T|null>,
 * set takes (key, value, { ttl? }) with ttl in seconds.
 *
 * Each stored entry is the ocache record { value, mtime?, integrity?, stale?, expires? }.
 * We keep the LRU small: cached Telegram HTML pages are large (hundreds of KB each),
 * so ocache's default unbounded Map is what blew the heap (see OOM incidents in data/).
 */
interface CacheEntry {
  value: unknown
  mtime?: number
  integrity?: string
  stale?: boolean
  expires?: number
  [key: string]: unknown
}

export interface CacheStats {
  /** Number of entries currently in the LRU. */
  size: number
  /** Configured maximum entry count. */
  max: number
  /** Estimated byte size of all stored values (sum of string lengths). */
  estimatedBytes: number
}

// Module-level pointer so diag / stats consumers can read LRU occupancy.
let _lru: LRUCache<string, CacheEntry> | null = null

/**
 * Live stats for the Telegram HTML cache. Used by diag logging to expose
 * occupancy in production without pulling in a full metrics library. Returns
 * zeroes if installLruCache() has not yet been called (e.g. in some test
 * paths that bypass module init).
 */
export function getCacheStats(): CacheStats {
  if (!_lru) {
    return { size: 0, max: 0, estimatedBytes: 0 }
  }
  return {
    size: _lru.size,
    max: _lru.max,
    estimatedBytes: _lru.calculatedSize ?? 0,
  }
}

export function createLruStorage(maxEntries: number): StorageInterface {
  const lru = new LRUCache<string, CacheEntry>({
    max: maxEntries,
    // ocache owns correctness; we just evict by count.
    // ttl on set() keeps entries fresh enough for the memory bound to hold.
    ttlAutopurge: false,
    // Track byte size so we can bound by memory, not just entry count.
    // The dominant cost is the stored string value; metadata fields are tiny.
    sizeCalculation(entry) {
      const v = entry.value
      if (typeof v === 'string') return v.length
      return 1
    },
    // ~1MB per entry soft cap → totals ~maxEntries MB. Acts as a backstop so
    // a burst of unusually large pages cannot exceed the heap budget.
    maxSize: maxEntries * 1024 * 1024,
    size: 0,
  })
  _lru = lru

  return {
    get<T = CacheEntry>(key: string): T | null {
      const entry = lru.get(key) as T | undefined
      if (!entry) return null
      // Honor absolute expiry if ocache stamped one.
      const expires = (entry as CacheEntry).expires
      if (expires && Date.now() > expires) {
        lru.delete(key)
        return null
      }
      return entry
    },
    set<T = CacheEntry>(key: string, value: T | null | undefined, opts?: { ttl?: number }): void {
      if (value === null || value === undefined) {
        lru.delete(key)
        return
      }
      const entry = value as CacheEntry
      // ocache passes ttl in seconds; lru-cache accepts ms.
      if (opts?.ttl) {
        lru.set(key, entry, { ttl: opts.ttl * 1000 })
      } else {
        lru.set(key, entry)
      }
    },
  }
}

/**
 * Swap ocache's default unbounded Map for a bounded LRU.
 * Call once at module load, before any defineCachedFunction runs.
 *
 * Max entries is tunable via TELEGRAM_HTML_CACHE_MAX env so it can be adjusted
 * without a rebuild. Default 2048: at ~300KB/page that's ~600MB of HTML,
 * appropriate for containers with 1-2GB heap. Lower if your host is smaller.
 */
export function installLruCache(maxEntries = 2048): void {
  setStorage(createLruStorage(maxEntries))
}
