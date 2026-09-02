import type { AnyNode, CheerioAPI } from 'cheerio'
import type { Post, Reaction } from '../../types'
import type { ExtractPostOptions, MessageSelection } from './types'
import { modifyHTMLContent } from './content'
import { getCustomEmojiImage, normalizeEmoji } from './emoji'
import { getAudio, getForwardedFrom, getImages, getImageStickers, getLinkPreview, getReply, getTgsStickers, getVideo, getVideoStickers } from './media'
import { renderRawContent } from './renderers/raw'
import { normalizeUrlAttributes } from './url'

const TITLE_PREVIEW_REGEX = /^.*?(?=[。\n]|http\S)/g

function isNonEmptyString(value: string | null | undefined): value is string {
  return Boolean(value)
}

function collectTags($: CheerioAPI, content: MessageSelection): string[] {
  const tags: string[] = []

  for (const tagNode of content.find('a[href^="?q="]').toArray()) {
    const tagLink = $(tagNode)
    const tagText = tagLink.text()

    tagLink.attr('href', `/search/result?q=${encodeURIComponent(tagText)}`)

    const normalizedTag = tagText.replace('#', '')
    if (normalizedTag) {
      tags.push(normalizedTag)
    }
  }

  return tags
}

function renderPostContent(
  $: CheerioAPI,
  message: MessageSelection,
  content: MessageSelection,
  options: ExtractPostOptions & { id: string, title: string },
): string {
  const { channel, staticProxy, index = 0, id, title } = options

  return [
    getForwardedFrom($, message),
    getReply($, message, { channel }),
    getImages($, message, { staticProxy, id, index, title }),
    getVideo($, message, { staticProxy, index }),
    getAudio($, message, { staticProxy }),
    content.html(),
    getImageStickers($, message, { staticProxy, index }),
    getTgsStickers($, message, { staticProxy, index }),
    getVideoStickers($, message, { staticProxy, index }),
    ...renderRawContent($, message, { staticProxy }),
    getLinkPreview($, message, { staticProxy, index }),
  ]
    .filter(isNonEmptyString)
    .join('')
}

function getReactions($: CheerioAPI, message: MessageSelection, staticProxy: string): Reaction[] {
  const reactions: Reaction[] = []

  for (const reactionNode of message.find('.tgme_widget_message_reactions .tgme_reaction').toArray()) {
    const reaction = $(reactionNode)
    const isPaid = reaction.hasClass('tgme_reaction_paid')
    let emoji = ''
    let emojiId: string | undefined
    let emojiImage: string | undefined

    const standardEmoji = reaction.find('.emoji b')
    if (standardEmoji.length) {
      emoji = normalizeEmoji(standardEmoji.text().trim())
    }

    const tgEmoji = reaction.find('tg-emoji')
    if (tgEmoji.length && !emoji) {
      emojiId = tgEmoji.attr('emoji-id')
      const customEmojiImage = getCustomEmojiImage(emojiId, staticProxy)
      if (customEmojiImage) {
        emojiImage = customEmojiImage
      }
    }

    if (isPaid && !emoji && !emojiImage) {
      emoji = '\u2B50'
    }

    const clone = reaction.clone()
    clone.find('.emoji, tg-emoji, i').remove()
    const count = clone.text().trim()

    if (count) {
      reactions.push({
        emoji,
        emojiId,
        emojiImage,
        count,
        isPaid,
      })
    }
  }

  return reactions
}

export async function extractPost($: CheerioAPI, item: AnyNode | null, options: ExtractPostOptions): Promise<Post> {
  const { channel, staticProxy, index = 0, reactionsEnabled } = options
  const message = item ? $(item).find('.tgme_widget_message') : $('.tgme_widget_message')
  normalizeUrlAttributes($, message)
  const hasReplyText = message.find('.js-message_reply_text').length > 0
  const content = await modifyHTMLContent(
    $,
    message.find(hasReplyText ? '.tgme_widget_message_text.js-message_text' : '.tgme_widget_message_text'),
    { index, staticProxy, normalizeUrls: false },
  )
  // cheerio 的 .text() 会丢弃 <br>，导致标题行与正文粘连（如"标题正文"）。
  // 先把 <br> 替换为换行符，再提取纯文本，这样 text 保留换行结构，
  // TITLE_PREVIEW_REGEX 也能通过 \n 正确识别出 Telegram 消息里的标题行。
  // 必须在克隆上做替换：content 还会被 renderPostContent 输出为正文 HTML，
  // 若直接改原 DOM，web/RSS 端的 <br> 会变成 \n，浏览器折叠空白后不再换行。
  const textSource = content.clone()
  textSource.find('br').replaceWith('\n')
  const contentText = textSource.text()
  const title = contentText.match(TITLE_PREVIEW_REGEX)?.[0] ?? contentText
  const id = message.attr('data-post')?.replace(new RegExp(`${channel}/`, 'i'), '') ?? ''
  const tags = collectTags($, content)
  const contentHtml = renderPostContent($, message, content, { channel, staticProxy, index, reactionsEnabled, id, title })

  return {
    id,
    title,
    type: message.attr('class')?.includes('service_message') ? 'service' : 'text',
    datetime: message.find('.tgme_widget_message_date time').attr('datetime') ?? '',
    tags,
    text: contentText,
    content: contentHtml,
    reactions: reactionsEnabled ? getReactions($, message, staticProxy) : [],
  }
}
