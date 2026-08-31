import type { APIRoute } from 'astro'
import { getChannelInfo } from '../../lib/telegram'
import { absolutizeMediaUrls } from '../../lib/feed'
import { sanitizeFeedHtml } from '../../lib/sanitize'

/**
 * 小程序 / 第三方消费方专用的文章列表接口。
 *
 * 返回轻量列表（不含正文全文），支持 before / after 游标分页与 q 搜索，
 * 与站点分页逻辑保持一致。图片等媒体统一输出为绝对 URL。
 */
export const GET: APIRoute = async (context) => {
  const before = context.url.searchParams.get('before') ?? undefined
  const after = context.url.searchParams.get('after') ?? undefined
  const q = context.url.searchParams.get('q') ?? undefined

  const channel = await getChannelInfo(context, { before, after, q })
  const siteUrl = new URL(context.locals.SITE_URL, context.url.origin)
  siteUrl.search = ''

  const posts = channel.posts.map((post) => ({
    id: post.id,
    title: post.title,
    type: post.type,
    datetime: post.datetime,
    tags: post.tags,
    text: post.text,
    description: post.description,
    sourceUrl: post.sourceUrl,
    url: new URL(`posts/${post.id}`, siteUrl).toString(),
  }))

  return new Response(JSON.stringify({
    title: channel.title,
    description: channel.description,
    avatar: channel.avatar ? absolutizeMediaUrls(`<img src="${channel.avatar}" />`, siteUrl).match(/src="([^"]+)"/)?.[1] : undefined,
    posts,
  }), {
    headers: {
      'Cache-Control': 'public, max-age=300',
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}