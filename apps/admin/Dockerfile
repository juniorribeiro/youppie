FROM node:20-alpine AS base

FROM base AS builder
WORKDIR /app
RUN corepack enable
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
COPY . .
RUN yarn install --frozen-lockfile
ENV NEXT_TELEMETRY_DISABLED=1
RUN yarn workspace @repo/admin build

FROM base AS dev
WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock tsconfig.base.json ./
COPY apps/admin/package.json ./apps/admin/
COPY packages ./packages
RUN yarn install
COPY . .
ENV PORT=3000
CMD ["yarn", "workspace", "@repo/admin", "dev:docker"]

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache wget
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir -p ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/static ./apps/admin/.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "apps/admin/server.js"]

