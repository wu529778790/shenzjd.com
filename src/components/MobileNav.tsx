import type { ChannelInfo } from '../types'
import { getEnv } from '../lib/env'
import { parseNavs } from '../lib/nav'

const TAGS = getEnv('TAGS')
const LINKS = getEnv('LINKS')
const NAVS = getEnv('NAVS')
const GOOGLE_SEARCH_SITE = getEnv('GOOGLE_SEARCH_SITE')

const navs = parseNavs(NAVS)

function normalizePathname(p: string): string {
  return p.replace(/\/$/, '') || '/'
}

interface MobileNavProps {
  channel: ChannelInfo
  siteUrl: string
  pathname: string
}

export default function MobileNav({ channel, siteUrl, pathname }: MobileNavProps) {
  const currentPathname = normalizePathname(pathname)
  const isAbsolute = siteUrl.startsWith('http')
  const tagsPathname = normalizePathname(isAbsolute ? new URL('tags', siteUrl).pathname : `${siteUrl}tags`)
  const linksPathname = normalizePathname(isAbsolute ? new URL('links', siteUrl).pathname : `${siteUrl}links`)

  const isActive = (path: string) => currentPathname === path

  return (
    <div className="absolute inset-x-0 top-12 border-t border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-medium)]">
      <nav aria-label="Mobile navigation" className="mx-auto flex max-w-[760px] flex-col px-4 py-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <img
            src={channel?.avatar?.startsWith('http') ? `/static/${channel?.avatar}` : '/void.png'}
            alt={channel?.title}
            width="36"
            height="36"
            className="h-9 w-9 rounded-full object-cover"
          />
          <div>
            <p className="text-[13px] font-semibold text-[var(--color-heading)] leading-tight">{channel?.title}</p>
            {channel?.description && (
              <p className="text-[11px] text-[var(--color-muted)] leading-snug line-clamp-1 mt-0.5">{channel.description}</p>
            )}
          </div>
        </div>
        <div className="border-t border-[var(--color-line)] my-1" />
        {TAGS && (
          <a
            href={`${siteUrl}tags`}
            className={`ui-font rounded-[var(--radius-sm)] px-3 py-2 text-[13px] no-underline transition-colors duration-200 ${isActive(tagsPathname) ? 'font-medium text-[var(--color-accent)]' : 'text-[var(--color-heading)] hover:bg-[var(--color-line)]'}`}>
            Tags
          </a>
        )}
        {LINKS && (
          <a
            href={`${siteUrl}links`}
            className={`ui-font rounded-[var(--radius-sm)] px-3 py-2 text-[13px] no-underline transition-colors duration-200 ${isActive(linksPathname) ? 'font-medium text-[var(--color-accent)]' : 'text-[var(--color-heading)] hover:bg-[var(--color-line)]'}`}>
            Links
          </a>
        )}
        {navs.map((nav) => (
          <a
            key={nav.href}
            href={nav.href}
            title={nav.title}
            target="_blank"
            rel="noopener noreferrer"
            className="ui-font rounded-[var(--radius-sm)] px-3 py-2 text-[13px] text-[var(--color-heading)] no-underline transition-colors duration-200 hover:bg-[var(--color-line)]">
            {nav.title}
          </a>
        ))}
        <div className="border-t border-[var(--color-line)] my-1" />
        <form
          className="px-3 py-2"
          action={`${siteUrl}search/result`}
          method="get"
          role="search">
          <button type="submit" className="sr-only">Search</button>
          {GOOGLE_SEARCH_SITE && (
            <input type="hidden" name="as_sitesearch" value={GOOGLE_SEARCH_SITE} />
          )}
          <label className="sr-only" htmlFor="nav-search-mobile">Search</label>
          <div className="flex items-center gap-1">
            <input
              id="nav-search-mobile"
              className="ui-font box-border h-9 flex-1 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-paper)] px-3 text-[13px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)] focus-visible:border-[var(--color-accent)]"
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
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-paper)] text-[11px] font-bold text-[var(--color-muted)] transition-colors duration-200 hover:bg-[var(--color-line)] hover:text-[var(--color-heading)]"
                title="Search with Google">
                G
              </button>
            )}
          </div>
        </form>
      </nav>
    </div>
  )
}
