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

  const results = await Promise.allSettled([
    getTelegramChannelInfo(params),
    hasXAccount ? getXChannelInfo(params) : Promise.resolve(null),
  ])

  const telegram = results[0].status === 'fulfilled' ? results[0].value : null
  const x = results[1].status === 'fulfilled' ? results[1].value : null

  if (!telegram) {
    // Telegram is the primary source — if it fails, propagate the error
    const err = results[0].status === 'rejected' ? results[0].reason : new Error('Telegram returned null')
    throw err
  }

  if (results[1].status === 'rejected') {
    console.error('Failed to fetch X channel info:', results[1].reason)
  }

  return mergeChannels(telegram, x)
}

export async function getChannelPost(id: string): Promise<Post> {
  if (id.startsWith(X_ID_PREFIX)) {
    try {
      return await getXChannelPost(id)
    } catch (err) {
      console.error('Failed to fetch X post:', err)
      throw err
    }
  }
  return getTelegramChannelPost(id)
}
