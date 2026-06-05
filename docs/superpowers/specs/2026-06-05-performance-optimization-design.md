# Performance Optimization Design

**Date:** 2026-06-05  
**Scope:** 16 performance and code quality issues across the entire codebase  
**Deployment:** Docker / Standalone  
**Rendering Strategy:** ISR (search page excluded)

---

## Overview

This design addresses 16 identified performance and code quality issues in the shenzjd.com microblog application. The changes are grouped into 5 parts, ordered by impact.

---

## Part 1: Rendering Strategy (ISR Migration)

### Problem

All page routes use `export const dynamic = 'force-dynamic'`, which completely bypasses Next.js ISR/SSG caching. Every request hits the server, which then checks a tiny 20-entry LRU cache.

### Changes

| Route | Current | Target |
|-------|---------|--------|
| `/` (home) | `force-dynamic` | `revalidate = 300` |
| `/posts/[id]` | `force-dynamic` | `revalidate = 300` |
| `/before/[cursor]` | `force-dynamic` | `revalidate = 300` |
| `/after/[cursor]` | `force-dynamic` | `revalidate = 300` |
| `/tags` | `force-dynamic` | `revalidate = 300` |
| `/links` | `force-dynamic` | `revalidate = 300` |
| `/search/[q]` | `force-dynamic` | **Keep `force-dynamic`** (search needs real-time results) |
| `/rss.xml` | `force-dynamic` | Keep dynamic, add `Cache-Control: public, max-age=600` |
| `/sitemap.xml` | `force-dynamic` | Keep dynamic, add `Cache-Control: public, max-age=3600` |
| `/sitemap/[cursor]` | `force-dynamic` | Keep dynamic, add `Cache-Control: public, max-age=3600` |

### Notes

- Next.js ISR in Docker standalone mode works correctly — the ISR cache is stored in-memory and regenerated on demand
- `revalidate = 300` aligns with the current 5-minute LRU TTL, so the transition is seamless
- The LRU cache underneath still serves as a hot cache within the ISR window

---

## Part 2: Cache Layer Optimization

### Problem

1. LRU `max: 20` is too small — pagination, search, and post lookups each use different keys, causing frequent eviction
2. `structuredClone` on every cache hit deep-clones large HTML content strings — significant CPU cost
3. `structuredClone` on cache write is unnecessary (value was just constructed)
4. Search results have no dedicated cache, reusing the same LRU as channel info

### Changes

1. **Increase LRU capacity**: `max: 20` → `max: 100`
2. **Remove write-time clone**: Delete `structuredClone` in `cloneCacheValue` for write operations
3. **Replace read-time `structuredClone` with shallow copy**:
   ```typescript
   // Before
   return structuredClone(cached)
   
   // After
   return {
     ...cached,
     posts: cached.posts.map(p => ({ ...p })),
   }
   ```
   This avoids deep-cloning HTML strings while still preventing cross-request mutation of the posts array and individual post objects
4. **Add dedicated search cache**: New LRU instance with `max: 50`, `ttl: 60000` (60s), separate from channel info cache

### Files to modify

- `src/lib/sources/telegram.ts` — cache configuration, `cloneCacheValue` function, new search cache

---

## Part 3: HTML Processing Optimization

### Problem

1. PrismJS imports 26 language components eagerly — unnecessary bundle/memory bloat
2. `dayjs` imports 6 locales but only uses 1
3. `sanitize-html` runs twice per post (once on cache write, once on render)
4. `getImageLoading` marks first 16 images as eager — too aggressive

### Changes

1. **PrismJS selective imports** (`src/lib/prism.ts`): Import only the 8 most common languages instead of all 26:
   ```typescript
   // Keep: javascript, typescript, python, go, rust, bash, markup (HTML), css
   // Remove: the other 18 languages
   ```
   Unknown languages still get syntax-highlighted (Prism falls back to no highlighting), but the 8 common ones get proper highlighting

2. **dayjs locale on-demand** (`src/lib/dayjs.ts`): Read `LOCALE` env var at module load, import only the matching locale:
   ```typescript
   const locale = getEnv('LOCALE', 'zh-cn')
   // Dynamic import based on locale value
   ```

3. **Remove redundant sanitize** (`src/components/Item.tsx`): Remove the `sanitize(post.content)` call in the render function. Content is already sanitized when entering the cache in `telegram.ts`

4. **Adjust image loading threshold** (`src/lib/sources/telegram.ts`): Change threshold from 15 to 2 — only the first 3 images are eager, rest are lazy

### Files to modify

- `src/lib/prism.ts`
- `src/lib/dayjs.ts`
- `src/components/Item.tsx`
- `src/lib/sources/telegram.ts`

---

