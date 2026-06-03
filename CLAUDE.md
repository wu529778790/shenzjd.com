# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Serve production build
```

No test suite, linter, or formatter is configured.

TypeScript check: `npx tsc --noEmit`

## Architecture

**Next.js 16 App Router** microblog that surfaces a Telegram channel's posts as a web reading experience. All pages are server-rendered (`force-dynamic`) — there is no client-side data fetching.

### Data Pipeline

1. `src/lib/sources/telegram.ts` fetches raw HTML from `t.me/s/{CHANNEL}` (or embed endpoints for individual posts) using `ofetch`
2. Cheerio parses the HTML, extracting post content, images, videos, stickers, reactions, link previews, and code blocks
3. Code blocks are auto-detected with `flourite` and syntax-highlighted with `prismjs`
4. `src/lib/sources/x.ts` fetches from Twitter/X syndication endpoint, merges with Telegram posts
5. Results are cached with a **stale-while-revalidate** strategy: 24h TTL, 30min refresh interval. Cache hits return immediately; if data is stale (>30min), a background refresh runs (with concurrency lock per key). Values are always `structuredClone`d on read to prevent cross-request mutation
6. `src/lib/sources/index.ts` is a facade that merges Telegram and X sources, routes posts by prefix

### Routing

| Route | Purpose |
|---|---|
| `/` | Home — channel posts with pagination |
| `/posts/[id]` | Single post detail with Telegram comments widget |
| `/before/[cursor]` | Older posts (cursor = ISO timestamp) |
| `/after/[cursor]` | Newer posts (cursor = ISO timestamp) |
| `/search/[q]` | Search results via Telegram's built-in search |
| `/tags` | Tag cloud (tags from `TAGS` env var) |
| `/links` | Link list (from `LINKS` env var) |
| `/rss.xml` | RSS 2.0 feed (not yet implemented) |
| `/rss.json` | JSON Feed 1.1 (not yet implemented) |
| `/sitemap.xml` | XML sitemap index |
| `/sitemap/[cursor]` | Paginated sitemap pages |
| `/static/[...url]` | Proxy for Telegram CDN assets (whitelisted domains only) |

### Component Hierarchy

All pages follow the same pattern: fetch data → wrap in `<Layout>` → render with `<List>` or `<Header>`+`<TagCloud>`.

- **Layout** (`src/components/Layout.tsx`): sidebar + content column, mobile hamburger nav (inline `<script>` toggle), search form, back-to-top button, header/footer inject zones
- **List** (`src/components/List.tsx`): renders `<ol>` of `<Item>` components with before/after pagination links (timestamp-based cursors)
- **Item** (`src/components/Item.tsx`): single post — timestamp, content (via `dangerouslySetInnerHTML`), reactions, tags, optional Telegram comments widget
- **Header** (`src/components/Header.tsx`): avatar, title, social links (RSS, Twitter, GitHub, Telegram, etc.), channel description

### Styling

- Tailwind CSS v4 via `@tailwindcss/postcss`
- Design tokens defined in `globals.css` `@theme` block: warm paper palette (`--color-paper: #faf6f0`), 4pt spacing grid, elevation shadows
- Body uses serif font (`Georgia` family); headings use system sans-serif
- `.content` class handles Telegram HTML styling (blockquotes, expandable sections, spoilers, image grids, link previews, code blocks, stickers, modals via Popover API)
- Mobile breakpoint: `37.5rem` (600px)

### Environment Variables

Required: `CHANNEL` (Telegram channel username).

Key optional vars in `.env.example`: `SITE_URL`, `LOCALE`, `TIMEZONE`, `STATIC_PROXY`, `TELEGRAM_HOST`, `TAGS`, `LINKS`, `NAVS` (semicolon-delimited), `COMMENTS`, `REACTIONS`, `HIDE_DESCRIPTION`, `GOOGLE_SEARCH_SITE`, `PROMOS`, social media usernames, `HEADER_INJECT`/`FOOTER_INJECT` (raw HTML), SEO flags (`NO_INDEX`, `NO_FOLLOW`).

### Static Asset Proxy

`/static/[...url]` proxies Telegram CDN resources through the app. Only domains in the whitelist (`t.me`, `telegram.org`, `cdn-telegram.org`, `telesco.pe`, etc.) are allowed. The `STATIC_PROXY` env var defaults to `/static/` and is prepended to all Telegram media URLs during HTML processing.

### Key Patterns

- `params` in page components are `Promise<...>` (Next.js 16 convention — must `await`)
- Cache values are always cloned via `structuredClone` before return to prevent cross-request mutation
- `getEnv` / `getRequiredEnv` wrappers in `src/lib/env.ts` for accessing `process.env`
- Social links, nav items, tags, and links are parsed from semicolon/comma-delimited env strings at module load time
- X/Twitter posts use `x-` prefix in their IDs (defined as `X_ID_PREFIX` in `x.ts`)
- Fetch config: `retry: 3`, `retryDelay: 1000`, `timeout: 20000` — Telegram connections can be unreliable from China
