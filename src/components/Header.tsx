import { useStore, type PanelId } from '../store'
import { goBack } from '../utils/readerControl'
import { useT } from '../i18n/useT'
import type { TKey } from '../i18n'

// Header superiore compatto + barra azioni inferiore nella thumb-zone.
// Entrambi rispettano le safe-area (notch / home indicator).

const PANELS: { id: Exclude<PanelId, null>; icon: string; label: TKey }[] = [
  { id: 'number', icon: '🎲', label: 'nav.number' },
  { id: 'chart', icon: '📋', label: 'nav.chart' },
  { id: 'inventory', icon: '🎒', label: 'nav.inventory' },
  { id: 'warlog', icon: '📜', label: 'nav.warlog' },
  { id: 'combat', icon: '⚔️', label: 'nav.combat' },
]

export function TopBar() {
  const t = useT()
  const goLibrary = useStore((s) => s.goLibrary)
  const setPanel = useStore((s) => s.setPanel)
  const fontSize = useStore((s) => s.fontSize)
  const setFontSize = useStore((s) => s.setFontSize)

  return (
    <header className="pt-safe shrink-0 border-b border-[var(--color-line)] bg-[var(--color-panel)]">
      <div className="flex items-center gap-2 px-2 py-1.5">
        <button
          className="touch flex items-center justify-center rounded-lg border border-[var(--color-line)] bg-[var(--color-panel-2)] px-3 active:bg-[var(--color-line)]"
          onClick={goLibrary}
          aria-label={t('top.library')}
        >
          ‹ {t('top.library')}
        </button>
        <button
          className="touch flex items-center justify-center rounded-lg border border-[var(--color-line)] bg-[var(--color-panel-2)] px-3 active:bg-[var(--color-line)]"
          onClick={() => goBack()}
          aria-label={t('top.backAria')}
        >
          ↩ {t('top.back')}
        </button>
        <span className="flex-1" />
        <div className="flex items-center overflow-hidden rounded-lg border border-[var(--color-line)]">
          <button
            className="touch px-3 text-sm active:bg-[var(--color-line)]"
            onClick={() => setFontSize(fontSize - 10)}
            aria-label={t('top.smaller')}
          >
            A−
          </button>
          <button
            className="touch px-3 text-sm active:bg-[var(--color-line)]"
            onClick={() => setFontSize(fontSize + 10)}
            aria-label={t('top.larger')}
          >
            A+
          </button>
        </div>
        <button
          className="touch flex items-center justify-center rounded-lg border border-[var(--color-line)] bg-[var(--color-panel-2)] px-3 active:bg-[var(--color-line)]"
          onClick={() => setPanel('settings')}
          aria-label={t('top.settingsAria')}
        >
          ⚙️
        </button>
      </div>
    </header>
  )
}

export function BottomBar() {
  const t = useT()
  const openPanel = useStore((s) => s.openPanel)
  const setPanel = useStore((s) => s.setPanel)
  return (
    // Toolbar in fondo alla colonna flex. Con `.app-shell` alta quanto lo schermo
    // fisico, tocca il bordo inferiore vero. Sfondo panel-2 + bordo/ombra = barra
    // piena e distinta; clearance home-indicator ridotta (env - 10px) per non
    // renderla troppo alta, tenendo le icone sopra l'indicatore.
    <nav
      className="shrink-0 border-t border-[var(--color-line)] bg-[var(--color-panel-2)] shadow-[0_-2px_8px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'max(calc(env(safe-area-inset-bottom) - 10px), 6px)' }}
    >
      <div className="grid grid-cols-5 gap-1 px-1 py-0.5">
        {PANELS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPanel(p.id)}
            className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-lg py-1 text-[10px] leading-none ${
              openPanel === p.id
                ? 'bg-[var(--color-panel)] text-[var(--color-gold)]'
                : 'text-[var(--color-ink)]/70 active:bg-[var(--color-panel)]'
            }`}
            aria-label={t(p.label)}
          >
            <span className="text-lg leading-none">{p.icon}</span>
            <span>{t(p.label)}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
