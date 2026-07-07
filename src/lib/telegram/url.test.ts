import { describe, expect, it } from 'vitest'
import { normalizeSrcsetAttribute } from './url'

describe('telegram URL normalization', () => {
  it('decodes entity references inside srcset candidates', () => {
    expect(normalizeSrcsetAttribute('https://cdn-telegram.org/a.webp?x=1&amp;y=2 1x, /b.webp?x=3&amp;y=4 2x'))
      .toBe('https://cdn-telegram.org/a.webp?x=1&y=2 1x, /b.webp?x=3&y=4 2x')
  })
})
