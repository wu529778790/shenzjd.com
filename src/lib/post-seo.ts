import type { Post, SeoMeta } from '../types'
import { getPostSeoOverride } from './post-seo-overrides'

/**
 * 摘要长度上限（字符）。
 * Google 桌面摘要约两行、移动端约三行，中文约 60~80 字即被截断；
 * 取 120 字既能填满桌面摘要，又不会被移动端从中间硬截。
 */
const META_DESCRIPTION_MAX_LENGTH = 120

/** 低于该长度的正文视为噪声（纯表情/口号），不生成摘要，交由上层回退站点描述。 */
const META_DESCRIPTION_MIN_LENGTH = 16

const ZERO_WIDTH_PATTERN = /[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g

/**
 * 裸外链在 SERP 摘要里既不可点又占字数（实测文章页摘要曾是
 * 「标题 + https://xxx」），连同一并剔除前面的「链接/地址」标签；
 * 收尾标点不算链接的一部分。
 */
const URL_PATTERN = /(?:链接|地址|网址|官网|下载地址|原文|来源)?[\s:：]*(?:https?:\/\/|www\.)[^\s<>"'）)】\]，。；！？、]+/gi

/** 话题标签多为频道名/互推标记，对搜索读者无信息量，剔除。 */
const HASHTAG_PATTERN = /(?:^|\s)#[^\s#]{1,40}/g

/** 标题剥离、外链剔除后可能残留的首尾分隔符。 */
const LEADING_SEPARATOR_PATTERN = /^[\s:：,，。.、\-—|·]+/
const TRAILING_SEPARATOR_PATTERN = /[\s:：,，、;；\-—|·]+$/

const SENTENCE_BREAKS = '。！？!?；;…'
const SOFT_BREAKS = '，,、：:'

function lastIndexOfAny(text: string, chars: string): number {
  let last = -1
  for (const char of chars) {
    const index = text.lastIndexOf(char)
    if (index > last) {
      last = index
    }
  }
  return last
}

/** 把频道原文压成单行纯文本：去零宽字符、去外链、去话题标签、折叠空白。 */
export function normalizeMetaText(value: string): string {
  return value
    .replace(ZERO_WIDTH_PATTERN, '')
    .replace(/\r\n?/g, '\n')
    .replace(URL_PATTERN, ' ')
    .replace(HASHTAG_PATTERN, ' ')
    .replace(/\s+/g, ' ')
    .replace(LEADING_SEPARATOR_PATTERN, '')
    .replace(TRAILING_SEPARATOR_PATTERN, '')
    .trim()
}

/**
 * 剥掉正文开头的标题。
 * Telegram 消息的首行会被当成标题渲染，摘要里再复述一遍等于浪费半条 snippet。
 */
export function stripLeadingTitle(text: string, title: string): string {
  const normalizedTitle = normalizeMetaText(title)
  if (!normalizedTitle || !text.startsWith(normalizedTitle)) {
    return text
  }
  return text.slice(normalizedTitle.length).replace(LEADING_SEPARATOR_PATTERN, '')
}

/** 按标点优先截断，避免把句子切成半截。 */
export function truncateMetaText(text: string, maxLength = META_DESCRIPTION_MAX_LENGTH): string {
  if (text.length <= maxLength) {
    return text
  }

  const window = text.slice(0, maxLength)
  const sentenceBreak = lastIndexOfAny(window, SENTENCE_BREAKS)
  if (sentenceBreak >= Math.floor(maxLength * 0.4)) {
    return window.slice(0, sentenceBreak + 1)
  }

  const softBreak = lastIndexOfAny(window, SOFT_BREAKS)
  if (softBreak >= Math.floor(maxLength * 0.6)) {
    return `${window.slice(0, softBreak).trimEnd()}…`
  }

  return `${window.trimEnd()}…`
}

/** 由频道原文推导文章页 meta description；无可用正文时返回 undefined（回退站点描述）。 */
export function buildPostDescription(post: Pick<Post, 'title' | 'text'>): string | undefined {
  const body = stripLeadingTitle(normalizeMetaText(post.text), post.title)
  if (body.length < META_DESCRIPTION_MIN_LENGTH) {
    return undefined
  }
  return truncateMetaText(body)
}

/** 文章页最终 SEO 元信息：手动覆盖优先，其次自动推导。 */
export function buildPostSeo(post: Post): SeoMeta {
  const override = getPostSeoOverride(post.id)
  const title = override?.title?.trim() || post.title
  const text = override?.text?.trim() || buildPostDescription(post)

  return {
    title,
    text,
    noindex: override?.noindex,
  }
}
