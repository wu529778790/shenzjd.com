import type { APIRoute } from 'astro'
import { getChannelInfo, getChannelPost } from '../../../lib/telegram'
import { absolutizeMediaUrls } from '../../../lib/feed'
import { sanitizeFeedHtml } from '../../../lib/sanitize'

/**
 * 小程序 / 第三方消费方专用的单篇文章接口。
 *
 * 返回单篇正文（已清洗的 HTML，媒体为绝对 URL），供详情页渲染。
 */
export const GET: APIRoute = async (context) => {
  const id = context.params.id

  if (!id) {
    return new Response(JSON.stringify({ error: 'missing id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
  }

  const siteUrl = new URL(context.locals.SITE_URL, context.url.origin)
  siteUrl.search = ''

  // 优先从列表缓存里找，找不到再单独抓取
  const channelInfo = await getChannelInfo(context)
  const post = channelInfo.posts.find((item) => item.id === id) ?? (await getChannelPost(context, id))

  if (!post) {
    return new Response(JSON.stringify({ error: 'not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
  }

  return new Response(JSON.stringify({
    id: post.id,
    title: post.title,
    type: post.type,
    datetime: post.datetime,
    tags: post.tags,
    text: post.text,
    description: post.description,
    sourceUrl: post.sourceUrl,
    url: new URL(`posts/${post.id}`, siteUrl).toString(),
    content_html: absolutizeMediaUrls(sanitizeFeedHtml(post.content), siteUrl),
    reactions: post.reactions,
  }), {
    headers: {
      'Cache-Control': 'public, max-age=300',
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}