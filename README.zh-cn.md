# shenzjd.com

将公开 Telegram 频道渲染为安静、服务端渲染的微博客，快速且对搜索引擎友好。

## 特性

- 将任意公开 Telegram 频道转为微博客
- SEO 友好（`/sitemap.xml`）
- 浏览器端零 JavaScript
- 提供 RSS 与 RSS JSON（`/rss.xml`、`/rss.json`）
- 服务端媒体代理，让处于 GFW 之后的访客也能加载图片与视频
- 支持 Reactions

## 技术栈

- [Astro](https://astro.build/)
- 内容来源：[Telegram Channels](https://telegram.org/tour/channels)
- 设计：Sepia（暖色编辑风极简）

## 部署

### Docker

```bash
docker build -t shenzjd-com .
docker run -d --name shenzjd-com -p 4321:4321 -e CHANNEL=shenzjd_com shenzjd-com
```

项目内置 GitHub Actions 工作流（`.github/workflows/docker.yml`），每次推送到 `main` 都会构建镜像并推送到 GitHub Container Registry，随后通过 SSH 部署。

### 配置

```env
# Telegram 频道用户名（必填）—— t.me/ 后面的部分
CHANNEL=shenzjd_com

# 语言与时区（BCP 47 locale，如 zh-CN 或 en）
LOCALE=zh-CN
TIMEZONE=Asia/Shanghai

# 社交媒体用户名
TELEGRAM=shenzjd
TWITTER=shenzjd
GITHUB=shenzjd

# SEO：禁止搜索引擎索引
NOFOLLOW=false
NOINDEX=false

# 隐藏频道简介
HIDE_DESCRIPTION=false

# Telegram 主机与静态资源代理。STATIC_PROXY 启用服务端媒体代理，
# 让处于 GFW 之后的访客也能加载媒体。
TELEGRAM_HOST=t.me
STATIC_PROXY=/static/

# 启用 Reactions
REACTIONS=true

# 标签页（英文逗号分割）
TAGS=标签A,标签B,标签C

# 链接页面（Title,URL;Title,URL;）
LINKS=标题1,URL1;标题2,URL2

# 侧边栏导航（Title,URL;Title,URL;）
NAVS=标题1,URL1;标题2,URL2

# 启用 RSS 美化
RSS_BEAUTIFY=true
```

## 许可证

AGPL-3.0，详见 [LICENSE](./LICENSE)。
