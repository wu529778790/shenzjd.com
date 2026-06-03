import type { ChannelInfo, GetChannelInfoParams, Post, Reaction } from '../../types'
import { LRUCache } from 'lru-cache'
import { $fetch } from 'ofetch'
import { getEnv, getRequiredEnv } from '../env'

type CacheValue = ChannelInfo | Post

export const X_ID_PREFIX = 'x-'

const MONTH_MAP: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
}

const CACHE_TTL = 1000 * 60 * 60 * 24 // 24 hours
const REFRESH_INTERVAL = 1000 * 60 * 30 // refresh every 30 minutes

const cache = new LRUCache<string, CacheValue>({
  ttl: CACHE_TTL,
  maxSize: 50 * 1024 * 1024,
  sizeCalculation: item => JSON.stringify(item).length,
})

const lastRefresh = new Map<string, number>()

function cloneCacheValue<T extends CacheValue>(value: T): T {
  return structuredClone(value)
}

function isChannelInfo(value: CacheValue): value is ChannelInfo {
  return 'posts' in value
}

function getCached<T extends CacheValue>(
  cacheKey: string,
  typeGuard: (v: CacheValue) => v is T,
): { value: T; stale: boolean } | null {
  const cached = cache.get(cacheKey)
  if (!cached || !typeGuard(cached)) return null

  const refreshed = lastRefresh.get(cacheKey) ?? 0
  const stale = Date.now() - refreshed > REFRESH_INTERVAL
  return { value: cached as T, stale }
}

function markRefreshed(cacheKey: string): void {
  lastRefresh.set(cacheKey, Date.now())
}

function backgroundRefresh<T extends CacheValue>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  typeGuard: (v: CacheValue) => v is T,
): void {
  fetcher()
    .then(fresh => {
      cache.set(cacheKey, fresh)
      markRefreshed(cacheKey)
    })
    .catch(() => {})
}

interface TwitterMedia {
  type: 'photo' | 'video' | 'animated_gif'
  media_url_https: string
  original_info?: { width: number; height: number }
  video_info?: {
    variants: { content_type: string; bitrate?: number; url: string }[]
  }
}

interface TwitterUser {
  name: string
  screen_name: string
  profile_image_url_https: string
}

interface TweetData {
  id_str: string
  created_at: string
  full_text: string
  entities: {
    urls?: { url: string; expanded_url: string; display_url: string }[]
    media?: TwitterMedia[]
  }
  extended_entities?: { media: TwitterMedia[] }
  user: TwitterUser
  favorite_count: number
  retweet_count: number
  reply_count: number
  is_quote_status?: boolean
  quoted_status?: TweetData
}

function parseTwitterDate(dateStr: string): string {
  const parts = dateStr.split(' ')
  const month = MONTH_MAP[parts[1]]
  if (month === undefined) return ''
  const day = parseInt(parts[2])
  const [hour, minute, second] = parts[3].split(':').map(Number)
  const year = parseInt(parts[5])
  return new Date(Date.UTC(year, month, day, hour, minute, second)).toISOString()
}

function extractHashtags(text: string): string[] {
  return text.match(/#(\w+)/g)?.map(m => m.slice(1)) ?? []
}

function renderMediaHtml(media: TwitterMedia[]): string {
  const images: string[] = []
  const videos: string[] = []

  for (const m of media) {
    if (m.type === 'photo') {
      const width = m.original_info?.width ?? 1200
      const height = m.original_info?.height ?? 675
      images.push(`<img src="${m.media_url_https}" alt="Image from X post" width="${width}" height="${height}" loading="lazy" />`)
    } else if (m.type === 'video' || m.type === 'animated_gif') {
      const variants = m.video_info?.variants?.filter(v => v.content_type === 'video/mp4') ?? []
      const best = variants.sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0]
      if (best) {
        videos.push(`<video src="${best.url}" poster="${m.media_url_https}" controls preload="metadata" playsinline webkit-playsinline></video>`)
      }
    }
  }

  const parts: string[] = []
  if (images.length) {
    const layoutClass = images.length % 2 === 0 ? 'image-list-even' : 'image-list-odd'
    parts.push(`<div class="image-list-container ${layoutClass}">${images.join('')}</div>`)
  }
  parts.push(...videos)
  return parts.join('')
}

function renderTweetText(text: string, entities: TweetData['entities']): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  if (entities?.urls) {
    for (const url of entities.urls) {
      html = html.replace(url.url, `<a href="${url.expanded_url}" target="_blank" rel="noopener">${url.display_url}</a>`)
    }
  }

  html = html.replace(/#(\w+)/g, (match, tag) => {
    return `<a href="/search/${encodeURIComponent(match)}">${match}</a>`
  })

  html = html.replace(/@(\w+)/g, (match, mention) => {
    return `<a href="https://x.com/${mention}" target="_blank" rel="noopener">${match}</a>`
  })

  html = html.replace(/\n/g, '<br />')

  return html
}

function renderQuoteTweet(quoted: TweetData): string {
  const text = renderTweetText(quoted.full_text, quoted.entities)
  const mediaHtml = quoted.extended_entities?.media ? renderMediaHtml(quoted.extended_entities.media) : ''
  return `<blockquote class="x-quote"><div class="x-quote-header"><strong>${quoted.user.name}</strong> @${quoted.user.screen_name}</div><p>${text}</p>${mediaHtml}</blockquote>`
}

