import { describe, expect, it } from 'vitest'
import { buildDescription, cleanContentHtml, formatDetailTime, formatListTime } from './mini-program'

describe('formatListTime', () => {
  it('formats ISO UTC datetime to local MM-DD HH:mm', () => {
    // 2026-09-01T06:30:00Z 在 UTC+8 下为 14:30
    expect(formatListTime('2026-09-01T06:30:00.000Z')).toBe('09-01 14:30')
  })
})

describe('formatDetailTime', () => {
  it('formats ISO UTC datetime to local YYYY-MM-DD HH:mm', () => {
    expect(formatDetailTime('2026-09-01T06:30:00.000Z')).toBe('2026-09-01 14:30')
  })
})

describe('buildDescription', () => {
  it('compresses whitespace and trims', () => {
    expect(buildDescription('  hello\n\n  world  ')).toBe('hello world')
  })

  it('removes title prefix when text starts with title', () => {
    expect(buildDescription('我的文章标题 这里是正文内容', '我的文章标题')).toBe('这里是正文内容')
  })

  it('truncates to 60 chars', () => {
    const long = 'a'.repeat(100)
    expect(buildDescription(long)).toHaveLength(60)
  })

  it('keeps text unchanged when it does not start with title', () => {
    expect(buildDescription('正文内容', '标题')).toBe('正文内容')
  })

  it('removes title prefix when title has emoji but text does not', () => {
    // 标题带 emoji，正文 text 里自定义 emoji 渲染成 <img> 取不到，故无 emoji
    expect(buildDescription('即梦AI视频CLI工作流是面向AI短剧的', '🧠 即梦AI视频CLI工作流')).toBe('是面向AI短剧的')
  })

  it('removes title prefix when both title and text have emoji', () => {
    expect(buildDescription('🧠 即梦AI视频CLI工作流是面向AI短剧的', '🧠 即梦AI视频CLI工作流')).toBe('是面向AI短剧的')
  })
})

describe('cleanContentHtml', () => {
  it('removes modal structure', () => {
    const html = '<div class="modal">hidden</div><p>visible</p>'
    expect(cleanContentHtml(html)).not.toContain('modal')
    expect(cleanContentHtml(html)).toContain('visible')
  })

  it('removes button tags but keeps inner img', () => {
    const html = '<button><img src="/static/a.webp" /></button>'
    const out = cleanContentHtml(html)
    expect(out).not.toContain('<button')
    expect(out).toContain('<img')
  })

  it('removes useless and browser-only attributes', () => {
    const html = '<a href="/x" target="_blank" rel="noopener" title="t" aria-label="l" popover>link</a>'
    const out = cleanContentHtml(html)
    expect(out).not.toContain('target=')
    expect(out).not.toContain('rel=')
    expect(out).not.toContain('title=')
    expect(out).not.toContain('aria-label')
    expect(out).not.toContain('popover')
  })

  it('removes duplicate title with preceding emoji', () => {
    const html = '<i class="emoji">📌</i> <b>文章标题</b><p>正文</p>'
    const out = cleanContentHtml(html, '文章标题')
    expect(out).not.toContain('文章标题')
    expect(out).not.toContain('emoji')
    expect(out).toContain('正文')
  })

  it('removes duplicate title with nested emoji b and title without emoji', () => {
    // 真实结构：<i class="emoji"><b>🟢</b></i> <b>标题</b>，标题字段不带 emoji
    const html = '<i class="emoji"><b>🟢</b></i> <b>SRT转白板手绘视频工具</b><p>正文</p>'
    const out = cleanContentHtml(html, 'SRT转白板手绘视频工具')
    expect(out).not.toContain('SRT转白板手绘视频工具')
    expect(out).not.toContain('emoji')
    expect(out).toContain('正文')
  })

  it('removes duplicate title when title has emoji but body b does not', () => {
    const html = '<i class="emoji"><b>🟢</b></i> <b>SRT转白板手绘视频工具</b><p>正文</p>'
    const out = cleanContentHtml(html, '🟢 SRT转白板手绘视频工具')
    expect(out).not.toContain('SRT转白板手绘视频工具')
    expect(out).not.toContain('emoji')
    expect(out).toContain('正文')
  })

  it('removes tag links', () => {
    const html = '<p>正文 <a href="/search/result?q=%23tag">#tag</a></p>'
    const out = cleanContentHtml(html)
    expect(out).not.toContain('/search/result')
    expect(out).not.toContain('#tag')
  })

  it('unwraps image container keeping inner img', () => {
    const html = '<div class="image-list-container"><img src="/static/a.webp" /></div>'
    const out = cleanContentHtml(html)
    expect(out).not.toContain('image-list-container')
    expect(out).toContain('<img')
  })

  it('adds adaptive style to img and removes width/height', () => {
    const html = '<img src="/static/a.webp" width="100" height="50" />'
    const out = cleanContentHtml(html)
    expect(out).toContain('max-width:100%')
    expect(out).not.toContain('width=')
    expect(out).not.toContain('height=')
  })

  it('removes br right after img but keeps the img', () => {
    const html = '<img src="/static/a.webp" /><br/><p>text</p>'
    const out = cleanContentHtml(html)
    expect(out).toContain('<img')
    expect(out).not.toContain('<br')
  })

  it('removes br created from newline right after img', () => {
    // 图片后紧跟换行 \n，先转成 <br/> 再移除，避免产生空白行
    const html = '<img src="/static/a-1" />\nsrt-whiteboard-animation 是一个'
    const out = cleanContentHtml(html)
    expect(out).toContain('<img')
    expect(out).not.toContain('<br')
    expect(out).toContain('srt-whiteboard-animation 是一个')
  })

  it('removes all brs after img from whitespace+newline sequence', () => {
    // 真实结构：图片容器被解包后，图片后是"换行+缩进+换行"的空白序列，
    // 换行转 <br> 后会产生多个 <br>，需全部移除，避免压缩后仍留空白行
    const html = '<img src="/static/a-1" />\n      \n      \n    \n srt-whiteboard-animation 是一个'
    const out = cleanContentHtml(html)
    expect(out).toContain('<img')
    expect(out).not.toContain('<br')
    expect(out).toContain('srt-whiteboard-animation 是一个')
  })

  it('converts newlines to br and collapses multiple br', () => {
    const html = '<p>line1\nline2</p><br/><br/><br/><p>end</p>'
    const out = cleanContentHtml(html)
    expect(out).toContain('line1<br>line2')
    expect(out).not.toContain('<br/><br/><br/>')
    expect(out).not.toContain('<br><br><br>')
  })
})
