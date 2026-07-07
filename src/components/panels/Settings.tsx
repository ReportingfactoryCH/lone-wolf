import { Sheet } from '../Sheet'
import { useStore } from '../../store'
import { useT } from '../../i18n/useT'

// Impostazioni: lingua UI + tema. Raggiungibile da Libreria e da Reader.
export function Settings({ onClose }: { onClose: () => void }) {
  const t = useT()
  const lang = useStore((s) => s.lang)
  const setLang = useStore((s) => s.setLang)
  const darkMode = useStore((s) => s.darkMode)
  const toggleDark = useStore((s) => s.toggleDark)

  return (
    <Sheet title={t('settings.title')} icon="⚙️" onClose={onClose}>
      <div className="flex flex-col gap-5">
        {/* Lingua */}
        <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 p-3">
          <h3 className="mb-3 font-semibold text-[var(--color-gold)]">{t('settings.language')}</h3>
          <Segmented
            value={lang}
            options={[
              { value: 'it', label: 'Italiano' },
              { value: 'en', label: 'English' },
            ]}
            onChange={(v) => setLang(v)}
          />
        </section>

        {/* Tema */}
        <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 p-3">
          <h3 className="mb-3 font-semibold text-[var(--color-gold)]">{t('settings.theme')}</h3>
          <Segmented
            value={darkMode ? 'dark' : 'light'}
            options={[
              { value: 'dark', label: `🌙 ${t('settings.themeDark')}` },
              { value: 'light', label: `☀️ ${t('settings.themeLight')}` },
            ]}
            onChange={(v) => {
              if ((v === 'dark') !== darkMode) toggleDark()
            }}
          />
        </section>
      </div>
    </Sheet>
  )
}

// Selettore a segmenti (toggle) generico, target tattili ampi.
function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="flex gap-2">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`touch flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
              active
                ? 'border-[var(--color-gold)] bg-[var(--color-panel-2)] text-[var(--color-gold)]'
                : 'border-[var(--color-line)] bg-[var(--color-panel-2)]/50 text-[var(--color-ink)]/70 active:bg-[var(--color-line)]'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
