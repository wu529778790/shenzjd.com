'use client'

import type { ChannelInfo } from '../types'
import { getEnv } from '../lib/env'

const PODCASRT = getEnv('PODCASRT')
const TWITTER = getEnv('TWITTER')
const GITHUB = getEnv('GITHUB')
const TELEGRAM = getEnv('TELEGRAM')
const DISCORD = getEnv('DISCORD')
const MASTODON = getEnv('MASTODON')
const BLUESKY = getEnv('BLUESKY')
const STATIC_PROXY = getEnv('STATIC_PROXY') ?? '/static/'
const HIDE_DESCRIPTION = getEnv('HIDE_DESCRIPTION')

interface SocialLink {
  href: string
  title: string
  label: string
  icon: string
  rel: string
  type?: string
}

function getSocialLinks(rssUrl: string): SocialLink[] {
  const links: SocialLink[] = [
    {
      href: rssUrl,
      title: 'RSS Feed',
      label: 'RSS Feed',
      icon: 'ri:rss-line',
      rel: 'alternate noopener noreferrer',
      type: 'application/rss+xml',
    },
  ]

  if (PODCASRT) links.push({ href: PODCASRT, title: 'Podcast', label: 'Podcast', icon: 'ri:mic-line', rel: 'noopener noreferrer' })
  if (TWITTER) links.push({ href: `https://x.com/${TWITTER}`, title: 'Twitter', label: 'Twitter / X', icon: 'ri:twitter-x-line', rel: 'noopener noreferrer' })
  if (GITHUB) links.push({ href: `https://github.com/${GITHUB}`, title: 'GitHub', label: 'GitHub', icon: 'ri:github-line', rel: 'noopener noreferrer' })
  if (TELEGRAM) links.push({ href: `https://t.me/${TELEGRAM}`, title: 'Telegram', label: 'Telegram', icon: 'ri:telegram-line', rel: 'noopener noreferrer' })
  if (DISCORD) links.push({ href: DISCORD, title: 'Discord', label: 'Discord', icon: 'ri:discord-line', rel: 'noopener noreferrer' })
  if (MASTODON) links.push({ href: `https://${MASTODON}`, title: 'Mastodon', label: 'Mastodon', icon: 'ri:mastodon-line', rel: 'noopener noreferrer' })
  if (BLUESKY) links.push({ href: `https://bsky.app/profile/${BLUESKY}`, title: 'BlueSky', label: 'Bluesky', icon: 'ri:bluesky-line', rel: 'noopener noreferrer' })

  return links
}

const headerMainClass = 'mb-[10px] flex items-center p-[10px] font-semibold max-sm:p-0'
const avatarClass = 'block h-10 w-10 rounded-full border-[3px] border-white object-cover shadow-soft'
const titleWrapClass = 'ml-[10px] min-w-0 flex-1 pr-[10px] text-[20px]'
const titleLinkClass = 'text-heading no-underline hover:text-ink hover:underline'
const iconNavClass = 'flex items-center gap-[2px]'
const socialLinkClass = 'group p-1 no-underline'
const socialIconClass = 'h-[1em] w-[1em] align-bottom [filter:var(--icon-secondary-filter)] group-hover:[filter:var(--icon-hover-filter)]'
const introClass = 'mb-5 ml-[3px] break-words rounded-panel border-l-2 border-line bg-code px-5 py-[10px] text-base leading-[1.6] text-muted shadow-soft max-sm:my-5 max-sm:ml-0'

export default function Header({ channel, siteUrl, rssUrl }: { channel: ChannelInfo, siteUrl: string, rssUrl: string }) {
  const socialLinks = getSocialLinks(rssUrl)

  return (
    <header>
      <div className={headerMainClass}>
        <a href={siteUrl} title={channel?.title}>
          <img
            src={channel?.avatar?.startsWith('http') ? STATIC_PROXY + channel?.avatar : '/void.png'}
            alt={channel?.title}
            loading="eager"
            fetchPriority="high"
            width="40"
            height="40"
            className={avatarClass}
          />
        </a>
        <div className={titleWrapClass}>
          <a href={siteUrl} className={titleLinkClass} style={{ viewTransitionName: 'site-title', transition: '0.2s ease' } as React.CSSProperties} title={channel?.title}>
            {channel?.title}
          </a>
        </div>
        <nav className={iconNavClass} aria-label="Channel links">
          {socialLinks.map(item => (
            <a
              key={item.href}
              href={item.href}
              title={item.title}
              target="_blank"
              rel={item.rel}
              className={socialLinkClass}
            >
              <span className={`iconify ${item.icon} ${socialIconClass}`} aria-hidden="true" />
            </a>
          ))}
        </nav>
      </div>
      {HIDE_DESCRIPTION !== 'true' && channel?.descriptionHTML && channel.descriptionHTML.length > 0 && (
        <div className={`${introClass} content`} dangerouslySetInnerHTML={{ __html: channel.descriptionHTML }} />
      )}
    </header>
  )
}
