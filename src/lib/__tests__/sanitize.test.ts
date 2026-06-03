import { describe, it, expect } from 'vitest'
import { sanitize, sanitizeInjection } from '../sanitize'

describe('sanitize', () => {
  it('strips script tags', () => {
    const input = '<p>Hello</p><script>alert("xss")</script><p>World</p>'
    const result = sanitize(input)
    expect(result).not.toContain('<script>')
    expect(result).not.toContain('alert')
    expect(result).toContain('Hello')
    expect(result).toContain('World')
  })

  it('strips onclick event handlers', () => {
    const input = '<a href="https://example.com" onclick="alert(1)">Click</a>'
    const result = sanitize(input)
    expect(result).not.toContain('onclick')
    expect(result).not.toContain('alert')
    expect(result).toContain('href="https://example.com"')
  })

  it('strips onerror event handlers', () => {
    const input = '<img src="x" onerror="alert(1)">'
    const result = sanitize(input)
    expect(result).not.toContain('onerror')
    expect(result).not.toContain('alert')
  })

  it('strips javascript: URLs', () => {
    const input = '<a href="javascript:alert(1)">Click</a>'
    const result = sanitize(input)
    expect(result).not.toContain('javascript:')
  })

  it('preserves allowed tags', () => {
    const input = '<p><strong>Bold</strong> and <em>italic</em></p><blockquote>Quote</blockquote><pre><code>Code</code></pre>'
    const result = sanitize(input)
    expect(result).toContain('<p>')
    expect(result).toContain('<strong>')
    expect(result).toContain('<em>')
    expect(result).toContain('<blockquote>')
    expect(result).toContain('<pre>')
    expect(result).toContain('<code>')
  })

  it('preserves img tags with src and alt', () => {
    const input = '<img src="https://example.com/img.png" alt="Photo" width="100" height="100">'
    const result = sanitize(input)
    expect(result).toContain('src="https://example.com/img.png"')
    expect(result).toContain('alt="Photo"')
  })

  it('preserves anchor tags with href', () => {
    const input = '<a href="https://example.com" target="_blank" rel="noopener">Link</a>'
    const result = sanitize(input)
    expect(result).toContain('href="https://example.com"')
    expect(result).toContain('target="_blank"')
    expect(result).toContain('rel="noopener"')
  })

  it('preserves Telegram-specific tags', () => {
    const input = '<tg-emoji emoji-id="5368324170671202286">👍</tg-emoji>'
    const result = sanitize(input)
    expect(result).toContain('tg-emoji')
    expect(result).toContain('emoji-id')
  })

  it('preserves video tags with controls', () => {
    const input = '<video src="https://example.com/video.mp4" controls playsinline width="300"></video>'
    const result = sanitize(input)
    expect(result).toContain('controls')
    expect(result).toContain('playsinline')
  })

  it('preserves table structure', () => {
    const input = '<table><thead><tr><th>Name</th></tr></thead><tbody><tr><td>Value</td></tr></tbody></table>'
    const result = sanitize(input)
    expect(result).toContain('<table>')
    expect(result).toContain('<thead>')
    expect(result).toContain('<th>')
    expect(result).toContain('<td>')
  })

  it('strips iframe tags', () => {
    const input = '<p>Text</p><iframe src="https://evil.com"></iframe><p>More</p>'
    const result = sanitize(input)
    expect(result).not.toContain('<iframe>')
    expect(result).toContain('Text')
  })

  it('handles empty input', () => {
    expect(sanitize('')).toBe('')
  })

  it('handles nested dangerous content', () => {
    const input = '<p><script>document.cookie</script><img src="x" onerror="steal()"></p>'
    const result = sanitize(input)
    expect(result).not.toContain('script')
    expect(result).not.toContain('onerror')
    expect(result).not.toContain('steal')
  })
})

describe('sanitizeInjection', () => {
  it('strips script tags', () => {
    const input = '<script src="https://evil.com/steal.js"></script>'
    const result = sanitizeInjection(input)
    expect(result).not.toContain('<script')
    expect(result).not.toContain('evil.com')
  })

  it('allows style tags', () => {
    const input = '<style>.custom { color: red; }</style>'
    const result = sanitizeInjection(input)
    expect(result).toContain('<style>')
  })

  it('allows meta tags', () => {
    const input = '<meta name="description" content="My site">'
    const result = sanitizeInjection(input)
    expect(result).toContain('<meta')
  })

  it('allows link tags', () => {
    const input = '<link rel="stylesheet" href="/styles.css">'
    const result = sanitizeInjection(input)
    expect(result).toContain('<link')
    expect(result).toContain('href="/styles.css"')
  })

  it('strips event handlers on allowed tags', () => {
    const input = '<link rel="stylesheet" href="/x.css" onload="alert(1)">'
    const result = sanitizeInjection(input)
    expect(result).not.toContain('onload')
    expect(result).not.toContain('alert')
  })

  it('strips data: URIs', () => {
    const input = '<img src="data:text/html,<script>alert(1)</script>">'
    const result = sanitizeInjection(input)
    expect(result).not.toContain('data:')
  })
})
