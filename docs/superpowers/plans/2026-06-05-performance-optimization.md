# Performance Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 16 performance and code quality issues across the microblog application.

**Architecture:** Migrate page routes from `force-dynamic` to ISR (`revalidate = 300`), optimize the LRU cache layer (capacity, clone strategy), reduce bundle size (PrismJS, dayjs locale, next/font), and add robustness (error boundaries, cache headers, proxy header filtering).

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, vitest, Cheerio, PrismJS, dayjs, lru-cache, sanitize-html

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/nav.ts` | Create | Shared nav parsing utility |
| `src/components/ItemError.tsx` | Create | Error boundary fallback for Item |
| `src/app/layout.tsx` | Modify | Migrate Google Fonts to next/font |
| `src/lib/prism.ts` | Modify | Reduce language imports from 26 to 8 |
| `src/lib/dayjs.ts` | Modify | Import only configured locale |
| `src/components/Item.tsx` | Modify | Remove redundant sanitize call |
| `src/lib/sources/telegram.ts` | Modify | Cache optimization, image loading threshold |
| `src/components/Sidebar.tsx` | Modify | Use shared nav parsing |
| `src/components/MobileNav.tsx` | Modify | Use shared nav parsing |
| `src/components/List.tsx` | Modify | Use getEnv, add ErrorBoundary |
| `next.config.ts` | Modify | Remove dead images.remotePatterns |
| `src/app/page.tsx` | Modify | force-dynamic → revalidate |
| `src/app/posts/[id]/page.tsx` | Modify | force-dynamic → revalidate |
| `src/app/before/[cursor]/page.tsx` | Modify | force-dynamic → revalidate |
| `src/app/after/[cursor]/page.tsx` | Modify | force-dynamic → revalidate |
| `src/app/tags/page.tsx` | Modify | force-dynamic → revalidate |
| `src/app/links/page.tsx` | Modify | force-dynamic → revalidate |
| `src/app/rss.xml/route.ts` | Modify | Add Cache-Control header |
| `src/app/sitemap.xml/route.ts` | Modify | Add Cache-Control header |
| `src/app/sitemap/[cursor]/route.ts` | Modify | Add Cache-Control header |
| `src/app/static/[...url]/route.ts` | Modify | Filter forwarded headers |
| `src/app/rss.json/` | Delete | Empty directory |
| `src/app/rules/prefetch.json/` | Delete | Empty directory |

---

## Task 1: Extract shared nav parsing utility

**Files:**
- Create: `src/lib/nav.ts`

The `NAVS` env var parsing logic is duplicated in `Sidebar.tsx` (line 12-18) and `MobileNav.tsx` (line 9-15). Extract it into a shared utility.

- [ ] **Step 1: Create the shared nav parsing utility**

```typescript
// src/lib/nav.ts
import type { NavItem } from '../types'

export function parseNavs(raw: string | undefined): NavItem[] {
  return (raw || '')
    .split(';')
    .filter(Boolean)
    .map((link) => {
      const [title = '', href = ''] = link.split(',')
      return { title, href }
    })
}
```

- [ ] **Step 2: Run existing tests to verify no regressions**

Run: `npm run test`
Expected: All existing tests pass

- [ ] **Step 3: Commit**

```bash
git add src/lib/nav.ts
git commit -m "refactor: extract shared nav parsing utility"
```

---

## Task 2: Update Sidebar to use shared nav parsing

**Files:**
- Modify: `src/components/Sidebar.tsx:1-18`

- [ ] **Step 1: Update Sidebar imports and remove duplicated parsing**

Replace the import section and navs parsing. Current code (lines 1-18):

```typescript
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
```

Replace with:

```typescript
import type { ChannelInfo } from "../types";
import { getEnv } from "../lib/env";
import { parseNavs } from "../lib/nav";

const TAGS = getEnv("TAGS");
const LINKS = getEnv("LINKS");
const NAVS = getEnv("NAVS");
const GITHUB = getEnv("GITHUB");
const TELEGRAM = getEnv("CHANNEL");
const X_ACCOUNT = getEnv("X_ACCOUNT");
const PROMOS = getEnv("PROMOS");

