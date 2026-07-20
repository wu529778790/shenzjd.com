import type { APIRoute } from 'astro'
import { getSitemapUrl, resolveSiteUrl } from '../lib/seo'
import { getChannelInfo } from '../lib/telegram'
import { computeSitemapETag, isSitemapNotModified, sitemap304 } from '../lib/sitemap-response'

export const GET: APIRoute = async (Astro) => {
  const siteUrl = resolveSiteUrl(Astro.locals.SITE_URL, Astro.url.origin)
  const channel = await getChannelInfo(Astro)
  const posts = channel.posts || []

  const pageSize = 20
  let count = Number(posts[0]?.id)

  const pages: number[] = []
  if (Number.isFinite(count) && count > 0) {
    pages.push(count)
    while (count > pageSize) {
      count -= pageSize
      pages.push(count)
    }
  }

  // ETag: derived from highest post id + post count + page count. Any new
  // post changes `count`, which changes the tag, which busts caches.
  const etag = computeSitemapETag([count, posts.length, pages.length])
  if (isSitemapNotModified(Astro.request, etag)) {
    return sitemap304()
  }

  const sitemaps = pages.map((page) => {
    return `
<sitemap>
  <loc>${getSitemapUrl(siteUrl, `sitemap/${page}.xml`)}</loc>
</sitemap>`
  })

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemaps.join('')}
</sitemapindex>`, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'application/xml',
      'ETag': etag,
    },
  })
}
