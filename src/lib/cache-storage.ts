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

export function createLruStorage(maxEntries: number): StorageInterface {
  const lru = new LRUCache<string, CacheEntry>({
    max: maxEntries,
    // ocache owns correctness; we just evict by count.
    // ttl on set() keeps entries fresh enough for the memory bound to hold.
    ttlAutopurge: false,
  })

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
 * without a rebuild. Default 128 is conservative: at ~300KB/page that's ~40MB
 * of HTML, well within the 256MB heap alongside the rest of the app.
 */
export function installLruCache(maxEntries = 128): void {
  setStorage(createLruStorage(maxEntries))
}
