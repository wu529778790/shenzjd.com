import { describe, expect, it } from 'vitest'
import { defaultNavItems, parseNavItems, withUtm } from './nav'

describe('parseNavItems', () => {
  it('falls back to the default list when NAVS is empty', () => {
    expect(parseNavItems('')).toEqual(defaultNavItems)
    expect(parseNavItems(undefined)).toEqual(defaultNavItems)
    expect(parseNavItems('   ')).toEqual(defaultNavItems)
  })

  it('parses a flat 标题,URL list separated by semicolons', () => {
    expect(parseNavItems('网盘搜索,https://panhub.shenzjd.com;TVbox,https://tvbox.shenzjd.com'))
      .toEqual([
        { title: '网盘搜索', href: 'https://panhub.shenzjd.com' },
        { title: 'TVbox', href: 'https://tvbox.shenzjd.com' },
      ])
  })

  it('keeps commas that appear inside the URL', () => {
    expect(parseNavItems('搜索,https://example.com/a,b')).toEqual([
      { title: '搜索', href: 'https://example.com/a,b' },
    ])
  })

  it('drops malformed entries but keeps the valid ones', () => {
    expect(parseNavItems('没有逗号;网盘搜索,https://panhub.shenzjd.com;,https://x.com')).toEqual([
      { title: '网盘搜索', href: 'https://panhub.shenzjd.com' },
    ])
  })

  it('falls back to defaults when nothing parses', () => {
    expect(parseNavItems('全部都不合法;;')).toEqual(defaultNavItems)
  })
})

describe('withUtm', () => {
  it('tags own subdomains with source, medium and campaign', () => {
    const href = withUtm('https://panhub.shenzjd.com', 'footer-nav', { selfHost: 'www.shenzjd.com' })

    expect(href).toBe('https://panhub.shenzjd.com/?utm_source=shenzjd.com&utm_medium=footer&utm_campaign=footer-nav')
  })

  it('leaves third-party links alone so affiliate attribution is not broken', () => {
    const href = 'https://h5.lot-ml.com/ProductEn/Index/3d58b4cfe8b560c8'

    expect(withUtm(href, 'footer-nav', { selfHost: 'www.shenzjd.com' })).toBe(href)
  })

  it('skips links that point back to the current site', () => {
    const href = 'https://www.shenzjd.com'

    expect(withUtm(href, 'footer-nav', { selfHost: 'www.shenzjd.com' })).toBe(href)
  })

  it('keeps existing query params and does not double-tag', () => {
    const href = withUtm('https://panhub.shenzjd.com/list?q=a', 'footer-nav', { selfHost: 'www.shenzjd.com' })

    expect(href).toContain('q=a')
    expect(href).toContain('utm_campaign=footer-nav')
    expect(withUtm(href, 'other', { selfHost: 'www.shenzjd.com' })).toBe(href)
  })

  it('returns the raw value for unparsable hrefs', () => {
    expect(withUtm('not a url', 'footer-nav')).toBe('not a url')
  })
})
