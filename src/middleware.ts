import { defineMiddleware } from 'astro:middleware'
import { LRUCache } from 'lru-cache'
import { diag } from './lib/diag'
import { getCachedPage, setCachedPage } from './lib/page-cache'

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

// --- Full-page HTML cache -------------------------------------------------
// Every HTML page the origin serves is rendered from t.me data. Without an
// app-level cache of the *final* HTML, every request re-parses (cheerio) and
// re-renders (SSR) even when the raw t.me HTML is cached — that parse+render
// is the CPU hotspot. Caching the finished page makes repeat hits (real users
// within TTL, crawlers re-crawling the same URL, pagination walks) free.
//
// Only GET page routes are cached; rss/sitemap/webmanifest/static proxy stay
// dynamic. Key = pathname + q (search pages render differently per query).

const CACHEABLE_PREFIXES = ['/before/', '/after/', '/posts/', '/search/result', '/tags', '/links']

export function getPageCacheKey(request: Request, url: URL): string | null {
  if (request.method !== 'GET') return null
  const { pathname } = url
  const isPage = pathname === '/' || CACHEABLE_PREFIXES.some(p => pathname === p || pathname.startsWith(p))
  if (!isPage) return null
  // Ignore scanner junk like ?golink=... which does not change rendering.
  const q = url.searchParams.get('q')
  return q ? `${pathname}?q=${q}` : pathname
}

// --- Crawler burst protection ----------------------------------------------
// robots.txt can't stop the crawlers that actually hammer /posts/N: Meta's
// crawler (2a03:2880::/32) deep-walks thousands of distinct post IDs per day,
// Semrush and friends ignore robots too. Each distinct ID is a fresh page-cache
// miss (too many keys for the LRU), so an uncontrolled crawl re-renders + (on
// t.me cache miss) re-fetches for every ID. Throttle known-bot UAs that are
// hammering /posts/ to a 60s window cap; over-limit gets a cheap 429.
const BOT_BURST = new LRUCache<string, number[]>({ max: 1024, ttl: 60_000, ttlAutopurge: true })
const BOT_BURST_LIMIT = 40 // /posts/ requests per bot per 60s window

export function isPostsBotBurst(request: Request, pathname: string): boolean {
  if (!pathname.startsWith('/posts/')) return false
  const ua = request.headers.get('user-agent') ?? ''
  if (!isBot(ua)) return false
  const now = Date.now()
  const key = ua.slice(0, 48)
  const hits = (BOT_BURST.get(key) ?? []).filter(t => now - t < 60_000)
  hits.push(now)
  BOT_BURST.set(key, hits)
  return hits.length > BOT_BURST_LIMIT
}

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname

  // Drop known-bad scanner traffic before any other work. 444 = close without
  // reply; the client sees a connection reset, which is cheaper than a 404
  // (no response body, no Astro rendering, no cache lookup).
  if (isScanProbe(pathname)) {
    return new Response(null, { status: 444 })
  }

  // Opportunistic periodic cache stats snapshot — also helps avoid
  // single-tick timer drift on long-running Node processes.
  if (diag.cacheStats && ++_reqCount % CACHE_STATS_INTERVAL === 0) {
    diag.logCacheStats()
  }

  // Throttle bot deep-crawls of /posts/ before any rendering happens.
  if (isPostsBotBurst(context.request, pathname)) {
    return new Response(null, {
      status: 429,
      headers: { 'Retry-After': '60' },
    })
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

  // Full-page cache: hit = skip fetch + parse + render entirely.
  const pageCacheKey = getPageCacheKey(context.request, context.url)
  if (pageCacheKey) {
    const cached = getCachedPage(pageCacheKey)
    if (cached) {
      const headers = new Headers(cached.headers)
      headers.set('X-Page-Cache', 'HIT')
      return new Response(cached.body, {
        status: cached.status,
        statusText: cached.statusText,
        headers,
      })
    }
  }

  const response = legacyTagSearch
    ? await context.rewrite(`/search/result?q=${encodeURIComponent(legacyTagSearch)}`)
    : await next()

  let finalResponse = response
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
      // Pagination pages (/before/N, /after/N) are noindexed and their
      // content barely changes (historical message ranges). Cache them at the
      // edge for a day so repeat visits — including crawlers that paged
      // through hundreds of cursors — never hit the origin or re-fetch t.me.
      const isPagination = pathname.startsWith('/before/') || pathname.startsWith('/after/')
      // Post pages (/posts/N) reference one immutable Telegram message, so the
      // rendered HTML only changes with reactions — cache at the edge for 1h.
      // Without this, crawlers deep-crawling thousands of distinct post IDs
      // each miss the 512-entry LRU (too many distinct keys) and every crawl
      // re-fetches t.me (~11k/day measured).
      const isPost = pathname.startsWith('/posts/')
      // Bots re-crawl the same URL many times per day; give them a longer
      // edge cache so the CDN absorbs the repeat hits instead of the origin.
      const maxAge = isPagination ? 86_400 : isPost ? 3600 : isBot(ua) ? 7200 : 300
      headers.set('Cache-Control', `public, max-age=${maxAge}, s-maxage=${maxAge}`)
      mutated = true
    }

    if (mutated) {
      finalResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    }
  }

  // Store the fully-rendered page (with final headers) so the next hit skips
  // fetch + parse + render. Only successful, unconsumed HTML pages are cached.
  if (
    pageCacheKey
    && !finalResponse.bodyUsed
    && isHtmlResponse(finalResponse)
    && finalResponse.status >= 200
    && finalResponse.status < 400
  ) {
    const body = await finalResponse.text()
    setCachedPage(pageCacheKey, {
      status: finalResponse.status,
      statusText: finalResponse.statusText,
      headers: [...finalResponse.headers],
      body,
    })
    return new Response(body, {
      status: finalResponse.status,
      statusText: finalResponse.statusText,
      headers: finalResponse.headers,
    })
  }

  return finalResponse
})
