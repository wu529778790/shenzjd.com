import type { Post } from '../types'

export interface TagCount {
  tag: string
  count: number
}

/** 标签索引最多展示多少个，防止列表页被标签撑爆。 */
export const TAG_INDEX_LIMIT = 60

/**
 * 汇总标签索引。
 *
 * 数据来源有两处：
 * - 当前频道已加载的帖子（聚合出真实热度，没有配置也能用）
 * - `TAGS` 环境变量里的显式列表（可把当前帖子没覆盖到的标签固定在前排）
 *
 * 排序按出现次数降序，次数相同按名称排序，保证页面稳定（避免每次渲染顺序抖动）。
 *
 * 大小写按同一个标签处理：`#Python` 和 `#python` 是同一条，展示时取出现次数最多的
 * 那种写法（次数相同取字典序小的），避免列表里出现重复项。
 */
export function collectTags(
  posts: Pick<Post, 'tags'>[],
  configured: string[] = [],
  limit = TAG_INDEX_LIMIT,
): TagCount[] {
  const total = new Map<string, number>()
  const spellings = new Map<string, Map<string, number>>()

  const record = (label: string) => {
    const key = label.toLowerCase()
    total.set(key, (total.get(key) ?? 0) + 1)
    const forms = spellings.get(key) ?? new Map<string, number>()
    forms.set(label, (forms.get(label) ?? 0) + 1)
    spellings.set(key, forms)
  }

  for (const post of posts) {
    // 同一帖子里重复出现的标签只算一次，否则热度会被单条长帖带偏
    const seen = new Set<string>()
    for (const tag of post.tags ?? []) {
      const label = tag.trim()
      const key = label.toLowerCase()
      if (label && !seen.has(key)) {
        seen.add(key)
        record(label)
      }
    }
  }

  for (const tag of configured) {
    const label = tag.trim()
    const key = label.toLowerCase()
    if (label && !total.has(key)) {
      total.set(key, 0)
      spellings.set(key, new Map([[label, 0]]))
    }
  }

  return [...total.entries()]
    .map(([key, count]) => {
      const forms = [...(spellings.get(key) ?? new Map<string, number>())]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      return { tag: forms[0]?.[0] ?? key, count }
    })
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, limit)
}
