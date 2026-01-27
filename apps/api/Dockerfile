FROM node:20-slim AS base

# Prune
FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# Debian has glibc, so we skip libc6-compat. But we need openssl and fast-fail updates.
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /app
RUN npm install turbo --global
COPY . .
RUN turbo prune --scope=api --docker

# Install dependencies and build
FROM base AS installer
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm ci

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Generate Prisma Client
WORKDIR /app/packages/database
RUN npx prisma generate

WORKDIR /app
RUN npx turbo run build --filter=api...

# Runner
FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN apt-get update -y && apt-get install -y openssl
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

COPY --from=installer --chown=nestjs:nodejs /app .

CMD ["node", "apps/api/dist/src/main"]
