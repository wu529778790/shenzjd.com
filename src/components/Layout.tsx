import type { ChannelInfo, NavItem } from "../types";
import { getEnv } from "../lib/env";

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
  const searchAction = GOOGLE_SEARCH_SITE
    ? "https://www.google.com/search"
    : `${siteUrl}search/result`;

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
        className="pointer-events-none absolute left-5 top-0 z-[1100] -translate-y-full rounded-[var(--radius-sm)] bg-[var(--color-heading)] px-3 py-2 text-sm text-white no-underline transition-transform duration-150 focus-visible:pointer-events-auto focus-visible:translate-y-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-heading)]">
        Skip to main content
      </a>

      {/* Top navigation bar */}
      <header className="sticky top-0 z-[100] border-b border-[var(--color-line)] bg-[var(--color-paper)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-12 max-w-[960px] items-center px-4 sm:px-6">
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
              width="24"
              height="24"
              className="block h-6 w-6 rounded-full object-cover"
            />
            <span className="text-sm font-bold text-[var(--color-heading)] max-sm:hidden">
              {channel?.title}
            </span>
          </a>

          {/* Desktop navigation */}
          <nav className="flex items-center gap-0.5 max-sm:hidden" aria-label="Primary navigation">
            {TAGS && (
              <a
                href={`${siteUrl}tags`}
                className={`rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[13px] font-medium no-underline transition-colors duration-200 hover:bg-[var(--color-line)] ${isActive(tagsPathname) ? 'text-[var(--color-accent)]' : 'text-[var(--color-heading)]'}`}>
                Tags
              </a>
            )}
            {LINKS && (
              <a
                href={`${siteUrl}links`}
                className={`rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[13px] font-medium no-underline transition-colors duration-200 hover:bg-[var(--color-line)] ${isActive(linksPathname) ? 'text-[var(--color-accent)]' : 'text-[var(--color-heading)]'}`}>
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
                className="rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[13px] font-medium text-[var(--color-heading)] no-underline transition-colors duration-200 hover:bg-[var(--color-line)]">
                {nav.title}
              </a>
            ))}
          </nav>

          {/* Right side: search + mobile menu */}
          <div className="ml-auto flex items-center gap-2">
            {/* Desktop search */}
            <form
              className="hidden sm:block"
              action={searchAction}
              method="get"
              role="search">
              {GOOGLE_SEARCH_SITE && (
                <input type="hidden" name="as_sitesearch" value={GOOGLE_SEARCH_SITE} />
              )}
              <label className="sr-only" htmlFor="nav-search">Search</label>
              <input
                id="nav-search"
                className="h-8 w-[160px] rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3 text-[13px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)] transition-all duration-200 focus:w-[220px] focus:border-[var(--color-accent)]"
                type="search"
                name="q"
                placeholder="Search..."
                autoComplete="off"
                inputMode="search"
                spellCheck={false}
              />
            </form>

            {/* Mobile hamburger - using details/summary for CSS-only toggle */}
            <details className="sm:hidden">
              <summary
                className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-[var(--radius-md)] bg-transparent text-[var(--color-muted)] transition-colors hover:bg-[var(--color-line)] [&::-webkit-details-marker]:hidden">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="3" y1="5" x2="15" y2="5" />
                  <line x1="3" y1="9" x2="15" y2="9" />
                  <line x1="3" y1="13" x2="15" y2="13" />
                </svg>
              </summary>
              <div className="absolute inset-x-0 top-12 border-t border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-medium)]">
                <nav aria-label="Mobile navigation" className="mx-auto flex max-w-[960px] flex-col px-4 py-2">
                  {TAGS && (
                    <a
                      href={`${siteUrl}tags`}
                      className={`rounded-[var(--radius-sm)] px-3 py-2 text-[13px] no-underline transition-colors duration-200 ${isActive(tagsPathname) ? 'font-medium text-[var(--color-accent)]' : 'text-[var(--color-heading)] hover:bg-[var(--color-line)]'}`}>
                      Tags
                    </a>
                  )}
                  {LINKS && (
                    <a
                      href={`${siteUrl}links`}
                      className={`rounded-[var(--radius-sm)] px-3 py-2 text-[13px] no-underline transition-colors duration-200 ${isActive(linksPathname) ? 'font-medium text-[var(--color-accent)]' : 'text-[var(--color-heading)] hover:bg-[var(--color-line)]'}`}>
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
                      className="rounded-[var(--radius-sm)] px-3 py-2 text-[13px] text-[var(--color-heading)] no-underline transition-colors duration-200 hover:bg-[var(--color-line)]">
                      {nav.title}
                    </a>
                  ))}
                  <form
                    className="mt-1 border-t border-[var(--color-line)] pt-2"
                    action={searchAction}
                    method="get"
                    role="search">
                    {GOOGLE_SEARCH_SITE && (
                      <input type="hidden" name="as_sitesearch" value={GOOGLE_SEARCH_SITE} />
                    )}
                    <label className="sr-only" htmlFor="nav-search-mobile">Search</label>
                    <input
                      id="nav-search-mobile"
                      className="box-border h-9 w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-paper)] px-3 text-[13px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)] focus-visible:border-[var(--color-accent)]"
                      type="search"
                      name="q"
                      placeholder="Search..."
                      autoComplete="off"
                      inputMode="search"
                      spellCheck={false}
                    />
                  </form>
                </nav>
              </div>
            </details>
          </div>
        </div>
      </header>

      <main id="main-content" className="relative mx-auto max-w-[720px] px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-line)] py-6 text-center text-[11px] text-[var(--color-footer)]">
        Powered by{" "}
        <a
          href="https://github.com/shenzjd_com/microblog"
          title="MicroBlog"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors duration-200">
          MicroBlog
        </a>
      </footer>

      {/* Back to top */}
      <a
        href="#main-content"
        id="back-to-top"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-card)] text-xl text-[var(--color-muted)] opacity-90 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:text-[var(--color-accent)] hover:shadow-[var(--shadow-medium)] active:translate-y-px"
        aria-label="Back to top">
        &uarr;
      </a>

      {HEADER_INJECT && (
        <div dangerouslySetInnerHTML={{ __html: HEADER_INJECT }} />
      )}
      {FOOTER_INJECT && (
        <div dangerouslySetInnerHTML={{ __html: FOOTER_INJECT }} />
      )}
    </>
  );
}
