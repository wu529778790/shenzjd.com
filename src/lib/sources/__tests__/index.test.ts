import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ChannelInfo, Post } from '../../../types'

// Mock the source modules
vi.mock('../telegram', () => ({
  getChannelInfo: vi.fn(),
  getChannelPost: vi.fn(),
}))

vi.mock('../x', () => ({
  X_ID_PREFIX: 'x-',
  getXChannelInfo: vi.fn(),
  getXChannelPost: vi.fn(),
}))

import { getChannelInfo, getChannelPost } from '../index'
import { getChannelInfo as getTelegramChannelInfo, getChannelPost as getTelegramChannelPost } from '../telegram'
import { getXChannelInfo, getXChannelPost } from '../x'

const mockTelegram = vi.mocked(getTelegramChannelInfo)
const mockTelegramPost = vi.mocked(getTelegramChannelPost)
const mockX = vi.mocked(getXChannelInfo)
const mockXPost = vi.mocked(getXChannelPost)

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
  delete process.env.X_ACCOUNT
})

describe('mergeChannels', () => {
  it('returns Telegram alone when X is null', async () => {
    const posts = [makePost('1', '2024-01-01T00:00:00Z')]
    mockTelegram.mockResolvedValue(makeChannelInfo(posts))

    const result = await getChannelInfo()

    expect(result.posts).toHaveLength(1)
    expect(result.posts[0].id).toBe('1')
    expect(result.title).toBe('Test Channel')
  })

  it('merges posts from Telegram and X, sorted by datetime', async () => {
    process.env.X_ACCOUNT = 'testuser'

    const tgPosts = [makePost('tg-1', '2024-01-01T00:00:00Z')]
    const xPosts = [makePost('x-tweet1', '2024-01-02T00:00:00Z')]

    mockTelegram.mockResolvedValue(makeChannelInfo(tgPosts))
    mockX.mockResolvedValue(makeChannelInfo(xPosts, 'X Channel'))

    const result = await getChannelInfo()

    expect(result.posts).toHaveLength(2)
    // X post should come first (newer)
    expect(result.posts[0].id).toBe('x-tweet1')
    expect(result.posts[1].id).toBe('tg-1')
  })

  it('uses Telegram title/description even when X has different values', async () => {
    process.env.X_ACCOUNT = 'testuser'

    const tgPosts = [makePost('1', '2024-01-01T00:00:00Z')]
    const xPosts = [makePost('x-1', '2024-01-02T00:00:00Z')]

    mockTelegram.mockResolvedValue(makeChannelInfo(tgPosts, 'Telegram Channel'))
    mockX.mockResolvedValue(makeChannelInfo(xPosts, 'X Channel'))

    const result = await getChannelInfo()

    expect(result.title).toBe('Telegram Channel')
    expect(result.description).toBe('Test description')
  })
})

describe('getChannelInfo error isolation', () => {
  it('propagates error when Telegram fails', async () => {
    mockTelegram.mockRejectedValue(new Error('Telegram API down'))

    await expect(getChannelInfo()).rejects.toThrow('Telegram API down')
  })

  it('returns Telegram data when X fails', async () => {
    process.env.X_ACCOUNT = 'testuser'

    const posts = [makePost('1', '2024-01-01T00:00:00Z')]
    mockTelegram.mockResolvedValue(makeChannelInfo(posts))
    mockX.mockRejectedValue(new Error('X API down'))

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await getChannelInfo()

    expect(result.posts).toHaveLength(1)
    expect(result.posts[0].id).toBe('1')
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to fetch X channel info:',
      expect.any(Error),
    )

    consoleSpy.mockRestore()
  })

  it('returns Telegram data when X is not configured', async () => {
    const posts = [makePost('1', '2024-01-01T00:00:00Z')]
    mockTelegram.mockResolvedValue(makeChannelInfo(posts))

    const result = await getChannelInfo()

    expect(result.posts).toHaveLength(1)
    expect(mockX).not.toHaveBeenCalled()
  })
})

describe('getChannelPost', () => {
  it('fetches Telegram post for non-X IDs', async () => {
    const post = makePost('123', '2024-01-01T00:00:00Z')
    mockTelegramPost.mockResolvedValue(post)

    const result = await getChannelPost('123')

    expect(result.id).toBe('123')
    expect(mockTelegramPost).toHaveBeenCalledWith('123')
    expect(mockXPost).not.toHaveBeenCalled()
  })

  it('fetches X post for x- prefixed IDs', async () => {
    const post = makePost('x-tweet1', '2024-01-01T00:00:00Z')
    mockXPost.mockResolvedValue(post)

    const result = await getChannelPost('x-tweet1')

    expect(result.id).toBe('x-tweet1')
    expect(mockXPost).toHaveBeenCalledWith('x-tweet1')
    expect(mockTelegramPost).not.toHaveBeenCalled()
  })

  it('re-throws X post fetch errors', async () => {
    mockXPost.mockRejectedValue(new Error('X post not found'))

    await expect(getChannelPost('x-tweet1')).rejects.toThrow('X post not found')
  })
})
