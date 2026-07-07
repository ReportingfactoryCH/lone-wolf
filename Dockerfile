# syntax=docker/dockerfile:1.7

# ---------- Builder ----------
FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig*.json vite.config.ts index.html components.json ./
COPY public ./public
COPY src ./src

# Vite inlines env vars at build time. Override with --build-arg VITE_API_URL=...
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# ---------- Runtime ----------
FROM nginx:1.27-alpine AS runtime

# SPA fallback so React Router routes resolve to index.html
RUN printf '%s\n' \
    'server {' \
    '    listen 80;' \
    '    server_name _;' \
    '    root /usr/share/nginx/html;' \
    '    index index.html;' \
    '    location / {' \
    '        try_files $uri $uri/ /index.html;' \
    '    }' \
    '    location ~* \.(?:js|css|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|ico|webp)$ {' \
    '        expires 7d;' \
    '        access_log off;' \
    '        add_header Cache-Control "public";' \
    '    }' \
    '}' > /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
