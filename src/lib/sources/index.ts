import type { ChannelInfo, GetChannelInfoParams, Post } from '../../types'
import { getChannelInfo as getTelegramChannelInfo, getChannelPost as getTelegramChannelPost } from './telegram'

export type { ChannelInfo, GetChannelInfoParams, Post }

export async function getChannelInfo(params: GetChannelInfoParams = {}): Promise<ChannelInfo> {
  return getTelegramChannelInfo(params)
}

export async function getChannelPost(id: string): Promise<Post> {
  return getTelegramChannelPost(id)
}
