FROM node:20-slim AS base

# Prune
FROM base AS builder
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /app
RUN npm install turbo --global
COPY . .
RUN turbo prune --scope=web --docker

# Install dependencies and build
FROM base AS installer
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /app

# First install dependencies
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm ci

# Build the project
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Environment variables must be present at build time for Next.js if they are public
ARG NEXT_PUBLIC_API_URL=http://localhost:3001/api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Generate Prisma Client (Required for Web Build)
WORKDIR /app/packages/database
RUN npx prisma generate

WORKDIR /app
RUN npx turbo run build --filter=web...

# Runner
FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /app/apps/web/next.config.ts . 
COPY --from=installer /app/apps/web/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

CMD ["node", "apps/web/server.js"]
