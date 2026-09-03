import { describe, expect, it } from 'vitest'
import { buildSanitizedDescription } from './mini-program'
import { hasMeaningfulContent, isLinkSanitizationEnabled, sanitizeLinksInHtml, sanitizeLinksInText } from './mini-program-links'

describe('isLinkSanitizationEnabled', () => {
  it('enables by default when env is unset or empty', () => {
    expect(isLinkSanitizationEnabled(undefined)).toBe(true)
    expect(isLinkSanitizationEnabled('')).toBe(true)
  })

  it('keeps enabled for truthy values', () => {
    expect(isLinkSanitizationEnabled('true')).toBe(true)
    expect(isLinkSanitizationEnabled('1')).toBe(true)
    expect(isLinkSanitizationEnabled('yes')).toBe(true)
  })

  it('disables only for explicit false values', () => {
    expect(isLinkSanitizationEnabled('false')).toBe(false)
    expect(isLinkSanitizationEnabled('0')).toBe(false)
    expect(isLinkSanitizationEnabled('off')).toBe(false)
    expect(isLinkSanitizationEnabled('no')).toBe(false)
    expect(isLinkSanitizationEnabled(' FALSE ')).toBe(false)
  })
})

describe('hasMeaningfulContent', () => {
  it('treats text with letters/digits/CJK as meaningful', () => {
    expect(hasMeaningfulContent('abc 123 中文')).toBe(true)
  })

  it('treats only emoji/arrows/punctuation as empty', () => {
    expect(hasMeaningfulContent('👉🔗')).toBe(false)
    expect(hasMeaningfulContent('→ ↑ ↓')).toBe(false)
    expect(hasMeaningfulContent('…，。')).toBe(false)
    expect(hasMeaningfulContent('   ')).toBe(false)
  })
})

describe('sanitizeLinksInText', () => {
  it('rewrites GitHub links to GitHub：owner/repo plain text', () => {
    expect(sanitizeLinksInText('项目在 https://github.com/foo/bar')).toBe('项目在 GitHub：foo/bar')
  })

  it('supports www. prefix and http scheme', () => {
    expect(sanitizeLinksInText('https://www.github.com/a/b')).toBe('GitHub：a/b')
    expect(sanitizeLinksInText('http://www.github.com/a/b')).toBe('GitHub：a/b')
  })

  it('supports bare github.com URL without scheme', () => {
    expect(sanitizeLinksInText('github.com/a/b 好')).toBe('GitHub：a/b 好')
  })

  it('strips .git suffix and deep paths / query / fragment', () => {
    expect(sanitizeLinksInText('https://github.com/foo/bar.git')).toBe('GitHub：foo/bar')
    expect(sanitizeLinksInText('https://github.com/foo/bar/tree/main/src?x=1#top')).toBe('GitHub：foo/bar')
    expect(sanitizeLinksInText('https://github.com/foo/bar.blob/releases')).toBe('GitHub：foo/bar.blob')
  })

  it('does not rewrite subdomain lookalikes', () => {
    expect(sanitizeLinksInText('https://x.github.com/a/b')).toBe('')
  })

  it('deletes other http(s) links and collapses whitespace', () => {
    expect(sanitizeLinksInText('详情见 https://example.com/a?x=1 谢谢')).toBe('详情见 谢谢')
  })

  it('deletes www. bare domains', () => {
    expect(sanitizeLinksInText('访问 www.example.com 官网')).toBe('访问 官网')
  })

  it('deletes raw URL-only text completely', () => {
    expect(sanitizeLinksInText('https://t.me/shenzjd_com')).toBe('')
  })

  it('does not eat surrounding CJK punctuation', () => {
    expect(sanitizeLinksInText('视频：https://t.me/x/1，不错')).toBe('视频：，不错')
  })
})

describe('buildSanitizedDescription', () => {
  it('removes title prefix and rewrites GitHub in desc', () => {
    const text = '我的标题 代码在 https://github.com/foo/bar，欢迎 star'
    expect(buildSanitizedDescription(text, '我的标题')).toBe('代码在 GitHub：foo/bar，欢迎 star')
  })

  it('returns empty string when all content is a removed link', () => {
    expect(buildSanitizedDescription('https://t.me/x')).toBe('')
  })

  it('returns empty string when body only repeats the title before a link', () => {
    // 真实结构：正文 = 标题行 + 链接行，脱敏去掉链接后标题前缀也被剥掉
    expect(buildSanitizedDescription('我的标题\nhttps://t.me/x', '我的标题')).toBe('')
  })

  it('returns empty string for emoji/arrow only content', () => {
    expect(buildSanitizedDescription('👉')).toBe('')
    expect(buildSanitizedDescription('🔗')).toBe('')
  })

  it('truncates to 60 chars after link removal', () => {
    const text = `https://github.com/a/b ${'好'.repeat(60)}`
    const desc = buildSanitizedDescription(text)
    expect(desc).toHaveLength(60)
    expect(desc).toContain('GitHub：a/b')
  })
})

