import type { ChannelInfo, NavItem } from "../types";
import { getEnv } from "../lib/env";
import { sanitizeInjection } from "../lib/sanitize";
import Animations from "./Animations";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";

const TAGS = getEnv("TAGS");
const LINKS = getEnv("LINKS");
const NAVS = getEnv("NAVS");
const GOOGLE_SEARCH_SITE = getEnv("GOOGLE_SEARCH_SITE");
const HEADER_INJECT = getEnv("HEADER_INJECT");
const FOOTER_INJECT = getEnv("FOOTER_INJECT");

const navs: NavItem[] = (NAVS || "")
  .split(";")
  .filter(Boolean)
  .map((link) => {
    const [title = "", href = ""] = link.split(",");
    return { title, href };
  });

function normalizePathname(p: string): string {
  return p.replace(/\/$/, "") || "/";
}

interface LayoutProps {
  channel: ChannelInfo;
  siteUrl: string;
  pathname: string;
  children: React.ReactNode;
}

export default function Layout({
  channel,
  siteUrl,
  pathname,
  children,
}: LayoutProps) {
  const currentPathname = normalizePathname(pathname);
  const isAbsolute = siteUrl.startsWith('http');
  const siteRootPathname = normalizePathname(isAbsolute ? new URL(siteUrl).pathname : siteUrl);
  const tagsPathname = normalizePathname(isAbsolute ? new URL("tags", siteUrl).pathname : `${siteUrl}tags`);
  const linksPathname = normalizePathname(isAbsolute ? new URL("links", siteUrl).pathname : `${siteUrl}links`);

  const isActive = (path: string) => currentPathname === path;

  return (
    <>
      <a
        href="#main-content"
        className="pointer-events-none absolute left-5 top-0 z-[1100] -translate-y-full rounded-[var(--radius-sm)] bg-[var(--color-heading)] px-3 py-2 text-sm text-[var(--color-paper)] no-underline transition-transform duration-150 focus-visible:pointer-events-auto focus-visible:translate-y-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-heading)]">
        Skip to main content
      </a>

      {/* Top navigation bar — simplified: logo + search + theme */}
      <header className="sticky top-0 z-[100] border-b border-[var(--color-line)] bg-[var(--color-paper)]/85 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-[760px] items-center px-4 sm:px-6">
          {/* Site title */}
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

          {/* Right side: search + theme + mobile menu */}
          <div className="ml-auto flex items-center gap-1">
            {/* Desktop search */}
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
              <div className="absolute inset-x-0 top-12 border-t border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-medium)]">
                <nav aria-label="Mobile navigation" className="mx-auto flex max-w-[760px] flex-col px-4 py-2">
                  {/* Channel info on mobile */}
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
            </details>
          </div>
        </div>
      </header>

      {/* Main content: articles left, sidebar right */}
      <main id="main-content" className="relative mx-auto max-w-[760px] px-4 py-6 sm:px-6 sm:py-8">
        <div className="lg:flex lg:justify-center lg:gap-8">
          {/* Left: article stream */}
          <div className="min-w-0 mx-auto lg:mx-0 lg:flex-1">
            {children}
          </div>

          {/* Right: sidebar — desktop only */}
          <Sidebar channel={channel} siteUrl={siteUrl} pathname={pathname} />
        </div>
      </main>

      {/* Footer */}
      <footer className="ui-font border-t border-[var(--color-line)] py-8 text-center text-[11px] text-[var(--color-footer)]">
        Powered by{" "}
        <a
          href="https://github.com/wu529778790/shenzjd.com"
          title="shenzjd.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors duration-200">
          shenzjd.com
        </a>
      </footer>

      {/* Back to top */}
      <a
        href="#main-content"
        id="back-to-top"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-card)] text-lg text-[var(--color-muted)] opacity-90 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:text-[var(--color-accent)] hover:shadow-[var(--shadow-medium)] active:translate-y-px"
        aria-label="Back to top">
        &uarr;
      </a>

      {HEADER_INJECT && (
        <div dangerouslySetInnerHTML={{ __html: sanitizeInjection(HEADER_INJECT) }} />
      )}
      {FOOTER_INJECT && (
        <div dangerouslySetInnerHTML={{ __html: sanitizeInjection(FOOTER_INJECT) }} />
      )}

      <Animations />
    </>
  );
}
