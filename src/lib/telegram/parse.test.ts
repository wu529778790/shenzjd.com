import type { Post } from '../../types'
import * as cheerio from 'cheerio'
import { describe, expect, it } from 'vitest'
import { extractPost } from './parse'

const MESSAGE_HTML
  = '<div class="tgme_channel_history">'
    + '<div class="tgme_widget_message_wrap">'
    + '<div class="tgme_widget_message" data-post="testchannel/123">'
    + '<div class="tgme_widget_message_text js-message_text">'
    + '<i class="emoji">🟢</i><b>标题行</b><br/>正文第一段<br/>正文第二段'
    + '</div>'
    + '<div class="tgme_widget_message_date"><time datetime="2026-01-02T03:04:05.000Z"></time></div>'
    + '</div>'
    + '</div>'
    + '</div>'

async function extractTestPost(html: string): Promise<Post> {
  const $ = cheerio.load(html)
  const item = $('.tgme_channel_history .tgme_widget_message_wrap').get(0)
  return extractPost($, item, { channel: 'testchannel', index: 0, reactionsEnabled: false })
}

describe('extractPost', () => {
  it('keeps <br> in content HTML for web line breaks', async () => {
    const post = await extractTestPost(MESSAGE_HTML)
    expect(post.content).toContain('<br')
    expect(post.content).toContain('正文第一段<br')
  })

  it('keeps newlines in extracted text for title detection', async () => {
    const post = await extractTestPost(MESSAGE_HTML)
    expect(post.text).toContain('标题行\n正文第一段')
    expect(post.title).toBe('🟢标题行')
  })
})