const navs = parseNavs(NAVS);
```

- [ ] **Step 2: Run tests**

Run: `npm run test`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add src/components/Sidebar.tsx
git commit -m "refactor: use shared nav parsing in Sidebar"
```

---

## Task 3: Update MobileNav to use shared nav parsing

**Files:**
- Modify: `src/components/MobileNav.tsx:1-15`

- [ ] **Step 1: Update MobileNav imports and remove duplicated parsing**

Current code (lines 1-15):

```typescript
import type { ChannelInfo, NavItem } from '../types'
import { getEnv } from '../lib/env'

const TAGS = getEnv('TAGS')
const LINKS = getEnv('LINKS')
const NAVS = getEnv('NAVS')
const GOOGLE_SEARCH_SITE = getEnv('GOOGLE_SEARCH_SITE')

const navs: NavItem[] = (NAVS || '')
  .split(';')
  .filter(Boolean)
  .map((link) => {
    const [title = '', href = ''] = link.split(',')
    return { title, href }
  })
```

Replace with:

```typescript
import type { ChannelInfo } from '../types'
import { getEnv } from '../lib/env'
import { parseNavs } from '../lib/nav'

const TAGS = getEnv('TAGS')
const LINKS = getEnv('LINKS')
const NAVS = getEnv('NAVS')
const GOOGLE_SEARCH_SITE = getEnv('GOOGLE_SEARCH_SITE')

const navs = parseNavs(NAVS)
```

- [ ] **Step 2: Run tests**

Run: `npm run test`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add src/components/MobileNav.tsx
git commit -m "refactor: use shared nav parsing in MobileNav"
```

---

## Task 4: Unify env access in List.tsx

**Files:**
- Modify: `src/components/List.tsx:1-3`

- [ ] **Step 1: Add getEnv import and replace process.env.CHANNEL**

Current code (lines 1-3):

```typescript
import type { ChannelInfo } from '../types'
import Item from './Item'
```

Add import:

```typescript
import type { ChannelInfo } from '../types'
import { getEnv } from '../lib/env'
import Item from './Item'
```

Then on line 52, replace `process.env.CHANNEL` with `getEnv('CHANNEL')`:

```typescript
// Before (line 52)
<Item key={post.id} post={post} isItem={isItem} siteUrl={siteUrl} channelName={process.env.CHANNEL} index={index} />

// After
<Item key={post.id} post={post} isItem={isItem} siteUrl={siteUrl} channelName={getEnv('CHANNEL')} index={index} />
```

- [ ] **Step 2: Run tests**

Run: `npm run test`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add src/components/List.tsx
git commit -m "fix: use getEnv for CHANNEL in List.tsx"
```

---

## Task 5: Migrate Google Fonts to next/font

**Files:**
- Modify: `src/app/layout.tsx:1-75`

- [ ] **Step 1: Replace external Google Fonts link with next/font**

Current `layout.tsx` loads fonts via external `<link>` tag (lines 44-47). Replace with Next.js font optimization.

Replace the entire file content with:

```typescript
import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import { getEnv } from "../lib/env";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-newsreader",
});

const LOCALE = getEnv("LOCALE") ?? "en";
const SITE_URL = getEnv("SITE_URL") || "";
const CHANNEL = getEnv("CHANNEL");
const METADATA_BASE = SITE_URL.startsWith("http") ? new URL(SITE_URL) : undefined;

export const metadata: Metadata = {
  title: {
    default: "神族九帝",
    template: "%s | 神族九帝",
  },
  description: "A MicroBlog powered by Telegram channels",
  metadataBase: METADATA_BASE,
  alternates: {
    types: {
      "application/rss+xml": [{ title: "RSS", url: `${SITE_URL}rss.xml` }],
    },
  },
  openGraph: {
    type: "website",
    locale: LOCALE,
    siteName: "神族九帝",
  },
  twitter: {
    card: "summary",
  },
  robots: {
    index: !getEnv("NO_INDEX"),
    follow: !getEnv("NO_FOLLOW"),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={LOCALE.split("-")[0]} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.classList.add('dark')}else if(t==='light'){document.documentElement.classList.remove('dark')}else if(window.matchMedia('(prefers-color-scheme:dark)').matches){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={newsreader.variable}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "神族九帝",
              url: SITE_URL,
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL}search/result?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
```