function tweetToPost(tweet: TweetData, index = 0): Post {
  const id = `${X_ID_PREFIX}${tweet.id_str}`
  const datetime = parseTwitterDate(tweet.created_at)
  const tags = extractHashtags(tweet.full_text)
  const text = tweet.full_text
  const titleMatch = text.match(/^.*?(?=[。\n]|http\S)/)
  const title = titleMatch?.[0] ?? text

  const textHtml = renderTweetText(text, tweet.entities)
  const mediaHtml = tweet.extended_entities?.media ? renderMediaHtml(tweet.extended_entities.media) : ''
  const quoteHtml = tweet.is_quote_status && tweet.quoted_status ? renderQuoteTweet(tweet.quoted_status) : ''
  const linkHtml = `<a href="https://x.com/${tweet.user.screen_name}/status/${tweet.id_str}" target="_blank" rel="noopener" class="x-permalink">View on X</a>`

  const reactions: Reaction[] = []
  if (tweet.favorite_count > 0) reactions.push({ emoji: '❤️', count: String(tweet.favorite_count), isPaid: false })
  if (tweet.retweet_count > 0) reactions.push({ emoji: '🔁', count: String(tweet.retweet_count), isPaid: false })

  return {
    id,
    title,
    type: 'text',
    datetime,
    tags,
    text,
    content: [textHtml, mediaHtml, quoteHtml, linkHtml].filter(Boolean).join(''),
    reactions,
  }
}

async function fetchTimeline(screenName: string, maxPosition?: string): Promise<TweetData[]> {
  const url = `https://syndication.twitter.com/srv/timeline-profile/screen-name/${screenName}`
  const html = await $fetch<string>(url, {
    query: maxPosition ? { maxPosition } : undefined,
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
    retry: 3,
    retryDelay: 1000,
    timeout: 20000,
  })

  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/)
  if (!match) return []

  const data = JSON.parse(match[1])
  const entries = data?.props?.pageProps?.timeline?.entries ?? []
  return entries
    .filter((e: { type: string }) => e.type === 'tweet')
    .map((e: { content: { tweet: TweetData } }) => e.content.tweet)
}

function extractUserInfo(tweets: TweetData[]): { avatar: string; name: string } {
  if (tweets.length > 0) {
    const user = tweets[0].user
    return {
      avatar: user.profile_image_url_https.replace('_normal.', '.'),
      name: user.name,
    }
  }
  return { avatar: '', name: '' }
}

export async function getXChannelInfo(params: GetChannelInfoParams = {}): Promise<ChannelInfo> {
  const { before, after, q } = params
  const cacheKey = JSON.stringify({ scope: 'x-channel', before: before ?? '', after: after ?? '', q: q ?? '' })
  const hit = getCached(cacheKey, isChannelInfo)
  if (hit) {
    if (hit.stale) {
      backgroundRefresh<ChannelInfo>(cacheKey, async () => {
        const screenName = getRequiredEnv('X_ACCOUNT')
        const tweets = await fetchTimeline(screenName)
        let posts = tweets.map((t, i) => tweetToPost(t, i))
        if (before) posts = posts.filter(p => p.datetime < before)
        if (after) posts = posts.filter(p => p.datetime > after)
        if (q) {
          const query = q.toLowerCase()
          posts = posts.filter(p => p.text.toLowerCase().includes(query) || p.tags.some(tag => tag.toLowerCase() === q.toLowerCase()))
        }
        const userInfo = extractUserInfo(tweets)
        return {
          posts,
          title: `${userInfo.name} (@${screenName})`,
          description: `X posts from @${screenName}`,
          descriptionHTML: null,
          avatar: userInfo.avatar || undefined,
        }
      }, isChannelInfo)
    }
    return cloneCacheValue(hit.value)
  }

  const screenName = getRequiredEnv('X_ACCOUNT')
  console.info('Fetching X timeline', { screenName, before, after, q })

  const tweets = await fetchTimeline(screenName)
  let posts = tweets.map((t, i) => tweetToPost(t, i))

  if (before) {
    posts = posts.filter(p => p.datetime < before)
  }
  if (after) {
    posts = posts.filter(p => p.datetime > after)
  }
  if (q) {
    const query = q.toLowerCase()
    posts = posts.filter(p => p.text.toLowerCase().includes(query) || p.tags.some(tag => tag.toLowerCase() === q.toLowerCase()))
  }

  const userInfo = extractUserInfo(tweets)

  const channelInfo: ChannelInfo = {
    posts,
    title: `${userInfo.name} (@${screenName})`,
    description: `X posts from @${screenName}`,
    descriptionHTML: null,
    avatar: userInfo.avatar || undefined,
  }

  cache.set(cacheKey, channelInfo)
  markRefreshed(cacheKey)
  return cloneCacheValue(channelInfo)
}

export async function getXChannelPost(id: string): Promise<Post> {
  const rawId = id.startsWith(X_ID_PREFIX) ? id.slice(X_ID_PREFIX.length) : id
  const cacheKey = JSON.stringify({ scope: 'x-post', id: rawId })
  const hit = getCached(cacheKey, (v): v is Post => !isChannelInfo(v))
  if (hit) {
    if (hit.stale) {
      backgroundRefresh(cacheKey, async () => {
        const screenName = getRequiredEnv('X_ACCOUNT')
        const tweets = await fetchTimeline(screenName)
        const tweet = tweets.find(t => t.id_str === rawId)
        if (!tweet) throw new Error(`X post not found: ${rawId}`)
        return tweetToPost(tweet)
      }, (v): v is Post => !isChannelInfo(v))
    }
    return cloneCacheValue(hit.value)
  }

  const screenName = getRequiredEnv('X_ACCOUNT')
  const tweets = await fetchTimeline(screenName)
  const tweet = tweets.find(t => t.id_str === rawId)
  if (!tweet) throw new Error(`X post not found: ${rawId}`)

  const post = tweetToPost(tweet)
  cache.set(cacheKey, post)
  markRefreshed(cacheKey)
  return cloneCacheValue(post)
}
