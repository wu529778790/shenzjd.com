# shenzjd.com

> 一个服务端渲染的极简微博客：把任意公开 Telegram 频道渲染成快速、对搜索引擎友好的阅读体验。

许可证：[AGPL-3.0](./LICENSE)

---

## 特性

- **频道即博客**：把任意公开 Telegram 频道转成时间线式的微博客（首页、文章、翻页、搜索、标签、链接页）。
- **零客户端 JavaScript**：页面默认纯服务端渲染（仅 Telegram 评论组件例外）。
- **GFW 绕行媒体代理**：服务端拉取 Telegram CDN 资源并流式转发，墙内访客也能正常加载图片与视频。
- **SEO 友好**：自动生成 `/sitemap.xml` 分页子地图、OG 标签与 `site.webmanifest`。
- **订阅源**：RSS (`/rss.xml`) 与 JSON Feed (`/rss.json`)，支持按标签过滤。
- **缓存**：`ocache` SWR（15 分钟新鲜期 / 1 小时陈旧期）+ `lru-cache` 有界存储 + 请求合并，冷缓存不惊群。
- **可观测性**：分级诊断日志（错误全量 / 慢请求告警 / 5 分钟聚合摘要），日志量小、信号可行动。

## 技术栈

[Astro](https://astro.build/)（server output，`@astrojs/node` standalone）· Tailwind CSS v4 · `cheerio` + `sanitize-html` + `prismjs` · `ocache` + `lru-cache` + `ofetch`。

## 架构

```
Telegram 频道 → 服务端抓取 → cheerio 解析 + 清洗
     → ocache 缓存 (SWR 15min / 1h stale) + LRU + 请求合并
     → Astro SSR 渲染（零客户端 JS）
     → 页面 · /sitemap.xml · /rss.xml · /rss.json
     → /static/... 媒体代理（GFW 绕行，流式透传）
```

媒体代理是必要的：Telegram CDN 在中国大陆不可达，图片/视频必须经服务端代理转发（只透传、不转码）。

## 快速开始

```bash
npm install
cp .env.example .env   # 至少填写 CHANNEL
npm run dev            # http://localhost:4321
```

核心配置见 `.env.example`（含 `CHANNEL`、`STATIC_PROXY`、`SITE_URL`、`DIAG_TELEGRAM`、`TELEGRAM_HTML_CACHE_MAX` 等）。

## 部署

```bash
docker build -t shenzjd-com .
docker run -d --name shenzjd-com -p 4321:4321 \
  -e CHANNEL=shenzjd_com -e STATIC_PROXY=/static/ \
  --log-opt max-size=10m --log-opt max-file=3 \
  shenzjd-com
```

推送到 `main` 时，`.github/workflows/docker.yml` 自动构建镜像、推送到 GHCR 并通过 SSH 部署到服务器。

## 许可证

**AGPL-3.0-or-later**。根据 AGPL 第 13 条，通过网络提供本程序服务时，你必须向用户提供对应源代码的获取方式。详见 [LICENSE](./LICENSE) 与 [NOTICE](./NOTICE)。
