import { getChannelInfo } from '../../lib/sources'
import { getEnv } from '../../lib/env'

function getOrigin(request: Request, url: URL): string {
  const siteUrl = getEnv('SITE_URL')
  if (siteUrl) return siteUrl

  // Derive from Host header (works behind reverse proxy / Docker / Cloudflare)
  const host = request.headers.get('host')
  if (host) {
    return `https://${host}`
  }

  return url.origin
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const origin = getOrigin(request, url)
  const TAGS = getEnv('TAGS')
  const LINKS = getEnv('LINKS')
  const channel = await getChannelInfo()
  const posts = channel.posts || []

  // Static pages
  const staticPages = ['']
  if (TAGS) staticPages.push('tags')
  if (LINKS) staticPages.push('links')

  const staticSitemaps = staticPages.map(page => `
<sitemap>
  <loc>${origin}${page ? page + '/' : ''}</loc>
</sitemap>`).join('')

  // Post sub-sitemaps
  const pageSize = 20
  let count = +posts[0]?.id

  const pages: number[] = []
  pages.push(count)
  while (count > pageSize) {
    count -= pageSize
    pages.push(count)
  }

  const postSitemaps = pages.map(page => `
<sitemap>
  <loc>${origin}/sitemap/${page}.xml</loc>
</sitemap>`).join('')

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticSitemaps}${postSitemaps}
</sitemapindex>`, {
    headers: { 'Content-Type': 'application/xml' },
  })
}
