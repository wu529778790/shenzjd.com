# nav.shenzjd.com

一个基于 Next.js 15 开发的个人导航网站，支持用户自定义站点分类和书签管理。

## 项目特点

- 🚀 基于 Next.js 15 和 App Router 构建
- 🎨 支持亮色/暗色主题切换
- 🔐 GitHub OAuth 认证
- 🗂️ 支持自定义站点分类
- 🔗 自动解析网站标题和图标
- 💾 数据持久化存储
- 📱 响应式设计，支持移动端

## 技术栈

- **框架**: Next.js 15
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **认证**: NextAuth.js
- **状态管理**: React Context
- **UI组件**: shadcn/ui
- **图标**: Lucide Icons
- **数据存储**: GitHub API

## 快速开始

### 环境要求

- Node.js 18.17 或更高版本
- pnpm 包管理器
- GitHub 账号（用于认证）和 数据存储

### 安装步骤

1. 安装依赖

```bash
pnpm install
```

2. 配置环境变量
创建 `.env.local` 文件并添加以下配置：

```env
NEXTAUTH_SECRET=your-secret-key
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
```

3. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

## 项目结构

```shell
src/
├── app/                # Next.js App Router 页面
├── components/         # React 组件
├── hooks/             # 自定义 React Hooks
├── lib/               # 工具函数和配置
├── types/             # TypeScript 类型定义
└── data/              # 静态数据
```

## 功能说明

### 未登录用户

- 只能访问原始仓库的公开数据(<https://github.com/wu529778790/nav.shenzjd.com/blob/main/src/data/sites.json>)
- 不能进行任何修改操作

### 已登录用户

- 首次进行修改操作时会自动 fork 仓库
- 所有操作都在自己的 fork 仓库中进行
- 可以自由地进行增删改查操作

### 退出登录后

- 回到访问原始仓库的公开内容
- 不能进行任何修改操作

### 注意事项

1. 所有请求都需要设置 `Content-Type: application/json` 头部
2. 站点 ID 和分类 ID 都是唯一的字符串
3. 更新操作需要提供完整的对象数据
4. 删除操作会级联删除分类下的所有站点
5. URL 解析 API 需要提供有效的 URL 地址

## 参考网站

- <https://octokit.github.io/rest.js/>
- <https://www.shadcn-ui.cn/>
- <https://nextjs.org/>

## 开发指南

### 代码规范

- 使用 ESLint 和 Prettier 进行代码格式化
- 遵循 TypeScript 严格模式
- 使用 Server Components 优先原则
- 组件采用函数式组件和 Hooks

## 部署

项目可以部署到任何支持 Next.js 的平台，推荐使用 Vercel：

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件
