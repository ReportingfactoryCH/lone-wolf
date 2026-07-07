import type { Rendition } from 'epubjs'
import { goToSection, type SectionIndex } from './sections'
import { useStore } from '../store'

// Singleton NON reattivo che espone il controllo del reader ai pannelli
// (es. "vai alla sezione N") senza forzare re-render del Reader memoizzato.
// Popolato da App quando il rendition è pronto.

interface ReaderControl {
  rendition: Rendition | null
  sectionIndex: SectionIndex
}

const control: ReaderControl = { rendition: null, sectionIndex: {} }

// --- Stack di history per il pulsante "Indietro" -----------------------------
// Browser-like: quando si cambia SEZIONE (non a ogni micro-scroll), si registra
// la posizione che si sta lasciando. "Indietro" ci riporta lì.
const history: string[] = []
let currentHref: string | null = null
let currentCfi: string | null = null
let navigatingBack = false

function trackRelocated(loc: { start?: { href?: string; cfi?: string } }) {
  const href = loc?.start?.href ?? null
  const cfi = loc?.start?.cfi ?? null
  // Cambio di sezione → spingo nello stack la posizione che lascio
  if (currentHref && href && href !== currentHref && !navigatingBack && currentCfi) {
    history.push(currentCfi)
  }
  navigatingBack = false
  currentHref = href
  currentCfi = cfi
}

export function setReaderControl(rendition: Rendition | null, sectionIndex: SectionIndex) {
  control.rendition = rendition
  control.sectionIndex = sectionIndex
  // reset history quando si (ri)apre un libro
  history.length = 0
  currentHref = null
  currentCfi = null
  navigatingBack = false
  if (rendition) {
    rendition.on('relocated', trackRelocated)
    // Inietta la barra di navigazione in coda a OGNI sezione renderizzata.
    // 'rendered' scatta a ogni cambio sezione → la barra è sempre presente.
    rendition.on('rendered', (_section: unknown, view: { document?: Document }) => {
      if (view?.document) {
        injectPageNav(view.document)
        injectImageZoom(view.document)
      }
    })
  }
}

export function getSectionIndex(): SectionIndex {
  return control.sectionIndex
}

export function isReaderReady(): boolean {
  return control.rendition !== null
}

/** Naviga alla sezione N. Ritorna true se il rendition era pronto e ha tentato. */
export async function navigateToSection(n: string): Promise<boolean> {
  if (!control.rendition) return false
  return goToSection(control.rendition, control.sectionIndex, n)
}

/** Pagina successiva nell'ordine dell'EPUB (spine). No-op se il reader non è pronto. */
export async function nextPage(): Promise<boolean> {
  if (!control.rendition) return false
  await control.rendition.next()
  return true
}

/** Pagina precedente nell'ordine dell'EPUB (spine). No-op se il reader non è pronto. */
export async function prevPage(): Promise<boolean> {
  if (!control.rendition) return false
  await control.rendition.prev()
  return true
}

/** Torna alla posizione precedente nello stack di history (browser-like). */
export async function goBack(): Promise<boolean> {
  if (!control.rendition || history.length === 0) return false
  const cfi = history.pop()!
  navigatingBack = true // evita di ri-registrare questo salto nello stack
  await control.rendition.display(cfi)
  return true
}

export function canGoBack(): boolean {
  return history.length > 0
}

/** CFI della posizione di lettura corrente (per creare un segnalibro). */
export function getCurrentCfi(): string | null {
  if (currentCfi) return currentCfi
  // Fallback best-effort dalla posizione live del rendition.
  const loc = control.rendition?.currentLocation() as unknown as { start?: { cfi?: string } } | undefined
  return loc?.start?.cfi ?? null
}

/** Salta a un CFI preciso (segnalibro). Ritorna true se il reader era pronto. */
export async function goToCfi(cfi: string): Promise<boolean> {
  if (!control.rendition) return false
  await control.rendition.display(cfi)
  return true
}

// --- Iniezione della barra di navigazione in coda al testo -------------------
// I bottoni vivono DENTRO il contenuto (sotto il testo): li si incontra
// scrollando fino in fondo alla sezione. Colori ereditati dal tema (currentColor),
// così seguono automaticamente dark/light senza ricalcoli.

