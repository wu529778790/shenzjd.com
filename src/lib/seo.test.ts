import type { ChannelInfo } from '../types'
import { afterEach, describe, expect, it } from 'vitest'
import { getPageSeo, getSitemapUrl, resolveSiteUrl } from './seo'

const channel: ChannelInfo = {
  posts: [],
  title: 'AI情报局🅥',
  description: '',
  descriptionHTML: null,
  avatar: undefined,
}

afterEach(() => {
  delete process.env.HOME_TITLE
  delete process.env.SITE_DESCRIPTION
})

function seoFor(url: string, seo?: { title?: string, text?: string }) {
  return getPageSeo({
    Astro: { url: new URL(url) },
    channel,
    seo,
    siteUrl: 'https://www.shenzjd.com/',
  })
}

describe('site level SEO overrides', () => {
  it('uses HOME_TITLE for the root page without appending the site title again', () => {
    process.env.HOME_TITLE = 'AI情报局 - 软件工具与开源项目合集'

    const { seoParams, hasCustomTitle } = seoFor('https://www.shenzjd.com/')

    expect(seoParams.title).toBe('AI情报局 - 软件工具与开源项目合集')
    expect(hasCustomTitle).toBe(false)
  })

  it('does not leak HOME_TITLE into article pages', () => {
    process.env.HOME_TITLE = 'AI情报局 - 软件工具与开源项目合集'

    const { seoParams, hasCustomTitle } = seoFor('https://www.shenzjd.com/posts/3835', { title: '文章标题' })

    expect(seoParams.title).toBe('文章标题')
    expect(hasCustomTitle).toBe(true)
  })

  it('falls back to a positioning description when the channel has none', () => {
    const { seoParams } = seoFor('https://www.shenzjd.com/')

    expect(seoParams.description).toContain('GitHub 开源项目')
  })

  it('prefers SITE_DESCRIPTION and then the page level description', () => {
    process.env.SITE_DESCRIPTION = '自定义站点描述'

    expect(seoFor('https://www.shenzjd.com/').seoParams.description).toBe('自定义站点描述')
    expect(seoFor('https://www.shenzjd.com/posts/3835', { text: '文章摘要' }).seoParams.description).toBe('文章摘要')
  })
})

describe('sitemap URL helpers', () => {
  it('resolves relative site URLs against the request origin', () => {
    const siteUrl = resolveSiteUrl('/blog/', 'https://preview.example')

    expect(getSitemapUrl(siteUrl, 'posts/1')).toBe('https://preview.example/blog/posts/1')
  })

  it('uses absolute site URLs instead of the request origin', () => {
    const siteUrl = resolveSiteUrl('https://site.example/blog/', 'https://preview.example')

    expect(getSitemapUrl(siteUrl, 'posts/1')).toBe('https://site.example/blog/posts/1')
  })

  it('keeps configured subpaths for sitemap index URLs', () => {
    const siteUrl = resolveSiteUrl('/blog/', 'https://preview.example')

    expect(getSitemapUrl(siteUrl, 'sitemap/20.xml')).toBe('https://preview.example/blog/sitemap/20.xml')
  })
})
