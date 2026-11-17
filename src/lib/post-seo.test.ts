import type { Post } from '../types'
import { describe, expect, it } from 'vitest'
import { buildPostDescription, buildPostSeo, normalizeMetaText, stripLeadingTitle, truncateMetaText } from './post-seo'

function createPost(overrides: Partial<Post> = {}): Post {
  return {
    id: '9001',
    title: '标题',
    type: 'text',
    datetime: '2026-01-02T03:04:05.000Z',
    tags: [],
    text: '标题\n正文',
    content: '<p>正文</p>',
    reactions: [],
    ...overrides,
  }
}

describe('normalizeMetaText', () => {
  it('removes bare URLs, hashtags, zero-width chars and collapses whitespace', () => {
    expect(normalizeMetaText('标题\r\n\r\n正文\u200B段落 #Python #工具 https://example.com/a?b=1')).toBe('标题 正文段落')
  })

  it('keeps the sentence after an URL and drops the dangling label', () => {
    expect(normalizeMetaText('地址 https://example.com/x，欢迎访问')).toBe('欢迎访问')
  })

  it('drops a trailing “链接：” label left behind by URL removal', () => {
    // 线上真实帖子 3622 的正文末尾就是「链接: <span>…</span>」形态
    expect(normalizeMetaText('站点名称: 哦游Max 描述: 属于iOS玩家的网站,ipa软件一键下载 链接: https://example.com/ipa'))
      .toBe('站点名称: 哦游Max 描述: 属于iOS玩家的网站,ipa软件一键下载')
  })
})

describe('stripLeadingTitle', () => {
  it('strips the leading title line and its separator', () => {
    expect(stripLeadingTitle('标题 正文第一段。', '标题')).toBe('正文第一段。')
  })

  it('strips a trailing colon left over from the title line', () => {
    expect(stripLeadingTitle('标题： 正文第一段。', '标题')).toBe('正文第一段。')
  })

  it('keeps text unchanged when it does not start with the title', () => {
    expect(stripLeadingTitle('正文第一段。', '另一个标题')).toBe('正文第一段。')
  })
})

describe('truncateMetaText', () => {
  it('returns short text untouched', () => {
    expect(truncateMetaText('短文本')).toBe('短文本')
  })

  it('cuts on a sentence break when one is available', () => {
    const text = `${'一'.repeat(60)}。${'二'.repeat(100)}`
    expect(truncateMetaText(text, 120)).toBe(`${'一'.repeat(60)}。`)
  })

  it('falls back to an ellipsis when no sentence break is available', () => {
    const result = truncateMetaText('三'.repeat(200), 120)
    expect(result).toHaveLength(121)
    expect(result.endsWith('…')).toBe(true)
  })
})

describe('buildPostDescription', () => {
  it('uses the body after the title line', () => {
    expect(buildPostDescription({
      title: '开源相册工具',
      text: '开源相册工具\n\n支持自建部署，图片自动压缩。\n兼容 Docker 一键启动。',
    })).toBe('支持自建部署，图片自动压缩。 兼容 Docker 一键启动。')
  })

  it('returns undefined for a post whose whole body is a bare link', () => {
    // 线上真实帖子 3835：正文只有一行标题 + 一条外链
    expect(buildPostDescription({
      title: '品技论坛Switch游戏下载：免费NS游戏下载与解锁资源全攻略',
      text: '品技论坛Switch游戏下载：免费NS游戏下载与解锁资源全攻略\r\n\r\nhttps://www.tekqart.org/',
    })).toBeUndefined()
  })

  it('does not repeat the title inside the description', () => {
    const description = buildPostDescription({
      title: '标题行',
      text: '标题行\n这是一段足够长的正文，用来验证标题不会重复出现在摘要开头。',
    })
    expect(description?.startsWith('标题行')).toBe(false)
    expect(description?.startsWith('这是一段')).toBe(true)
  })
})

describe('buildPostSeo', () => {
  it('derives title and description automatically', () => {
    const seo = buildPostSeo(createPost({
      title: '自动标题',
      text: '自动标题\n这是一段足够长的正文，用于生成文章页的 meta description。',
    }))

    expect(seo.title).toBe('自动标题')
    expect(seo.text).toBe('这是一段足够长的正文，用于生成文章页的 meta description。')
    expect(seo.noindex).toBeUndefined()
  })

  it('lets the manual override table win over auto derivation', () => {
    const seo = buildPostSeo(createPost({
      id: '3835',
      title: '品技论坛Switch游戏下载：免费NS游戏下载与解锁资源全攻略',
      text: '品技论坛Switch游戏下载：免费NS游戏下载与解锁资源全攻略\r\n\r\nhttps://www.tekqart.org/',
    }))

    expect(seo.title).toBe('品技论坛（Tekqart）入口地址与 NS 游戏资源说明')
    expect(seo.text).toContain('tekqart.org')
  })
})
