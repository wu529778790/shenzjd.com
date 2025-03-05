# 阶段一：构建阶段
FROM node:20-slim AS builder
WORKDIR /app

# 使用 npm 安装 pnpm
RUN npm install -g pnpm@latest

# 优先复制包管理文件（利用 Docker 层缓存）
COPY package.json pnpm-lock.yaml* .npmrc* ./

# 安装依赖（包含 devDependencies）
RUN pnpm install --frozen-lockfile

# 复制项目文件
COPY . .

# 构建项目
RUN pnpm build

# 阶段二：生产镜像
FROM node:20-slim
WORKDIR /app

# 使用 npm 安装 pnpm
RUN npm install -g pnpm@latest

# 从构建阶段复制必要文件
COPY --from=builder /app/package.json .
COPY --from=builder /app/pnpm-lock.yaml .
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.ts ./

# 仅安装生产依赖
RUN pnpm install --prod --frozen-lockfile

# 环境变量配置
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# 启动命令
CMD ["pnpm", "start"]
