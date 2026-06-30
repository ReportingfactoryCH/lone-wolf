import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Tailwind v4 via plugin ufficiale (@tailwindcss/vite) — NIENTE config PostCSS v3.
// vite-plugin-pwa con registerType autoUpdate: precache di tutta l'app shell.
// Nessuna risorsa da CDN: tutto è bundlato per garantire il funzionamento offline.
export default defineConfig({
  // Porta di default per dev (`npm run dev`) e preview (`npm run preview`).
  server: { port: 4200 },
  preview: { port: 4200 },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // La registrazione del SW la facciamo a mano in main.tsx (per agganciare il
      // controllo periodico degli aggiornamenti) → niente auto-inject del plugin.
      injectRegister: false,
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      workbox: {
        // L'app shell (JS/CSS/HTML/font) viene precachata.
        globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2,ico}'],
        // L'EPUB e i salvataggi vivono in IndexedDB, non serve cachearli qui.
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
      },
      manifest: {
        name: 'Lupo Solitario',
        short_name: 'Lupo Sol.',
        description: 'Reader PWA offline per gamebook Lupo Solitario / Lone Wolf',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#1a1206',
        background_color: '#1a1206',
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
