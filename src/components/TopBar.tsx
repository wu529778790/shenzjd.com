import type { ChannelInfo } from '../types'
import { getEnv } from '../lib/env'
import ThemeToggle from './ThemeToggle'

const GOOGLE_SEARCH_SITE = getEnv('GOOGLE_SEARCH_SITE')

interface TopBarProps {
  channel: ChannelInfo
  siteUrl: string
  children?: React.ReactNode
}

export default function TopBar({ channel, siteUrl, children }: TopBarProps) {
  return (
    <header className="sticky top-0 z-[100] border-b border-[var(--color-line)] bg-[var(--color-paper)]/85 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-[760px] items-center px-4 sm:px-6">
        <a
          href={siteUrl}
          title={channel?.title}
          className="mr-4 flex items-center gap-2.5 no-underline"
          style={{ viewTransitionName: 'site-title', transition: '0.15s ease' } as React.CSSProperties}>
          <img
            src={channel?.avatar?.startsWith('http') ? `/static/${channel?.avatar}` : '/void.png'}
            alt={channel?.title}
            loading="eager"
            fetchPriority="high"
            width="28"
            height="28"
            className="block h-7 w-7 rounded-full object-cover"
          />
          <span className="text-[15px] font-bold text-[var(--color-heading)] max-sm:hidden">
            {channel?.title}
          </span>
        </a>

        <div className="ml-auto flex items-center gap-1">
          <form
            className="hidden sm:flex items-center gap-1"
            action={`${siteUrl}search/result`}
            method="get"
            role="search">
            <button type="submit" className="sr-only">Search</button>
            {GOOGLE_SEARCH_SITE && (
              <input type="hidden" name="as_sitesearch" value={GOOGLE_SEARCH_SITE} />
            )}
            <label className="sr-only" htmlFor="nav-search">Search</label>
            <input
              id="nav-search"
              className="ui-font h-9 w-[140px] rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3 text-[13px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)] transition-all duration-200 focus:w-[200px] focus:border-[var(--color-accent)] focus:bg-white"
              type="search"
              name="q"
              placeholder="Search..."
              autoComplete="off"
              inputMode="search"
              spellCheck={false}
            />
            {GOOGLE_SEARCH_SITE && (
              <button
                type="submit"
                formAction="https://www.google.com/search"
                className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-[11px] font-bold text-[var(--color-muted)] transition-colors duration-200 hover:bg-[var(--color-line)] hover:text-[var(--color-heading)]"
                title="Search with Google">
                G
              </button>
            )}
          </form>

          <ThemeToggle />

          {/* Mobile hamburger */}
          <details className="lg:hidden">
            <summary
              className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-[var(--radius-md)] bg-transparent text-[var(--color-muted)] transition-colors hover:bg-[var(--color-line)] [&::-webkit-details-marker]:hidden">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="3" y1="5" x2="15" y2="5" />
                <line x1="3" y1="9" x2="15" y2="9" />
                <line x1="3" y1="13" x2="15" y2="13" />
              </svg>
            </summary>
            {children}
          </details>
        </div>
      </div>
    </header>
  )
}
