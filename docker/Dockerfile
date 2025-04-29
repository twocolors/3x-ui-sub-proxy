FROM node:lts-alpine AS builder

# ENV NODE_ENV=production
WORKDIR /app
COPY . .
RUN npm install && \
    npm run build:clean

# Release
FROM node:lts-alpine AS release

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/data/config.json ./data/config.json

RUN mkdir -p /app/data

EXPOSE 8080

CMD ["node", "build/bin/main.js", "/app/data/config.json"]
