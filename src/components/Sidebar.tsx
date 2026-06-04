import type { ChannelInfo, NavItem } from "../types";
import { getEnv } from "../lib/env";

const TAGS = getEnv("TAGS");
const LINKS = getEnv("LINKS");
const NAVS = getEnv("NAVS");
const GITHUB = getEnv("GITHUB");
const TELEGRAM = getEnv("CHANNEL");
const X_ACCOUNT = getEnv("X_ACCOUNT");
const PROMOS = getEnv("PROMOS");

const navs: NavItem[] = (NAVS || "")
  .split(";")
  .filter(Boolean)
  .map((link) => {
    const [title = "", href = ""] = link.split(",");
    return { title, href };
  });

interface PromoItem {
  title: string;
  description: string;
  url: string;
}

const promos: PromoItem[] = (PROMOS || "")
  .split(";")
  .filter(Boolean)
  .map((item) => {
    const [title = "", description = "", url = ""] = item.split("|");
    return { title, description, url };
  })
  .filter((p) => p.title && p.url);

interface SidebarProps {
  channel: ChannelInfo;
  siteUrl: string;
  pathname: string;
}

function normalizePathname(p: string): string {
  return p.replace(/\/$/, "") || "/";
}

export default function Sidebar({ channel, siteUrl, pathname }: SidebarProps) {
  const currentPathname = normalizePathname(pathname);
  const isAbsolute = siteUrl.startsWith('http');
  const siteRootPathname = normalizePathname(isAbsolute ? new URL(siteUrl).pathname : siteUrl);
  const tagsPathname = normalizePathname(isAbsolute ? new URL("tags", siteUrl).pathname : `${siteUrl}tags`);
  const linksPathname = normalizePathname(isAbsolute ? new URL("links", siteUrl).pathname : `${siteUrl}links`);

  const isActive = (path: string) => currentPathname === path;

  return (
    <aside className="hidden lg:block w-[160px] shrink-0" aria-label="Sidebar">
      <div className="sticky top-20 space-y-6">
        {/* Navigation */}
        <nav className="space-y-0.5" aria-label="Sidebar navigation">
          <a
            href={siteUrl}
            className={`ui-font flex items-center rounded-[var(--radius-sm)] px-3 py-2 text-[13px] font-medium no-underline transition-colors duration-200 ${isActive(siteRootPathname) ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)]' : 'text-[var(--color-muted)] hover:bg-[var(--color-line)] hover:text-[var(--color-heading)]'}`}>
            <svg className="mr-2.5 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Home
          </a>
          {TAGS && (
            <a
              href={`${siteUrl}tags`}
              className={`ui-font flex items-center rounded-[var(--radius-sm)] px-3 py-2 text-[13px] font-medium no-underline transition-colors duration-200 ${isActive(tagsPathname) ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)]' : 'text-[var(--color-muted)] hover:bg-[var(--color-line)] hover:text-[var(--color-heading)]'}`}>
              <svg className="mr-2.5 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>
              Tags
            </a>
          )}
          {LINKS && (
            <a
              href={`${siteUrl}links`}
              className={`ui-font flex items-center rounded-[var(--radius-sm)] px-3 py-2 text-[13px] font-medium no-underline transition-colors duration-200 ${isActive(linksPathname) ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)]' : 'text-[var(--color-muted)] hover:bg-[var(--color-line)] hover:text-[var(--color-heading)]'}`}>
              <svg className="mr-2.5 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
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
              className="ui-font flex items-center rounded-[var(--radius-sm)] px-3 py-2 text-[13px] font-medium text-[var(--color-muted)] no-underline transition-colors duration-200 hover:bg-[var(--color-line)] hover:text-[var(--color-heading)]">
              <span className="mr-2.5 h-1 w-1 rounded-full bg-[var(--color-accent)] opacity-50" />
              {nav.title}
            </a>
          ))}
        </nav>

        {/* Social links */}
        {(GITHUB || TELEGRAM || X_ACCOUNT) && (
          <div className="flex items-center gap-2">
            {TELEGRAM && (
              <a
                href={`https://t.me/${TELEGRAM}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-muted)] transition-all duration-200 hover:bg-[var(--color-line)] hover:text-[var(--color-heading)]"
                title="Telegram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </a>
            )}
            {GITHUB && (
              <a
                href={`https://github.com/${GITHUB}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-muted)] transition-all duration-200 hover:bg-[var(--color-line)] hover:text-[var(--color-heading)]"
                title="GitHub">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              </a>
            )}
            {X_ACCOUNT && (
              <a
                href={`https://x.com/${X_ACCOUNT}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-muted)] transition-all duration-200 hover:bg-[var(--color-line)] hover:text-[var(--color-heading)]"
                title="X (Twitter)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            )}
          </div>
        )}

        {/* Promos */}
        {promos.length > 0 && (
          <div className="space-y-2">
            {promos.map((promo, i) => (
              <a
                key={i}
                href={promo.url}
                target="_blank"
                rel="noopener noreferrer"
                data-animate="promo"
                style={{ '--animate-delay': `${150 + i * 60}ms` } as React.CSSProperties}
                className="block rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-card)] p-3 transition-colors duration-200 hover:border-[var(--color-accent)]">
                <h3 className="ui-font text-[12px] font-medium text-[var(--color-heading)] leading-snug mb-0.5">{promo.title}</h3>
                {promo.description && (
                  <p className="ui-font text-[11px] text-[var(--color-muted)] leading-relaxed line-clamp-2">{promo.description}</p>
                )}
              </a>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-[var(--color-line)] pt-4 text-center text-[11px] text-[var(--color-footer)]">
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
      </div>
    </aside>
  );
}