const NAV_ID = 'lupo-pagenav'

function injectPageNav(doc: Document) {
  if (!doc.body || doc.getElementById(NAV_ID)) return

  const bar = doc.createElement('div')
  bar.id = NAV_ID
  bar.setAttribute(
    'style',
    [
      'display:flex',
      'flex-direction:column',
      'gap:8px',
      'margin:32px 0 0',
      // Spazio dal fondo via PADDING (non margin): il margin-bottom dell'ultimo
      // elemento non viene incluso nell'altezza del contenuto da epub.js e verrebbe
      // tagliato → la barra resterebbe a ridosso della toolbar. Il padding invece è
      // sempre incluso, quindi lo spazio si vede e non si rischia di premere la toolbar.
      'padding:16px 0 56px',
      'border-top:1px solid currentColor',
      'opacity:0.95',
      'font-family:system-ui,-apple-system,sans-serif',
    ].join(';'),
  )

  const mkRow = () => {
    const r = doc.createElement('div')
    r.setAttribute('style', 'display:flex;align-items:stretch;gap:8px')
    return r
  }

  const mkBtn = (label: string, aria: string, onClick: () => void) => {
    const b = doc.createElement('button')
    b.type = 'button'
    b.textContent = label
    b.setAttribute('aria-label', aria)
    b.setAttribute(
      'style',
      [
        'flex:1 1 0',
        'min-height:44px',
        'padding:10px 12px',
        'font-size:16px',
        'line-height:1',
        'color:inherit',
        'background:transparent',
        'border:1px solid currentColor',
        'border-radius:10px',
        'cursor:pointer',
        '-webkit-tap-highlight-color:transparent',
      ].join(';'),
    )
    b.addEventListener('click', (e) => {
      e.preventDefault()
      onClick()
    })
    return b
  }

  // Riga 1: Precedente | Successiva
  const row1 = mkRow()
  row1.appendChild(mkBtn('‹ Precedente', 'Pagina precedente', () => prevPage()))
  row1.appendChild(mkBtn('Successiva ›', 'Pagina successiva', () => nextPage()))

  // Riga 2: Indietro | Sezione (apre il pannello "vai alla sezione")
  const row2 = mkRow()
  row2.appendChild(mkBtn('↩ Indietro', 'Torna indietro nella cronologia', () => goBack()))
  row2.appendChild(
    mkBtn('🧭 Sezione', 'Vai alla sezione', () => useStore.getState().setPanel('goto')),
  )

  bar.appendChild(row1)
  bar.appendChild(row2)
  doc.body.appendChild(bar)
}

// --- Tap sulle immagini → apertura nel lightbox a tutto schermo --------------
// Le immagini dell'EPUB sono <img> dentro l'iframe. Al tap ne ricaviamo un URL
// utilizzabile dal parent (fetch del blob → object URL; fallback canvas → dataURL)
// e lo passiamo allo store, che mostra il lightbox React.

async function imageToParentUrl(img: HTMLImageElement, doc: Document): Promise<string | null> {
  const src = img.currentSrc || img.src
  try {
    const blob = await fetch(src).then((r) => r.blob())
    return URL.createObjectURL(blob)
  } catch {
    // Fallback: ridisegna su canvas (same-origin → non tainted) e usa un dataURL.
    try {
      const canvas = doc.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      canvas.getContext('2d')?.drawImage(img, 0, 0)
      return canvas.toDataURL('image/png')
    } catch {
      return null
    }
  }
}

function injectImageZoom(doc: Document) {
  const imgs = doc.querySelectorAll<HTMLImageElement>('img:not([data-lupo-zoom])')
  imgs.forEach((img) => {
    img.dataset.lupoZoom = '1'
    img.style.cursor = 'zoom-in'
    img.addEventListener('click', async (e) => {
      // Apriamo lo zoom invece di seguire un eventuale link che avvolge l'immagine.
      e.preventDefault()
      e.stopPropagation()
      const url = await imageToParentUrl(img, doc)
      if (url) useStore.getState().openLightbox(url)
    })
  })
}
