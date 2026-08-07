/**
 * Lightweight diagnostic logging for production troubleshooting.
 * Toggle via env:
 *   DIAG_TELEGRAM=1    -> telegram fetch: cache hit/miss, status, error type, duration
 *   DIAG_CACHE_STATS=1 -> emit Telegram HTML cache occupancy stats opportunistically
 *
 * Per-request ACCESS logging was removed entirely (was ~70k lines / 10MB per
 * day of crawler/scanner/sitemap noise) and is NOT env-gated: a stray
 * DIAG_ACCESS=1 in the server .env can never re-inflate the log. If you ever
 * need per-request logs again, add them deliberately in middleware.
 *
 * Kept separate from ad-hoc console.* so each channel can be enabled
 * independently and the format stays consistent ("[diag] ...").
 */

import { getCacheStats } from './cache-storage'

function enabled(name: string): boolean {
  const v = (Reflect.get(globalThis, 'process') as { env?: Record<string, string> } | undefined)?.env?.[name]
  return v === '1' || v === 'true'
}

function ts(): string {
  return new Date().toISOString().slice(11, 19) // HH:MM:SS, matches existing log timestamps
}

// Per-URL throttle for successful TELEGRAM lines. A single hot URL (the
// channel main page, /s/<channel>) can be fetched thousands of times a day
// when the LRU evicts it under heavy traffic — logging every miss drowns the
// log with identical lines. Errors always log; successful misses are capped
// to one line per URL per window.
const TELEGRAM_THROTTLE_MS = 60_000 // 1 min
const _lastTelegramLog = new Map<string, number>()

function throttleTelegram(url: string): boolean {
  const now = Date.now()
  const last = _lastTelegramLog.get(url)
  if (last !== undefined && now - last < TELEGRAM_THROTTLE_MS) {
    return false
  }
  _lastTelegramLog.set(url, now)
  // Opportunistic cleanup: entries older than 2 windows are stale; drop them
  // to keep the map bounded (URL set is small, but be safe on long runs).
  if (_lastTelegramLog.size > 5000) {
    for (const [u, t] of _lastTelegramLog) {
      if (now - t > TELEGRAM_THROTTLE_MS * 2) _lastTelegramLog.delete(u)
    }
  }
  return true
}

export const diag = {
  telegram: enabled('DIAG_TELEGRAM'),
  cacheStats: enabled('DIAG_CACHE_STATS'),

  /** Telegram fetch lifecycle: issue (cache miss), ok, or fail. */
  logTelegram(info: {
    cache: 'hit' | 'miss'
    url: string
    status?: number
    ms?: number
    error?: string
  }): void {
    if (!diag.telegram) return
    // Errors always log; successful misses are throttled per URL so a hot URL
    // that keeps getting evicted from the LRU can't flood the log.
    if (!info.error && !throttleTelegram(info.url)) return
    const base = `[diag] ${ts()} TELEGRAM cache=${info.cache} url=${info.url}`
    if (info.error) {
      console.warn(`${base} ERROR ${info.error} (${info.ms}ms)`)
    } else {
      console.log(`${base} HTTP ${info.status} (${info.ms}ms)`)
    }
  },

  /** Periodic snapshot of Telegram HTML cache occupancy. Only emits when DIAG_CACHE_STATS=1. */
  logCacheStats(): void {
    if (!diag.cacheStats) return
    const stats = getCacheStats()
    // Estimated bytes derived from lru-cache's sizeCalculation (sum of
    // stored value string lengths). `max` is the configured TELEGRAM_HTML_CACHE_MAX.
    const mb = (stats.estimatedBytes / 1024 / 1024).toFixed(1)
    console.log(`[diag] ${ts()} CACHE stats size=${stats.size}/${stats.max} bytes=${mb}MB`)
  },
}
