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
import { getPageCacheStats } from './page-cache'

function enabled(name: string): boolean {
  const v = (Reflect.get(globalThis, 'process') as { env?: Record<string, string> } | undefined)?.env?.[name]
  return v === '1' || v === 'true'
}

function ts(): string {
  return new Date().toISOString().slice(11, 19) // HH:MM:SS, matches existing log timestamps
}

// Telegram fetch accounting for the periodic summary line. Successful fetches
// are NOT logged per-line anymore — that was 90%+ of TELEGRAM log volume with
// near-zero diagnostic value. Instead they accumulate here and are reported as
// one aggregated line per window. Errors and slow fetches still log
// immediately; those are the lines that actually help troubleshooting.
const TELEGRAM_SLOW_MS = 3000 // normal t.me fetches are ~200-700ms; 3s+ is degraded
const TELEGRAM_SUMMARY_MS = 5 * 60_000 // emit one summary line per 5min window
let _tgCount = 0
let _tgErrors = 0
let _tgSlow = 0
let _tgMsSum = 0
let _tgMsMax = 0
let _tgLastSummary = 0

function maybeTelegramSummary(): void {
  const now = Date.now()
  if (now - _tgLastSummary < TELEGRAM_SUMMARY_MS) return
  _tgLastSummary = now
  if (!_tgCount) return
  const avg = Math.round(_tgMsSum / _tgCount)
  const stats = getCacheStats()
  const mb = (stats.estimatedBytes / 1024 / 1024).toFixed(1)
  console.log(`[diag] ${ts()} TELEGRAM summary fetch=${_tgCount} err=${_tgErrors} slow=${_tgSlow} avg=${avg}ms max=${_tgMsMax}ms cache=${stats.size}/${stats.max} ${mb}MB`)
  _tgCount = 0
  _tgErrors = 0
  _tgSlow = 0
  _tgMsSum = 0
  _tgMsMax = 0
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
    const ms = info.ms ?? 0

    // Errors always log immediately — this is the troubleshooting channel.
    if (info.error) {
      _tgErrors++
      console.warn(`[diag] ${ts()} TELEGRAM ERROR ${info.url} ${info.error} (${ms}ms)`)
      maybeTelegramSummary()
      return
    }

    // Success: accumulate for the periodic summary instead of logging a line.
    // A successful fetch is not actionable by itself; only the aggregate
    // (volume, error rate, avg/max latency) tells us if t.me is degrading.
    _tgCount++
    _tgMsSum += ms
    if (ms > _tgMsMax) _tgMsMax = ms
    // Still surface unusually slow fetches individually: 3s+ on a ~200-700ms
    // path usually means the proxy/egress is degrading even before it fails.
    if (ms >= TELEGRAM_SLOW_MS) {
      _tgSlow++
      console.warn(`[diag] ${ts()} TELEGRAM SLOW ${info.url} HTTP ${info.status} (${ms}ms)`)
    }
    maybeTelegramSummary()
  },

  /** Periodic snapshot of Telegram HTML cache + full-page cache occupancy. Only emits when DIAG_CACHE_STATS=1. */
  logCacheStats(): void {
    if (!diag.cacheStats) return
    const tg = getCacheStats()
    // Estimated bytes derived from lru-cache's sizeCalculation (sum of
    // stored value string lengths). `max` is the configured TELEGRAM_HTML_CACHE_MAX.
    const tgMb = (tg.estimatedBytes / 1024 / 1024).toFixed(1)
    const page = getPageCacheStats()
    const pageMb = (page.estimatedBytes / 1024 / 1024).toFixed(1)
    console.log(`[diag] ${ts()} CACHE stats telegram=${tg.size}/${tg.max} ${tgMb}MB page=${page.size}/${page.max} ${pageMb}MB`)
  },
}
