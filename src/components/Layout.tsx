import type { ChannelInfo } from "../types";
import { getEnv } from "../lib/env";
import { sanitizeInjection } from "../lib/sanitize";
import MobileNav from "./MobileNav";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

const HEADER_INJECT = getEnv("HEADER_INJECT");
const FOOTER_INJECT = getEnv("FOOTER_INJECT");

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
  return (
    <>
      <a
        href="#main-content"
        className="pointer-events-none absolute left-5 top-0 z-[1100] -translate-y-full rounded-[var(--radius-sm)] bg-[var(--color-heading)] px-3 py-2 text-sm text-[var(--color-paper)] no-underline transition-transform duration-150 focus-visible:pointer-events-auto focus-visible:translate-y-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-heading)]">
        Skip to main content
      </a>

      <TopBar channel={channel} siteUrl={siteUrl}>
        <MobileNav channel={channel} siteUrl={siteUrl} pathname={pathname} />
      </TopBar>

      <main id="main-content" className="relative mx-auto max-w-[760px] px-4 py-6 sm:px-6 sm:py-8">
        <div className="lg:flex lg:justify-center lg:gap-8">
          <div className="min-w-0 mx-auto lg:mx-0 lg:flex-1">
            {children}
          </div>
          <Sidebar channel={channel} siteUrl={siteUrl} pathname={pathname} />
        </div>
      </main>

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
    </>
  );
}
