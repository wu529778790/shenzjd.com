import type { ChannelInfo, Post } from '../types'
import { describe, expect, it } from 'vitest'
import { absolutizeMediaUrls, buildJsonFeed } from './feed'

describe('json feed builder', () => {
  it('emits JSON Feed 1.1 metadata and valid item fields', () => {
    const channel: ChannelInfo = {
      posts: [],
      title: 'Channel title',
      description: 'Channel description',
      descriptionHTML: null,
      avatar: undefined,
    }
    const posts: Post[] = [{
      id: '123',
      title: 'Post title',
      type: 'text',
      datetime: '2026-01-02T03:04:05.000Z',
      tags: ['tag'],
      text: 'Post text',
      description: 'Post summary',
      content: '<p>Hello</p><script>alert(1)</script>',
      reactions: [],
    }]

    const feed = buildJsonFeed({
      channel,
      posts,
      siteUrl: new URL('https://example.com/blog/'),
      tag: null,
      title: 'Feed title',
    })

    expect(feed).toMatchObject({
      version: 'https://jsonfeed.org/version/1.1',
      title: 'Feed title',
      home_page_url: 'https://example.com/blog/',
      feed_url: 'https://example.com/blog/rss.json',
    })
    expect(feed.items).toHaveLength(1)
    expect(feed.items[0]).toMatchObject({
      id: 'https://example.com/blog/posts/123',
      url: 'https://example.com/blog/posts/123',
      title: 'Post title',
      summary: 'Post summary',
      tags: ['tag'],
      content_html: '<p>Hello</p>',
    })
    expect(typeof feed.items[0]?.date_published).toBe('string')
  })

  it('absolutizes relative media paths in content_html', () => {
    const channel: ChannelInfo = {
      posts: [],
      title: 'Channel title',
      description: 'Channel description',
      descriptionHTML: null,
      avatar: undefined,
    }
    const posts: Post[] = [{
      id: '123',
      title: 'Post title',
      type: 'text',
      datetime: '2026-01-02T03:04:05.000Z',
      tags: [],
      text: 'Post text',
      content: '<img src="/static/https://cdn-telegram.org/a.webp" /><video poster="/static/p.webp"></video>',
      reactions: [],
    }]

    const feed = buildJsonFeed({
      channel,
      posts,
      siteUrl: new URL('https://shenzjd.com/'),
      tag: null,
      title: 'Feed title',
    })

    expect(feed.items[0]?.content_html).toBe(
      '<img src="https://shenzjd.com/static/https://cdn-telegram.org/a.webp" /><video poster="https://shenzjd.com/static/p.webp"></video>',
    )
  })

  it('leaves already-absolute and non-media URLs untouched', () => {
    const html = '<a href="https://example.com/x">link</a><img src="/images/a.png" />'
    expect(absolutizeMediaUrls(html, new URL('https://shenzjd.com/'))).toBe(
      '<a href="https://example.com/x">link</a><img src="/images/a.png" />',
    )
  })
})