Key changes:
- Added `import { Newsreader } from "next/font/google"`
- Created `newsreader` font instance with CSS variable
- Removed the external `<link>` tag for Google Fonts
- Added `className={newsreader.variable}` to `<body>`
- The font variable `--font-newsreader` is now available for Tailwind/CSS to use

- [ ] **Step 2: Update globals.css to use the font variable**

Check if `globals.css` references the Newsreader font. The body font-family rule should use `var(--font-newsreader)` or the `font-family` from the CSS variable. Read `src/app/globals.css` to find the body font rule and update it if needed.

The `newsreader.variable` approach sets a CSS variable `--font-newsreader` on the body. The existing `font-family` in CSS should reference this variable instead of the hardcoded `Georgia` fallback.

- [ ] **Step 3: Build to verify no errors**

Run: `npm run build`
Expected: Build succeeds, no font-related errors

- [ ] **Step 4: Run tests**

Run: `npm run test`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "perf: migrate Google Fonts to next/font for optimized loading"
```

---

## Task 6: Remove dead images.remotePatterns config

**Files:**
- Modify: `next.config.ts:9-20`

- [ ] **Step 1: Remove the images block**

Current code (lines 9-20):

```typescript
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 't.me',
      },
      {
        protocol: 'https',
        hostname: '*.t.me',
      },
    ],
  },
```

Remove this entire block. The project uses no `next/image` components — all images are raw `<img>` tags in server-generated HTML.

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "chore: remove dead images.remotePatterns config"
```

---

## Task 7: Delete empty directories

**Files:**
- Delete: `src/app/rss.json/` (empty directory)
- Delete: `src/app/rules/prefetch.json/` (empty directory)

- [ ] **Step 1: Remove empty directories**

```bash
rm -rf src/app/rss.json src/app/rules
```

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds, no references to deleted directories

- [ ] **Step 3: Commit**

```bash
git add -A src/app/rss.json src/app/rules
git commit -m "chore: remove empty unused directories"
```

---

## Task 8: Reduce PrismJS language imports

**Files:**
- Modify: `src/lib/prism.ts`

- [ ] **Step 1: Replace all 26 language imports with 8 most common**

Current file imports 26 languages. Replace with:

```typescript
import prism from 'prismjs'

// Core languages (8 most common for tech blogs)
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-go'
import 'prismjs/components/prism-rust'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-css'

export default prism
```

Removed: c, clojure, cpp, csharp, dart, docker, elixir, java, json, julia, kotlin, lua, markdown, pascal, php, ruby, sql, yaml

PrismJS gracefully falls back when a language grammar is not loaded — the code block still renders, just without syntax highlighting.

- [ ] **Step 2: Run tests**

Run: `npm run test`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add src/lib/prism.ts
git commit -m "perf: reduce PrismJS imports from 26 to 8 core languages"
```

---

## Task 9: Optimize dayjs locale imports

**Files:**
- Modify: `src/lib/dayjs.ts`

- [ ] **Step 1: Import only the configured locale**

Current file imports all 6 locales. Replace with:

```typescript
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import updateLocale from 'dayjs/plugin/updateLocale'
import utc from 'dayjs/plugin/utc'
import { getEnv } from './env'

// Import only the configured locale instead of all 6
const locale = getEnv('LOCALE') ?? 'en'
import(`dayjs/locale/${locale}.js`)

dayjs.extend(updateLocale)
dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)
dayjs.extend(utc)
dayjs.extend(timezone)

