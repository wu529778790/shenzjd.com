import { getChannelInfo } from '../../lib/sources'
import { getEnv } from '../../lib/env'

export async function GET(request: Request) {
  const siteUrl = getEnv('SITE_URL') ?? '/'
  const requestUrl = new URL(request.url)
  const tag = requestUrl.searchParams.get('tag')
  const channel = await getChannelInfo({ q: tag ? `#${tag}` : '' })
  const posts = channel.posts ?? []

  const baseUrl = siteUrl.startsWith('http') ? siteUrl : new URL(siteUrl, requestUrl.origin).toString()

  return Response.json({
    version: 'https://jsonfeed.org/version/1.1',
    title: `${tag ? `${tag} | ` : ''}${channel.title}`,
    description: channel.description,
    home_page_url: baseUrl,
    items: posts.map(item => ({
      url: `${baseUrl}posts/${item.id}`,
      title: item.title,
      description: item.description,
      date_published: new Date(item.datetime),
      tags: item.tags,
      content_html: item.content,
    })),
  })
}
