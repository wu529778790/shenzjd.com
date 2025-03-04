# 构建阶段
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 禁用 Next.js 遥测数据收集
ENV NEXT_TELEMETRY_DISABLED=1

# 复制package.json和pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# 生产阶段
FROM node:20-alpine AS runner

WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# 禁用Next.js 的遥测数据收集
ENV NEXT_TELEMETRY_DISABLED=1

# 声明构建参数
ARG GITHUB_TOKEN
ARG GITHUB_ID
ARG GITHUB_SECRET
ARG NEXTAUTH_SECRET

# 设置环境变量
ENV GITHUB_TOKEN=$GITHUB_TOKEN
ENV GITHUB_ID=$GITHUB_ID
ENV GITHUB_SECRET=$GITHUB_SECRET
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET

# 从构建阶段复制 standalone 目录和静态文件
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# COPY --from=builder /app/public ./public

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "server.js"] 