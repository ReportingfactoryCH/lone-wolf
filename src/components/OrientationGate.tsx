// Invito a tornare in verticale (solo browser su telefono in landscape).
// La visibilità è gestita interamente da CSS (.landscape-gate + media query):
// nessun listener di resize/orientation lato JS.
export function OrientationGate() {
  return (
    <div className="landscape-gate" aria-hidden="true">
      <div className="text-5xl">🔄</div>
      <p className="text-lg font-semibold text-[var(--color-gold)]">Ruota in verticale</p>
      <p className="max-w-xs text-sm text-[var(--color-ink)]/70">
        Lupo Solitario è pensato per il formato portrait.
      </p>
    </div>
  )
}
