import { useT } from '../i18n/useT'

// Invito a tornare in verticale (solo browser su telefono in landscape).
// La visibilità è gestita interamente da CSS (.landscape-gate + media query):
// nessun listener di resize/orientation lato JS.
export function OrientationGate() {
  const t = useT()
  return (
    <div className="landscape-gate" aria-hidden="true">
      <div className="text-5xl">🔄</div>
      <p className="text-lg font-semibold text-[var(--color-gold)]">{t('orient.rotate')}</p>
      <p className="max-w-xs text-sm text-[var(--color-ink)]/70">{t('orient.hint')}</p>
    </div>
  )
}
