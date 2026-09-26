import { LRUCache } from 'lru-cache'

/**
 * 应用层全页 HTML 缓存。
 *
 * 现状：只缓存了 t.me 的原始 HTML，每次请求命中后仍要 cheerio 解析 + SSR
 * 渲染，CPU 大头（解析 + 渲染）一个都没省。本模块缓存**渲染完成后的最终
 * 页面 HTML**：命中直接返回，抓取/解析/渲染全部跳过。
 *
 * 目标页面：/、/before/*、/after/*、/posts/*、/search/result、/tags、/links。
 * 非 HTML 路由（rss/sitemap/webmanifest/static 代理）不经过这里。
 *
 * TTL 5 分钟与现有 Cache-Control max-age=300 一致；缓存满按字节淘汰。
 * 单页 ~50-200KB，64 条上限 ≈ 3-13MB，内存开销远小于收益。
 */
export interface CachedPageResponse {
  status: number
  statusText: string
  headers: [string, string][]
  body: string
}

// 可调：PAGE_CACHE_MAX 条目数、PAGE_CACHE_TTL 秒。默认 64 条 / 300s。
const pageEnv = (Reflect.get(globalThis, 'process') as { env?: Record<string, string | undefined> } | undefined)?.env
const pageCacheMax = Number(pageEnv?.PAGE_CACHE_MAX ?? 64)
const pageCacheTtlMs = (Number(pageEnv?.PAGE_CACHE_TTL ?? 300)) * 1000
// 单页字节上限兜底（~1MB/条），防止极端大页面撑爆堆。
const pageCacheMaxBytes = pageCacheMax * 1024 * 1024

let _pageCache: LRUCache<string, CachedPageResponse> | null = null

function getPageCache(): LRUCache<string, CachedPageResponse> {
  if (!_pageCache) {
    _pageCache = new LRUCache<string, CachedPageResponse>({
      max: pageCacheMax,
      ttl: pageCacheTtlMs,
      ttlAutopurge: true,
      // Disable lru-cache's 1s perf debounce so TTL checks read a fresh
      // timestamp on every access (real-time eviction; the per-read cost is
      // negligible at our volume).
      ttlResolution: 0,
      // Drive TTL checks from Date.now() instead of performance.now(): ms
      // precision is plenty for a 5-minute TTL, and it keeps the cache
      // deterministic under test (fake timers fake Date reliably).
      perf: { now: () => Date.now() },
      sizeCalculation: v => v.body.length,
      maxSize: pageCacheMaxBytes,
    })
  }
  return _pageCache
}

export function getCachedPage(key: string): CachedPageResponse | undefined {
  return getPageCache().get(key)
}

// --- Stale layer (stale-while-revalidate) ----------------------------------
// 过期条目不立即丢弃，而是挪进第二个更长 TTL 的 LRU。新鲜缓存 miss 时若
// stale 层还有旧值，中间件可以先返回旧页（用户零等待），再在后台触发一次
// 自请求重新渲染。stale 窗口默认 1h，可调 PAGE_CACHE_STALE_TTL（秒）。
const staleTtlMs = (Number(pageEnv?.PAGE_CACHE_STALE_TTL ?? 3600)) * 1000

let _staleCache: LRUCache<string, CachedPageResponse> | null = null

function getStaleCache(): LRUCache<string, CachedPageResponse> {
  if (!_staleCache) {
    _staleCache = new LRUCache<string, CachedPageResponse>({
      max: pageCacheMax,
      ttl: staleTtlMs,
      ttlAutopurge: true,
      ttlResolution: 0,
      perf: { now: () => Date.now() },
      sizeCalculation: v => v.body.length,
      maxSize: pageCacheMaxBytes,
    })
  }
  return _staleCache
}

/** 新鲜缓存 miss 时的兜底读取：返回过期但仍在 stale 窗口内的旧页。 */
export function getStalePage(key: string): CachedPageResponse | undefined {
  return getStaleCache().get(key)
}

export function setCachedPage(key: string, value: CachedPageResponse, ttlMs?: number): void {
  // Per-entry TTL override (e.g. posts 1h, pagination 1d); falls back to the
  // cache-wide default when omitted.
  const effectiveTtlMs = ttlMs && ttlMs > 0 ? ttlMs : pageCacheTtlMs
  getPageCache().set(key, value, { ttl: effectiveTtlMs })
  // stale 层比新鲜层多活一个 stale 窗口，作为 SWR 的旧页来源。
  getStaleCache().set(key, value, { ttl: effectiveTtlMs + staleTtlMs })
}

export interface PageCacheStats {
  size: number
  max: number
  estimatedBytes: number
}

/** 供 diag 输出占用，观察缓存是否健康。未初始化时返回零值。 */
export function getPageCacheStats(): PageCacheStats {
  const cache = _pageCache
  if (!cache) {
    return { size: 0, max: 0, estimatedBytes: 0 }
  }
  return {
    size: cache.size,
    max: cache.max,
    estimatedBytes: cache.calculatedSize ?? 0,
  }
}