describe('sanitizeLinksInHtml', () => {
  it('rewrites GitHub anchors to plain text and removes the anchor', () => {
    const html = '<p>仓库：<a href="https://github.com/foo/bar">https://github.com/foo/bar</a></p>'
    const out = sanitizeLinksInHtml(html)
    expect(out).not.toContain('<a')
    expect(out).toContain('GitHub：foo/bar')
  })

  it('rewrites GitHub anchor with www and deep path', () => {
    const html = '<p><a href="https://www.github.com/foo/bar.git/tree/main">x</a></p>'
    const out = sanitizeLinksInHtml(html)
    expect(out).toContain('GitHub：foo/bar')
    expect(out).not.toContain('github.com')
  })

  it('unwraps external links keeping visible text', () => {
    const html = '<p>查看 <a href="https://example.com/x">详情说明</a> 更多</p>'
    const out = sanitizeLinksInHtml(html)
    expect(out).not.toContain('<a')
    expect(out).toContain('详情说明')
    expect(out).toContain('查看')
  })

  it('removes anchors whose visible text is itself a URL', () => {
    const html = '<p><a href="https://example.com/x">https://example.com/x</a></p>'
    const out = sanitizeLinksInHtml(html)
    expect(out).not.toContain('example.com')
    expect(out).not.toContain('<a')
  })

  it('keeps images inside unwrapped link cards', () => {
    const html = '<p><a href="https://example.com/x"><img src="https://cdn.example.com/cover.webp" />标题文字</a></p>'
    const out = sanitizeLinksInHtml(html)
    expect(out).not.toContain('<a')
    expect(out).toContain('<img src="https://cdn.example.com/cover.webp"')
    expect(out).toContain('标题文字')
  })

  it('keeps media attributes (img src / video poster) untouched', () => {
    const html = '<p><img src="https://cdn.example.com/a.webp" />看视频<video poster="https://cdn.example.com/p.jpg" src="https://cdn.example.com/v.mp4"></video></p>'
    const out = sanitizeLinksInHtml(html)
    expect(out).toContain('src="https://cdn.example.com/a.webp"')
    expect(out).toContain('poster="https://cdn.example.com/p.jpg"')
    expect(out).toContain('src="https://cdn.example.com/v.mp4"')
    expect(out).not.toContain('<a')
  })

  it('keeps an image wrapped inside a GitHub link and still rewrites its URL text', () => {
    const html = '<p><a href="https://github.com/foo/bar"><img src="https://cdn.example.com/badge.svg" />https://github.com/foo/bar</a></p>'
    const out = sanitizeLinksInHtml(html)
    expect(out).not.toContain('<a')
    expect(out).toContain('<img src="https://cdn.example.com/badge.svg"')
    expect(out).toContain('GitHub：foo/bar')
  })

  it('deletes bare URLs left in text nodes', () => {
    const html = '<p>官网 https://example.com/x 再见</p>'
    expect(sanitizeLinksInHtml(html)).toContain('官网 再见')
    expect(sanitizeLinksInHtml(html)).not.toContain('example.com')
  })

  it('rewrites bare GitHub URL in text node', () => {
    const html = '<p>见 https://github.com/foo/bar</p>'
    expect(sanitizeLinksInHtml(html)).toContain('GitHub：foo/bar')
  })

  it('removes br lines that become empty, keeping neighbour lines', () => {
    const html = '第一行<br>https://t.me/x/123<br>第二行'
    const out = sanitizeLinksInHtml(html)
    expect(out).not.toContain('t.me')
    expect(out).toContain('第一行')
    expect(out).toContain('第二行')
    expect(out.match(/<br\s*\/?>/gi)).toHaveLength(1)
  })

  it('removes leading empty link line', () => {
    const out = sanitizeLinksInHtml('https://t.me/x<br>正文开始')
    expect(out).not.toContain('t.me')
    expect(out).toContain('正文开始')
    expect(out).not.toContain('https://')
  })

  it('removes whole p when it only held a URL', () => {
    const html = '<p>https://x.com</p><p>保留段落</p>'
    const out = sanitizeLinksInHtml(html)
    expect(out).not.toContain('x.com')
    expect(out).toContain('保留段落')
    expect(out).not.toContain('<p></p>')
  })

  it('removes p that only holds emoji/punctuation', () => {
    const html = '<p>👉🔗</p><p>正文</p>'
    const out = sanitizeLinksInHtml(html)
    expect(out).toContain('<p>正文</p>')
    expect(out).not.toContain('👉')
  })

  it('keeps image-only lines as non-empty', () => {
    const html = '<img src="/static/a.webp" /><br>https://t.me/x<br>文字'
    const out = sanitizeLinksInHtml(html)
    expect(out).toContain('<img src="/static/a.webp"')
    expect(out).toContain('文字')
    expect(out).not.toContain('t.me')
  })

  it('keeps mixed line when it still has meaningful text after URL removal', () => {
    const html = '<p>文案 https://example.com/x 继续</p>'
    const out = sanitizeLinksInHtml(html)
    expect(out).toContain('<p>文案 继续</p>')
    expect(out).not.toContain('example.com')
  })

  it('does not touch code blocks', () => {
    const html = '<pre><code>pip install git+https://github.com/foo/bar</code></pre>'
    expect(sanitizeLinksInHtml(html)).toContain('https://github.com/foo/bar')
  })

  it('is idempotent', () => {
    const html = '<p>仓库：<a href="https://github.com/foo/bar">GitHub</a></p><br>详情 https://t.me/x'
    const once = sanitizeLinksInHtml(html)
    expect(sanitizeLinksInHtml(once)).toBe(once)
  })
})
