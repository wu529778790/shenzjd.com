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

  return (
    <>
      <a
        href="#main-content"
        className="pointer-events-none absolute left-5 top-0 z-[1100] -translate-y-full rounded-[var(--radius-sm)] bg-[var(--color-heading)] px-3 py-2 text-sm text-white no-underline transition-transform duration-150 focus-visible:pointer-events-auto focus-visible:translate-y-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-heading)] sm:hidden">
        Skip to main content
      </a>

      <main id="main-content" className="relative mx-4 sm:mx-6 lg:mx-8">
        <div className="mx-auto flex w-full max-w-[820px] flex-col-reverse sm:flex-row sm:items-start sm:gap-8">
          {/* Main content */}
          <div className="w-full min-w-0 pb-6 pt-4 sm:flex-1 sm:pt-6">
            {children}
          </div>

          {/* Sidebar */}
          <aside className="w-full min-w-0 border-b border-[var(--color-line)] bg-[var(--color-sidebar)] pb-4 sm:w-[220px] sm:min-w-[220px] sm:self-start sm:rounded-[var(--radius-lg)] sm:border sm:border-[var(--color-line)] sm:bg-[var(--color-card)] sm:p-5 sm:shadow-[var(--shadow-card)]">
            {/* Mobile: hamburger toggle */}
            <div className="flex items-center justify-between px-1 pt-3 sm:hidden">
              <span className="text-sm font-medium text-[var(--color-heading)]">
                {channel?.title || "MicroBlog"}
              </span>
              <button
                type="button"
                id="nav-toggle"
                aria-label="Toggle navigation"
                aria-expanded="false"
                className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-transparent text-[var(--color-muted)] transition-colors hover:bg-[var(--color-line)]">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="3" y1="5" x2="15" y2="5" />
                  <line x1="3" y1="9" x2="15" y2="9" />
                  <line x1="3" y1="13" x2="15" y2="13" />
                </svg>
              </button>
            </div>

            {/* Nav content - collapsible on mobile */}
            <div id="nav-content" className="relative overflow-y-visible sm:max-h-[100svh] sm:overflow-y-auto">
              <nav aria-label="Primary navigation">
                <ul className="m-0 flex list-none flex-wrap gap-1.5 pl-0 pt-3 sm:block sm:gap-0 sm:pt-0">
                  <li className="flex items-center text-[13px] leading-none sm:mb-1">
                    <a
                      href={siteUrl}
                      title={channel?.title}
                      className={`flex-1 inline-block rounded-[var(--radius-md)] px-3 py-2 text-[var(--color-heading)] no-underline transition-all duration-200 hover:bg-[var(--color-line)] hover:no-underline ${currentPathname === siteRootPathname ? "bg-[var(--color-accent-light)] font-medium text-[var(--color-accent)]" : ""}`}>
                      Home
                    </a>
                  </li>
                  {TAGS && (
                    <li className="flex items-center text-[13px] leading-none sm:mb-1">
                      <a
                        href={`${siteUrl}tags`}
                        title="Tags"
                        className={`flex-1 inline-block rounded-[var(--radius-md)] px-3 py-2 text-[var(--color-heading)] no-underline transition-all duration-200 hover:bg-[var(--color-line)] hover:no-underline ${currentPathname === tagsPathname ? "bg-[var(--color-accent-light)] font-medium text-[var(--color-accent)]" : ""}`}>
                        Tags
                      </a>
                    </li>
                  )}
                  {LINKS && (
                    <li className="flex items-center text-[13px] leading-none sm:mb-1">
                      <a
                        href={`${siteUrl}links`}
                        title="Links"
                        className={`flex-1 inline-block rounded-[var(--radius-md)] px-3 py-2 text-[var(--color-heading)] no-underline transition-all duration-200 hover:bg-[var(--color-line)] hover:no-underline ${currentPathname === linksPathname ? "bg-[var(--color-accent-light)] font-medium text-[var(--color-accent)]" : ""}`}>
                        Links
                      </a>
                    </li>
                  )}
                  {navs.map((nav) => (
                    <li key={nav.href} className="flex items-center text-[13px] leading-none sm:mb-1">
                      <a
                        href={nav.href}
                        title={nav.title}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-block rounded-[var(--radius-md)] px-3 py-2 text-[var(--color-heading)] no-underline transition-all duration-200 hover:bg-[var(--color-line)] hover:no-underline">
                        {nav.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <form
                className="mt-3 hidden rounded-[var(--radius-md)] bg-[var(--color-code)] p-2 sm:mt-4 sm:block"
                action={searchAction}
                method="get"
                role="search">
                {GOOGLE_SEARCH_SITE && (
                  <input
                    type="hidden"
                    name="as_sitesearch"
                    value={GOOGLE_SEARCH_SITE}
                  />
                )}
                <label className="sr-only" htmlFor="search-query">
                  Search
                </label>
                <input
                  id="search-query"
                  className="box-border w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-[13px] leading-relaxed text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)] focus-visible:border-[var(--color-accent)] focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                  type="search"
                  name="q"
                  placeholder="Search..."
                  autoComplete="off"
                  inputMode="search"
                  spellCheck={false}
                />
              </form>

              <footer className="hidden p-2 pt-4 text-[11px] leading-relaxed text-[var(--color-footer)] sm:block">
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
            </div>
          </aside>
        </div>

        {/* Back to top */}
        <div id="back-to-top-wrapper">
          <a
            href="#main-content"
            id="back-to-top"
            className="pointer-events-auto z-[1000] flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-card)] text-xl text-[var(--color-muted)] opacity-90 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:text-[var(--color-accent)] hover:shadow-[var(--shadow-medium)] active:translate-y-px"
            aria-label="Back to top">
            &uarr;
          </a>
        </div>
      </main>

      {/* Mobile nav toggle script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var t=document.getElementById('nav-toggle'),c=document.getElementById('nav-content');if(!t||!c)return;t.addEventListener('click',function(){var o=c.style.display==='block';c.style.display=o?'none':'block';t.setAttribute('aria-expanded',String(!o))})})()`,
        }}
      />

      {HEADER_INJECT && (
        <div dangerouslySetInnerHTML={{ __html: HEADER_INJECT }} />
      )}
      {FOOTER_INJECT && (
        <div dangerouslySetInnerHTML={{ __html: FOOTER_INJECT }} />
      )}
    </>
  );
}
