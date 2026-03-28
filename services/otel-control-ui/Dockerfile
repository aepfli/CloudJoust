# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage — lightweight static file server
FROM ghcr.io/static-web-server/static-web-server:2-alpine
COPY --from=build /app/dist /public
ENV SERVER_ROOT=/public
ENV SERVER_PORT=8080
ENV SERVER_FALLBACK_PAGE=/public/index.html
EXPOSE 8080