export default dayjs
```

Note: The `import()` with a variable works in Next.js because dayjs locales are side-effect-only modules. However, since this is a server-side module and `getEnv` is synchronous at module load time, we can use a static import approach instead if dynamic import causes issues. An alternative is to use a map:

```typescript
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import updateLocale from 'dayjs/plugin/updateLocale'
import utc from 'dayjs/plugin/utc'
import { getEnv } from './env'

const locale = getEnv('LOCALE') ?? 'en'

// Locale map — only the configured locale is imported at build time
const localeMap: Record<string, () => Promise<void>> = {
  'zh-cn': () => import('dayjs/locale/zh-cn.js'),
  'zh-tw': () => import('dayjs/locale/zh-tw.js'),
  'zh': () => import('dayjs/locale/zh.js'),
  'en': () => import('dayjs/locale/en.js'),
  'ja': () => import('dayjs/locale/ja.js'),
  'ko': () => import('dayjs/locale/ko.js'),
}

dayjs.extend(updateLocale)
dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)
dayjs.extend(utc)
dayjs.extend(timezone)

// Import the configured locale
localeMap[locale]?.()

export default dayjs
```

Actually, since this is a server module loaded at build/request time and `getEnv` returns synchronously, the simplest approach is a conditional static import. But ESM static imports must be at top level. The cleanest solution: keep the imports but use a single conditional:

```typescript
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import updateLocale from 'dayjs/plugin/updateLocale'
import utc from 'dayjs/plugin/utc'
import { getEnv } from './env'

// Only import the configured locale
const LOCALE = getEnv('LOCALE') ?? 'en'
if (LOCALE === 'zh-cn') await import('dayjs/locale/zh-cn.js')
else if (LOCALE === 'zh-tw') await import('dayjs/locale/zh-tw.js')
else if (LOCALE === 'zh') await import('dayjs/locale/zh.js')
else if (LOCALE === 'en') await import('dayjs/locale/en.js')
else if (LOCALE === 'ja') await import('dayjs/locale/ja.js')
else if (LOCALE === 'ko') await import('dayjs/locale/ko.js')

dayjs.extend(updateLocale)
dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)
dayjs.extend(utc)
dayjs.extend(timezone)

export default dayjs
```

Wait — top-level `await` is supported in ESM modules and Next.js server components. However, this is a module that gets imported by both server components and potentially client components (Item.tsx imports dayjs). Let me reconsider.

Actually, looking at the imports: `dayjs` is used in `Item.tsx` which is a server component (it uses `dangerouslySetInnerHTML` and is imported in server-rendered pages). The module is only used server-side. Top-level await in ESM is fine here.

But the cleanest approach for Next.js: since the env var is known at build time in Docker, just keep static imports but reduce them. Use a simple conditional:

```typescript
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import updateLocale from 'dayjs/plugin/updateLocale'
import utc from 'dayjs/plugin/utc'
import { getEnv } from './env'

const locale = getEnv('LOCALE') ?? 'en'

// Only import the configured locale (not all 6)
if (locale === 'zh-cn') { await import('dayjs/locale/zh-cn.js') }
else if (locale === 'zh-tw') { await import('dayjs/locale/zh-tw.js') }
else if (locale === 'zh') { await import('dayjs/locale/zh.js') }
else if (locale === 'ja') { await import('dayjs/locale/ja.js') }
else if (locale === 'ko') { await import('dayjs/locale/ko.js') }
else { await import('dayjs/locale/en.js') }

dayjs.extend(updateLocale)
dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)
dayjs.extend(utc)
dayjs.extend(timezone)

export default dayjs
```

- [ ] **Step 2: Run existing dayjs tests**

Run: `npm run test -- src/lib/__tests__/dayjs.test.ts`
Expected: All dayjs tests pass

- [ ] **Step 3: Run full test suite**

Run: `npm run test`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/lib/dayjs.ts
git commit -m "perf: import only configured dayjs locale instead of all 6"
```

---

## Task 10: Remove redundant sanitize in Item.tsx

**Files:**
- Modify: `src/components/Item.tsx:4,55`

