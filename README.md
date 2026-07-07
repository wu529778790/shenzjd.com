# shenzjd.com

A quiet, server-rendered microblog that renders a public Telegram channel as a fast, SEO-friendly reading experience.

## Features

- Turns any public Telegram channel into a microblog
- SEO friendly (`/sitemap.xml`)
- Zero client-side JavaScript
- RSS & RSS JSON feeds (`/rss.xml`, `/rss.json`)
- Server-side media proxy so visitors behind the GFW can load images and videos
- Reactions support

## Tech stack

- [Astro](https://astro.build/)
- Content source: [Telegram Channels](https://telegram.org/tour/channels)
- Design: Sepia (warm editorial minimalism)

## Deployment

### Docker

```bash
docker build -t shenzjd-com .
docker run -d --name shenzjd-com -p 4321:4321 -e CHANNEL=shenzjd_com shenzjd-com
```

A GitHub Actions workflow (`.github/workflows/docker.yml`) builds and pushes the image to GitHub Container Registry on every push to `main`, then deploys via SSH.

### Configuration

```env
# Telegram channel username (required) — the part after t.me/
CHANNEL=shenzjd_com

# Locale and timezone (BCP 47 locale, e.g. zh-CN or en)
LOCALE=zh-CN
TIMEZONE=Asia/Shanghai

# Social links (usernames)
TELEGRAM=shenzjd
TWITTER=shenzjd
GITHUB=shenzjd

# SEO: prevent indexing
NOFOLLOW=false
NOINDEX=false

# Hide channel description
HIDE_DESCRIPTION=false

# Telegram host and static proxy. STATIC_PROXY enables server-side media
# proxying so visitors behind the GFW can load media.
TELEGRAM_HOST=t.me
STATIC_PROXY=/static/

# Enable Reactions
REACTIONS=true

# Tags (comma separated)
TAGS=TagA,TagB,TagC

# Links page (Title,URL;Title,URL;)
LINKS=Title1,URL1;Title2,URL2

# Sidebar navigation (Title,URL;Title,URL;)
NAVS=Title1,URL1;Title2,URL2

# RSS beautify
RSS_BEAUTIFY=true
```

## License

AGPL-3.0. See [LICENSE](./LICENSE).
