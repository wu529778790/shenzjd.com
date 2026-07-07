import { getProxiedUrl } from './url'

export function normalizeEmoji(emoji: string): string {
  const emojiMap: Record<string, string> = {
    '\u2764': '\u2764\uFE0F',
    '\u263A': '\u263A\uFE0F',
    '\u2639': '\u2639\uFE0F',
    '\u2665': '\u2764\uFE0F',
  }

  return emojiMap[emoji] ?? emoji
}

export function getCustomEmojiImage(emojiId: string | undefined, staticProxy = ''): string | null {
  if (!emojiId) {
    return null
  }

  const imageUrl = `https://t.me/i/emoji/${emojiId}.webp`
  return getProxiedUrl(staticProxy, imageUrl)
}
