import { defineMiddleware } from 'astro:middleware'
import { LRUCache } from 'lru-cache'
import { diag } from './lib/diag'
import { getProcessEnv } from './lib/env'
import { getCachedPage, getStalePage, setCachedPage } from './lib/page-cache'

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
  if (request.method !== 'GET')
    return null
  const { pathname } = url
  const isPage = pathname === '/' || CACHEABLE_PREFIXES.some(p => pathname === p || pathname.startsWith(p))
  if (!isPage)
    return null
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
  if (!pathname.startsWith('/posts/'))
    return false
  const ua = request.headers.get('user-agent') ?? ''
  if (!isBot(ua))
    return false
  const now = Date.now()
  const key = ua.slice(0, 48)
  const hits = (BOT_BURST.get(key) ?? []).filter(t => now - t < 60_000)
  hits.push(now)
  BOT_BURST.set(key, hits)
  return hits.length > BOT_BURST_LIMIT
}

// --- Stale-while-revalidate background refresh ------------------------------
// 页面缓存过期后，第一个请求拿到旧页立即返回（零等待），同时通过本机回环
// 自请求触发一次真实渲染来回填缓存。in-flight 去重防止并发 stale 命中造成
// 渲染风暴；自请求带 PAGE_CACHE_REFRESH 头，让下一次进入中间件时跳过 stale
// 分支真正渲染（否则它会又拿一次 stale 直接返回，永远刷新不了）。
const REFRESH_UA = 'page-cache-swr/1.0'
const REFRESH_PORT = Number(getProcessEnv('PORT') ?? 4321)
const refreshInflight = new Set<string>()

export function isPageCacheRefreshRequest(request: Request): boolean {
  return request.headers.get('user-agent') === REFRESH_UA
}

function schedulePageRefresh(key: string): void {
  if (refreshInflight.has(key)) {
    return
  }
  refreshInflight.add(key)
  fetch(`http://127.0.0.1:${REFRESH_PORT}${key}`, {
    headers: { 'user-agent': REFRESH_UA },
    signal: AbortSignal.timeout(20_000),
  })
    .then((res) => {
      // 渲染与回填都发生在服务端的中间件里，这里只需把响应排掉释放连接。
      res.body?.cancel().catch(() => {})
    })
    .catch(() => {}) // 回环请求失败（重启中/端口变化）不影响已返回的 stale 响应
    .finally(() => refreshInflight.delete(key))
}

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname

  // Drop known-bad scanner traffic before any other work. 444 = close without
  // reply; the client sees a connection reset, which is cheaper than a 404
  // (no response body, no Astro rendering, no cache lookup).
  if (isScanProbe(pathname)) {
    return new Response(null, { status: 444 })
  }

  // AdSense / IAB 爬虫有时会以大小写变体请求 ads.txt（如 Ads.txt、ADS.TXT）。
  // Linux/Docker 文件系统大小写敏感，只有小写文件，统一 rewrite 到小写即可。
  if (pathname.toLowerCase() === '/ads.txt' && pathname !== '/ads.txt') {
    return context.rewrite('/ads.txt')
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

  // SITE_URL 优先级：.env 里的 SITE_URL > astro config 的 site + base > 当前请求 origin
  // .env 的 SITE_URL 是用户可信配置，强制作为绝对 URL（防 IP 泄露），
  // 末尾必须以 "/" 结尾以避免 ${SITE_URL}rss.xml 拼成 https://shenzjd.comrss.xml。
  const envSiteUrl = getProcessEnv('SITE_URL')
  const fallback = `${import.meta.env.SITE ?? ''}${import.meta.env.BASE_URL || '/'}`
  const raw = (envSiteUrl ?? (fallback || context.url.origin)).trim()
  context.locals.SITE_URL = raw.endsWith('/') ? raw : `${raw}/`
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
  const isRefreshRequest = isPageCacheRefreshRequest(context.request)
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
    // 新鲜层过期但 stale 层还在：先返回旧页，再后台重渲染回填缓存。
    // 后台自请求必须跳过 stale 分支——否则它会再拿一次旧页直接返回，
    // 永远走不到真正的渲染路径。
    if (!isRefreshRequest) {
      const stale = getStalePage(pageCacheKey)
      if (stale) {
        schedulePageRefresh(pageCacheKey)
        const headers = new Headers(stale.headers)
        headers.set('X-Page-Cache', 'STALE')
        return new Response(stale.body, {
          status: stale.status,
          statusText: stale.statusText,
          headers,
        })
      }
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
    // Per-route TTL, aligned with the Cache-Control max-age above: posts are
    // immutable (1h), pagination barely changes (1d), everything else 5min.
    const isPagination = pathname.startsWith('/before/') || pathname.startsWith('/after/')
    const isPost = pathname.startsWith('/posts/')
    const pageTtlMs = isPagination ? 86_400_000 : isPost ? 3_600_000 : undefined
    setCachedPage(pageCacheKey, {
      status: finalResponse.status,
      statusText: finalResponse.statusText,
      headers: [...finalResponse.headers],
      body,
    }, pageTtlMs)
    return new Response(body, {
      status: finalResponse.status,
      statusText: finalResponse.statusText,
      headers: finalResponse.headers,
    })
  }

  return finalResponse
})
