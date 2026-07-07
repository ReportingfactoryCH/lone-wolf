import { useStore, type PanelId } from '../store'
import type { PersistState } from '../hooks/usePersistence'
import { goBack } from '../utils/readerControl'

// Header superiore compatto + barra azioni inferiore nella thumb-zone.
// Entrambi rispettano le safe-area (notch / home indicator).

const PANELS: { id: Exclude<PanelId, null>; icon: string; label: string }[] = [
  { id: 'number', icon: '🎲', label: 'Numero' },
  { id: 'chart', icon: '📋', label: 'Chart' },
  { id: 'inventory', icon: '🎒', label: 'Zaino' },
  { id: 'warlog', icon: '📜', label: 'Registro' },
  { id: 'combat', icon: '⚔️', label: 'Combatti' },
]

export function TopBar({ persist }: { persist: PersistState }) {
  const goLibrary = useStore((s) => s.goLibrary)
  const darkMode = useStore((s) => s.darkMode)
  const toggleDark = useStore((s) => s.toggleDark)
  const fontSize = useStore((s) => s.fontSize)
  const setFontSize = useStore((s) => s.setFontSize)

  const persistDot =
    persist === 'granted' ? '🟢' : persist === 'denied' ? '🟡' : persist === 'unsupported' ? '⚪️' : '⏳'

  return (
    <header className="pt-safe shrink-0 border-b border-[var(--color-line)] bg-[var(--color-panel)]">
      <div className="flex items-center gap-2 px-2 py-1.5">
        <button
          className="touch flex items-center justify-center rounded-lg border border-[var(--color-line)] bg-[var(--color-panel-2)] px-3 active:bg-[var(--color-line)]"
          onClick={goLibrary}
          aria-label="Torna alla libreria"
        >
          ‹ Libreria
        </button>
        <button
          className="touch flex items-center justify-center rounded-lg border border-[var(--color-line)] bg-[var(--color-panel-2)] px-3 active:bg-[var(--color-line)]"
          onClick={() => goBack()}
          aria-label="Indietro nella cronologia di lettura"
        >
          ↩ Back
        </button>
        <span className="flex-1" />
        <span title={`Persistenza storage: ${persist}`} className="text-xs">
          {persistDot}
        </span>
        <div className="flex items-center overflow-hidden rounded-lg border border-[var(--color-line)]">
          <button
            className="touch px-3 text-sm active:bg-[var(--color-line)]"
            onClick={() => setFontSize(fontSize - 10)}
            aria-label="Riduci testo"
          >
            A−
          </button>
          <button
            className="touch px-3 text-sm active:bg-[var(--color-line)]"
            onClick={() => setFontSize(fontSize + 10)}
            aria-label="Ingrandisci testo"
          >
            A+
          </button>
        </div>
        <button
          className="touch flex items-center justify-center rounded-lg border border-[var(--color-line)] bg-[var(--color-panel-2)] px-3 active:bg-[var(--color-line)]"
          onClick={toggleDark}
          aria-label="Tema chiaro/scuro"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  )
}

export function BottomBar() {
  const openPanel = useStore((s) => s.openPanel)
  const setPanel = useStore((s) => s.setPanel)
  return (
    // Sfondo più chiaro (panel-2) + bordo e ombra verso l'alto: così la barra si
    // legge come una barra piena attaccata al fondo. Fondamentale su iPhone, dove
    // `pb-safe` aggiunge la clearance dell'home-indicator: senza questo contrasto
    // quello spazio sembrava pagina vuota e la toolbar pareva "staccata".
    <nav className="pb-safe shrink-0 border-t border-[var(--color-line)] bg-[var(--color-panel-2)] shadow-[0_-6px_16px_rgba(0,0,0,0.45)]">
      <div className="grid grid-cols-5 gap-1 px-1 py-1">
        {PANELS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPanel(p.id)}
            className={`touch flex flex-col items-center justify-center rounded-lg py-1 text-[10px] ${
              openPanel === p.id
                ? 'bg-[var(--color-panel-2)] text-[var(--color-gold)]'
                : 'text-[var(--color-ink)]/70 active:bg-[var(--color-panel-2)]'
            }`}
            aria-label={p.label}
          >
            <span className="text-xl">{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
