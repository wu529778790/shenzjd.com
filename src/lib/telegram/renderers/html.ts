import type { CheerioAPI } from 'cheerio'
import type { MessageSelection } from '../types'
import { getProxiedUrl, normalizeUrlAttribute } from '../url'

const STYLE_DOUBLE_QUOTED_URL_REGEX = /url\("([^"]*)"\)/gi
const STYLE_SINGLE_QUOTED_URL_REGEX = /url\('([^']*)'\)/gi
const STYLE_UNQUOTED_URL_REGEX = /url\(([^)"']*)\)/gi
const PROXYABLE_URL_REGEX = /^(?:https?:)?\/\//i

function normalizeProxyableStyleUrl(staticProxy: string, url: string): string {
  const normalizedUrl = normalizeUrlAttribute(url.trim())

  if (!PROXYABLE_URL_REGEX.test(normalizedUrl)) {
    return normalizedUrl
  }

  const absoluteUrl = normalizedUrl.startsWith('//') ? `https:${normalizedUrl}` : normalizedUrl
  return getProxiedUrl(staticProxy, absoluteUrl)
}

export function proxyStyleUrls($: CheerioAPI, root: MessageSelection, staticProxy: string): void {
  const nodes = [...root.toArray(), ...root.find('*').toArray()]

  for (const node of nodes) {
    const element = $(node)
    const style = element.attr('style')

    if (style) {
      element.attr('style', style
        .replace(STYLE_DOUBLE_QUOTED_URL_REGEX, (_match, url: string) => `url("${normalizeProxyableStyleUrl(staticProxy, url)}")`)
        .replace(STYLE_SINGLE_QUOTED_URL_REGEX, (_match, url: string) => `url('${normalizeProxyableStyleUrl(staticProxy, url)}')`)
        .replace(STYLE_UNQUOTED_URL_REGEX, (_match, url: string) => `url(${normalizeProxyableStyleUrl(staticProxy, url)})`))
    }
  }
}
