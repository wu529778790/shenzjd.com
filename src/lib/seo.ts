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
  // 首页标题默认只有频道名（如「某某频道🅥」），SERP 里看不出站点在做什么；
  // HOME_TITLE 单独覆盖首页标题，不会污染文章页的「标题 | 站点名」拼接。
  const pageTitle = seo?.title?.trim()
    || (isSiteRoot ? getEnv(import.meta.env, Astro, 'HOME_TITLE')?.trim() : undefined)
  const siteTitle = channel?.title ?? ''
  const seoDescription = seo?.text?.trim()
    || getEnv(import.meta.env, Astro, 'SITE_DESCRIPTION')?.trim()
    || channel?.description?.trim()
    || FALLBACK_SITE_DESCRIPTION
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
