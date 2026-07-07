# syntax=docker/dockerfile:1.7

# ---------- Builder ----------
FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# tsconfig*.json → i tre file di progetto (tsc -b li referenzia tutti).
# vite.config.ts + index.html + public/ + src/ = tutto ciò che serve a `npm run build`.
COPY tsconfig*.json vite.config.ts index.html ./
COPY public ./public
COPY src ./src

RUN npm run build

# ---------- Runtime ----------
FROM nginx:1.27-alpine AS runtime

# Config nginx: SPA fallback + regole di cache pensate per la PWA.
# Non c'è un router lato client (l'app è single-page a pannelli), ma il fallback
# a index.html serve comunque per ricariche profonde e per la registrazione del SW.
RUN printf '%s\n' \
    'server {' \
    '    listen 80;' \
    '    server_name _;' \
    '    root /usr/share/nginx/html;' \
    '    index index.html;' \
    '' \
    '    # App shell / fallback SPA. HTML mai cachato a lungo, così un nuovo deploy' \
    '    # (e quindi un nuovo service worker) viene raccolto al ricaricamento.' \
    '    location / {' \
    '        try_files $uri $uri/ /index.html;' \
    '        add_header Cache-Control "no-cache";' \
    '    }' \
    '' \
    '    # Service worker + manifest: sempre rivalidati. Con expires lungo la PWA' \
    '    # (registerType autoUpdate) resterebbe bloccata su una versione vecchia.' \
    '    location ~* ^/(sw\.js|workbox-[^/]+\.js|registerSW\.js|manifest\.webmanifest)$ {' \
    '        add_header Cache-Control "no-cache";' \
    '    }' \
    '' \
    '    # Asset con hash nel nome (immutabili per definizione): cache lunga.' \
    '    location /assets/ {' \
    '        access_log off;' \
    '        add_header Cache-Control "public, max-age=31536000, immutable";' \
    '    }' \
    '}' > /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
