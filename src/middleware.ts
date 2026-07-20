import { defineMiddleware } from 'astro:middleware'
import { diag } from './lib/diag'

function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? ''
}

function getEncodedTagSearchQuery(pathname: string): string {
  if (!pathname.startsWith('/search/%23')) {
    return ''
  }

  try {
    return decodeURIComponent(pathname.slice('/search/'.length))
  }
  catch {
    return ''
  }
}

export function isHtmlResponse(response: Response): boolean {
  return response.headers.get('content-type')?.includes('text/html') ?? false
}

export function shouldApplyDefaultCache(response: Response): boolean {
  return response.status >= 200 && response.status < 400 && !response.headers.has('Cache-Control')
}

// Paths that only show up in vulnerability scans for long-dead WordPress
// installs. Returning 444 (Nginx-style "close connection without response")
// wastes zero bytes on the reply and zero CPU on Astro rendering. The IPs
// that hit these are never real users — they're automated wp-login / timthumb
// / xmlrpc probes that have nothing to do with this Astro site.
const DEAD_PATHS = [
  /^\/wp-(admin|content|includes)(\/|$)/,
  /^\/wp-login\.php/,
  /^\/xmlrpc\.php/,
  /timthumb\.php/,
  /eval-stdin\.php/,
  /\/env$/, // .env dump probes
  /^\/phpmyadmin(\/|$)/,
]

function isScanProbe(pathname: string): boolean {
  return DEAD_PATHS.some(re => re.test(pathname))
}

// Bots that crawl for SEO / AI training benefit from a longer edge cache
// because their requests are highly repetitive (same URL re-crawled many
// times per day). Real users get the default 5-min window.
const BOT_UA_HINTS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /ahrefs/i,
  /semrush/i,
  /gptbot/i,
  /amazonbot/i,
  /baidu/i,
  /yandex/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /curl\//i,
  /python-requests/i,
  /httpie/i,
]

function isBot(ua: string): boolean {
  return BOT_UA_HINTS.some(re => re.test(ua))
}

// Ring buffer of request timestamps used to fire periodic tasks roughly
// once per N requests without a timer (timers add event-loop overhead in
// serverless/container environments where this runs once).
let _reqCount = 0
const CACHE_STATS_INTERVAL = 250 // ~once per 250 requests

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname

  // Drop known-bad scanner traffic before any other work. 444 = close without
  // reply; the client sees a connection reset, which is cheaper than a 404
  // (no response body, no Astro rendering, no cache lookup).
  if (isScanProbe(pathname)) {
    diag.logAccess({ method: context.request.method, path: pathname, ua: context.request.headers.get('user-agent') ?? '', ip: getClientIp(context.request) })
    return new Response(null, { status: 444 })
  }

  diag.logAccess({
    method: context.request.method,
    path: pathname + context.url.search,
    ua: context.request.headers.get('user-agent') ?? '',
    ip: getClientIp(context.request),
  })

  // Opportunistic periodic cache stats snapshot — also helps avoid
  // single-tick timer drift on long-running Node processes.
  if (diag.cacheStats && ++_reqCount % CACHE_STATS_INTERVAL === 0) {
    diag.logCacheStats()
  }

  context.locals.SITE_URL = `${import.meta.env.SITE ?? ''}${import.meta.env.BASE_URL}`
  context.locals.RSS_URL = `${context.locals.SITE_URL}rss.xml`
  context.locals.RSS_PREFIX = ''

  const querySearch = context.url.searchParams.get('q') || ''
  const legacyTagSearch = getEncodedTagSearchQuery(pathname)
  const pathSearch = context.params.q || ''
  const searchQuery = querySearch || legacyTagSearch || pathSearch

  if (pathname.startsWith('/search') && searchQuery.startsWith('#')) {
    const tag = searchQuery.replace('#', '')
    context.locals.RSS_URL = `${context.locals.SITE_URL}rss.xml?tag=${encodeURIComponent(tag)}`
    context.locals.RSS_PREFIX = `${tag} | `
  }

  const response = legacyTagSearch
    ? await context.rewrite(`/search/result?q=${encodeURIComponent(legacyTagSearch)}`)
    : await next()

  if (!response.bodyUsed) {
    // Copy headers into a fresh, mutable Headers instance. On Node ≥ 22 / undici
    // the Response returned by `next()` may have immutable headers, so mutating
    // it in place throws `TypeError: immutable`. Building a new Response avoids that.
    const headers = new Headers(response.headers)
    let mutated = false

    if (isHtmlResponse(response)) {
      headers.set('Speculation-Rules', '"/rules/prefetch.json"')
      mutated = true
    }

    if (shouldApplyDefaultCache(response)) {
      const ua = context.request.headers.get('user-agent') ?? ''
      // Bots re-crawl the same URL many times per day; give them a longer
      // edge cache so the CDN absorbs the repeat hits instead of the origin.
      const maxAge = isBot(ua) ? 7200 : 300
      headers.set('Cache-Control', `public, max-age=${maxAge}, s-maxage=${maxAge}`)
      mutated = true
    }

    if (mutated) {
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    }
  }
  return response
})
