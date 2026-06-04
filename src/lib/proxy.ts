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

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT)

  try {
    const response = await fetch(target.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: controller.signal,
    })

    const headers = new Headers(response.headers)
    headers.set('Cache-Control', 'public, max-age=604800, s-maxage=604800')
    headers.delete('set-cookie')

    return new Response(response.body, { status: response.status, headers })
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
