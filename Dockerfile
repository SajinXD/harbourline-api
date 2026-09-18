# ---- Stage 1: build ----
FROM node:20.11-alpine AS builder
WORKDIR /build
COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force
COPY server.js test.js ./

# ---- Stage 2: runtime ----
FROM node:20.11-alpine AS runtime
ENV NODE_ENV=production
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=builder --chown=appuser:appgroup /build/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /build/server.js ./server.js
COPY --from=builder --chown=appuser:appgroup /build/package.json ./package.json
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q --spider http://localhost:3000/healthz || exit 1
CMD ["node", "server.js"]
