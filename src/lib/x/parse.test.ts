import { describe, expect, it } from 'vitest'
import { parseXProfile, xTextToHtml } from './parse'

// Minimal fixture mirroring x.com's schema.org microdata for two tweets.
const fixture = `
<html><body>
<article data-tweet-id="2042290592961741114" itemScope itemType="https://schema.org/SocialMediaPosting">
  <meta content="2042290592961741114" itemProp="identifier"/>
  <meta content="2026-04-09T17:16:35.000Z" itemProp="datePublished"/>
  <meta content="https://x.com/shenzujiudi/status/2042290592961741114" itemProp="url"/>
  <meta content="第一行标题\n\n第二行内容 https://example.com/foo" itemProp="text"/>
  <div hidden itemProp="author" itemScope itemType="https://schema.org/Person">
    <meta content="1540457422476611584" itemProp="identifier"/>
    <meta content="shenzujiudi" itemProp="alternateName"/>
    <meta content="神族九帝" itemProp="name"/>
  </div>
  <div hidden itemProp="interactionStatistic" itemScope itemType="https://schema.org/InteractionCounter">
    <meta content="https://schema.org/LikeAction" itemProp="interactionType"/>
    <meta content="Likes" itemProp="name"/>
    <meta content="12" itemProp="userInteractionCount"/>
  </div>
  <div hidden itemProp="interactionStatistic" itemScope itemType="https://schema.org/InteractionCounter">
    <meta content="https://schema.org/ViewAction" itemProp="interactionType"/>
    <meta content="Views" itemProp="name"/>
    <meta content="183" itemProp="userInteractionCount"/>
  </div>
</article>
<article data-tweet-id="9990000000000000000" itemScope itemType="https://schema.org/SocialMediaPosting">
  <meta content="9990000000000000000" itemProp="identifier"/>
  <meta content="2026-08-20T01:00:00.000Z" itemProp="datePublished"/>
  <meta content="https://x.com/shenzujiudi/status/9990000000000000000" itemProp="url"/>
  <meta content="带话题 #ai 和图片的推文" itemProp="text"/>
  <div hidden itemProp="author" itemScope itemType="https://schema.org/Person">
    <meta content="shenzujiudi" itemProp="alternateName"/>
    <meta content="神族九帝" itemProp="name"/>
  </div>
  <img src="https://pbs.twimg.com/media/HQJuw2BXUAA3cTG?format=jpg&name=small"/>
</article>
</body></html>
`

describe('parseXProfile', () => {
  const posts = parseXProfile(fixture, 'shenzujiudi')

  it('parses two tweets', () => {
    expect(posts).toHaveLength(2)
  })

  it('builds prefixed ids and source urls', () => {
    expect(posts[0].id).toBe('x-shenzujiudi-2042290592961741114')
    expect(posts[0].sourceUrl).toBe('https://x.com/shenzujiudi/status/2042290592961741114')
  })

  it('extracts text, datetime and title', () => {
    expect(posts[0].datetime).toBe('2026-04-09T17:16:35.000Z')
    expect(posts[0].title).toBe('第一行标题')
    expect(posts[0].text).toContain('第二行内容')
  })

  it('maps Likes and Views to reactions', () => {
    const reactions = posts[0].reactions
    expect(reactions.map((r) => `${r.emoji}${r.count}`)).toContain('❤️12')
    expect(reactions.map((r) => `${r.emoji}${r.count}`)).toContain('👁183')
  })

  it('renders content html with line breaks and auto-links', () => {
    const html = posts[0].content
    expect(html).toContain('<br>')
    expect(html).toContain('href="https://example.com/foo"')
  })

  it('extracts hashtags and media through the static proxy', () => {
    expect(posts[1].tags).toContain('ai')
    expect(posts[1].content).toContain('/static/https%3A%2F%2Fpbs.twimg.com')
  })

  it('skips articles without text', () => {
    const empty = '<article data-tweet-id="123"><meta content="2026-01-01T00:00:00.000Z" itemProp="datePublished"/></article>'
    expect(parseXProfile(empty, 'x')).toHaveLength(0)
  })
})

describe('xTextToHtml', () => {
  it('escapes html and preserves newlines', () => {
    expect(xTextToHtml('a <b> & c\nd')).toBe('a &lt;b&gt; &amp; c<br>d')
  })
})
