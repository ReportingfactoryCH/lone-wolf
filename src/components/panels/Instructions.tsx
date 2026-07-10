import { Sheet } from '../Sheet'
import { useT } from '../../i18n/useT'
import type { TKey } from '../../i18n'

// Guida all'uso dell'app. Contenuto interamente data-driven da chiavi i18n
// (nessun testo hard-coded qui) → localizzato come il resto dell'interfaccia.
// Ogni sezione = icona + titolo + elenco puntato. La chiusura ribadisce il
// principio di prodotto "l'utente è l'arbitro".
const SECTIONS: { icon: string; title: TKey; bullets: TKey[] }[] = [
  { icon: '📚', title: 'help.load.title', bullets: ['help.load.b1', 'help.load.b2', 'help.load.b3', 'help.load.b4'] },
  {
    icon: '📖',
    title: 'help.read.title',
    bullets: ['help.read.b1', 'help.read.b2', 'help.read.b3', 'help.read.b4', 'help.read.b5'],
  },
  { icon: '🧭', title: 'help.goto.title', bullets: ['help.goto.b1', 'help.goto.b2'] },
  { icon: '📋', title: 'help.chart.title', bullets: ['help.chart.b1', 'help.chart.b2', 'help.chart.b3'] },
  { icon: '🎒', title: 'help.inv.title', bullets: ['help.inv.b1', 'help.inv.b2'] },
  { icon: '🎲', title: 'help.num.title', bullets: ['help.num.b1'] },
  {
    icon: '⚔️',
    title: 'help.combat.title',
    bullets: [
      'help.combat.b1',
      'help.combat.b2',
      'help.combat.b3',
      'help.combat.b4',
      'help.combat.b5',
      'help.combat.b6',
      'help.combat.b7',
      'help.combat.b8',
      'help.combat.b9',
    ],
  },
  { icon: '📜', title: 'help.warlog.title', bullets: ['help.warlog.b1', 'help.warlog.b2'] },
  { icon: '⚙️', title: 'help.backup.title', bullets: ['help.backup.b1', 'help.backup.b2', 'help.backup.b3'] },
]

export function Instructions({ onClose }: { onClose: () => void }) {
  const t = useT()
  return (
    <Sheet title={t('help.title')} icon="❓" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-[var(--color-ink)]/70">{t('help.intro')}</p>

        {/* Principio di prodotto in cima: è la prima cosa da capire. */}
        <section className="rounded-xl border border-[var(--color-gold-dim)] bg-[var(--color-panel-2)] p-3">
          <h3 className="mb-2 flex items-center gap-2 font-semibold text-[var(--color-gold)]">
            <span aria-hidden>🗡️</span>
            {t('help.principle.title')}
          </h3>
          <p className="text-sm text-[var(--color-ink)]/80">{t('help.principle.body')}</p>
        </section>

        {SECTIONS.map((s) => (
          <section
            key={s.title}
            className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 p-3"
          >
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-[var(--color-gold)]">
              <span aria-hidden>{s.icon}</span>
              {t(s.title)}
            </h3>
            <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-[var(--color-ink)]/80">
              {s.bullets.map((b) => (
                <li key={b}>{t(b)}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Sheet>
  )
}
