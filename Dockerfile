FROM node:20-alpine AS deps

# 安装 pnpm
RUN npm install -g pnpm

WORKDIR /app

# 禁用 Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# 只复制依赖相关文件
COPY package.json pnpm-lock.yaml ./

# 只安装生产依赖
RUN pnpm install --prod --frozen-lockfile

# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm

# 禁用 Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 构建项目
RUN pnpm run build

# 生产阶段
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXTAUTH_URL=https://shenzjd.com

# 不需要再次安装 pnpm，因为我们只需要运行构建后的文件
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 使用非 root 用户运行应用
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
