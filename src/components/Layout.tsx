"use client";

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

const layoutShellClass = "mx-5";
const layoutGridClass =
  "mx-auto flex w-full max-w-[800px] flex-col-reverse sm:flex-row sm:items-start";
const mainPanelClass =
  "w-full min-w-0 pb-5 pt-[10px] sm:mr-5 sm:flex-1 sm:border-r sm:border-line sm:pr-[30px] sm:pt-5";
const asidePanelClass =
  "sticky top-0 w-full min-w-0 border-b border-line bg-paper pb-[10px] shadow-[0_4px_16px_-16px_rgba(0,0,0,0.1)] sm:w-[200px] sm:min-w-[200px] sm:self-start sm:border-b-0 sm:bg-transparent sm:pb-5 sm:shadow-none";
const asideInnerClass =
  "relative overflow-y-visible sm:max-h-[100svh] sm:overflow-y-auto";
const navListClass =
  "m-0 flex list-none flex-wrap gap-[2px] pl-0 pt-5 sm:block";
const navItemClass =
  "flex items-center text-[14px] leading-none sm:mb-[10px] sm:text-base sm:leading-normal";
const navLinkClass =
  "flex-1 inline-block rounded-panel px-[10px] py-[5px] text-heading no-underline transition-[background-color,box-shadow] duration-150 ease-in-out hover:bg-white/65 hover:shadow-soft hover:no-underline";
const navLinkCurrentClass = "bg-white/75 shadow-soft";
const skipLinkClass =
  "pointer-events-none absolute left-5 top-0 z-[1100] -translate-y-full rounded-panel bg-heading px-3 py-2 text-sm text-white no-underline transition-transform duration-150 focus-visible:pointer-events-auto focus-visible:translate-y-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-heading sm:hidden";
const searchFormClass =
  "mt-3 hidden rounded-panel bg-code p-2 text-muted sm:mt-0 sm:block";
const searchInputClass =
  "box-border w-full rounded-panel border border-paper bg-code px-2 text-[16px] leading-[2.4] text-muted outline-none placeholder:text-muted focus-visible:border-heading focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-heading sm:text-[12px]";
const footerClass = "hidden p-2 text-[14px] leading-[1.5] text-footer sm:block";
const backToTopClass =
  "pointer-events-auto z-[1000] flex h-8 w-8 items-center justify-center rounded-full bg-code text-[24px] opacity-90 transition-transform duration-300 hover:-translate-y-[3px] active:translate-y-px";

interface LayoutProps {
  channel: ChannelInfo;
  siteUrl: string;
  rssUrl: string;
  pathname: string;
  children: React.ReactNode;
}

export default function Layout({
  channel,
  siteUrl,
  rssUrl,
  pathname,
  children,
}: LayoutProps) {
  const searchAction = GOOGLE_SEARCH_SITE
    ? "https://www.google.com/search"
    : `${siteUrl}search/result`;

  function normalizePathname(p: string): string {
    return p.replace(/\/$/, "") || "/";
  }

  const currentPathname = normalizePathname(pathname);
  const siteRootPathname = normalizePathname(new URL(siteUrl).pathname);
  const tagsPathname = normalizePathname(new URL("tags", siteUrl).pathname);
  const linksPathname = normalizePathname(new URL("links", siteUrl).pathname);

  return (
    <>
      <a href="#main-content" className={skipLinkClass}>
        Skip to main content
      </a>
      <main id="main-content" className={layoutShellClass}>
        <div className={layoutGridClass}>
          <div className={mainPanelClass}>{children}</div>
          <aside className={asidePanelClass}>
            <div className={asideInnerClass}>
              <nav aria-label="Primary navigation">
                <ul className={navListClass}>
                  <li className={navItemClass}>
                    <a
                      href={siteUrl}
                      title={channel?.title}
                      className={`${navLinkClass} ${currentPathname === siteRootPathname ? navLinkCurrentClass : ""}`}>
                      Home
                    </a>
                  </li>
                  {TAGS && (
                    <li className={navItemClass}>
                      <a
                        href={`${siteUrl}tags`}
                        title="Tags"
                        className={`${navLinkClass} ${currentPathname === tagsPathname ? navLinkCurrentClass : ""}`}>
                        Tags
                      </a>
                    </li>
                  )}
                  {LINKS && (
                    <li className={navItemClass}>
                      <a
                        href={`${siteUrl}links`}
                        title="Links"
                        className={`${navLinkClass} ${currentPathname === linksPathname ? navLinkCurrentClass : ""}`}>
                        Links
                      </a>
                    </li>
                  )}
                  {navs.map((nav) => (
                    <li key={nav.href} className={navItemClass}>
                      <a
                        href={nav.href}
                        title={nav.title}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={navLinkClass}>
                        {nav.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <form
                className={searchFormClass}
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
                  className={searchInputClass}
                  type="search"
                  name="q"
                  placeholder="Search…"
                  autoComplete="off"
                  inputMode="search"
                  spellCheck={false}
                />
              </form>

              <footer className={footerClass}>
                Powered by{" "}
                <a
                  href="https://github.com/shenzjd_com/microblog"
                  title="microblog"
                  target="_blank"
                  rel="noopener noreferrer">
                  microblog
                </a>
              </footer>
            </div>
          </aside>
        </div>
        <div id="back-to-top-wrapper">
          <a
            href="#main-content"
            id="back-to-top"
            className={backToTopClass}
            aria-label="Back to top">
            ↑
          </a>
        </div>
      </main>
      {FOOTER_INJECT && (
        <div dangerouslySetInnerHTML={{ __html: FOOTER_INJECT }} />
      )}
    </>
  );
}
