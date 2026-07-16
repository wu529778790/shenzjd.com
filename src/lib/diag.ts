/**
 * Lightweight diagnostic logging for production troubleshooting.
 * Toggle via env:
 *   DIAG_ACCESS=1       -> one line per inbound request (method, path, UA, IP)
 *   DIAG_TELEGRAM=1     -> telegram fetch: cache hit/miss, status, error type, duration
 *
 * Kept separate from ad-hoc console.* so each channel can be enabled
 * independently and the format stays consistent ("[diag] ...").
 */

function enabled(name: string): boolean {
  const v = (Reflect.get(globalThis, 'process') as { env?: Record<string, string> } | undefined)?.env?.[name]
  return v === '1' || v === 'true'
}

function ts(): string {
  return new Date().toISOString().slice(11, 19) // HH:MM:SS, matches existing log timestamps
}

export const diag = {
  access: enabled('DIAG_ACCESS'),
  telegram: enabled('DIAG_TELEGRAM'),

  /** One line per inbound HTTP request. */
  logAccess(info: { method: string; path: string; ua: string; ip: string }): void {
    if (!diag.access) return
    const ua = info.ua.slice(0, 80)
    console.log(`[diag] ${ts()} ACCESS ${info.method} ${info.path} ip=${info.ip} ua="${ua}"`)
  },

  /** Telegram fetch lifecycle: issue (cache miss), ok, or fail. */
  logTelegram(info: {
    cache: 'hit' | 'miss'
    url: string
    status?: number
    ms?: number
    error?: string
  }): void {
    if (!diag.telegram) return
    const base = `[diag] ${ts()} TELEGRAM cache=${info.cache} url=${info.url}`
    if (info.error) {
      console.warn(`${base} ERROR ${info.error} (${info.ms}ms)`)
    } else {
      console.log(`${base} HTTP ${info.status} (${info.ms}ms)`)
    }
  },
}
