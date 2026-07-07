import type { AnyNode, Cheerio, CheerioAPI } from 'cheerio'
import type { AstroEnvContext } from '../../types'

export type MessageSelection = Cheerio<AnyNode>
export type RequestContext = AstroEnvContext & { request: Request }

export interface StaticProxyOptions {
  staticProxy?: string
}

export interface IndexedStaticProxyOptions extends StaticProxyOptions {
  index?: number
}

export interface ReplyOptions {
  channel: string
}

export interface MessageAssetOptions extends IndexedStaticProxyOptions {
  id?: string
  title?: string
}

export interface ExtractPostOptions {
  channel: string
  staticProxy: string
  index?: number
  reactionsEnabled?: boolean
}

export interface LoadedChannelDocument {
  $: CheerioAPI
  channel: string
  staticProxy: string
  reactionsEnabled?: boolean
}
