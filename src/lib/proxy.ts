import { LRUCache } from 'lru-cache'

const TARGET_WHITELIST = [
  't.me',
  'telegram.org',
  'telegram.me',
  'telegram.dog',
  'cdn-telegram.org',
  'telesco.pe',
  'yandex.ru',
]

const PROXY_TIMEOUT = 10_000
const CACHE_TTL = 1000 * 60 * 60 * 24 * 7 // 7 days for static assets

const cache = new LRUCache<string, { body: ArrayBuffer; headers: Headers; status: number }>({
  ttl: CACHE_TTL,
  maxSize: 50 * 1024 * 1024,
  sizeCalculation: item => item.body.byteLength,
})

export function resolveStaticProxyTarget(rawTarget: string): URL {
  const normalizedTarget = rawTarget.startsWith('//') ? `https:${rawTarget}` : rawTarget
  return new URL(normalizedTarget)
}

export function isStaticProxyWhitelisted(target: URL): boolean {
  return TARGET_WHITELIST.some(domain =>
    target.hostname === domain || target.hostname.endsWith(`.${domain}`),
  )
}

export async function createStaticProxyResponse(request: Request, rawTarget: string): Promise<Response> {
  const target = resolveStaticProxyTarget(rawTarget)
  if (!isStaticProxyWhitelisted(target)) {
    return new Response('Proxy target not allowed', { status: 403 })
  }

  const cacheKey = target.toString()
  const cached = cache.get(cacheKey)
  if (cached) {
    return new Response(cached.body, {
      status: cached.status,
      headers: cached.headers,
    })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT)

  try {
    const response = await fetch(target.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: controller.signal,
    })

    const body = await response.arrayBuffer()
    const headers = new Headers(response.headers)
    headers.set('Cache-Control', 'public, max-age=604800, s-maxage=604800')
    headers.delete('set-cookie')

    if (response.ok) {
      cache.set(cacheKey, { body, headers: new Headers(headers), status: response.status })
    }

    return new Response(body, { status: response.status, headers })
  }
  catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return new Response('Proxy timeout', { status: 504 })
    }
    throw err
  }
  finally {
    clearTimeout(timeout)
  }
}
