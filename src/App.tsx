import { useCallback, useEffect, useRef } from 'react'
import type { Rendition, Book } from 'epubjs'
import { useStore } from './store'
import { usePersistence } from './hooks/usePersistence'
import { useBookData } from './hooks/useBookUrl'
import { Library } from './components/Library'
import { Reader } from './components/Reader'
import { Lightbox } from './components/Lightbox'
import { TopBar, BottomBar } from './components/Header'
import { NumberGenerator } from './components/panels/NumberGenerator'
import { ActionChart } from './components/panels/ActionChart'
import { Inventory } from './components/panels/Inventory'
import { WarLog } from './components/panels/WarLog'
import { Combat } from './components/panels/Combat'
import { GoToSection } from './components/panels/GoToSection'
import { db } from './db'
import { buildSectionIndex, attachLinkInterceptor } from './utils/sections'
import { setReaderControl } from './utils/readerControl'

export default function App() {
  const { state: persist } = usePersistence()
  const view = useStore((s) => s.view)
  const bookId = useStore((s) => s.bookId)
  const playthrough = useStore((s) => s.playthrough)
  const darkMode = useStore((s) => s.darkMode)
  const fontSize = useStore((s) => s.fontSize)
  const openPanel = useStore((s) => s.openPanel)
  const setPanel = useStore((s) => s.setPanel)
  const setLocation = useStore((s) => s.setLocation)
  const addWarLog = useStore((s) => s.addWarLog)

  const { data, loading, error } = useBookData(view === 'reader' ? bookId : null)

  // La toolbar è posizionata ASSOLUTA in fondo alla shell (vedi sotto): è fuori
  // dal flusso, quindi `main` non le riserva spazio da solo. Misuriamo l'altezza
  // reale della toolbar e la esponiamo come `--footer-h`, usata come padding-bottom
  // di `main` così il testo del reader non finisce mai sotto la toolbar.
  const shellRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const nav = navRef.current
    const shell = shellRef.current
    if (!nav || !shell) return
    const sync = () => shell.style.setProperty('--footer-h', `${nav.offsetHeight}px`)
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(nav)
    return () => ro.disconnect()
  }, [view])

  // Identità STABILE (dipende solo da bookId/azioni stabili) → non rompe il memo del Reader.
  const onReady = useCallback(
    async (rendition: Rendition, book: Book) => {
      if (bookId == null) return
      // Indice sezione->href: usa la cache nel record del libro o costruiscilo ora.
      const rec = await db.books.get(bookId)
      let index = rec?.sectionIndex
      if (!index || Object.keys(index).length === 0) {
        index = await buildSectionIndex(book)
        if (rec) await db.books.update(bookId, { sectionIndex: index })
      }
      setReaderControl(rendition, index)
      // Logga i salti sui link interni (senza impedirne la navigazione), con il
      // bersaglio così l'evento è ri-cliccabile dal registro.
      attachLinkInterceptor(rendition, ({ section, href }) => {
        addWarLog(
          section
            ? { type: 'navigation', text: `Link → sezione ${section}`, section }
            : { type: 'navigation', text: `Link → ${href}`, cfi: href },
        )
      })
    },
    [bookId, addWarLog],
  )

  if (view === 'library' || bookId == null || !playthrough) {
    return <Library persist={persist} />
  }

  return (
    // Shell a `height:100%` e `relative`: fa da contesto di posizionamento per la
    // toolbar assoluta. `#root` (height:100%) arriva al bordo fisico dello schermo
    // anche in standalone su iOS (misurato: rootBottom = fondo viewport), quindi la
    // toolbar `absolute bottom-0` è incollata al fondo VERO — a differenza di un
    // `fixed`, che in standalone iOS si ferma sopra l'home-indicator.
    <div ref={shellRef} className="relative h-full">
      <div className="flex h-full flex-col">
        <TopBar persist={persist} />

        {/* padding-bottom = altezza reale della toolbar, così il testo non ci finisce sotto */}
        <main
          className="relative flex-1 min-h-0 overflow-hidden"
          style={{ paddingBottom: 'var(--footer-h, 64px)' }}
        >
        {loading && (
          <div className="flex h-full items-center justify-center text-[var(--color-gold-dim)]">Caricamento…</div>
        )}
        {error && <div className="flex h-full items-center justify-center text-[var(--color-blood)]">{error}</div>}
        {data && (
          <Reader
            key={bookId}
            url={data}
            initialLocation={playthrough.currentLocation}
            darkMode={darkMode}
            fontSize={fontSize}
            onLocationChange={setLocation}
            onReady={onReady}
          />
        )}
        </main>
      </div>

      {/* Toolbar assoluta: incollata al bordo inferiore della shell (fondo fisico). */}
      <BottomBar navRef={navRef} />

      {/* Pannelli full-screen sheet */}
      {openPanel === 'number' && <NumberGenerator onClose={() => setPanel(null)} />}
      {openPanel === 'chart' && <ActionChart onClose={() => setPanel(null)} />}
      {openPanel === 'inventory' && <Inventory onClose={() => setPanel(null)} />}
      {openPanel === 'warlog' && <WarLog onClose={() => setPanel(null)} />}
      {openPanel === 'combat' && <Combat onClose={() => setPanel(null)} />}
      {openPanel === 'goto' && <GoToSection onClose={() => setPanel(null)} />}

      {/* Lightbox immagini (mappe ecc.): si auto-nasconde se nessuna immagine aperta. */}
      <Lightbox />
    </div>
  )
}