- [ ] **Step 1: Remove sanitize import and call**

Remove the import on line 4:

```typescript
// Before
import { sanitize } from '../lib/sanitize'

// After (remove this line entirely)
```

Replace line 55:

```typescript
// Before
dangerouslySetInnerHTML={{ __html: sanitize(post.content) }}

// After
dangerouslySetInnerHTML={{ __html: post.content }}
```

The content is already sanitized in `telegram.ts` when it enters the cache via `extractPost`. The `sanitize-html` call in `Item.tsx` is redundant double-sanitization.

- [ ] **Step 2: Run tests**

Run: `npm run test`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add src/components/Item.tsx
git commit -m "perf: remove redundant sanitize call in Item rendering"
```

---

## Task 11: Optimize LRU cache capacity and clone strategy

**Files:**
- Modify: `src/lib/sources/telegram.ts:56-76, 452-493`

- [ ] **Step 1: Increase LRU cache max from 20 to 100**

Current code (lines 58-63):

```typescript
const cache = new LRUCache<string, CacheValue>({
  ttl: CACHE_TTL,
  max: 20,
  allowStale: true,
  updateAgeOnGet: true,
})
```

Change `max: 20` to `max: 100`:

```typescript
const cache = new LRUCache<string, CacheValue>({
  ttl: CACHE_TTL,
  max: 100,
  allowStale: true,
  updateAgeOnGet: true,
})
```

- [ ] **Step 2: Replace structuredClone with shallow copy**

Current `cloneCacheValue` (lines 65-67):

```typescript
function cloneCacheValue<T extends CacheValue>(value: T): T {
  return structuredClone(value)
}
```

Replace with:

```typescript
function cloneCacheValue<T extends CacheValue>(value: T): T {
  // Shallow copy prevents cross-request mutation of the posts array
  // while avoiding the CPU cost of deep-cloning large HTML strings
  if (Array.isArray((value as any).posts)) {
    return {
      ...value,
      posts: (value as any).posts.map((p: any) => ({ ...p })),
    } as T
  }
  return { ...value } as T
}
```

- [ ] **Step 3: Remove unnecessary clone on cache write**

In `getChannelPost` (lines 452-464), the cache write currently calls `cloneCacheValue` after `cache.set`. Since the value was just constructed, the write clone is unnecessary.

Current:

```typescript
export async function getChannelPost(id: string): Promise<Post> {
  const cacheKey = JSON.stringify({ scope: 'post', id })
  const hit = getCached(cacheKey, (v): v is Post => !isChannelInfo(v))
  if (hit) {
    console.info('Cache hit', { id })
    return cloneCacheValue(hit)
  }

  const { $, channel, staticProxy, reactionsEnabled } = await loadChannelDocument({ id })
  const post = await extractPost($, null, { channel, staticProxy, reactionsEnabled })
  cache.set(cacheKey, post)
  return cloneCacheValue(post)
}
```

Replace with:

```typescript
export async function getChannelPost(id: string): Promise<Post> {
  const cacheKey = JSON.stringify({ scope: 'post', id })
  const hit = getCached(cacheKey, (v): v is Post => !isChannelInfo(v))
  if (hit) {
    console.info('Cache hit', { id })
    return cloneCacheValue(hit)
  }

  const { $, channel, staticProxy, reactionsEnabled } = await loadChannelDocument({ id })
  const post = await extractPost($, null, { channel, staticProxy, reactionsEnabled })
  cache.set(cacheKey, post)
  return post
}
```

Same change in `getChannelInfo` (lines 466-493):

```typescript
export async function getChannelInfo(params: GetChannelInfoParams = {}): Promise<ChannelInfo> {
  const { before = '', after = '', q = '' } = params
  const cacheKey = JSON.stringify({ scope: 'channel', before, after, q })
  const hit = getCached(cacheKey, isChannelInfo)
  if (hit) {
    console.info('Cache hit', { before, after, q })
    return cloneCacheValue(hit)
  }

  const { $, channel, staticProxy, reactionsEnabled } = await loadChannelDocument({ before, after, q })
  const postNodes = $('.tgme_channel_history .tgme_widget_message_wrap').toArray()
  const posts = (await Promise.all(
    postNodes.map((item, index) => extractPost($, item, { channel, staticProxy, index, reactionsEnabled })),
  ))
    .reverse()
    .filter(post => post.type === 'text' && Boolean(post.id) && Boolean(post.content))

  const channelInfo: ChannelInfo = {
    posts,
    title: $('.tgme_channel_info_header_title').text(),
    description: $('.tgme_channel_info_description').text(),
    descriptionHTML: (await modifyHTMLContent($, $('.tgme_channel_info_description'), { staticProxy })).html(),
    avatar: $('.tgme_page_photo_image img').attr('src'),
  }

  cache.set(cacheKey, channelInfo)
  return channelInfo
}
```

- [ ] **Step 4: Add dedicated search cache**

Add a separate LRU cache for search results (lower TTL, smaller capacity):

After the existing cache declaration (line 63), add:

```typescript
const searchCache = new LRUCache<string, CacheValue>({
  ttl: 1000 * 60, // 60 seconds — search results are less cacheable
  max: 50,
  allowStale: true,
  updateAgeOnGet: true,
})
```

Then modify `getChannelInfo` to use `searchCache` when `q` is provided:

In `getChannelInfo`, change the cache lookup and storage to use `searchCache` when `q` is non-empty:

```typescript
export async function getChannelInfo(params: GetChannelInfoParams = {}): Promise<ChannelInfo> {
  const { before = '', after = '', q = '' } = params
  const cacheKey = JSON.stringify({ scope: 'channel', before, after, q })
  const activeCache = q ? searchCache : cache

  const hit = activeCache.get(cacheKey)
  if (hit && isChannelInfo(hit)) {
    console.info('Cache hit', { before, after, q })
    return cloneCacheValue(hit)
  }

  const { $, channel, staticProxy, reactionsEnabled } = await loadChannelDocument({ before, after, q })
  const postNodes = $('.tgme_channel_history .tgme_widget_message_wrap').toArray()
  const posts = (await Promise.all(
    postNodes.map((item, index) => extractPost($, item, { channel, staticProxy, index, reactionsEnabled })),
  ))
    .reverse()
    .filter(post => post.type === 'text' && Boolean(post.id) && Boolean(post.content))

  const channelInfo: ChannelInfo = {
    posts,
    title: $('.tgme_channel_info_header_title').text(),
    description: $('.tgme_channel_info_description').text(),
    descriptionHTML: (await modifyHTMLContent($, $('.tgme_channel_info_description'), { staticProxy })).html(),
    avatar: $('.tgme_page_photo_image img').attr('src'),
  }

  activeCache.set(cacheKey, channelInfo)
  return channelInfo
}
```

- [ ] **Step 5: Run tests**

Run: `npm run test`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add src/lib/sources/telegram.ts
git commit -m "perf: optimize LRU cache capacity, clone strategy, and add search cache"
```

