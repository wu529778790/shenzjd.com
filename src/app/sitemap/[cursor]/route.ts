import { getChannelInfo } from '../../../lib/sources'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ cursor: string }> },
) {
  const { cursor } = await params
  const url = new URL(request.url)
  const channel = await getChannelInfo({ before: cursor })
  const posts = channel.posts || []

  const xmlUrls = posts.map(post => `
    <url>
      <loc>${url.origin}/posts/${post.id}</loc>
      <lastmod>${new Date(post.datetime).toISOString()}</lastmod>
    </url>`).join('')

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${xmlUrls}
</urlset>`, {
    headers: { 'Content-Type': 'application/xml' },
  })
}
