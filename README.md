# shenzjd.com

将 Telegram 频道内容转化为精致的网页阅读体验。同时支持 X/Twitter 内容聚合。

## 功能

- 自动同步 Telegram 频道帖子 + X/Twitter 推文
- 文章卡片式布局，阅读优化
- 帖子搜索、标签分类、链接收藏
- SEO 优化：Sitemap、robots.txt、RSS Feed、Open Graph、JSON-LD 结构化数据
- 暗色模式（亮色/暗色/跟随系统）
- 响应式设计，支持移动端
- 代码高亮（PrismJS + flourite 自动检测语言）
- Telegram 评论和表情反应
- HTML 净化防 XSS
- 错误边界 + 优雅降级
- 测试覆盖（Vitest）

## 快速开始

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env，至少设置 CHANNEL

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 常用命令

```bash
npm run dev          # 开发服务器
npm run build        # 生产构建
npm run start        # 启动生产服务
npm run test         # 运行测试
npm run test:watch   # 监听模式测试
npx tsc --noEmit     # TypeScript 类型检查
```

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `CHANNEL` | ✅ | Telegram 频道用户名（不带 @） |
| `X_ACCOUNT` | | X/Twitter 用户名（不带 @），设置后启用 X 数据源 |
| `SITE_URL` | | 站点完整 URL（用于 RSS/Sitemap/OG），如 `https://shenzjd.com` |
| `LOCALE` | | 语言设置，如 `zh-CN` |
| `TIMEZONE` | | 时区，如 `Asia/Shanghai` |
| `GITHUB` | | GitHub 用户名（侧边栏图标） |
| `TAGS` | | 标签列表，逗号分隔 |
| `LINKS` | | 链接列表，格式 `标题,URL;标题,URL` |
| `NAVS` | | 自定义导航，格式 `标题,URL;标题,URL` |
| `COMMENTS` | | 启用 Telegram 评论（`true`） |
| `REACTIONS` | | 启用表情反应（`true`） |
| `HIDE_DESCRIPTION` | | 隐藏频道描述（`true`） |
| `GOOGLE_SEARCH_SITE` | | Google 站内搜索域名 |
| `HEADER_INJECT` | | 页头 HTML 注入（分析脚本等） |
| `FOOTER_INJECT` | | 页脚 HTML 注入 |
| `PROMOS` | | 侧边栏推广卡片，格式 `标题\|描述\|URL;标题\|描述\|URL` |
| `STATIC_PROXY` | | 静态资源代理前缀（默认 `/static/`） |
| `TELEGRAM_HOST` | | Telegram 域名（默认 `t.me`） |

完整变量列表见 `.env.example`。

## 部署

### Docker

```bash
docker build -t shenzjd .
docker run -d \
  --name shenzjd \
  --restart unless-stopped \
  --env-file .env \
  -p 3000:3000 \
  shenzjd
```

### Docker Compose

```yaml
services:
  shenzjd:
    build: .
    ports:
      - "3000:3000"
    env_file: .env
    restart: unless-stopped
```

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/wu529778790/shenzjd.com)

CI/CD：推送到 `main` 分支自动构建 Docker 镜像并部署到服务器。

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS v4
- **字体**: Newsreader（正文）+ 系统 sans-serif（UI）
- **数据源**: Telegram 频道 HTML 解析（Cheerio）+ X/Twitter 聚合
- **安全**: sanitize-html（HTML 净化防 XSS）
- **测试**: Vitest
- **部署**: Docker + GitHub Actions CI/CD

## 项目结构

```
src/
├── app/                  # 页面路由
│   ├── page.tsx          # 首页
│   ├── layout.tsx        # 根布局 + 全局元数据
│   ├── error.tsx         # 错误边界
│   ├── not-found.tsx     # 404 页面
│   ├── robots.ts         # robots.txt
│   ├── posts/            # 文章详情
│   ├── before/           # 分页：更早
│   ├── after/            # 分页：更新
│   ├── search/           # 搜索
│   ├── tags/             # 标签
│   ├── links/            # 链接
│   ├── sitemap.xml/      # Sitemap 索引
│   ├── sitemap/          # 分页 Sitemap
│   ├── rss.xml/          # RSS Feed
│   └── static/           # Telegram CDN 代理
├── components/           # React 组件
│   ├── Layout.tsx        # 页面布局 + 导航
│   ├── Sidebar.tsx       # 侧边栏（导航 + 社交 + 推广）
│   ├── Header.tsx        # 频道描述
│   ├── List.tsx          # 帖子列表 + 分页
│   ├── Item.tsx          # 文章卡片
│   ├── TagCloud.tsx      # 标签云
│   ├── ThemeToggle.tsx   # 暗色模式切换
│   └── Animations.tsx    # 入场动画
├── lib/
│   ├── sources/          # 数据源（Telegram + X）
│   ├── sanitize.ts       # HTML 净化
│   ├── env.ts            # 环境变量
│   ├── dayjs.ts          # 日期处理
│   ├── prism.ts          # 代码高亮
│   └── proxy.ts          # 静态资源代理
├── types.ts              # TypeScript 类型
└── __tests__/            # 测试文件
```

## License

MIT
