import type { NavItem } from '../types'

export interface NavGroup {
  title: string
  items: NavItem[]
}

/**
 * 站群导航默认条目。
 *
 * 注意：顶部导航条 `site-navbar` 是由 npm 包提供的 web component，条目硬编码在包里，
 * 服务端输出的 HTML 里没有这些链接（爬虫和禁用 JS 的访客都看不到）。
 * 所以这里维护一份**可由服务端渲染**的版本，配合 `NAVS` 环境变量做覆盖。
 */
export const defaultNavItems: NavItem[] = [
  { title: 'AI情报局', href: 'https://www.shenzjd.com' },
  { title: '网盘搜索', href: 'https://panhub.shenzjd.com' },
  { title: 'TVbox 接口', href: 'https://tvbox.shenzjd.com' },
  { title: '导航森林', href: 'https://navhub.shenzjd.com' },
  { title: '停车月卡', href: 'https://jietingche.shenzjd.com' },
  { title: '流量卡', href: 'https://h5.lot-ml.com/ProductEn/Index/3d58b4cfe8b560c8' },
  { title: '更多', href: 'https://portfolio.shenzjd.com/products' },
]

/** UTM 归因的来源标识，子站据此区分「从主站导航过来的流量」。 */
export const UTM_SOURCE = 'shenzjd.com'

/**
 * 解析 `NAVS` 环境变量：`标题,URL;标题,URL`。
 * 标题里允许出现逗号之外的字符；只按**第一个**逗号切分，避免 URL 里的逗号被误切。
 * 解析不出任何有效条目时回退默认列表，避免配错导致导航整块消失。
 */
export function parseNavItems(raw?: string | null): NavItem[] {
  if (!raw?.trim()) {
    return defaultNavItems
  }

  const items = raw
    .split(/[;；]/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const splitAt = chunk.indexOf(',')
      if (splitAt <= 0) {
        return null
      }
      const title = chunk.slice(0, splitAt).trim()
      const href = chunk.slice(splitAt + 1).trim()
      return title && href ? { title, href } : null
    })
    .filter((item): item is NavItem => item !== null)

  return items.length > 0 ? items : defaultNavItems
}

/**
 * 给站群入口追加 UTM，用来回答「哪个位置、哪一页把用户送去了子站」。
 *
 * 两条护栏：
 * - 只处理自己的域名。外站的联盟链接（如流量卡）带 UTM 会破坏对方的归因。
 * - 指向本站自身的链接不加，否则会在站内制造出带参数的 URL 变体。
 */
export function withUtm(href: string, campaign: string, options: { medium?: string; selfHost?: string } = {}): string {
  const { medium = 'footer', selfHost } = options

  try {
    const url = new URL(href)
    const isOwnDomain = url.hostname === 'shenzjd.com' || url.hostname.endsWith('.shenzjd.com')
    if (!isOwnDomain || url.hostname === selfHost || url.searchParams.has('utm_source')) {
      return href
    }
    url.searchParams.set('utm_source', UTM_SOURCE)
    url.searchParams.set('utm_medium', medium)
    url.searchParams.set('utm_campaign', campaign)
    return url.toString()
  } catch {
    return href
  }
}