---

## Task 12: Adjust image loading threshold

**Files:**
- Modify: `src/lib/sources/telegram.ts:110-112`

- [ ] **Step 1: Change threshold from 15 to 2**

Current code (lines 110-112):

```typescript
function getImageLoading(index: number): 'eager' | 'lazy' {
  return index > 15 ? 'lazy' : 'eager'
}
```

Replace with:

```typescript
function getImageLoading(index: number): 'eager' | 'lazy' {
  return index > 2 ? 'lazy' : 'eager'
}
```

Only the first 3 images (indices 0, 1, 2) are eager-loaded. The rest are lazy.

- [ ] **Step 2: Run tests**

Run: `npm run test`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add src/lib/sources/telegram.ts
git commit -m "perf: reduce eager image loading threshold from 16 to 3"
```

---

## Task 13: Migrate page routes from force-dynamic to ISR

**Files:**
- Modify: `src/app/page.tsx:7`
- Modify: `src/app/posts/[id]/page.tsx:8`
- Modify: `src/app/before/[cursor]/page.tsx:8`
- Modify: `src/app/after/[cursor]/page.tsx:8`
- Modify: `src/app/tags/page.tsx:8`
- Modify: `src/app/links/page.tsx:9`

- [ ] **Step 1: Update homepage**

In `src/app/page.tsx`, replace line 7:

```typescript
// Before
export const dynamic = 'force-dynamic'

