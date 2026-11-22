import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import '@fontsource/montserrat/400.css'
import '@fontsource/montserrat/600.css'
import '@fontsource/montserrat/700.css'
import './index.css'
import App from './App'
import { OrientationGate } from './components/OrientationGate'
import { useStore } from './store'
import { goBack } from './utils/readerControl'

// Android-App (WebView): die Zurück-Taste des Telefons ruft diese Funktion auf.
// Reihenfolge: Bild schliessen → Panel schliessen → im Leseverlauf zurück →
// zur Bibliothek. Gibt false zurück, wenn nichts mehr zu tun ist (App schliesst).
;(window as unknown as { spielbuchBack: () => Promise<boolean> }).spielbuchBack = async () => {
  const s = useStore.getState()
  if (s.lightboxSrc) { s.closeLightbox(); return true }
  if (s.openPanel) { s.setPanel(null); return true }
  if (s.view === 'reader') {
    if (await goBack()) return true
    s.goLibrary()
    return true
  }
  return false
}

const isAndroidApp = import.meta.env.VITE_ANDROID === '1'

// Service worker (offline-first). In der Android-App unnötig: dort liegen alle
// Dateien bereits lokal im APK.
if (isAndroidApp) {
  // nichts zu tun
} else if (import.meta.env.DEV) {
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

// Rimuove lo splash inline (index.html) una volta montata l'app. Un minimo di
// permanenza (~450ms) evita un lampo troppo brusco; poi dissolve e rimuove il nodo.
{
  const splash = document.getElementById('splash')
  if (splash) {
    setTimeout(() => {
      splash.classList.add('splash--hide')
      splash.addEventListener('transitionend', () => splash.remove(), { once: true })
      // Fallback se transitionend non scatta (es. reduced-motion / interruzioni).
      setTimeout(() => splash.remove(), 600)
    }, 450)
  }
}
