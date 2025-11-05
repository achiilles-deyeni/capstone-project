# React (Vite) production Dockerfile
# Multi-stage: build with Node, serve static assets with nginx

FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies based on package files
COPY package*.json ./
# Use `npm install` here so the Docker build reflects package.json edits even if package-lock.json
# still references removed packages during local iteration. For reproducible builds in CI, prefer
# keeping package-lock.json in sync and using `npm ci`.
RUN npm install --silent

# Copy source and build
COPY . .
RUN npm run build

FROM nginx:stable-alpine AS runner
# Remove default nginx static content
RUN rm -rf /usr/share/nginx/html/*

# Copy Vite build output (default is /dist) to nginx html dir
COPY --from=builder /app/dist /usr/share/nginx/html

# Override default nginx config to add SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]