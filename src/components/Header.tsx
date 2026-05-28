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

function getSocialLinks(): SocialLink[] {
  const links: SocialLink[] = []

  if (PODCAST) links.push({ href: PODCAST, title: 'Podcast', label: 'Podcast', icon: 'ri:mic-line', rel: 'noopener noreferrer' })
  if (TWITTER) links.push({ href: `https://x.com/${TWITTER}`, title: 'Twitter', label: 'Twitter / X', icon: 'ri:twitter-x-line', rel: 'noopener noreferrer' })
  if (GITHUB) links.push({ href: `https://github.com/${GITHUB}`, title: 'GitHub', label: 'GitHub', icon: 'ri:github-line', rel: 'noopener noreferrer' })
  if (TELEGRAM) links.push({ href: `https://t.me/${TELEGRAM}`, title: 'Telegram', label: 'Telegram', icon: 'ri:telegram-line', rel: 'noopener noreferrer' })
  if (DISCORD) links.push({ href: DISCORD, title: 'Discord', label: 'Discord', icon: 'ri:discord-line', rel: 'noopener noreferrer' })
  if (MASTODON) links.push({ href: `https://${MASTODON}`, title: 'Mastodon', label: 'Mastodon', icon: 'ri:mastodon-line', rel: 'noopener noreferrer' })
  if (BLUESKY) links.push({ href: `https://bsky.app/profile/${BLUESKY}`, title: 'BlueSky', label: 'Bluesky', icon: 'ri:bluesky-line', rel: 'noopener noreferrer' })

  return links
}

export default function Header({ channel, siteUrl }: { channel: ChannelInfo, siteUrl: string }) {
  const socialLinks = getSocialLinks()

  return (
    <header>
      <div className="mb-5 flex items-center gap-3 p-0 max-sm:mb-4 max-sm:p-0">
        <a href={siteUrl} title={channel?.title}>
          <img
            src={channel?.avatar?.startsWith('http') ? STATIC_PROXY + channel?.avatar : '/void.png'}
            alt={channel?.title}
            loading="eager"
            fetchPriority="high"
            width="40"
            height="40"
            className="block h-10 w-10 rounded-full border-2 border-white/80 object-cover shadow-[var(--shadow-soft)]"
          />
        </a>
        <div className="min-w-0 flex-1 pr-3">
          <a
            href={siteUrl}
            className="text-lg font-semibold tracking-tight text-[var(--color-heading)] no-underline transition-colors hover:text-[var(--color-accent)]"
            style={{ viewTransitionName: 'site-title', transition: '0.15s ease' } as React.CSSProperties}
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
              className="group rounded-[var(--radius-sm)] p-1.5 no-underline transition-colors hover:bg-[var(--color-line)]"
            >
              <span className={`iconify ${item.icon} h-[18px] w-[18px] align-bottom [filter:var(--icon-secondary-filter)] group-hover:[filter:var(--icon-hover-filter)]`} aria-hidden="true" />
            </a>
          ))}
        </nav>
      </div>
      {HIDE_DESCRIPTION !== 'true' && channel?.descriptionHTML && channel.descriptionHTML.length > 0 && (
        <div
          className="mb-6 break-words rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-3.5 text-[14px] leading-relaxed text-[var(--color-muted)] shadow-[var(--shadow-soft)] max-sm:my-4 max-sm:ml-0 content"
          dangerouslySetInnerHTML={{ __html: channel.descriptionHTML }}
        />
      )}
    </header>
  )
}