// After
export const revalidate = 300
```

- [ ] **Step 2: Update posts/[id] page**

In `src/app/posts/[id]/page.tsx`, replace line 8:

```typescript
// Before
export const dynamic = 'force-dynamic'

// After
export const revalidate = 300
```

- [ ] **Step 3: Update before/[cursor] page**

In `src/app/before/[cursor]/page.tsx`, replace line 8:

```typescript
// Before
export const dynamic = 'force-dynamic'

// After
export const revalidate = 300
```

- [ ] **Step 4: Update after/[cursor] page**

In `src/app/after/[cursor]/page.tsx`, replace line 8:

```typescript
// Before
export const dynamic = 'force-dynamic'

// After
export const revalidate = 300
```

- [ ] **Step 5: Update tags page**

In `src/app/tags/page.tsx`, replace line 8:

```typescript
// Before
export const dynamic = 'force-dynamic'

// After
export const revalidate = 300
```

- [ ] **Step 6: Update links page**

In `src/app/links/page.tsx`, replace line 9:

```typescript
// Before
export const dynamic = 'force-dynamic'

// After
export const revalidate = 300
```

- [ ] **Step 7: Verify search page still has force-dynamic**

Confirm `src/app/search/[q]/page.tsx` line 7 still has `export const dynamic = 'force-dynamic'` — do NOT change this.

- [ ] **Step 8: Build to verify ISR works**

Run: `npm run build`
Expected: Build succeeds, pages are statically generated with revalidation

- [ ] **Step 9: Run tests**

Run: `npm run test`
Expected: All tests pass

- [ ] **Step 10: Commit**

```bash
git add src/app/page.tsx src/app/posts/\[id\]/page.tsx src/app/before/\[cursor\]/page.tsx src/app/after/\[cursor\]/page.tsx src/app/tags/page.tsx src/app/links/page.tsx
git commit -m "perf: migrate page routes from force-dynamic to ISR with 300s revalidation"
```

---

## Task 14: Add Cache-Control headers to RSS and Sitemap routes

**Files:**
- Modify: `src/app/rss.xml/route.ts:55-57`
- Modify: `src/app/sitemap.xml/route.ts:51-56`
- Modify: `src/app/sitemap/[cursor]/route.ts:27-32`

- [ ] **Step 1: Add Cache-Control to RSS route**

Current response in `src/app/rss.xml/route.ts` (lines 55-57):

```typescript
  return new Response(rss, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
```

Replace with:

```typescript
  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=600',
    },
  })
```

- [ ] **Step 2: Add Cache-Control to sitemap.xml route**

Current response in `src/app/sitemap.xml/route.ts` (lines 51-56):

```typescript
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticSitemaps}${postSitemaps}
</sitemapindex>`, {
    headers: { 'Content-Type': 'application/xml' },
  })
```

Replace with:

```typescript
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticSitemaps}${postSitemaps}
</sitemapindex>`, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
```

- [ ] **Step 3: Add Cache-Control to sitemap/[cursor] route**

Current response in `src/app/sitemap/[cursor]/route.ts` (lines 27-32):

```typescript
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${xmlUrls}
</urlset>`, {
    headers: { 'Content-Type': 'application/xml' },
  })
```

Replace with:

```typescript
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${xmlUrls}
</urlset>`, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
```

- [ ] **Step 4: Run tests**

Run: `npm run test`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/app/rss.xml/route.ts src/app/sitemap.xml/route.ts src/app/sitemap/\[cursor\]/route.ts
git commit -m "perf: add Cache-Control headers to RSS and Sitemap routes"
```

---

