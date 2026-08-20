import type { ChannelInfo, GetChannelInfoParams, Post } from '../../types'
import type { RequestContext } from './types'
import { getXPosts } from '../x'
import { modifyHTMLContent } from './content'
import { extractPost } from './parse'
import { loadChannelDocument } from './request'
import { normalizeUrlAttribute } from './url'

export function isRenderablePost(post: Post | null | undefined): post is Post {
  return Boolean(post?.id && post.type === 'text' && post.content)
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
    avatar: avatar ? normalizeUrlAttribute(avatar) : avatar,
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
