import { describe, expect, it, vi } from 'vitest'

vi.mock('astro:middleware', () => ({
  defineMiddleware: <T>(handler: T): T => handler,
}))

const { isHtmlResponse, shouldApplyDefaultCache, getPageCacheKey, isPostsBotBurst } = await import('./middleware')

describe('middleware response header helpers', () => {
  it('applies default cache to successful responses without cache headers', () => {
    expect(shouldApplyDefaultCache(new Response('', { status: 200 }))).toBe(true)
  })

  it('applies default cache to redirects without cache headers', () => {
    expect(shouldApplyDefaultCache(new Response('', { status: 302 }))).toBe(true)
  })

  it('does not apply default cache to not found responses', () => {
    expect(shouldApplyDefaultCache(new Response('', { status: 404 }))).toBe(false)
  })

  it('does not apply default cache to upstream error responses', () => {
    expect(shouldApplyDefaultCache(new Response('', { status: 502 }))).toBe(false)
  })

  it('does not replace existing cache headers', () => {
    expect(shouldApplyDefaultCache(new Response('', {
      headers: {
        'Cache-Control': 'private, max-age=0',
      },
      status: 200,
    }))).toBe(false)
  })

  it('detects HTML responses with charset parameters', () => {
    expect(isHtmlResponse(new Response('', {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    }))).toBe(true)
  })
})

describe('getPageCacheKey', () => {
  it('caches GET page routes with a stable key', () => {
    const url = new URL('https://shenzjd.com/posts/49')
    expect(getPageCacheKey(new Request(url), url)).toBe('/posts/49')
  })

  it('caches the home page', () => {
    const url = new URL('https://shenzjd.com/')
    expect(getPageCacheKey(new Request(url), url)).toBe('/')
  })

  it('caches pagination routes', () => {
    const url = new URL('https://shenzjd.com/before/5303')
    expect(getPageCacheKey(new Request(url), url)).toBe('/before/5303')
  })

  it('includes the q param for search pages', () => {
    const url = new URL('https://shenzjd.com/search/result?q=%23%E8%A7%86%E9%A2%91')
    expect(getPageCacheKey(new Request(url), url)).toBe('/search/result?q=#视频')
  })

  it('ignores scanner params like golink on the home page', () => {
    const url = new URL('https://shenzjd.com/?golink=aHR0cHM6Ly9mb28=')
    expect(getPageCacheKey(new Request(url), url)).toBe('/')
  })

  it('does not cache non-page routes (rss, static proxy, webmanifest)', () => {
    for (const p of ['/rss.xml', '/sitemap.xml', '/static/foo.jpg', '/site.webmanifest', '/rules/prefetch.json']) {
      const url = new URL(`https://shenzjd.com${p}`)
      expect(getPageCacheKey(new Request(url), url)).toBeNull()
    }
  })

  it('does not cache non-GET requests', () => {
    const url = new URL('https://shenzjd.com/')
    expect(getPageCacheKey(new Request(url, { method: 'POST' }), url)).toBeNull()
  })
})

describe('isPostsBotBurst', () => {
  it('allows real user agents on /posts/', () => {
    const req = new Request('https://shenzjd.com/posts/49', {
      headers: { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
    })
    expect(isPostsBotBurst(req, '/posts/49')).toBe(false)
  })

  it('ignores non-post paths', () => {
    const req = new Request('https://shenzjd.com/', {
      headers: { 'user-agent': 'facebookexternalhit/1.1' },
    })
    expect(isPostsBotBurst(req, '/')).toBe(false)
  })

  it('throttles a bot that hammers /posts/ beyond the window cap', () => {
    const req = new Request('https://shenzjd.com/posts/49', {
      headers: { 'user-agent': 'facebookexternalhit/1.1' },
    })
    const limit = 41
    let blocked = false
    for (let i = 0; i < limit; i++) {
      blocked = isPostsBotBurst(req, '/posts/49')
    }
    expect(blocked).toBe(true)
  })
})
