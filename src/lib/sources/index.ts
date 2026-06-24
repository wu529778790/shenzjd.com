import type { ChannelInfo, GetChannelInfoParams, Post } from '../../types'
import { getEnv } from '../env'
import { getChannelInfo as getTelegramChannelInfo, getChannelPost as getTelegramChannelPost } from './telegram'

export type { ChannelInfo, GetChannelInfoParams, Post }

export async function getChannelInfo(params: GetChannelInfoParams = {}): Promise<ChannelInfo> {
  return getTelegramChannelInfo(params)
}

export async function getChannelPost(id: string): Promise<Post> {
  return getTelegramChannelPost(id)
}

/**
 * Returns a minimal ChannelInfo fallback for when the upstream fetch fails.
 */
export function getEmptyChannel(): ChannelInfo {
  return {
    posts: [],
    title: getEnv('CHANNEL') ?? '',
    description: '',
    descriptionHTML: null,
    avatar: undefined,
  }
}