## Part 4: Frontend Resource Optimization

### Problem

1. Google Fonts loaded via external `<link>` — render-blocking
2. `next.config.ts` has dead `images.remotePatterns` config (no `next/image` usage)
3. Empty directories `rss.json/` and `rules/prefetch.json/` serve no purpose
4. Nav parsing logic duplicated between `Sidebar.tsx` and `MobileNav.tsx`
5. `List.tsx` accesses `process.env.CHANNEL` directly instead of `getEnv`

### Changes

1. **`next/font` migration** (`src/app/layout.tsx`): Replace Google Fonts `<link>` with Next.js font optimization:
   ```typescript
   import { Newsreader } from 'next/font/google'
   const newsreader = Newsreader({ subsets: ['latin'], display: 'swap' })
   ```
   Apply the generated className to `<body>` instead of external stylesheet link

2. **Remove dead config** (`next.config.ts`): Delete `images.remotePatterns` block

3. **Clean up empty directories**: Remove `src/app/rss.json/` and `src/app/rules/prefetch.json/`

4. **Extract shared nav parsing** (`src/lib/nav.ts`): Create shared utility:
   ```typescript
   export function parseNavs(raw: string | undefined): Array<{ title: string; url: string }> { ... }
   ```
   Update `Sidebar.tsx` and `MobileNav.tsx` to import from this utility

5. **Unify env access** (`src/components/List.tsx`): Replace `process.env.CHANNEL` with `getEnv('CHANNEL', '')`

### Files to modify

- `src/app/layout.tsx`
- `next.config.ts`
- `src/components/Sidebar.tsx`
- `src/components/MobileNav.tsx`
- `src/components/List.tsx`
- New file: `src/lib/nav.ts`

### Files to delete

- `src/app/rss.json/` (empty directory)
- `src/app/rules/prefetch.json/` (empty directory)

---

## Part 5: Robustness

### Problem

1. No component-level error boundaries — one malformed post crashes the entire page
2. RSS/Sitemap routes inherit only the global 5-minute cache header
3. Static proxy forwards `Accept-Language` and other client headers to upstream

### Changes

1. **Component error boundary** (`src/components/ItemError.tsx`): Create an error boundary wrapping each `Item`:
   ```typescript
   // In List.tsx, wrap each Item in <ErrorBoundary fallback={<ItemError />}>
   // ItemError renders a placeholder with "Failed to load this post"
   ```

2. **RSS/Sitemap cache headers**: Add explicit `Cache-Control` headers:
   - `/rss.xml`: `public, max-age=600, s-maxage=600`
   - `/sitemap.xml` and `/sitemap/[cursor]`: `public, max-age=3600, s-maxage=3600`

3. **Static proxy header filtering** (`src/app/static/[...url]/route.ts`): Whitelist only safe headers to forward:
   ```typescript
   const ALLOWED_HEADERS = ['accept', 'accept-encoding']
   ```

### Files to modify

- `src/components/List.tsx` (wrap Item in ErrorBoundary)
- `src/app/rss.xml/route.ts`
- `src/app/sitemap.xml/route.ts`
- `src/app/sitemap/[cursor]/route.ts`
- `src/app/static/[...url]/route.ts`
- New file: `src/components/ItemError.tsx`

---

## Implementation Order

1. **Part 4** (Frontend Resources) — lowest risk, quick wins (next/font, dead config, empty dirs)
2. **Part 3** (HTML Processing) — moderate risk, bundle/memory improvements
3. **Part 2** (Cache Layer) — moderate risk, requires careful testing of shallow copy correctness
4. **Part 1** (ISR Migration) — highest impact, test thoroughly with Docker standalone
5. **Part 5** (Robustness) — safety net, add after core changes are stable

---

## Testing Strategy

- Run `npm run build` after each part to verify no regressions
- Run `npm run test` (vitest) after each part
- Manual verification: start dev server, navigate all page types, confirm rendering
- After Part 1: verify ISR behavior by checking `x-nextjs-cache` header in responses
- After Part 2: verify no cross-request data mutation by loading multiple pages concurrently
- After Part 3: verify PrismJS still highlights common languages correctly

---

## Risk Assessment

| Change | Risk | Mitigation |
|--------|------|------------|
| ISR migration | Medium — ISR behavior in standalone mode | Test with `npm run build && npm run start`, verify cache headers |
| Shallow copy vs structuredClone | Medium — potential mutation bugs | Verify no page mutates post objects after rendering |
| PrismJS language reduction | Low — unknown languages fall back gracefully | Test with code blocks in uncommon languages |
| next/font | Low — well-documented migration | Verify font renders correctly in all themes |
| Error boundary | Low — additive only | Verify fallback renders correctly |
