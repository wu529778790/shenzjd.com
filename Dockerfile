FROM node:22-alpine AS base

# --- Build stage ---
FROM base AS builder
ARG BUILD_TIME
WORKDIR /app
COPY package.json package-lock.json ./
# Cache npm downloads across builds via BuildKit mount — only re-runs when lockfile changes.
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
RUN npm run build

# --- Production stage ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

# --shrink-global-heap and --gc-interval must be CLI args (not NODE_OPTIONS):
# they force V8 to return freed heap pages to the OS and run GC more eagerly,
# keeping RSS close to actual usage instead of the peak.
CMD ["node", "--shrink-global-heap", "--gc-interval", "1000", "server.js"]
