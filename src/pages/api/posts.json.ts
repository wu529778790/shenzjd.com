import type { APIRoute } from 'astro'
import { getChannelInfo } from '../../lib/telegram'
import { absolutizeMediaUrls } from '../../lib/feed'

/** 从正文 HTML 中提取第一张图片的绝对 URL（用于列表缩略图），无图返回 undefined */
function extractFirstImage(content: string, siteUrl: URL): string | undefined {
  const absolutized = absolutizeMediaUrls(content, siteUrl)
  return absolutized.match(/<img[^>]+src="([^"]+)"/)?.[1]
}

/**
 * 小程序 / 第三方消费方专用的文章列表接口。
 *
 * 返回轻量列表（不含正文全文），支持 before / after 游标分页与 q 搜索，
 * 与站点分页逻辑保持一致。每篇附带首图缩略图（image），媒体统一为绝对 URL。
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
    image: extractFirstImage(post.content, siteUrl),
    url: new URL(`posts/${post.id}`, siteUrl).toString(),
  }))

  // 分页游标基于 Telegram 消息 ID（纯数字）。X 推文合并进首页时间线时带
  // 前缀 id（x-handle-...），不能参与游标分页，需过滤掉。
  // 与站点 list.astro 的分页逻辑保持一致：
  //   - next_before = 本页最老一条的 id，用于"上滑加载更早"
  //   - next_after  = 本页最新一条的 id，用于"下拉刷新更新"
  // 游标天然稳定：新文章发布不会导致重复或遗漏（页码分页才会）。
  const tgPosts = channel.posts.filter((post) => /^\d+$/.test(post.id))
  const nextBefore = tgPosts[tgPosts.length - 1]?.id
  const nextAfter = tgPosts[0]?.id
  const pagination = {
    // 最老一条 id > 1 才说明还有更早内容
    next_before: nextBefore && Number(nextBefore) > 1 ? nextBefore : undefined,
    next_after: nextAfter || undefined,
  }

  return new Response(JSON.stringify({
    title: channel.title,
    description: channel.description,
    avatar: channel.avatar ? absolutizeMediaUrls(`<img src="${channel.avatar}" />`, siteUrl).match(/src="([^"]+)"/)?.[1] : undefined,
    posts,
    pagination,
  }), {
    headers: {
      'Cache-Control': 'public, max-age=300',
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}