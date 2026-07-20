import { createHash } from 'node:crypto'

/**
 * Compute an opaque ETag for a sitemap response. We hash the inputs that
 * fully determine the body (highest post id, cursor, post count) so any
 * change in content produces a different tag.
 */
export function computeSitemapETag(parts: (string | number)[]): string {
  const h = createHash('md5')
  for (const p of parts) h.update(String(p))
  return `"${h.digest('hex')}"`
}

/**
 * Compare the request's If-None-Match against our ETag. Handles strong and
 * weak validators, plus the wildcard `*`. Returns true when the client's
 * cache is still valid and we should return 304.
 */
export function isSitemapNotModified(request: Request, etag: string): boolean {
  const inm = request.headers.get('if-none-match')
  if (!inm) return false
  if (inm.trim() === '*') return true
  // Comma-separated list of ETags is allowed by the spec (rare in practice)
  for (const tag of inm.split(',')) {
    const t = tag.trim()
    if (t === etag || t === `W/${etag}`) return true
  }
  return false
}

/** A 304 response: empty body, signals client to reuse its cached copy. */
export function sitemap304(): Response {
  return new Response(null, { status: 304 })
}
