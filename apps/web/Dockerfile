# Build context is the repo root (the web app consumes the packages/node workspaces).
# Build with:  docker build -f apps/web/Dockerfile .

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/web/package.json apps/web/
COPY packages/node/domain/package.json packages/node/domain/
COPY packages/node/api-client/package.json packages/node/api-client/
# npm ci is deterministic but needs a lockfile; fall back on a fresh clone that has none.
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app ./
COPY apps/web ./apps/web
COPY packages/node ./packages/node

# Inlined into the client bundle at build time, so it must be known here.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build -w @aegis/web

FROM node:22-alpine AS final
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
EXPOSE 3000
USER node

# next.config.ts sets output: "standalone". In a workspace root Next nests the
# app under apps/web/, so the static/public paths mirror that layout.
COPY --from=build --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=node:node /app/apps/web/public ./apps/web/public

CMD ["node", "apps/web/server.js"]
