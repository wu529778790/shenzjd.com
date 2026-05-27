import { getChannelInfo } from '../../lib/sources'
import { getEnv } from '../../lib/env'
import sanitizeHtml from 'sanitize-html'

export async function GET(request: Request) {
  const siteUrl = getEnv('SITE_URL') ?? '/'
  const requestUrl = new URL(request.url)
  const tag = requestUrl.searchParams.get('tag')
  const rssBeautify = getEnv('RSS_BEAUTIFY')
  const channel = await getChannelInfo({ q: tag ? `#${tag}` : '' })
  const posts = channel.posts ?? []

  const baseUrl = siteUrl.startsWith('http') ? siteUrl : new URL(siteUrl, requestUrl.origin).toString()

  const items = posts.map(item => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${baseUrl}posts/${item.id}</link>
      <description><![CDATA[${sanitizeHtml(item.content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'video', 'audio']),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          video: ['src', 'width', 'height', 'poster'],
          audio: ['src', 'controls'],
          img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading', 'class'],
        },
        exclusiveFilter(frame) {
          return frame.tag === 'img' && frame.attribs.class?.includes('modal-img')
        },
      })}]]></description>
      <pubDate>${new Date(item.datetime).toUTCString()}</pubDate>
      <guid isPermaLink="false">${item.id}</guid>
    </item>`).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${tag ? `${tag} | ` : ''}${channel.title}</title>
    <description>${channel.description}</description>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}rss.xml${tag ? `?tag=${encodeURIComponent(tag)}` : ''}" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'text/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
