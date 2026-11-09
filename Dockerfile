FROM node:24-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build && npm prune --omit=dev


FROM node:24-slim

ENV NODE_ENV=production \
    DATA_DIR=/data \
    PORT=6080

WORKDIR /app

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY server ./server
COPY shared ./shared

# Run as a non-root user; responses are stored in /data (a volume)
RUN useradd --create-home --uid 10001 zy \
 && mkdir -p /data \
 && chown zy:zy /data
USER zy

VOLUME ["/data"]
EXPOSE 6080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/health',{signal:AbortSignal.timeout(4000)}).then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"

CMD ["node", "server/index.js"]
