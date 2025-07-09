# Multi-stage build for Next.js application
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./

# Check for package-lock.json synchronization and handle accordingly
RUN \
  if [ -f package-lock.json ]; then \
    echo "Checking package-lock.json synchronization..."; \
    if npm ci --dry-run 2>/dev/null; then \
      echo "Package-lock.json is synchronized, using npm ci"; \
      npm ci; \
    else \
      echo "Package-lock.json is out of sync with package.json"; \
      echo "This often happens after version changes. Regenerating lock file..."; \
      rm package-lock.json; \
      npm install --package-lock-only; \
      npm ci; \
    fi; \
  else \
    echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

# Add build environment variables for better error reporting
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NEXT_BUILD_VERBOSE=1

# Run build with error handling
RUN npm run build || (echo "Build failed. Checking for common issues..." && \
    echo "Node version: $(node --version)" && \
    echo "NPM version: $(npm --version)" && \
    echo "Package.json contents:" && cat package.json && \
    echo "Installed packages:" && npm list --depth=0 && \
    exit 1)

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Install wget for health checks (per guidelines)
RUN apk add --no-cache wget

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health/ || exit 1

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]