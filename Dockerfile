FROM node:lts-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV DOCKER=true
RUN npm run build

FROM node:lts-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321
COPY --from=build /app/dist ./dist
RUN addgroup -g 1001 -S nodejs \
  && adduser -u 1001 -S nodejs -G nodejs
USER nodejs
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
