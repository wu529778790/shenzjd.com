import { describe, expect, it } from 'vitest'
import { getMaybeProxiedSrcset } from './utils'

describe('media URL helpers', () => {
  it('proxies each absolute srcset candidate separately', () => {
    expect(getMaybeProxiedSrcset('/static/', 'https://cdn-telegram.org/a.webp 1x, https://cdn-telegram.org/b.webp 2x'))
      .toBe('/static/https://cdn-telegram.org/a.webp 1x, /static/https://cdn-telegram.org/b.webp 2x')
  })

  it('proxies protocol-relative candidates', () => {
    expect(getMaybeProxiedSrcset('/static/', '//cdn-telegram.org/a.webp 2x'))
      .toBe('/static///cdn-telegram.org/a.webp 2x')
  })

  it('keeps relative candidates out of the static proxy', () => {
    expect(getMaybeProxiedSrcset('/static/', '/images/a.webp 1x'))
      .toBe('/images/a.webp 1x')
  })

  it('normalizes extra spaces around candidates and descriptors', () => {
    expect(getMaybeProxiedSrcset('/static/', '  https://cdn-telegram.org/a.webp   1x  ,  /images/b.webp   2x '))
      .toBe('/static/https://cdn-telegram.org/a.webp 1x, /images/b.webp 2x')
  })
})
