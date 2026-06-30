import { Sheet } from '../Sheet'
import { EditableList, Stepper } from '../ui'
import { useStore } from '../../store'
import type { ActionChart as Chart } from '../../db'

// Inventario: armi / zaino / oggetti speciali / pasti. Liste liberamente editabili.
// Limiti classici mostrati come riferimento, mai bloccanti.
export function Inventory({ onClose }: { onClose: () => void }) {
  const chart = useStore((s) => s.playthrough?.actionChart)
  const setChart = useStore((s) => s.setActionChart)
  if (!chart) return null

  const patch = (p: Partial<Chart>) => setChart({ ...chart, ...p })

  return (
    <Sheet title="Inventario" icon="🎒" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <EditableList
          title="Armi"
          items={chart.weapons}
          onChange={(weapons) => patch({ weapons })}
          softMax={2}
          addPlaceholder="es. Spada, Lancia…"
        />
        <EditableList
          title="Zaino (Backpack)"
          items={chart.backpack}
          onChange={(backpack) => patch({ backpack })}
          softMax={8}
          addPlaceholder="es. Corda, Lanterna…"
        />
        <EditableList
          title="Oggetti speciali"
          items={chart.specialItems}
          onChange={(specialItems) => patch({ specialItems })}
          addPlaceholder="es. Mappa, Sigillo Kai…"
        />
        <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 p-3">
          <h3 className="mb-2 font-semibold text-[var(--color-gold)]">Pasti (Meals)</h3>
          <Stepper
            value={chart.meals}
            onChange={(meals) => patch({ meals })}
            hint="ogni pasto occupa 1 slot zaino"
          />
        </section>
      </div>
    </Sheet>
  )
}
