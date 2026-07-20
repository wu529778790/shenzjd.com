import type { APIRoute } from 'astro'
import { getSitemapUrl, resolveSiteUrl } from '../../lib/seo'
import { getChannelInfo } from '../../lib/telegram'
import { computeSitemapETag, isSitemapNotModified, sitemap304 } from '../../lib/sitemap-response'

export const GET: APIRoute = async (Astro) => {
  const siteUrl = resolveSiteUrl(Astro.locals.SITE_URL, Astro.url.origin)
  const channel = await getChannelInfo(Astro, {
    before: Astro.params.cursor,
  })
  const posts = channel.posts || []

  // ETag: cursor + every post id in order. Any edit to a post's id order
  // (i.e. a new post pushing an old one out of this page) busts the tag.
  const etag = computeSitemapETag([
    Astro.params.cursor,
    ...posts.map(p => p.id),
  ])
  if (isSitemapNotModified(Astro.request, etag)) {
    return sitemap304()
  }

  const xmlUrls = posts.map(post => `
    <url>
      <loc>${getSitemapUrl(siteUrl, `posts/${post.id}`)}</loc>
      <lastmod>${new Date(post.datetime).toISOString()}</lastmod>
    </url>
  `).join('')

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${xmlUrls}
</urlset>`, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'application/xml',
      'ETag': etag,
    },
  })
}
