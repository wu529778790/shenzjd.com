export interface Reaction {
  emoji: string
  emojiId?: string
  emojiImage?: string
  count: string
  isPaid: boolean
}

export interface Post {
  id: string
  title: string
  type: 'text' | 'service'
  datetime: string
  tags: string[]
  text: string
  description?: string
  content: string
  reactions: Reaction[]
  /** 外部来源原链（如 X 推文），渲染时时间链接指向它而非本地 /posts/N */
  sourceUrl?: string
  /**
   * 帖子携带机器人推广链接：t.me/tg:// 深链带 ?start= 归因参数，或指向 t.me 的
   * 内联键盘按钮（正常频道帖没有键盘）。解析时探测，由 isPromotionPost 过滤。
   */
  hasPromoLink?: boolean
}

export interface ChannelInfo {
  posts: Post[]
  title: string
  description: string
  descriptionHTML: string | null
  avatar: string | undefined
}

export interface SeoMeta {
  title?: string
  text?: string
  noindex?: string | boolean
  nofollow?: string | boolean
}

/** Parameters accepted by getChannelInfo */
export interface GetChannelInfoParams {
  before?: string
  after?: string
  q?: string
}

export interface AstroEnvContext {
  locals?: App.Locals
  request?: Request
  url?: URL
}

export interface NavItem {
  title: string
  href: string
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export interface TagCloudItem {
  href: string
  label: string
  title?: string
  external?: boolean
  /** 该标签下的帖子数，仅用于展示，便于判断哪些标签是活跃的 */
  count?: number
}
