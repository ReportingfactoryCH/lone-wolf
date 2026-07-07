/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// Iniettato da Vite a build time (vedi `define` in vite.config.ts): serve come
// marcatore di versione per verificare a colpo d'occhio di non essere in cache.
declare const __BUILD_ID__: string
