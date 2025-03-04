# 使用 Node.js 官方镜像作为基础镜像
FROM node:20-alpine AS builder

# 安装 pnpm
RUN npm install -g pnpm

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install

# 复制项目文件
COPY . .

# 构建项目
RUN pnpm run build

# 使用多阶段构建，减少最终镜像大小
FROM node:20-alpine AS runner

# 安装 pnpm
RUN npm install -g pnpm

# 设置工作目录
WORKDIR /app

# 从 builder 阶段复制构建好的文件
COPY --from=builder /app/next.config.ts ./
# COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装生产依赖
RUN pnpm install --prod

# 暴露端口
EXPOSE 3000

# 运行应用
CMD ["node", "server.js"]
