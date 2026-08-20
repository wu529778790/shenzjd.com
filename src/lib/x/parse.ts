import * as cheerio from 'cheerio'
import type { Post } from '../../types'
import { getProcessEnv } from '../env'

/**
 * Parse X profile page HTML into Post[].
 *
 * Each tweet is an <article data-tweet-id="..."> carrying full schema.org
 * microdata (itemProp=...) — text, datePublished, author, interaction counts
 * (Likes / Retweets / Replies / Views). All content is in <meta> tags, so
 * parsing is uniform and stable.
 */

const STATIC_PROXY = getProcessEnv('STATIC_PROXY') ?? '/static/'

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

function metaContent($: cheerio.CheerioAPI, root: cheerio.AnyNode, itemProp: string): string {
  const value = $(root).find(`[itemProp="${itemProp}"]`).first().attr('content')
  return value ? decodeEntities(value) : ''
}

function interactionCount($: cheerio.CheerioAPI, article: cheerio.AnyNode, name: string): string {
  // <div itemProp="interactionStatistic"><meta content="Likes" itemProp="name"/><meta content="N" itemProp="userInteractionCount"/></div>
  const counter = $(article)
    .find('[itemProp="interactionStatistic"]')
    .filter((_, el) => $(el).find('[itemProp="name"]').attr('content') === name)
    .first()
  return counter.find('[itemProp="userInteractionCount"]').attr('content') ?? ''
}

function extractHashtags(text: string): string[] {
  const tags = new Set<string>()
  for (const m of text.matchAll(/#([\p{L}\p{N}_]+)/gu)) {
    tags.add(m[1])
  }
  return [...tags].slice(0, 6)
}

/** Lightweight text → HTML: escape, auto-link URLs, line breaks. */
export function xTextToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  // URLs → links (must run after escaping, on the escaped text)
  const linked = escaped.replace(
    /(https?:\/\/[^\s<]+)/g,
    (url) => `<a href="${url}" rel="nofollow noopener noreferrer" target="_blank">${url}</a>`,
  )
  return linked.replace(/\n/g, '<br>')
}

function extractImages($: cheerio.CheerioAPI, article: cheerio.AnyNode): string[] {
  const urls: string[] = []
  $(article).find('img[src*="pbs.twimg.com/media/"]').each((_, el) => {
    const src = $(el).attr('src')
    if (src) {
      // Strip sizing suffix (?format=...&name=...) for the full image.
      urls.push(src.split('?')[0])
    }
  })
  return [...new Set(urls)].slice(0, 4)
}

/**
 * Approximate absolute time from x.com's relative label (e.g. "4h", "2d").
 * Repost cards carry no absolute timestamp, only a relative one.
 */
function approximateDatetime(relTime: string): string {
  const m = relTime.match(/^(\d+)(s|m|h|d|w|mo|yr)$/)
  if (!m) {
    return new Date().toISOString()
  }
  const units: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
    w: 604_800_000,
    mo: 2_592_000_000,
    yr: 31_536_000_000,
  }
  return new Date(Date.now() - Number(m[1]) * (units[m[2]] ?? 0)).toISOString()
}

/**
 * Parse a repost (retweet) card. x.com renders these without schema.org
 * microdata: the whole card text is `authorName@handleRelativeTime tweetText`,
 * and there is no absolute timestamp. Extract what we can and approximate the
 * datetime from the relative label.
 */
function parseRepost($: cheerio.CheerioAPI, article: cheerio.AnyNode, profileHandle: string): Post | null {
  const id = $(article).attr('data-tweet-id')
  if (!id) return null

  const authorLink = $(article).find('a[href^="/"]').first().attr('href') ?? ''
  const authorHandle = authorLink.replace(/^\//, '').split(/[/?#]/)[0] || profileHandle

  const full = $(article).text().replace(/\s+/g, ' ').trim()
  const atIndex = full.indexOf(`@${authorHandle}`)
  const after = atIndex >= 0 ? full.slice(atIndex + authorHandle.length + 1) : full
  const relMatch = after.match(/^\s*(\d+(?:[smhdw]|mo|yr))\s*(.*)$/)
  const relTime = relMatch ? relMatch[1] : ''
  const text = (relMatch ? relMatch[2] : after).trim()
  if (!text) return null

  const images = extractImages($, article)
  let content = `<p class="x-repost">🔁 转自 <a href="https://x.com/${authorHandle}">@${authorHandle}</a></p>${xTextToHtml(text)}`
  if (images.length > 0) {
    const imagesHtml = images
      .map((src) => `<img src="${STATIC_PROXY}${encodeURIComponent(src)}" alt="" loading="lazy" />`)
      .join('')
    content += `<div class="x-media">${imagesHtml}</div>`
  }

  const title = text.split('\n')[0].slice(0, 60) || text.slice(0, 60)

  return {
    id: `x-${authorHandle}-${id}`,
    title,
    type: 'text',
    datetime: approximateDatetime(relTime),
    tags: extractHashtags(text),
    text,
    description: text.slice(0, 120),
    content,
    reactions: [],
    sourceUrl: `https://x.com/${authorHandle}/status/${id}`,
  }
}

export function parseXProfile(html: string, handle: string): Post[] {
  const $ = cheerio.load(html, {}, false)
  const posts: Post[] = []

  $('article[data-tweet-id]').each((_, article) => {
    const id = $(article).attr('data-tweet-id')
    if (!id) return

    const text = metaContent($, article, 'text')
    if (!text) {
      // No schema text → this is a repost card, not an original tweet.
      const repost = parseRepost($, article, handle)
      if (repost) posts.push(repost)
      return
    }

    const datetime = metaContent($, article, 'datePublished') || metaContent($, article, 'dateCreated')
    if (!datetime) return

    const authorHandle = metaContent($, article, 'alternateName') || handle
    const authorName = metaContent($, article, 'name') || handle

    const likes = interactionCount($, article, 'Likes')
    const retweets = interactionCount($, article, 'Retweets')
    const replies = interactionCount($, article, 'Replies')
    const views = interactionCount($, article, 'Views')

    const reactions: Post['reactions'] = []
    if (likes) reactions.push({ emoji: '❤️', count: likes, isPaid: false })
    if (retweets) reactions.push({ emoji: '🔁', count: retweets, isPaid: false })
    if (views) reactions.push({ emoji: '👁', count: views, isPaid: false })

    const images = extractImages($, article)
    let content = xTextToHtml(text)
    if (images.length > 0) {
      const imagesHtml = images
        .map((src) => `<img src="${STATIC_PROXY}${encodeURIComponent(src)}" alt="" loading="lazy" />`)
        .join('')
      content += `<div class="x-media">${imagesHtml}</div>`
    }

    const title = text.split('\n')[0].replace(/^#+\s*/, '').slice(0, 60) || text.slice(0, 60)

    posts.push({
      id: `x-${authorHandle}-${id}`,
      title,
      type: 'text',
      datetime,
      tags: extractHashtags(text),
      text,
      description: text.slice(0, 120),
      content,
      reactions,
      sourceUrl: `https://x.com/${authorHandle}/status/${id}`,
    })
  })

  return posts
}
