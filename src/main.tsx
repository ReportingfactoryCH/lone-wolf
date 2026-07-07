import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App'
import { OrientationGate } from './components/OrientationGate'

// Service worker (offline-first).
if (import.meta.env.DEV) {
  // In DEV il service worker NON viene rigenerato. Se ne è rimasto uno da un
  // precedente `npm run preview` (stessa origin localhost:4200), continuerebbe a
  // servire la build cachata e non vedremmo MAI i cambiamenti del dev server.
  // → lo rimuoviamo e svuotiamo le cache così il dev mostra sempre codice live.
  navigator.serviceWorker?.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()))
  if ('caches' in window) caches.keys().then((ks) => ks.forEach((k) => caches.delete(k)))
} else {
  // PROD: registerType è 'autoUpdate' → trova la build nuova, la scarica, la
  // attiva e ricarica la pagina da sola. Di default però il controllo avviene
  // SOLO al load: aggiungiamo un controllo periodico finché la tab è viva.
  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return
      const intervalMs = 60 * 1000 // ogni 60s
      setInterval(() => {
        // Solo se online; update() interroga il server per il SW aggiornato.
        // In offline fallisce in silenzio (l'app continua dalla cache).
        if (navigator.onLine) registration.update().catch(() => {})
      }, intervalMs)
    },
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <OrientationGate />
  </StrictMode>,
)
