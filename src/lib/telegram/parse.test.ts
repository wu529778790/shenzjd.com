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

function withMessageText(text: string): string {
  return MESSAGE_HTML.replace('正文第一段<br/>正文第二段', text)
}

async function extractTestPost(html: string): Promise<Post> {
  const $ = cheerio.load(html)
  const item = $('.tgme_channel_history .tgme_widget_message_wrap').get(0)
  return extractPost($, item, { channel: 'testchannel', index: 0, reactionsEnabled: false, staticProxy: '' })
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

  it('flags posts whose text contains a t.me bot referral deep link', async () => {
    // 取自真实广告帖 8973（海搜推广）
    const html = withMessageText('海量资源搜索 海搜 @haisou<br/><br/>👉 '
      + '<a href="https://t.me/haisou?start=a_689940150">https://t.me/haisou?start=a_689940150</a>')
    const post = await extractTestPost(html)
    expect(post.hasPromoLink).toBe(true)
  })

  it('flags posts with an inline keyboard button linking to t.me', async () => {
    // 取自真实广告帖 9020（超级索引推广）：视频 + 推广内联键盘
    const html = withMessageText('TG必备的索引机器人！'
      + '<a class="tgme_widget_message_inline_button" href="https://t.me/CJSY?start=689940150">'
      + '🔍超级索引</a>')
    const post = await extractTestPost(html)
    expect(post.hasPromoLink).toBe(true)
  })

  it('flags tg:// deep links with a start payload as referral links', async () => {
    const html = withMessageText('开始使用 '
      + '<a href="tg://resolve?domain=somebot&start=ref_123">打开</a>')
    const post = await extractTestPost(html)
    expect(post.hasPromoLink).toBe(true)
  })

  it('does not flag normal outbound links or plain t.me links', async () => {
    const html = withMessageText(
      '工具 <a href="https://github.com/foo/bar">GitHub</a> '
      + '频道 <a href="https://t.me/shenzjd_com/8973">回复</a>',
    )
    const post = await extractTestPost(html)
    expect(post.hasPromoLink).toBe(false)
  })
})
