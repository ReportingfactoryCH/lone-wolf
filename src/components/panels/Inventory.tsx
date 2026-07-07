import { Sheet } from '../Sheet'
import { EditableList, Stepper } from '../ui'
import { useStore } from '../../store'
import { useT } from '../../i18n/useT'
import type { ActionChart as Chart } from '../../db'

// Inventario: armi / zaino / oggetti speciali / pasti. Liste liberamente editabili.
// Limiti classici mostrati come riferimento, mai bloccanti.
export function Inventory({ onClose }: { onClose: () => void }) {
  const t = useT()
  const chart = useStore((s) => s.playthrough?.actionChart)
  const setChart = useStore((s) => s.setActionChart)
  if (!chart) return null

  const patch = (p: Partial<Chart>) => setChart({ ...chart, ...p })

  return (
    <Sheet title={t('inv.title')} icon="🎒" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <EditableList
          title={t('inv.weapons')}
          items={chart.weapons}
          onChange={(weapons) => patch({ weapons })}
          softMax={2}
          addPlaceholder={t('inv.weaponsPlaceholder')}
        />
        <EditableList
          title={t('inv.backpack')}
          items={chart.backpack}
          onChange={(backpack) => patch({ backpack })}
          softMax={8}
          addPlaceholder={t('inv.backpackPlaceholder')}
        />
        <EditableList
          title={t('inv.special')}
          items={chart.specialItems}
          onChange={(specialItems) => patch({ specialItems })}
          addPlaceholder={t('inv.specialPlaceholder')}
        />
        <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 p-3">
          <h3 className="mb-2 font-semibold text-[var(--color-gold)]">{t('inv.meals')}</h3>
          <Stepper
            value={chart.meals}
            onChange={(meals) => patch({ meals })}
            hint={t('inv.mealsHint')}
          />
        </section>
      </div>
    </Sheet>
  )
}
