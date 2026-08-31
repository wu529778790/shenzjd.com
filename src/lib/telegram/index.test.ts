import type { Post } from '../../types'
import { describe, expect, it } from 'vitest'
import { isPromotionPost, isRenderablePost } from './index'

function createPost(overrides: Partial<Post> = {}): Post {
  return {
    id: '123',
    title: 'Title',
    type: 'text',
    datetime: '2026-01-02T03:04:05.000Z',
    tags: [],
    text: 'Text',
    content: '<p>Text</p>',
    reactions: [],
    ...overrides,
  }
}

describe('post renderability', () => {
  it('accepts text posts with an id and content', () => {
    expect(isRenderablePost(createPost())).toBe(true)
  })

  it('rejects posts without an id', () => {
    expect(isRenderablePost(createPost({ id: '' }))).toBe(false)
  })

  it('rejects posts without content', () => {
    expect(isRenderablePost(createPost({ content: '' }))).toBe(false)
  })

  it('rejects service posts', () => {
    expect(isRenderablePost(createPost({ type: 'service' }))).toBe(false)
  })

  it('rejects nullish posts', () => {
    expect(isRenderablePost(null)).toBe(false)
    expect(isRenderablePost(undefined)).toBe(false)
  })
})

describe('promotion post detection', () => {
  it('flags posts tagged as 频道互推', () => {
    expect(isPromotionPost(createPost({ tags: ['频道互推', '相似推荐'] }))).toBe(true)
  })

  it('flags posts whose text mentions 互推入口', () => {
    expect(isPromotionPost(createPost({ text: '#频道互推 #相似推荐\n互推入口：@sosoo' }))).toBe(true)
  })

  it('does not flag normal posts', () => {
    expect(isPromotionPost(createPost())).toBe(false)
    expect(isPromotionPost(createPost({ tags: ['Python', '工具'] }))).toBe(false)
  })

  it('rejects promotion posts from renderability', () => {
    expect(isRenderablePost(createPost({ tags: ['频道互推'] }))).toBe(false)
  })
})
