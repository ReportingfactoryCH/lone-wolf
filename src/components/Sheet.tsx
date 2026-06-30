import { useEffect, type ReactNode } from 'react'

// Sheet a tutto schermo (mobile-first). Entra dal basso, rispetta le safe-area,
// si chiude con il pulsante grande in alto o con Esc. Non "imprigiona" l'utente:
// la chiusura è sempre disponibile, lo stato sottostante non viene toccato.
export function Sheet({
  title,
  icon,
  onClose,
  children,
  footer,
}: {
  title: string
  icon?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--color-parchment)] h-app">
      <header className="pt-safe shrink-0 border-b border-[var(--color-line)] bg-[var(--color-panel)]">
        <div className="flex items-center gap-2 px-3 py-2">
          <span className="text-xl" aria-hidden>
            {icon}
          </span>
          <h2 className="flex-1 text-lg font-semibold text-[var(--color-gold)]">{title}</h2>
          <button
            onClick={onClose}
            className="touch flex items-center justify-center rounded-lg border border-[var(--color-line)] bg-[var(--color-panel-2)] px-3 text-[var(--color-ink)] active:bg-[var(--color-line)]"
            aria-label="Chiudi"
          >
            ✕
          </button>
        </div>
      </header>

      <div className="scroll-area flex-1 px-3 py-3">{children}</div>

      {footer && (
        <footer className="pb-safe shrink-0 border-t border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2">
          {footer}
        </footer>
      )}
    </div>
  )
}
