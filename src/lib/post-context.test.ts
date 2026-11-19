import { describe, expect, it } from 'vitest'
import { buildPostContext, toSearchKeyword } from './post-context'

describe('toSearchKeyword', () => {
  it('strips leading emoji and decoration', () => {
    expect(toSearchKeyword('🔹 现代 Web 指南')).toBe('现代 Web 指南')
    expect(toSearchKeyword('🧩 MCP 服务器集合')).toBe('MCP 服务器集合')
    expect(toSearchKeyword('【工具】自动剪辑')).toBe('工具】自动剪辑')
  })

  it('collapses whitespace and trims', () => {
    expect(toSearchKeyword('  AI   工作流平台  ')).toBe('AI 工作流平台')
  })

  it('cuts the trailing description after a CJK separator', () => {
    expect(toSearchKeyword('磁力魔：分布式磁力搜索引擎')).toBe('磁力魔')
    expect(toSearchKeyword('Arcane——Docker 管理面板')).toBe('Arcane')
  })

  it('keeps hyphens and spaces that belong to the name', () => {
    expect(toSearchKeyword('🔹 CLI-Anything')).toBe('CLI-Anything')
    expect(toSearchKeyword('🔹 现代 Web 指南')).toBe('现代 Web 指南')
  })

  it('caps overly long titles', () => {
    const keyword = toSearchKeyword('一'.repeat(60), 24)

    expect(keyword).toHaveLength(24)
  })

  it('returns an empty string for a title made only of symbols', () => {
    expect(toSearchKeyword('🔹🔹 ✨')).toBe('')
  })
})

describe('buildPostContext', () => {
  it('builds a panhub search link tagged with post attribution', () => {
    const context = buildPostContext({ id: '6672', title: '🔹 磁力魔分布式磁力搜索引擎', tags: [] })

    expect(context).not.toBeNull()
    const url = new URL(context!.panhubUrl)

    expect(url.origin).toBe('https://panhub.shenzjd.com')
    expect(url.searchParams.get('q')).toBe('磁力魔分布式磁力搜索引擎')
    expect(url.searchParams.get('utm_campaign')).toBe('post-context')
    expect(url.searchParams.get('utm_content')).toBe('6672')
  })

  it('keeps at most three tag links', () => {
    const context = buildPostContext({
      id: '1',
      title: '示例工具',
      tags: ['a', 'b', 'c', 'd', 'e'],
    })

    expect(context?.tagLinks).toHaveLength(3)
    expect(context?.tagLinks[0]).toEqual({ label: 'a', href: '/search/result?q=%23a' })
  })

  it('returns null when the title yields no keyword', () => {
    expect(buildPostContext({ id: '1', title: '🔹 ✨', tags: [] })).toBeNull()
  })
})
