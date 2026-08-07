# shenzjd.com

> 一个服务端渲染的极简微博客：把任意公开 Telegram 频道渲染成快速、对搜索引擎友好的阅读体验。

许可证：[AGPL-3.0](./LICENSE)

---

## 特性

- **频道即博客**：把任意公开 Telegram 频道转成时间线式的微博客（首页、文章、翻页、搜索、标签、链接页）。
- **零客户端 JavaScript**：页面默认纯服务端渲染，浏览器端几乎无脚本（仅 Telegram 评论组件例外）。
- **GFW 绕行媒体代理**：服务端拉取 Telegram CDN 资源并流式转发，身处墙内的访客也能正常加载图片与视频。
- **SEO 友好**：自动生成 `/sitemap.xml` 与分页子地图、规范的 `<link>`、OG 标签与 `site.webmanifest`。
- **订阅源**：RSS (`/rss.xml`) 与 JSON Feed (`/rss.json`)，支持按标签过滤。
- **缓存与并发控制**：基于 `ocache` 的 SWR 缓存（15 分钟新鲜期、最长 1 小时陈旧期）+ LRU 有界存储 + 请求合并，冷缓存不惊群。
- **可观测性**：内置分级诊断日志（错误全量 / 慢请求告警 / 5 分钟聚合摘要），日志量小且有优化信号（见下文「诊断日志」）。

## 技术栈

- [Astro](https://astro.build/)（`output: 'server'`，`@astrojs/node` standalone 适配器）
- [Tailwind CSS v4](https://tailwindcss.com/)（via `@tailwindcss/vite`）
- `cheerio` 解析 Telegram 页面、`sanitize-html` 清洗外部 HTML、`prismjs` 代码高亮
- `ocache` + `lru-cache` 服务端缓存、`ofetch` 网络请求、`astro-icon` 图标
- 媒体代理：服务端 `fetch` Telegram CDN 后流式透传（`/static/...`）

## 架构要点

```
Telegram 频道 (t.me/s/{CHANNEL})
        │ 服务端抓取 (UA: shenzjd-com/1.0.0)
        ▼
  cheerio 解析 + sanitize-html 清洗
        │ ocache 缓存 (SWR, 15min / 1h stale) + LRU + 请求合并
        ▼
  Astro SSR 渲染 (零客户端 JS)
        │
        ├── 页面 / 列表 / 文章 / 搜索 / 标签 / 链接
        ├── /sitemap.xml · /rss.xml · /rss.json
        └── /static/... 媒体代理 (GFW 绕行, 流式透传)
```

- **媒体代理为什么必须存在**：Telegram 的 CDN 域名在中国大陆不可达，因此图片/视频必须经服务端代理转发，而非直链。代理只做流式透传与白名单校验，不做转码，避免 CPU 峰值。
- **缓存策略**：抓取结果进入 `ocache`，新鲜期内直接返回；过期但在 `staleMaxAge` 内先返回旧值并后台刷新（SWR）；同时对同一 key 的并发请求做合并，避免冷缓存被同时打爆。存储用 `lru-cache` 有界（默认 2048 条，约 400MB-1GB 堆内存），防止无界 Map 撑爆容器堆。

## 路由一览

| 路由 | 说明 |
| --- | --- |
| `/` | 首页时间线 |
| `/posts/[id]` | 单篇文章 |
| `/before/[cursor]` / `/after/[cursor]` | 翻页（按 Telegram 消息游标） |
| `/search` | 站内搜索（内置搜索，或配 `GOOGLE_SEARCH_SITE` 用 Google 站内搜索） |
| `/tags` | 标签云 |
| `/links` | 链接页 |
| `/rss.xml` / `/rss.json` | 订阅源（支持 `?tag=` 过滤） |
| `/sitemap.xml` + `/sitemap/[cursor].xml` | 站点地图 |
| `/rules/prefetch.json` | Speculation Rules 预取 |
| `/static/[...url]` | 媒体代理（GFW 绕行） |

## 诊断日志

日志通过 `src/lib/diag.ts` 分级输出（`[diag]` 前缀，可用环境变量独立开关，默认关闭）：

| 级别 | 触发条件 | 价值 |
| --- | --- | --- |
| `ERROR` | t.me 抓取失败 / 超时 | 全量即时记录，故障排查通道 |
| `SLOW` | 单次抓取 ≥ 3s（正常 200-700ms） | 出网/代理劣化预警 |
| `SUMMARY` | 每 5 分钟一行聚合 | `fetch=42 err=0 slow=1 avg=310ms max=4120ms cache=512/512 180MB`——avg 上涨说明 t.me 劣化，cache 满说明 LRU 需调大 |

成功抓取不逐条记录（历史上逐条日志每天产生数万行、十几 MB 的无效噪音，且 ACCESS 逐请求日志已从代码中彻底移除，任何环境变量都无法重新打开）。开启方式见「配置」中的 `DIAG_*` 变量。

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
| `npm run lint` / `lint:fix` | ESLint 检查 / 自动修复 |
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
| `DIAG_TELEGRAM` | | `1` 开启 Telegram 抓取诊断（ERROR / SLOW / SUMMARY） |
| `DIAG_CACHE_STATS` | | `1` 周期性输出缓存占用 |
| `TELEGRAM_HTML_CACHE_MAX` | | 缓存 LRU 最大条目数，默认 2048；内存小的容器可调低（如 512） |

## 部署

### Docker（standalone）

```bash
docker build -t shenzjd-com .
docker run -d --name shenzjd-com -p 4321:4321 \
  -e CHANNEL=shenzjd_com \
  -e STATIC_PROXY=/static/ \
  shenzjd-com
```

构建产物为 `@astrojs/node` standalone 镜像，运行时仅包含 `dist/` 与入口，体积较小。建议为 `docker run` 配置日志轮转（`--log-opt max-size=10m --log-opt max-file=3`），避免容器日志无限膨胀。

### 自动部署

`.github/workflows/docker.yml` 在每次推送到 `main` 时构建镜像并推送到 GitHub Container Registry（GHCR），随后通过 SSH 部署到目标服务器。请确保仓库中配置了对应的部署密钥 / Secrets。

## 测试

```bash
npm run test   # Vitest：env / feed / seo / prism / post-ui / static-proxy
```

## 许可证

本项目以 **AGPL-3.0-or-later** 发布。根据 AGPL 第 13 条，通过网络提供本程序服务时，你必须向用户提供对应源代码的获取方式。详见 [LICENSE](./LICENSE) 与 [NOTICE](./NOTICE)。
