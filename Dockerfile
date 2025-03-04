# 构建阶段
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM node:20-alpine AS runner

WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production

# 创建非root用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制必要的文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 设置正确的权限
RUN chown -R nextjs:nodejs /app

# 切换到非root用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# 启动应用
CMD ["node", "server.js"] 