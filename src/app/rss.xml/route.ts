import { getChannelInfo } from '../../lib/sources'
import { getEnv } from '../../lib/env'

const SITE_URL = getEnv('SITE_URL') ?? '/'
const LOCALE = getEnv('LOCALE') ?? 'en'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const channel = await getChannelInfo()
  const posts = channel.posts || []

  const items = posts.map(post => {
    const pubDate = new Date(post.datetime).toUTCString()
    const description = post.description || post.text || ''
    const link = `${SITE_URL}posts/${post.id}`

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
    <link>${SITE_URL}</link>
    <description>${escapeXml(channel.description)}</description>
    <language>${LOCALE}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(rss, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
