import type { GetChannelInfoParams } from '../../types'
import type { LoadedChannelDocument, RequestContext } from './types'
import * as cheerio from 'cheerio'
import { defineCachedFunction } from 'ocache'
import { $fetch } from 'ofetch'
import { getBooleanEnv, getEnv, getStaticProxy } from '../env'

interface TelegramHtmlParams {
  host: string
  channel: string
  id?: string
  before?: string
  after?: string
  q?: string
  headers: Record<string, string>
}

function getRequiredEnv(context: RequestContext, name: string): string {
  const value = getEnv(import.meta.env, context, name)
  if (!value) {
    throw new Error(`Missing required env: ${name}`)
  }
  return value
}

export function getTelegramRequestHeaders(): Record<string, string> {
  return {
    'accept': 'text/html,application/xhtml+xml',
    'user-agent': 'shenzjd-com/1.0.0',
  }
}

async function fetchTelegramHtml({ host, channel, id, before, after, q, headers }: TelegramHtmlParams): Promise<string> {
  const requestUrl = id
    ? `https://${host}/${channel}/${id}?embed=1&mode=tme`
    : `https://${host}/s/${channel}`

  return await $fetch<string, 'text'>(requestUrl, {
    headers,
    query: {
      before: before || undefined,
      after: after || undefined,
      q: q || undefined,
    },
    responseType: 'text',
    timeout: 15000,
    retry: 3,
    retryDelay: 100,
  })
}

const loadTelegramHtml = defineCachedFunction(fetchTelegramHtml, {
  name: 'telegram-html',
  maxAge: 60 * 5,
  swr: true,
  staleMaxAge: 60 * 60,
  getKey: ({ host, channel, id, before, after, q }) => JSON.stringify({
    host,
    channel,
    id: id || '',
    before: before || '',
    after: after || '',
    q: q || '',
  }),
})

export async function loadChannelDocument(
  context: RequestContext,
  params: GetChannelInfoParams & { id?: string } = {},
): Promise<LoadedChannelDocument> {
  const { before, after, q, id } = params
  const host = getEnv(import.meta.env, context, 'TELEGRAM_HOST') ?? 't.me'
  const channel = getRequiredEnv(context, 'CHANNEL')
  const staticProxy = getStaticProxy(import.meta.env, context)
  const reactionsEnabled = getBooleanEnv(import.meta.env, context, 'REACTIONS')
  const html = await loadTelegramHtml({
    host,
    channel,
    id,
    before,
    after,
    q,
    headers: getTelegramRequestHeaders(),
  })

  return {
    $: cheerio.load(html, {}, false),
    channel,
    staticProxy,
    reactionsEnabled,
  }
}
