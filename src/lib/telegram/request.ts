import type { GetChannelInfoParams } from '../../types'
import type { LoadedChannelDocument, RequestContext } from './types'
import * as cheerio from 'cheerio'
import { defineCachedFunction } from 'ocache'
import { $fetch } from 'ofetch'
import { getBooleanEnv, getEnv, getProcessEnv, getStaticProxy } from '../env'
import { installLruCache } from '../cache-storage'
import { diag } from '../diag'

// Replace ocache's unbounded in-memory Map with a bounded LRU.
// Tunable via TELEGRAM_HTML_CACHE_MAX; default 2048 keeps memory ~400MB-1GB
// (each cached Telegram HTML page is ~200-500KB). Lower this if the container
// has less than 2GB heap.
const cacheMax = Number(getProcessEnv('TELEGRAM_HTML_CACHE_MAX') ?? 2048)
installLruCache(cacheMax)

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

  // This resolver only runs on a cache miss, so every invocation here is a real
  // outbound request to Telegram. Log outcome for diagnosing intermittent failures.
  const start = Date.now()
  try {
    const html = await $fetch<string, 'text'>(requestUrl, {
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
    diag.logTelegram({ cache: 'miss', url: requestUrl, status: 200, ms: Date.now() - start })
    return html
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    diag.logTelegram({ cache: 'miss', url: requestUrl, error: message, ms: Date.now() - start })
    throw error
  }
}

const loadTelegramHtml = defineCachedFunction(fetchTelegramHtml, {
  name: 'telegram-html',
  // 15min fresh window: keeps most traffic on the fast path before any
  // stale revalidation. Combined with the 2048-entry LRU this avoids the
  // previous pattern where main-page entries got evicted every 5 minutes,
  // causing ~67 redundant outbound fetches per TTL window.
  maxAge: 60 * 15,
  swr: true,
  // 1hr stale window: if the outbound t.me fetch fails, srv returns the
  // stale HTML instead of an empty page. The user sees slightly older
  // content rather than a broken channel.
  staleMaxAge: 60 * 60,
  getKey: ({ host, channel, id, before, after, q }) => JSON.stringify({
    host,
    channel,
    id: id || '',
    before: before || '',
    after: after || '',
    q: q || '',
  }),
  // Runs on every cache hit (and after a miss resolver). Cheap signal for
  // hit/miss ratio without instrumentation inside ocache.
  // NOTE: ocache spreads the cachedFn args, so this receives the params object
  // directly (`transform(entry, params)`), NOT wrapped in an array.
  transform(entry, params) {
    const p = params as TelegramHtmlParams
    const url = p.id
      ? `https://${p.host}/${p.channel}/${p.id}?embed=1&mode=tme`
      : `https://${p.host}/s/${p.channel}`
    diag.logTelegram({ cache: 'hit', url })
    return entry.value as string
  },
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

  // fetchTelegramHtml logs every miss/failure via diag. Catch here so a flaky
  // t.me degrades the page to "no posts" instead of throwing a 500 whose stack
  // trace (the noisy [ERROR] FetchError lines) adds no diagnostic value.
  let html = ''
  try {
    html = await loadTelegramHtml({
      host,
      channel,
      id,
      before,
      after,
      q,
      headers: getTelegramRequestHeaders(),
    })
  }
  catch {
    // Intentionally swallowed: diag.logTelegram already recorded url/error/ms.
  }

  return {
    $: cheerio.load(html, {}, false),
    channel,
    staticProxy,
    reactionsEnabled,
  }
}
