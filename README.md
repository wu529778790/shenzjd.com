# MicroBlog

将 Telegram 频道内容转化为精致的网页阅读体验。

## 功能

- 自动同步 Telegram 频道帖子
- 文章卡片式布局，阅读优化
- 帖子搜索、标签分类、链接收藏
- Sitemap
- 响应式设计，支持移动端
- 代码高亮（PrismJS）
- Telegram 评论和表情反应

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

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `CHANNEL` | ✅ | Telegram 频道用户名（不带 @） |
| `GITHUB` | | GitHub 用户名（顶部导航图标） |
| `SITE_URL` | | 站点完整 URL（用于 RSS/Sitemap） |
| `LOCALE` | | 语言设置，如 `zh-CN` |
| `TIMEZONE` | | 时区，如 `Asia/Shanghai` |
| `TAGS` | | 标签列表，逗号分隔 |
| `LINKS` | | 链接列表，格式 `标题,URL;标题,URL` |
| `NAVS` | | 自定义导航，格式 `标题,URL;标题,URL` |
| `COMMENTS` | | 启用 Telegram 评论（`true`） |
| `REACTIONS` | | 启用表情反应（`true`） |

完整变量列表见 `.env.example`。

## 部署

### Docker

```bash
docker build -t microblog .
docker run -d \
  --name microblog \
  --restart unless-stopped \
  --env-file .env \
  -p 3000:3000 \
  microblog
```

### Docker Compose

```yaml
services:
  microblog:
    build: .
    ports:
      - "3000:3000"
    env_file: .env
    restart: unless-stopped
```

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/wu529778790/MicroBlog)

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS v4
- **字体**: Newsreader（正文）+ 系统 sans-serif（UI）
- **数据源**: Telegram 频道 HTML 解析（Cheerio）
- **部署**: Docker + GitHub Actions CI/CD

## 项目结构

```
src/
├── app/              # 页面路由
│   ├── page.tsx      # 首页
│   ├── posts/        # 文章详情
│   ├── before/       #  older posts
│   ├── after/        # newer posts
│   ├── search/       # 搜索
│   ├── tags/         # 标签
│   ├── links/        # 链接
│   └── rss.xml/      # RSS Feed
├── components/       # React 组件
│   ├── Layout.tsx    # 页面布局 + 导航
│   ├── Header.tsx    # 频道描述
│   ├── List.tsx      # 帖子列表 + 分页
│   ├── Item.tsx      # 文章卡片
│   └── TagCloud.tsx  # 标签云
├── lib/
│   ├── sources/      # 数据源（Telegram）
│   ├── env.ts        # 环境变量
│   └── dayjs.ts      # 日期处理
└── types.ts          # TypeScript 类型
```

## License

MIT
