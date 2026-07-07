# shenzjd.com

> 一个服务端渲染的极简微博客：把任意公开 Telegram 频道渲染成快速、对搜索引擎友好的阅读体验。

[English](#english) · 许可证：[AGPL-3.0](./LICENSE)

---

## 特性

- **频道即博客**：把任意公开 Telegram 频道转成时间线式的微博客。
- **零客户端 JavaScript**：页面默认纯服务端渲染，浏览器端几乎无脚本（仅 Telegram 评论组件例外）。
- **GFW 绕行媒体代理**：服务端拉取 Telegram CDN 资源并以流式转发，身处墙内的访客也能正常加载图片与视频。
- **SEO 友好**：自动生成 `/sitemap.xml` 与分页子地图、规范的 `<link>` 与 OG 标签。
- **订阅源**：提供 RSS (`/rss.xml`) 与 JSON Feed (`/rss.json`)。
- **互动与导航**：Reactions 反应、标签云、自定义链接页与侧边栏导航。
- **缓存与并发控制**：基于 `ocache` 的 SWR 缓存（5 分钟新鲜期、最长 1 小时陈旧期）+ 请求合并，冷缓存不惊群。

## 技术栈

- [Astro](https://astro.build/)（`output: 'server'`，`@astrojs/node` standalone 适配器）
- [Tailwind CSS v4](https://tailwindcss.com/)（via `@tailwindcss/vite`）
- `cheerio` 解析 Telegram 页面、`sanitize-html` 清洗外部 HTML、`prismjs` 代码高亮
- `ocache` 服务端缓存、`ofetch` 网络请求
- 媒体代理：服务端 `fetch` Telegram CDN 后流式透传（`/static/...`）

## 架构要点

```
Telegram 频道 (t.me/s/{CHANNEL})
        │ 服务端抓取 (UA: shenzjd-com/1.0.0)
        ▼
  cheerio 解析 + sanitize-html 清洗
        │ ocache 缓存 (SWR, 5min / 1h stale) + 请求合并
        ▼
  Astro SSR 渲染 (零客户端 JS)
        │
        ├── 页面 / 列表 / 文章 / 搜索 / 标签 / 链接
        ├── /sitemap.xml · /rss.xml · /rss.json
        └── /static/... 媒体代理 (GFW 绕行, 流式透传)
```

- **媒体代理为什么必须存在**：Telegram 的 CDN 域名在中国大陆不可达，因此图片/视频必须经服务端代理转发，而非直链。代理只做流式透传与白名单校验，不做转码，避免 CPU 峰值。
- **缓存策略**：抓取结果进入 `ocache`，新鲜期内直接返回；过期但在 `staleMaxAge` 内先返回旧值并后台刷新（SWR）；同时对同一 key 的并发请求做合并，避免冷缓存被同时打爆。

## 本地开发

```bash
# 需要 Node 22+
npm install
cp .env.example .env   # 至少填写 CHANNEL
npm run dev            # http://localhost:4321
```

常用脚本：

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 本地开发服务器 |
| `npm run build` | 生产构建（standalone server） |
| `npm run preview` | 预览构建产物 |
| `npm run lint` | ESLint 检查 |
| `npm run typecheck` | `tsc --noEmit` 类型检查 |
| `npm run test` | Vitest 运行测试 |

## 配置

复制 `.env.example` 为 `.env` 后按需填写。核心变量：

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `CHANNEL` | ✅ | Telegram 频道用户名（不含 `@`，即 `t.me/` 后的部分） |
| `LOCALE` | | 语言/地区，如 `zh-CN` |
| `TIMEZONE` | | 时区，如 `Asia/Shanghai` |
| `SITE_URL` | | 站点地址，用于 RSS / Sitemap / OG |
| `STATIC_PROXY` | ✅ | 媒体代理前缀，须为 `/static/`（GFW 绕行） |
| `TELEGRAM_HOST` | | Telegram 抓取主机，默认 `t.me`（服务端需可出墙访问） |
| `REACTIONS` | | 是否启用 Reactions，`true`/`false` |
| `COMMENTS` | | Telegram 评论组件开关（可选，依赖官方评论嵌入） |
| `HIDE_DESCRIPTION` | | 是否隐藏频道简介 |
| `TAGS` | | 标签云，逗号分隔 |
| `LINKS` | | 链接页，格式 `标题,URL;标题,URL` |
| `NAVS` | | 侧边栏导航，格式 `标题,URL;标题,URL` |
| `TELEGRAM` / `TWITTER` / `GITHUB` / ... | | 社交链接用户名 |
| `NOFOLLOW` / `NOINDEX` | | SEO 控制 |
| `HEADER_INJECT` / `FOOTER_INJECT` | | 页头/页脚 HTML 注入 |
| `GOOGLE_SEARCH_SITE` | | 填域名启用 Google 站内搜索，否则用内置搜索 |
| `RSS_BEAUTIFY` | | RSS 美化 |

## 部署

### Docker（standalone）

```bash
docker build -t shenzjd-com .
docker run -d --name shenzjd-com -p 4321:4321 \
  -e CHANNEL=shenzjd_com \
  -e STATIC_PROXY=/static/ \
  shenzjd-com
```

构建产物为 `@astrojs/node` standalone 镜像，运行时仅包含 `dist/` 与入口，体积较小。

### 自动部署

`.github/workflows/docker.yml` 在每次推送到 `main` 时构建镜像并推送到 GitHub Container Registry（GHCR），随后通过 SSH 部署到目标服务器。请确保仓库中配置了对应的部署密钥 / Secrets。

## 许可证

本项目以 **AGPL-3.0-or-later** 发布。根据 AGPL 第 13 条，通过网络提供本程序服务时，你必须向用户提供对应源代码的获取方式。详见 [LICENSE](./LICENSE) 与 [NOTICE](./NOTICE)。

---

## English

**shenzjd.com** is a server-rendered, minimal microblog that turns any public Telegram channel into a fast, SEO-friendly reading experience.

- **Zero client-side JavaScript** by default (Telegram comments widget excluded).
- **GFW-aware media proxy**: the server fetches Telegram CDN assets and streams them through `/static/...`, so visitors behind the GFW can load media.
- **Caching**: `ocache` with SWR (5-min freshness, 1-hour stale) plus in-flight request coalescing to avoid thundering-herd on cold cache.
- **Stack**: Astro (server output, `@astrojs/node` standalone), Tailwind CSS v4, `cheerio` + `sanitize-html`, `prismjs`.
- **Deploy**: Docker standalone image built by GitHub Actions and pushed to GHCR, then SSH-deployed.
- **License**: AGPL-3.0-or-later.
