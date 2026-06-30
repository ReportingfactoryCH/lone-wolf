import { useEffect, useRef, useState } from 'react'
import { Sheet } from '../Sheet'
import { useStore } from '../../store'

// Random Number Table: Lupo Solitario NON usa dadi → una sola cifra 0–9.
// Breve animazione di "estrazione", poi log nel war log (type: 'roll').
export function NumberGenerator({ onClose }: { onClose: () => void }) {
  const addWarLog = useStore((s) => s.addWarLog)
  const [display, setDisplay] = useState<number>(0)
  const [result, setResult] = useState<number | null>(null)
  const [rolling, setRolling] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => () => { if (timer.current) clearInterval(timer.current) }, [])

  const draw = () => {
    if (rolling) return
    setRolling(true)
    setResult(null)
    let ticks = 0
    timer.current = setInterval(() => {
      setDisplay(Math.floor(Math.random() * 10))
      ticks++
      if (ticks > 12) {
        if (timer.current) clearInterval(timer.current)
        const final = Math.floor(Math.random() * 10) // 0..9
        setDisplay(final)
        setResult(final)
        setRolling(false)
        addWarLog({ type: 'roll', text: `Numero estratto: ${final}` })
      }
    }, 60)
  }

  return (
    <Sheet title="Genera numero" icon="🎲" onClose={onClose}>
      <div className="flex flex-col items-center gap-6 py-6">
        <div
          className={`flex h-40 w-40 items-center justify-center rounded-2xl border-2 ${
            result !== null ? 'border-[var(--color-gold)]' : 'border-[var(--color-line)]'
          } bg-[var(--color-panel)] text-7xl font-bold text-[var(--color-gold)] ${rolling ? 'opacity-70' : ''}`}
        >
          {display}
        </div>

        <button
          onClick={draw}
          disabled={rolling}
          className="touch w-full max-w-xs rounded-xl border border-[var(--color-gold-dim)] bg-[var(--color-panel-2)] px-6 py-3 text-lg font-semibold text-[var(--color-gold)] active:bg-[var(--color-line)] disabled:opacity-50"
        >
          {rolling ? 'Estrazione…' : 'Estrai numero (0–9)'}
        </button>

        <p className="text-center text-sm text-[var(--color-ink)]/60">
          Lupo Solitario non usa dadi: si estrae una singola cifra da 0 a 9.
          Ogni estrazione viene registrata nel Registro di guerra.
        </p>
      </div>
    </Sheet>
  )
}
