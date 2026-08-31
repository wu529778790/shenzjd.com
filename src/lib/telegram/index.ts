import type { ChannelInfo, GetChannelInfoParams, Post } from '../../types'
import type { RequestContext } from './types'
import { getXPosts } from '../x'
import { modifyHTMLContent } from './content'
import { extractPost } from './parse'
import { loadChannelDocument } from './request'
import { getProxiedUrl, normalizeUrlAttribute } from './url'

// 频道互推 / 相似推荐等广告推广内容，不爬取、不展示。
// 用"标签 + 文本"双特征判断，避免只依赖标签（标签可能不完整）。
const PROMOTION_TAGS = ['频道互推', '相似推荐']
const PROMOTION_TEXT_PATTERNS = ['#频道互推', '#相似推荐', '互推入口']

export function isPromotionPost(post: Post | null | undefined): boolean {
  if (!post) {
    return false
  }
  if (post.tags.some((tag) => PROMOTION_TAGS.includes(tag))) {
    return true
  }
  const text = post.text ?? ''
  return PROMOTION_TEXT_PATTERNS.some((pattern) => text.includes(pattern))
}

export function isRenderablePost(post: Post | null | undefined): post is Post {
  return Boolean(post?.id && post.type === 'text' && post.content) && !isPromotionPost(post)
}

export async function getChannelPost(context: RequestContext, id: string): Promise<Post | null> {
  const { $, channel, staticProxy, reactionsEnabled } = await loadChannelDocument(context, { id })
  const post = await extractPost($, null, { channel, staticProxy, reactionsEnabled })

  return isRenderablePost(post) ? post : null
}

export async function getChannelInfo(context: RequestContext, params: GetChannelInfoParams = {}): Promise<ChannelInfo> {
  const { before = '', after = '', q = '' } = params
  const { $, channel, staticProxy, reactionsEnabled } = await loadChannelDocument(context, { before, after, q })
  const postNodes = $('.tgme_channel_history .tgme_widget_message_wrap').toArray()
  const avatar = $('.tgme_page_photo_image img').attr('src')
  const posts = (await Promise.all(
    postNodes.map((item, index) => extractPost($, item, { channel, staticProxy, index, reactionsEnabled })),
  ))
    .reverse()
    .filter(isRenderablePost)

  const channelInfo: ChannelInfo = {
    posts,
    title: $('.tgme_channel_info_header_title').text(),
    description: $('.tgme_channel_info_description').text(),
    descriptionHTML: (await modifyHTMLContent($, $('.tgme_channel_info_description'), { staticProxy })).html(),
    // 头像走静态代理（/static/<url>），与正文图片一致，避免消费方直接访问
    // Telegram CDN（如 cdn5.telesco.pe）因网络原因加载失败。
    avatar: avatar ? getProxiedUrl(staticProxy, avatar) : avatar,
  }

  // Home feed only (no pagination/search params): merge X tweets into a single
  // unified timeline sorted by time. Pagination stays pure Telegram — X IDs are
  // prefixed (x-handle-id) and are excluded from cursor logic in the list view.
  if (!before && !after && !q) {
    try {
      const xPosts = await getXPosts()
      if (xPosts.length > 0) {
        channelInfo.posts = [...posts, ...xPosts].sort(
          (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime(),
        )
      }
    }
    catch (error) {
      console.warn(`[diag] X merge failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return channelInfo
}
