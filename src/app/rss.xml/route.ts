import { getChannelInfo } from '../../lib/sources'
import { getEnv } from '../../lib/env'

const LOCALE = getEnv('LOCALE') ?? 'en'

function getOrigin(request: Request): string {
  const siteUrl = getEnv('SITE_URL')
  if (siteUrl) return siteUrl
  const host = request.headers.get('host')
  if (host) return `https://${host}`
  return '/'
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET(request: Request) {
  const origin = getOrigin(request)
  const channel = await getChannelInfo()
  const posts = channel.posts || []

  const items = posts.map(post => {
    const pubDate = new Date(post.datetime).toUTCString()
    const description = post.description || post.text || ''
    const link = `${origin}/posts/${post.id}`

    return `    <item>
      <title>${escapeXml(post.title || channel.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`
  }).join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(channel.title)}</title>
    <link>${origin}</link>
    <description>${escapeXml(channel.description)}</description>
    <language>${LOCALE}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${origin}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(rss, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
