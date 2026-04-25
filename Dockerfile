FROM node:20-alpine AS base

FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages/*/package.json packages/*/
COPY apps/*/package.json apps/*/

RUN corepack enable && pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/packages ./packages

RUN corepack enable && pnpm install --frozen-lockfile --prod

WORKDIR /app/apps/api
EXPOSE 3000

CMD ["node", "dist/main.js"]
