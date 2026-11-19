import { describe, expect, it } from 'vitest'
import { collectTags } from './tags'

const post = (...tags: string[]) => ({ tags })

describe('collectTags', () => {
  it('counts how many posts use each tag', () => {
    const result = collectTags([post('a', 'b'), post('a'), post('a', 'c')])

    expect(result).toEqual([
      { tag: 'a', count: 3 },
      { tag: 'b', count: 1 },
      { tag: 'c', count: 1 },
    ])
  })

  it('counts a repeated tag inside one post only once', () => {
    expect(collectTags([post('a', 'a', 'a')])).toEqual([{ tag: 'a', count: 1 }])
  })

  it('keeps configured tags even when no post uses them', () => {
    expect(collectTags([post('a')], ['固定标签'])).toEqual([
      { tag: 'a', count: 1 },
      { tag: '固定标签', count: 0 },
    ])
  })

  it('ignores blank tags', () => {
    expect(collectTags([post('', '   ', 'a')])).toEqual([{ tag: 'a', count: 1 }])
  })

  it('merges tags that differ only by case and keeps the most used spelling', () => {
    // 消息源里 #Python / #python 会同时出现，列表里不该出现两条
    expect(collectTags([post('Python'), post('Python'), post('python')])).toEqual([{ tag: 'Python', count: 3 }])
  })

  it('sorts by count desc then by name', () => {
    const result = collectTags([post('z'), post('z'), post('b'), post('c')])

    expect(result.map(item => item.tag)).toEqual(['z', 'b', 'c'])
  })

  it('caps the index length', () => {
    const posts = Array.from({ length: 10 }, (_, i) => post(`tag${i}`))

    expect(collectTags(posts, [], 3)).toHaveLength(3)
  })

  it('returns an empty list when there is nothing at all', () => {
    expect(collectTags([])).toEqual([])
  })
})
