# Repository Guide for Coding Agents

## Sources

- Treat this file as the maintained repo guide; `CLAUDE.md` may lag behind it.
- No repo-local `opencode.json`, `.opencode/`, `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md` is present.
- For any visible UI/design change, read `@DESIGN.md` first; implementation tokens live in `src/styles/app.css` and `src/styles/content/**`.

## Stack and commands

- Runtime/tooling: Node `v22`, `pnpm@11.5.3`, Astro `^6.4.6` SSR, Tailwind CSS v4 via `@tailwindcss/vite`, ESLint `^10.4.1` with Antfu + Astro + formatter rules.
- Install/dev/build: `pnpm install`, `pnpm dev` or `pnpm start` (`astro dev`), `pnpm build`, `pnpm preview`.
- Lint/typecheck/test: `pnpm lint`, `pnpm typecheck`, and `pnpm test` for repo gates; `pnpm lint:fix` for auto-fix; `pnpm eslint <path>` for focused lint checks.
- There is no established single-test command; keep new unit coverage focused and use Vitest's normal filters only when needed.
- `postinstall` installs `simple-git-hooks` when `.git` exists; pre-commit runs `lint-staged` with `eslint --fix`.
- CI does not validate app behavior: `docker.yml` only builds/pushes the GHCR image, and `sync.yml` only syncs forks from upstream.

## Validation shortcuts

- Small code change: `pnpm eslint <changed-file>`, `pnpm typecheck`, and `pnpm test`; run `pnpm lint` if scope widened.
- UI or route change: `pnpm lint`, `pnpm build`, then preview/manual check.
- Feed/SEO/sitemap changes: manually verify `/rss.xml`, `/rss.json`, `/sitemap.xml`, and relevant canonical/meta output in preview.
- Telegram parsing or proxy changes: verify home, one `/posts/[id]` page, RSS output, and a `/static/...` asset path.
- Build config or adapter changes must finish with `pnpm build`.

## Architecture notes

- `src/pages/` contains Astro pages and API-style routes; `src/pages/index.astro` is intentionally thin and calls `getChannelInfo(Astro)`.
- `src/layouts/base.astro` wires global CSS, `astro-seo`, nav/sidebar, RSS links, `HEADER_INJECT`, and `FOOTER_INJECT`.
- `src/middleware.ts` sets `SITE_URL`/`RSS_URL` locals, handles legacy `#tag` search rewrites, and adds speculation/cache headers.
- Telegram fetching/parsing belongs in `src/lib/telegram/**`; request caching uses `ocache` with 5 min max age, SWR enabled, and 1 hour stale max age.
- Shared env helpers are in `src/lib/env.ts`; they read `import.meta.env` first and fall back to `Astro.locals.runtime.env` for runtime bindings.
- Static proxy logic is shared in `src/lib/static-proxy.ts`; both Astro route `src/pages/static/[...url].ts` and Vercel Edge Function `api/static/index.ts` use it, with `/static/:path*` rewritten by `vercel.json`.
- Do not broaden the static proxy target whitelist unless the task explicitly changes the security model.
- Keep shared domain interfaces in `src/types.ts`; there are no TS path aliases, so use relative imports.

## Env and deployment gotchas

- `CHANNEL` is required server-side; missing it throws during Telegram fetch.
- `TELEGRAM_HOST` defaults in code to `t.me`; `.env.example` uses `telegram.dog` as an override example.
- `STATIC_PROXY` defaults to `/static/` only when unset; set it to an empty string for direct Telegram asset URLs.
- `PODCAST` configures the optional podcast link.
- `astro.config.mjs` selects adapters for Vercel, Cloudflare Pages, Netlify, Node standalone, and EdgeOne; `SERVER_ADAPTER` can override detection.
- EdgeOne detection depends on `HOME=/dev/shm/home` and `TMPDIR=/dev/shm/tmp`; `DOCKER=true` changes Vite SSR `noExternal` behavior.
- If env behavior changes, update `.env.example` and README docs together.

## Code and content conventions

- Server-rendered HTML is the default; keep browser JS near zero. Telegram comments are the deliberate exception.
- API-style routes must return `Response`/`Response.json`, not Express-like objects.
- Follow ESLint formatting: 2 spaces, LF, UTF-8, single quotes, usually no semicolons; let `pnpm lint:fix` settle import order.
- Preserve local naming: Astro route filenames follow routing syntax, newer reusable components use `PascalCase.astro`, older `header.astro`/`item.astro` stay lowercase.
- External Telegram HTML must be sanitized via `src/lib/sanitize.ts` before `set:html`; config injections in `base.astro` are the only intentional raw HTML path.
- Design changes should keep the sepia, content-first system from `@DESIGN.md`: warm paper background, restrained burnt-orange accent, system sans fonts, subtle borders/shadows, and no card-heavy redesigns unless explicitly requested.
