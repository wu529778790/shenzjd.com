import type { APIContext } from 'astro'
import type { ChannelInfo, Post } from '../types'
import { sanitizeFeedHtml } from './sanitize'
import { getChannelInfo } from './telegram'

export interface FeedData {
  channel: ChannelInfo
  posts: Post[]
  siteUrl: URL
  tag: string | null
  title: string
}

export interface JsonFeedData {
  version: string
  title: string
  description: string
  home_page_url: string
  feed_url: string
  items: {
    id: string
    url: string
    title: string | undefined
    summary: string | undefined
    date_published: string
    tags: string[]
    content_html: string
  }[]
}

/**
 * 把正文 HTML 里的相对媒体路径（如 /static/...）转成绝对路径。
 *
 * RSS / JSON Feed 是独立文档，没有"当前页面"可用来补全相对路径，
 * 爬虫和阅读器（以及微信小程序）可能拿不到图片。这里统一补全为
 * 站点绝对 URL，保证任何消费方都能直接访问。
 */
export function absolutizeMediaUrls(html: string, siteUrl: URL): string {
  const base = siteUrl.toString().replace(/\/$/, '')
  return html.replace(/(src|href|poster)="\/(static\/)/g, `$1="${base}/$2`)
}

export function buildJsonFeed({ channel, posts, siteUrl, title }: FeedData): JsonFeedData {
  return {
    version: 'https://jsonfeed.org/version/1.1',
    title,
    description: channel.description,
    home_page_url: siteUrl.toString(),
    feed_url: new URL('rss.json', siteUrl).toString(),
    items: posts.map((item) => {
      const itemUrl = new URL(`posts/${item.id}`, siteUrl).toString()

      return {
        id: itemUrl,
        url: itemUrl,
        title: item.title || undefined,
        summary: item.description,
        date_published: new Date(item.datetime).toISOString(),
        tags: item.tags,
        content_html: absolutizeMediaUrls(sanitizeFeedHtml(item.content), siteUrl),
      }
    }),
  }
}

export async function getFeedData(context: APIContext): Promise<FeedData> {
  const tag = context.url.searchParams.get('tag')
  const channel = await getChannelInfo(context, {
    q: tag ? `#${tag}` : '',
  })
  const siteUrl = new URL(context.locals.SITE_URL, context.url.origin)
  siteUrl.search = ''

  return {
    channel,
    posts: channel.posts ?? [],
    siteUrl,
    tag,
    title: `${tag ? `${tag} | ` : ''}${channel.title}`,
  }
}
