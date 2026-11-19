import type { AstroEnvContext, ChannelInfo, SeoMeta } from '../types'
import { getBooleanEnv, getEnv } from './env'

const TRAILING_SLASH_REGEX = /\/$/
const URL_PROTOCOL_REGEX = /^https?:\/\//
const ARTICLE_PATH_REGEX = /\/posts\/[^/]+$/

/**
 * 频道描述为空时的站点兜底摘要。
 * 大量 Telegram 频道没填描述，此时首页没有 meta description，
 * 搜索引擎会自行拼摘要，实测首页 CTR 仅 1.4%；用定位文案兜底。
 * 需要改写时设 `SITE_DESCRIPTION`，无需改代码。
 */
const FALLBACK_SITE_DESCRIPTION = '每日整理 GitHub 开源项目、实用软件工具与热门网络资源，附官网地址与使用说明。'

/**
 * 首页标题在未配置 `HOME_TITLE` 时追加的定位后缀。
 * 频道名本身只是品牌（「某某频道」），补一句定位才能在 SERP 里说明站点内容。
 */
const HOME_TITLE_SUFFIX = ' - 软件工具与开源项目合集'

/**
 * 频道名末尾的认证徽标/装饰符号（Telegram 的 🅥 是 So 类的 enclosed 字母，
 * 不在 Extended_Pictographic 里）在 SERP 里常被渲染成方块，拼接标题前剥掉。
 */
const TRAILING_EMOJI_PATTERN = /[\p{S}\uFE0F\u200D\s]+$/u

export function cleanSiteTitle(title: string): string {
  return title.replace(TRAILING_EMOJI_PATTERN, '').trim()
}

/**
 * 全站兜底 description：页面级摘要 > SITE_DESCRIPTION > 频道描述 > 内置定位文案。
 * 首页在没有频道描述时会用它渲染一段可见简介，避免正文只剩帖子标题。
 */
export function getSiteDescription(
  env: Record<string, string | undefined>,
  Astro: AstroEnvContext,
  channel?: ChannelInfo,
): string {
  return getEnv(env, Astro, 'SITE_DESCRIPTION')?.trim()
    || channel?.description?.trim()
    || FALLBACK_SITE_DESCRIPTION
}

export function normalizePathname(pathname: string): string {
  return pathname.replace(TRAILING_SLASH_REGEX, '') || '/'
}

export function getAbsoluteSiteUrl(siteUrl: string, origin: string): string {
  return siteUrl.startsWith('http') ? siteUrl : new URL(siteUrl, origin).toString()
}

export function resolveSiteUrl(siteUrl: string, origin: string): URL {
  const resolvedSiteUrl = new URL(getAbsoluteSiteUrl(siteUrl, origin))
  resolvedSiteUrl.search = ''
  return resolvedSiteUrl
}

export function getSitemapUrl(baseUrl: URL, path: string): string {
  return new URL(path, baseUrl).toString()
}

export function getPageSeo(options: {
  Astro: AstroEnvContext & { url: URL }
  channel?: ChannelInfo
  locale?: string
  seo?: SeoMeta
  siteUrl: string
}) {
  const { Astro, channel, locale, seo, siteUrl } = options
  const absoluteSiteUrl = getAbsoluteSiteUrl(siteUrl, Astro.url.origin)
  const canonicalUrl = new URL(Astro.url.pathname, absoluteSiteUrl)
  const siteRootPathname = normalizePathname(new URL(absoluteSiteUrl).pathname)
  const canonical = normalizePathname(canonicalUrl.pathname) === siteRootPathname
    ? canonicalUrl.toString()
    : canonicalUrl.toString().replace(TRAILING_SLASH_REGEX, '')

  const { pathname } = new URL(canonical)
  const currentPathname = normalizePathname(pathname)
  const isSiteRoot = currentPathname === siteRootPathname
  const rawSiteTitle = channel?.title ?? ''
  // 站点名用于所有非首页的「标题 | 站点名」拼接，顺带剥掉末尾的认证徽标符号。
  const siteTitle = cleanSiteTitle(rawSiteTitle) || rawSiteTitle
  // 首页标题默认只有频道名（如「某某频道🅥」），SERP 里看不出站点在做什么。
  // HOME_TITLE 优先；没配时用「频道名 - 定位后缀」兜底，保证发版即生效。
  // 该覆盖只作用于首页，不会污染文章页的「标题 | 站点名」拼接。
  const homeTitle = getEnv(import.meta.env, Astro, 'HOME_TITLE')?.trim()
    || (siteTitle ? `${siteTitle}${HOME_TITLE_SUFFIX}` : undefined)
  const pageTitle = seo?.title?.trim() || (isSiteRoot ? homeTitle : undefined)
  const seoDescription = seo?.text?.trim() || getSiteDescription(import.meta.env, Astro, channel)
  const shareImage = channel?.avatar
    ? `https://wsrv.nl/?w=1200&h=630&fit=cover&url=ssl:${channel.avatar.replace(URL_PROTOCOL_REGEX, '')}`
    : new URL('favicon.ico', absoluteSiteUrl).toString()
  const favicon = channel?.avatar
    ? `https://wsrv.nl/?w=64&h=64&fit=cover&mask=circle&url=ssl:${channel.avatar.replace(URL_PROTOCOL_REGEX, '')}`
    : new URL('favicon.svg', absoluteSiteUrl).toString()
  const isArticle = ARTICLE_PATH_REGEX.test(pathname)

  return {
    absoluteSiteUrl,
    canonical,
    currentPathname,
    // 首页标题本身就是站点标题，不能再拼一次「| 站点名」。
    hasCustomTitle: Boolean(pageTitle && pageTitle !== siteTitle && !isSiteRoot),
    linksPathname: normalizePathname(new URL('links', absoluteSiteUrl).pathname),
    seoParams: {
      title: pageTitle,
      description: seoDescription,
      canonical,
      noindex: seo?.noindex ?? getBooleanEnv(import.meta.env, Astro, 'NOINDEX'),
      nofollow: seo?.nofollow ?? getBooleanEnv(import.meta.env, Astro, 'NOFOLLOW'),
      openGraph: {
        basic: {
          type: isArticle ? 'article' : 'website',
          title: pageTitle ?? siteTitle,
          url: canonical,
          image: shareImage,
        },
        optional: {
          description: seoDescription,
          locale,
        },
      },
      extend: {
        link: [
          {
            rel: 'icon',
            href: favicon,
          },
          {
            rel: 'apple-touch-icon',
            href: new URL('favicon.ico', absoluteSiteUrl).toString(),
          },
          {
            rel: 'manifest',
            href: new URL('site.webmanifest', absoluteSiteUrl).toString(),
          },
        ],
      },
    },
    siteRootPathname,
    siteTitle,
    tagsPathname: normalizePathname(new URL('tags', absoluteSiteUrl).pathname),
  }
}