## Task 15: Filter forwarded headers in static proxy

**Files:**
- Modify: `src/lib/proxy.ts:24-54`

- [ ] **Step 1: Add header whitelist to createStaticProxyResponse**

Current code fetches the target with only a User-Agent header (line 34-36), which is already safe. However, the `request` object is passed in but not used for forwarding headers. Let me verify — actually, looking at the code again, the proxy does NOT forward client headers to upstream. It only sends `User-Agent: Mozilla/5.0`. The `request` parameter is used to extract the raw target URL, not to forward headers.

The proxy is already safe — it only sends `User-Agent` to upstream. No change needed here. The original concern about header leakage was incorrect upon code review.

However, to be explicit and future-proof, let's add a comment:

```typescript
export async function createStaticProxyResponse(request: Request, rawTarget: string): Promise<Response> {
  const target = resolveStaticProxyTarget(rawTarget)
  if (!isStaticProxyWhitelisted(target)) {
    return new Response('Proxy target not allowed', { status: 403 })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT)

  try {
    // Only send User-Agent — do NOT forward client headers to upstream
    const response = await fetch(target.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: controller.signal,
    })

    const headers = new Headers(response.headers)
    headers.set('Cache-Control', 'public, max-age=604800, s-maxage=604800')
    headers.delete('set-cookie')

    return new Response(response.body, { status: response.status, headers })
  }
  catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return new Response('Proxy timeout', { status: 504 })
    }
    throw err
  }
  finally {
    clearTimeout(timeout)
  }
}
```

- [ ] **Step 2: Run tests**

Run: `npm run test`
Expected: All tests pass (including proxy tests)

- [ ] **Step 3: Commit**

```bash
git add src/lib/proxy.ts
git commit -m "docs: clarify static proxy header policy (no client headers forwarded)"
```

---

## Task 16: Add component-level error boundary for Item

**Files:**
- Create: `src/components/ItemError.tsx`
- Modify: `src/components/List.tsx`

- [ ] **Step 1: Create ItemError fallback component**

```typescript
// src/components/ItemError.tsx
export default function ItemError() {
  return (
    <article className="rounded-[var(--radius-md)] bg-[var(--color-card)] px-4 py-3 sm:px-5 sm:py-4 mb-3">
      <p className="ui-font text-[13px] text-[var(--color-muted)]">
        Failed to load this post.
      </p>
    </article>
  )
}
```

- [ ] **Step 2: Create ErrorBoundary wrapper component**

React Server Components don't support error boundaries directly. We need a client component error boundary. Create:

```typescript
// src/components/ErrorBoundary.tsx
'use client'

import { Component, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}
```

- [ ] **Step 3: Wrap Item in ErrorBoundary in List.tsx**

Update `src/components/List.tsx` imports and wrap each Item:

```typescript
import type { ChannelInfo } from '../types'
import { getEnv } from '../lib/env'
import ErrorBoundary from './ErrorBoundary'
import Item from './Item'
import ItemError from './ItemError'
```

Then in the map (line 51-53), wrap Item:

```typescript
// Before
{posts.map((post, index) => (
  <Item key={post.id} post={post} isItem={isItem} siteUrl={siteUrl} channelName={getEnv('CHANNEL')} index={index} />
))}

// After
{posts.map((post, index) => (
  <ErrorBoundary key={post.id} fallback={<ItemError />}>
    <Item post={post} isItem={isItem} siteUrl={siteUrl} channelName={getEnv('CHANNEL')} index={index} />
  </ErrorBoundary>
))}
```

- [ ] **Step 4: Run tests**

Run: `npm run test`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/components/ItemError.tsx src/components/ErrorBoundary.tsx src/components/List.tsx
git commit -m "feat: add component-level error boundary for Item rendering"
```

---

## Task 17: Final verification

- [ ] **Step 1: Run full build**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Run full test suite**

Run: `npm run test`
Expected: All tests pass

- [ ] **Step 3: Type check**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: Verify git status is clean**

Run: `git status`
Expected: Clean working tree
