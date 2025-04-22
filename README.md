# nav.shenzjd.com

## 部署遇到的问题

### 1. 环境变量问题

#### 1.1 现象

```shell
2025-04-21T12:47:26.415593Z ▲  You are using Node.js 18.17.1. For Next.js, Node.js version "^18.18.0 || ^19.8.0 || >= 20.0.0" is required.
2025-04-21T12:47:26.423736Z ▲  ELIFECYCLE  Command failed with exit code 1.
2025-04-21T12:47:26.459234Z ▲  Error: Command "pnpm run build" exited with 1
2025-04-21T12:47:26.506415Z 
2025-04-21T12:47:26.506796Z ⚡️ The Vercel build (`npx vercel build`) command failed. For more details see the Vercel logs above.
2025-04-21T12:47:26.506974Z ⚡️ If you need help solving the issue, refer to the Vercel or Next.js documentation or their repositories.
2025-04-21T12:47:26.507092Z 
2025-04-21T12:47:26.543295Z Failed: Error while executing user command. Exited with error code: 1
2025-04-21T12:47:26.554331Z Failed: build command exited with code: 1
2025-04-21T12:47:27.545735Z Failed: error occurred while running build command
```

#### 1.2 原因

Cloudflare Pages 的默认构建环境使用的是 Node.js 18.17.1

但你的 Next.js 项目需要更新的 Node.js 版本（至少 18.18.0）

#### 1.3 解决方案

添加环境变量`NODE_VERSION`

### 2. nodejs_compat 兼容问题

#### 2.1 现象

![20250422113601](https://gcore.jsdelivr.net/gh/wu529778790/image/blog/20250422113601.png)

#### 2.2 原因

你的 Next.js 应用可能使用了 Node.js 特有的功能（如文件系统操作、fs 模块等）。

Cloudflare Pages 默认不支持 Node.js 运行时，除非显式启用 nodejs_compat 兼容性标志。

| 选项名称 | 作用 | 适用场景 |
|----------|------|----------|
| **`nodejs_compat`** | 启用 Node.js 兼容性支持 | 必须启用，否则 Node.js 相关功能（如 `fs`、`path` 模块）无法运行 |
| **`nodejs_compat_populate_process_env`** | 自动填充 `process.env` 环境变量 | 应用依赖运行时环境变量（如 `NEXT_PUBLIC_*`）时启用 |
| **`nodejs_compat_do_not_populate_process_env`** | 禁止填充 `process.env` | 需手动管理环境变量或避免冲突时启用 |

#### 2.3 解决方案

![20250422113817](https://gcore.jsdelivr.net/gh/wu529778790/image/blog/20250422113817.png)

## 参考链接

- <https://developers.cloudflare.com/pages/get-started/>
- <https://www.better-auth.com/>
- <https://tweakcn.com>
