import sanitizeHtml from 'sanitize-html'

/**
 * Sanitize HTML from external sources (Telegram, user-injected HTML).
 * Allows the tags/attributes needed for Telegram content while stripping
 * script injection, event handlers, and dangerous URLs.
 */
export function sanitize(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      // Text formatting
      'b', 'strong', 'i', 'em', 'u', 'ins', 's', 'strike', 'del', 'sub', 'sup', 'small', 'mark',
      // Structure
      'p', 'br', 'hr', 'div', 'span', 'pre', 'code', 'blockquote',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'figure', 'figcaption', 'caption',
      // Links and media
      'a', 'img', 'video', 'source', 'audio',
      // Telegram-specific
      'tg-emoji', 'tg-spoiler',
      // Interactive
      'button', 'input', 'label',
      // Details/summary for expandable
      'details', 'summary',
    ],
    allowedAttributes: {
      '*': ['class', 'id', 'style', 'role', 'aria-label', 'aria-controls', 'aria-hidden'],
      'a': ['href', 'title', 'target', 'rel', 'data-*'],
      'img': ['src', 'alt', 'width', 'height', 'loading', 'data-webp', 'popovertarget', 'popovertargetaction'],
      'video': ['src', 'controls', 'preload', 'playsinline', 'webkit-playsinline', 'muted', 'loop', 'aria-label', 'disablepictureinpicture', 'poster'],
      'audio': ['src', 'controls', 'preload'],
      'source': ['src', 'type'],
      'button': ['type', 'popovertarget', 'popovertargetaction', 'aria-label'],
      'input': ['type', 'id', 'checked', 'aria-label', 'aria-controls'],
      'label': ['for'],
      'div': ['popover'],
      'td': ['colspan', 'rowspan'],
      'th': ['colspan', 'rowspan'],
      'tg-emoji': ['emoji-id'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: {
      img: ['http', 'https', 'data'],
      video: ['http', 'https'],
      audio: ['http', 'https'],
      source: ['http', 'https'],
    },
    // Strip everything not explicitly allowed
    allowedIframeHostnames: [],
    // Remove event handlers (onclick, onerror, etc.)
    allowedSchemesAppliedToAttributes: ['href', 'src'],
  })
}

/**
 * Sanitize raw HTML injection from env vars (HEADER_INJECT, FOOTER_INJECT).
 * More permissive than content sanitization but still strips scripts.
 */
export function sanitizeInjection(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'style', 'link', 'meta', 'script',
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      'link': ['rel', 'href', 'type', 'integrity', 'crossorigin'],
      'meta': ['name', 'content', 'property', 'charset'],
      'script': ['src', 'type', 'async', 'defer', 'integrity', 'crossorigin'],
      '*': ['class', 'id', 'style'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  })
}
