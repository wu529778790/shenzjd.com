# shenzjd.com

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

1. 克隆项目

```bash
git clone https://github.com/yourusername/shenzjd.com.git
cd shenzjd.com
```

2. 安装依赖

```bash
pnpm install
```

3. 配置环境变量
创建 `.env.local` 文件并添加以下配置：

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
```

4. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

5. 访问 <http://localhost:3000>

## 项目结构

```
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

- 只能访问原始仓库的公开数据(<https://github.com/wu529778790/shenzjd.com/blob/main/src/data/sites.json>)
- 不能进行任何修改操作

### 已登录用户

- 首次进行修改操作时会自动 fork 仓库
- 所有操作都在自己的 fork 仓库中进行
- 可以自由地进行增删改查操作

### 退出登录后

- 回到访问原始仓库的公开内容
- 不能进行任何修改操作

## API 文档

### 站点管理 API

#### 获取所有站点数据

```http
GET /api/sites
```

返回所有分类和站点数据。

**响应示例：**

```json
[
  {
    "id": "default",
    "name": "默认分类",
    "icon": "home",
    "sites": [
      {
        "title": "示例站点",
        "favicon": "https://example.com/favicon.ico",
        "url": "https://example.com",
        "id": "1234567890"
      }
    ]
  }
]
```

#### 添加站点

```http
POST /api/sites
```

在指定分类中添加新站点。

**请求体：**

```json
{
  "type": "addSite",
  "data": {
    "categoryId": "default",
    "site": {
      "title": "新站点",
      "favicon": "https://example.com/favicon.ico",
      "url": "https://example.com",
      "id": "1234567890"
    }
  }
}
```

#### 更新站点

```http
PUT /api/sites
```

更新指定分类中的站点信息。

**请求体：**

```json
{
  "type": "updateSite",
  "data": {
    "categoryId": "default",
    "siteId": "1234567890",
    "site": {
      "title": "更新后的标题",
      "favicon": "https://example.com/new-favicon.ico",
      "url": "https://example.com/new-url",
      "id": "1234567890"
    }
  }
}
```

#### 删除站点

```http
DELETE /api/sites
```

删除指定分类中的站点。

**请求体：**

```json
{
  "type": "deleteSite",
  "data": {
    "categoryId": "default",
    "siteId": "1234567890"
  }
}
```

#### 添加分类

```http
POST /api/sites
```

添加新的站点分类。

**请求体：**

```json
{
  "type": "addCategory",
  "data": {
    "id": "new-category",
    "name": "新分类",
    "icon": "folder",
    "sites": []
  }
}
```

#### 更新分类

```http
PUT /api/sites
```

更新分类信息。

**请求体：**

```json
{
  "type": "updateCategory",
  "data": {
    "categoryId": "default",
    "category": {
      "id": "default",
      "name": "更新后的分类名",
      "icon": "new-icon",
      "sites": []
    }
  }
}
```

#### 删除分类

```http
DELETE /api/sites
```

删除指定分类。

**请求体：**

```json
{
  "type": "deleteCategory",
  "data": {
    "categoryId": "default"
  }
}
```

### URL 解析 API

#### 解析 URL

```http
POST /api/parse-url
```

解析 URL 获取网站标题和图标。

**请求体：**

```json
{
  "url": "https://example.com"
}
```

**响应示例：**

```json
{
  "title": "示例网站",
  "favicon": "https://example.com/favicon.ico",
  "url": "https://example.com"
}
```

**错误响应：**

```json
{
  "error": "无法解析 URL"
}
```

### 错误处理

所有 API 在发生错误时会返回以下格式：

```json
{
  "error": "错误信息描述"
}
```

常见 HTTP 状态码：

- 200: 请求成功
- 400: 请求参数错误
- 404: 资源不存在
- 500: 服务器内部错误

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

### 提交规范

提交信息格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

type 类型：

- feat: 新功能
- fix: 修复
- docs: 文档
- style: 格式
- refactor: 重构
- test: 测试
- chore: 构建过程或辅助工具的变动

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
