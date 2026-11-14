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

  it('flags posts carrying a bot referral link detected at parse time', () => {
    expect(isPromotionPost(createPost({ hasPromoLink: true }))).toBe(true)
    expect(isRenderablePost(createPost({ hasPromoLink: true }))).toBe(false)
  })

  it('flags bot referral deep links in text', () => {
    // 取自真实广告帖 8973（海搜推广）
    expect(isPromotionPost(createPost({
      text: '海量资源搜索 海搜 @haisou\n👉 https://t.me/haisou?start=a_689940150',
    }))).toBe(true)
  })

  it('flags known promo campaign phrasing', () => {
    // 取自真实广告帖 9020（超级索引）与 8479/8673（毒舌加速器）、8652（@xmsubbot）
    expect(isPromotionPost(createPost({
      text: 'TG必备的索引机器人！超级索引帮您精准找到：群组、频道、音乐、视频等\n👇点击下方按钮，开启搜索把！👇',
    }))).toBe(true)
    expect(isPromotionPost(createPost({ text: '毒舌加速器是一款VPN工具 #毒舌加速器' }))).toBe(true)
    expect(isPromotionPost(createPost({ text: '通过 @xmsubbot 机器人获取免费 VPN 订阅链接 https://t.me/txwl666' }))).toBe(true)
  })

  it('does not flag normal posts', () => {
    expect(isPromotionPost(createPost())).toBe(false)
    expect(isPromotionPost(createPost({ tags: ['Python', '工具'] }))).toBe(false)
  })

  it('does not flag normal posts that merely mention similar words', () => {
    // 站长自己的帖 2729 提到"索引机器人"，不得被推广关键字误伤
    expect(isPromotionPost(createPost({
      text: '你的频道有专属的搜索机器人吗？列举一些已经接入司南引擎的索引机器人：叮当搜索 FarrLibrary',
    }))).toBe(false)
  })

  it('rejects promotion posts from renderability', () => {
    expect(isRenderablePost(createPost({ tags: ['频道互推'] }))).toBe(false)
  })
})
