const TARGET_WHITELIST = [
  't.me',
  'telegram.org',
  'telegram.me',
  'telegram.dog',
  'cdn-telegram.org',
  'telesco.pe',
  'yandex.ru',
]

const FORWARDED_REQUEST_HEADERS = new Set([
  'accept',
  'accept-language',
  'if-modified-since',
  'if-none-match',
  'range',
  'user-agent',
])

// Files proxied from the Telegram CDN are immutable: they are keyed by a
// content hash in the path and never change. Cache aggressively at every
// layer (browser + CDN + any downstream proxy).
const STATIC_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 days

export function resolveStaticProxyTarget(rawTarget: string): URL {
  const normalizedTarget = rawTarget.startsWith('//') ? `https:${rawTarget}` : rawTarget
  return new URL(normalizedTarget)
}

export function isStaticProxyWhitelisted(target: URL): boolean {
  const isAllowedProtocol = target.protocol === 'http:' || target.protocol === 'https:'
  return isAllowedProtocol && TARGET_WHITELIST.some(domain => target.hostname === domain || target.hostname.endsWith(`.${domain}`))
}

function getForwardedRequestHeaders(request: Request): Headers {
  const headers = new Headers()

  for (const [key, value] of request.headers.entries()) {
    if (FORWARDED_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value)
    }
  }

  return headers
}

// Telegram CDN file URLs embed a content hash in the path, so the bytes are
// immutable for a given URL. If the upstream sent its own Cache-Control we
// leave it intact; otherwise we stamp a 30-day public cache so the CDN
// (Cloudflare / Vercel Edge / etc.) caches it on the edge and stops relaying
// every image back through the origin. ~65k/day of these requests piggyback
// on generic UAs that any browser / crawler profile would re-request anyway.
function withCdnCacheHeaders(response: Response): Response {
  const headers = new Headers(response.headers)
  const existing = headers.get('cache-control')
  if (!existing) {
    headers.set('Cache-Control', `public, max-age=${STATIC_TTL_SECONDS}, immutable`)
    headers.set('CDN-Cache-Control', `max-age=${STATIC_TTL_SECONDS}`)
    headers.set('Vary', 'Accept')
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
  }
  return response
}

export async function createStaticProxyResponse(request: Request, rawTarget: string): Promise<Response> {
  let target: URL

  try {
    target = resolveStaticProxyTarget(rawTarget)
  }
  catch {
    return new Response('Invalid proxy target', { status: 400 })
  }

  if (!isStaticProxyWhitelisted(target)) {
    return new Response('Proxy target not allowed', { status: 403 })
  }

  let response: Response

  try {
    response = await fetch(target.toString(), {
      headers: getForwardedRequestHeaders(request),
    })
  }
  catch {
    return new Response('Upstream fetch failed', { status: 502 })
  }

  return withCdnCacheHeaders(response)
}
