import type { ChannelInfo, GetChannelInfoParams, Post } from '../../types'
import { getChannelInfo as getTelegramChannelInfo, getChannelPost as getTelegramChannelPost } from './telegram'
import { X_ID_PREFIX, getXChannelInfo, getXChannelPost } from './x'

export type { ChannelInfo, GetChannelInfoParams, Post }

function mergeChannels(telegram: ChannelInfo, x: ChannelInfo | null): ChannelInfo {
  if (!x) return telegram

  const posts = [...telegram.posts, ...x.posts]
    .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())

  return {
    posts,
    title: telegram.title,
    description: telegram.description,
    descriptionHTML: telegram.descriptionHTML,
    avatar: telegram.avatar,
  }
}

export async function getChannelInfo(params: GetChannelInfoParams = {}): Promise<ChannelInfo> {
  const hasXAccount = Boolean(process.env.X_ACCOUNT)

  const [telegram, x] = await Promise.all([
    getTelegramChannelInfo(params),
    hasXAccount ? getXChannelInfo(params).catch((err: unknown) => {
      console.error('Failed to fetch X channel info:', err)
      return null
    }) : null,
  ])

  return mergeChannels(telegram, x)
}

export async function getChannelPost(id: string): Promise<Post> {
  if (id.startsWith(X_ID_PREFIX)) {
    return getXChannelPost(id)
  }
  return getTelegramChannelPost(id)
}
