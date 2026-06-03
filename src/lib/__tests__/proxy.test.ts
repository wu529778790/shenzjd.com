import { describe, it, expect } from 'vitest'
import { resolveStaticProxyTarget, isStaticProxyWhitelisted } from '../proxy'

describe('resolveStaticProxyTarget', () => {
  it('resolves absolute https URL', () => {
    const result = resolveStaticProxyTarget('https://t.me/s/channel')
    expect(result.hostname).toBe('t.me')
    expect(result.pathname).toBe('/s/channel')
  })

  it('resolves protocol-relative URL', () => {
    const result = resolveStaticProxyTarget('//t.me/s/channel')
    expect(result.hostname).toBe('t.me')
    expect(result.protocol).toBe('https:')
  })

  it('resolves URL with query string', () => {
    const result = resolveStaticProxyTarget('https://t.me/s/channel?before=123')
    expect(result.search).toBe('?before=123')
  })

  it('throws on invalid URL', () => {
    expect(() => resolveStaticProxyTarget('not-a-url')).toThrow()
  })
})

describe('isStaticProxyWhitelisted', () => {
  it.each([
    ['t.me', 'https://t.me/s/channel'],
    ['telegram.org', 'https://telegram.org/favicon.ico'],
    ['telegram.me', 'https://telegram.me/channel'],
    ['telegram.dog', 'https://telegram.dog/channel'],
    ['cdn-telegram.org', 'https://cdn-telegram.org/file.mp4'],
    ['telesco.pe', 'https://telesco.pe/preview.jpg'],
    ['yandex.ru', 'https://yandex.ru/map.png'],
    ['subdomain.t.me', 'https://subdomain.t.me/image.jpg'],
  ])('allows %s', (_domain, url) => {
    expect(isStaticProxyWhitelisted(new URL(url))).toBe(true)
  })

  it.each([
    ['evil.com', 'https://evil.com/steal'],
    ['t.me.evil.com', 'https://t.me.evil.com/phish'],
    ['nottelegram.org', 'https://nottelegram.org/hack'],
    ['cdn-telegram.org.evil.com', 'https://cdn-telegram.org.evil.com/malware'],
  ])('blocks %s', (_domain, url) => {
    expect(isStaticProxyWhitelisted(new URL(url))).toBe(false)
  })
})
