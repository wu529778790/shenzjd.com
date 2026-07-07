import { defineMiddleware } from 'astro:middleware'

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

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.SITE_URL = `${import.meta.env.SITE ?? ''}${import.meta.env.BASE_URL}`
  context.locals.RSS_URL = `${context.locals.SITE_URL}rss.xml`
  context.locals.RSS_PREFIX = ''

  const querySearch = context.url.searchParams.get('q') || ''
  const legacyTagSearch = getEncodedTagSearchQuery(context.url.pathname)
  const pathSearch = context.params.q || ''
  const searchQuery = querySearch || legacyTagSearch || pathSearch

  if (context.url.pathname.startsWith('/search') && searchQuery.startsWith('#')) {
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
      headers.set('Cache-Control', 'public, max-age=300, s-maxage=300')
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
