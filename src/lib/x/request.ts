import { $fetch } from 'ofetch'
import { LRUCache } from 'lru-cache'
import { getProcessEnv } from '../env'

/**
 * X (Twitter) profile page fetcher.
 *
 * x.com renders the latest ~5 tweets of a profile server-side for SEO, with
 * full schema.org microdata per tweet (text, date, author, interaction counts).
 * No authentication is needed — same approach as t.me/s. Verified 2026-08:
 * HTTP 200 from both local and the production server, no login wall.
 *
 * History beyond the latest 5 is persisted incrementally by store.ts: every
 * fetch merges new tweets into a local JSON file, so over time the full
 * history accumulates without fighting X's anti-bot APIs.
 *
 * NOTE: cache is self-contained on purpose — ocache's setStorage is a global
 * singleton already owned by the Telegram layer (src/lib/cache-storage.ts);
 * wiring a second storage here would silently replace the Telegram LRU.
 */

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36'

// Bounded LRU for fetched profile HTML — keep it tiny (pages are ~90-280KB).
const cacheMax = Number(getProcessEnv('X_HTML_CACHE_MAX') ?? 16)
let _lru: LRUCache<string, string> | null = null

function getLru(): LRUCache<string, string> {
  if (!_lru) {
    _lru = new LRUCache<string, string>({
      max: cacheMax,
      ttl: 15 * 60_000,
      ttlAutopurge: true,
      ttlResolution: 0,
      perf: { now: () => Date.now() },
      sizeCalculation: (v) => v.length,
      maxSize: cacheMax * 1024 * 1024,
    })
  }
  return _lru
}

async function fetchProfileHtml(handle: string): Promise<string> {
  const url = `https://x.com/${handle}`
  try {
    return await $fetch<string, 'text'>(url, {
      headers: { 'user-agent': UA, 'accept': 'text/html' },
      responseType: 'text',
      timeout: 15000,
      retry: 2,
      retryDelay: 200,
    })
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.warn(`[diag] X ERROR ${url} ${message}`)
    throw error
  }
}

/** Fetch the profile page with a 15min in-process cache. Failures bubble up. */
export async function loadXProfileHtml(handle: string): Promise<string> {
  const lru = getLru()
  const cached = lru.get(handle)
  if (cached !== undefined) {
    return cached
  }
  const html = await fetchProfileHtml(handle)
  lru.set(handle, html)
  return html
}
