import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ChannelInfo, Post } from '../../../types'

// Mock the source modules
vi.mock('../telegram', () => ({
  getChannelInfo: vi.fn(),
  getChannelPost: vi.fn(),
}))

import { getChannelInfo, getChannelPost } from '../index'
import { getChannelInfo as getTelegramChannelInfo, getChannelPost as getTelegramChannelPost } from '../telegram'

const mockTelegram = vi.mocked(getTelegramChannelInfo)
const mockTelegramPost = vi.mocked(getTelegramChannelPost)

function makePost(id: string, datetime: string, overrides?: Partial<Post>): Post {
  return {
    id,
    title: `Post ${id}`,
    type: 'text',
    datetime,
    tags: [],
    text: `Text ${id}`,
    content: `<p>Content ${id}</p>`,
    reactions: [],
    ...overrides,
  }
}

function makeChannelInfo(posts: Post[], title = 'Test Channel'): ChannelInfo {
  return {
    posts,
    title,
    description: 'Test description',
    descriptionHTML: '<p>Test description</p>',
    avatar: 'https://example.com/avatar.jpg',
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getChannelInfo', () => {
  it('returns Telegram data', async () => {
    const posts = [makePost('1', '2024-01-01T00:00:00Z')]
    mockTelegram.mockResolvedValue(makeChannelInfo(posts))

    const result = await getChannelInfo()

    expect(result.posts).toHaveLength(1)
    expect(result.posts[0].id).toBe('1')
    expect(result.title).toBe('Test Channel')
    expect(mockTelegram).toHaveBeenCalledOnce()
  })

  it('propagates error when Telegram fails', async () => {
    mockTelegram.mockRejectedValue(new Error('Telegram API down'))

    await expect(getChannelInfo()).rejects.toThrow('Telegram API down')
  })
})

describe('getChannelPost', () => {
  it('fetches Telegram post', async () => {
    const post = makePost('123', '2024-01-01T00:00:00Z')
    mockTelegramPost.mockResolvedValue(post)

    const result = await getChannelPost('123')

    expect(result.id).toBe('123')
    expect(mockTelegramPost).toHaveBeenCalledWith('123')
  })
})
