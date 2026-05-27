import type { ChannelInfo } from '../types'
import { getEnv } from '../lib/env'

const PODCAST = getEnv('PODCAST') ?? getEnv('PODCASRT')
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
}

function getSocialLinks(rssUrl: string): SocialLink[] {
  const links: SocialLink[] = [
    {
      href: rssUrl,
      title: 'RSS Feed',
      label: 'RSS Feed',
      icon: 'ri:rss-line',
      rel: 'alternate noopener noreferrer',
    },
  ]

  if (PODCAST) links.push({ href: PODCAST, title: 'Podcast', label: 'Podcast', icon: 'ri:mic-line', rel: 'noopener noreferrer' })
  if (TWITTER) links.push({ href: `https://x.com/${TWITTER}`, title: 'Twitter', label: 'Twitter / X', icon: 'ri:twitter-x-line', rel: 'noopener noreferrer' })
  if (GITHUB) links.push({ href: `https://github.com/${GITHUB}`, title: 'GitHub', label: 'GitHub', icon: 'ri:github-line', rel: 'noopener noreferrer' })
  if (TELEGRAM) links.push({ href: `https://t.me/${TELEGRAM}`, title: 'Telegram', label: 'Telegram', icon: 'ri:telegram-line', rel: 'noopener noreferrer' })
  if (DISCORD) links.push({ href: DISCORD, title: 'Discord', label: 'Discord', icon: 'ri:discord-line', rel: 'noopener noreferrer' })
  if (MASTODON) links.push({ href: `https://${MASTODON}`, title: 'Mastodon', label: 'Mastodon', icon: 'ri:mastodon-line', rel: 'noopener noreferrer' })
  if (BLUESKY) links.push({ href: `https://bsky.app/profile/${BLUESKY}`, title: 'BlueSky', label: 'Bluesky', icon: 'ri:bluesky-line', rel: 'noopener noreferrer' })

  return links
}

export default function Header({ channel, siteUrl, rssUrl }: { channel: ChannelInfo, siteUrl: string, rssUrl: string }) {
  const socialLinks = getSocialLinks(rssUrl)

  return (
    <header>
      <div className="mb-2.5 flex items-center gap-2.5 p-0 font-semibold max-sm:mb-2 max-sm:p-0">
        <a href={siteUrl} title={channel?.title}>
          <img
            src={channel?.avatar?.startsWith('http') ? STATIC_PROXY + channel?.avatar : '/void.png'}
            alt={channel?.title}
            loading="eager"
            fetchPriority="high"
            width="40"
            height="40"
            className="block h-10 w-10 rounded-full border-[3px] border-white object-cover shadow-[var(--shadow-soft)]"
          />
        </a>
        <div className="min-w-0 flex-1 pr-2.5">
          <a
            href={siteUrl}
            className="text-lg text-[var(--color-heading)] no-underline hover:text-[var(--color-ink)] hover:underline"
            style={{ viewTransitionName: 'site-title', transition: '0.2s ease' } as React.CSSProperties}
            title={channel?.title}>
            {channel?.title}
          </a>
        </div>
        <nav className="flex items-center gap-0.5" aria-label="Channel links">
          {socialLinks.map(item => (
            <a
              key={item.href}
              href={item.href}
              title={item.title}
              target="_blank"
              rel={item.rel}
              className="group p-1 no-underline"
            >
              <span className={`iconify ${item.icon} h-4 w-4 align-bottom [filter:var(--icon-secondary-filter)] group-hover:[filter:var(--icon-hover-filter)]`} aria-hidden="true" />
            </a>
          ))}
        </nav>
      </div>
      {HIDE_DESCRIPTION !== 'true' && channel?.descriptionHTML && channel.descriptionHTML.length > 0 && (
        <div
          className="mb-5 break-words rounded-[var(--radius-sm)] border-l-2 border-[var(--color-line)] bg-[var(--color-code)] px-5 py-2.5 text-base leading-relaxed text-[var(--color-muted)] shadow-[var(--shadow-soft)] max-sm:my-5 max-sm:ml-0 content"
          dangerouslySetInnerHTML={{ __html: channel.descriptionHTML }}
        />
      )}
    </header>
  )
}
