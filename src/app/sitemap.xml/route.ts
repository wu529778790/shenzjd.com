import { getChannelInfo } from '../../lib/sources'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const channel = await getChannelInfo()
  const posts = channel.posts || []

  const pageSize = 20
  let count = +posts[0]?.id

  const pages: number[] = []
  pages.push(count)
  while (count > pageSize) {
    count -= pageSize
    pages.push(count)
  }

  const sitemaps = pages.map(page => `
<sitemap>
  <loc>${url.origin}/sitemap/${page}.xml</loc>
</sitemap>`).join('')

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemaps}
</sitemapindex>`, {
    headers: { 'Content-Type': 'application/xml' },
  })
}
