import type { Post } from '../types'
import { UTM_SOURCE } from './nav'
import { getTagHref } from './post-ui'

/** 网盘搜索站首页，`?q=` 是它支持的搜索参数。 */
export const PANHUB_SEARCH_URL = 'https://panhub.shenzjd.com/'

/** 关键词长度上限：太长拿去搜网盘基本搜不到东西，反而把人送进空结果页。 */
const KEYWORD_MAX_LENGTH = 24

/** 标题常以「🔹」「【」之类的装饰符号开头，做搜索词前要剥掉。 */
const LEADING_NOISE_PATTERN = /^[\s\p{Extended_Pictographic}\p{S}\p{P}]+/u

/**
 * 标题里的「名字：说明」结构，搜索只用冒号前那半。
 * 只认中文分隔符：连字符（CLI-Anything）和空格（现代 Web 指南）都是名字的一部分。
 */
const TITLE_SPLIT_PATTERN = /[，。：；｜·—]/u

/**
 * 把帖子标题收敛成搜索词。
 * 标题是 Telegram 消息首行，通常已经是最简描述（如「🔹 现代 Web 指南」），
 * 去掉装饰符号与多余空白即可，不做分词（中文分词不在这一步解决）。
 */
export function toSearchKeyword(title: string, maxLength = KEYWORD_MAX_LENGTH): string {
  const cleaned = title.replace(LEADING_NOISE_PATTERN, '').replace(/\s+/g, ' ').trim()
  const head = cleaned.split(TITLE_SPLIT_PATTERN)[0].trim() || cleaned
  return head.length > maxLength ? head.slice(0, maxLength).trim() : head
}

export interface PostContextLinks {
  keyword: string
  /** 站外：网盘搜索同名资源，带 UTM 以便在子站区分「文章页带过来的流量」 */
  panhubUrl: string
  /** 站内：按同一关键词搜索本站其他帖子 */
  siteSearchUrl: string
  tagLinks: { label: string, href: string }[]
}

/**
 * 由帖子推导「下一步该去哪」的入口。
 * 找不到可用关键词时返回 null —— 宁可不显示，也不要给一个搜不到东西的入口。
 */
export function buildPostContext(post: Pick<Post, 'id' | 'title' | 'tags'>): PostContextLinks | null {
  const keyword = toSearchKeyword(post.title)
  if (!keyword) {
    return null
  }

  const panhub = new URL(PANHUB_SEARCH_URL)
  panhub.searchParams.set('q', keyword)
  panhub.searchParams.set('utm_source', UTM_SOURCE)
  panhub.searchParams.set('utm_medium', 'post')
  panhub.searchParams.set('utm_campaign', 'post-context')
  panhub.searchParams.set('utm_content', post.id)

  return {
    keyword,
    panhubUrl: panhub.toString(),
    siteSearchUrl: `/search/result?q=${encodeURIComponent(keyword)}`,
    // 话题标签最多带 3 个，再多就变成标签墙
    tagLinks: (post.tags ?? []).slice(0, 3).map(tag => ({ label: tag, href: getTagHref(tag) })),
  }
}
