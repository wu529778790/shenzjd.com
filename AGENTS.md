<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

```bash
npm run dev       # Dev server on localhost:3000
npm run build     # Production build
npm run test      # Run tests (vitest)
npm run test:watch  # Watch mode
npx tsc --noEmit  # Type check (no linter/formatter configured)
```

## Architecture

Next.js 16 App Router microblog that renders a Telegram channel's posts as a web reading experience. All pages are server-rendered (`force-dynamic`), no client-side data fetching.

### Data flow

1. `src/lib/sources/telegram.ts` — fetches raw HTML from `t.me/s/{CHANNEL}` via `ofetch`, parses with Cheerio (posts, images, videos, stickers, reactions, link previews, code blocks)
2. Code blocks auto-detected with `flourite`, syntax-highlighted with `prismjs`
3. Results cached with LRU cache: **5min TTL**, `max: 20` entries, `allowStale: true`, `updateAgeOnGet: true` — values are **always** `structuredClone`'d on read to prevent cross-request mutation. No concurrency lock per key
4. `src/lib/sources/index.ts` — facade that routes posts to Telegram

### Key routes

- `/` — home (posts + pagination)
- `/posts/[id]` — single post with Telegram comments widget
- `/before/[cursor]` / `/after/[cursor]` — older/newer posts (cursor = numeric message ID)
- `/search/[q]` — search
- `/tags` — tag cloud (from `TAGS` env)
- `/links` — link list (from `LINKS` env)
- `/sitemap.xml` — sitemap index with paginated sub-sitemaps
- `/sitemap/[cursor]` — paginated sitemap pages
- `/static/[...url]` — proxy for Telegram CDN (whitelisted domains only)

### Component pattern

All pages: fetch data → wrap in `<Layout>` → render with `<List>` or `<Header>`+`<TagCloud>`.

## Next.js 16 specifics

- **`params` in page components are `Promise<...>` — must `await` them**
- Path alias: `@/*` → `./src/*`

## Styling

- Tailwind CSS **v4** via `@tailwindcss/postcss` — config is different from v3
- Design tokens in `src/app/globals.css` `@theme` block: warm paper palette, 4pt spacing grid
- Mobile breakpoint: `37.5rem` (600px)
- `.content` class handles all Telegram HTML styling (blockquotes, spoilers, image grids, code blocks, etc.)
- CSS-only animations (anime.js removed)

## Environment

- Required: `CHANNEL` (Telegram channel username, no @)
- Full list in `.env.example` — key ones: `SITE_URL`, `LOCALE`, `TIMEZONE`, `STATIC_PROXY`, `TAGS`, `LINKS`, `NAVS` (semicolon-delimited), `COMMENTS`, `REACTIONS`
- `getEnv` / `getRequiredEnv` wrappers in `src/lib/env.ts`

## Deployment

- Docker standalone build (`output: 'standalone'` in next.config.ts)
- GitHub Actions (`docker.yml`) builds and pushes to GHCR on push to `main`, then deploys via SSH

## Gotchas

- This uses **npm** (package-lock.json), not pnpm
- Telegram HTML is rendered via `dangerouslySetInnerHTML` after Cheerio processing
- Turbopack root set in next.config.ts to prevent scanning home directory
- Tests use vitest: `npm run test`
