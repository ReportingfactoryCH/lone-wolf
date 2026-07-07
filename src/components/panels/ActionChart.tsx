import { Sheet } from '../Sheet'
import { EditableList, Stepper } from '../ui'
import { useStore } from '../../store'
import { useT } from '../../i18n/useT'
import type { ActionChart as Chart } from '../../db'

// Action Chart: TUTTO sempre modificabile a mano (principio "l'utente è l'arbitro").
// I limiti classici sono mostrati come riferimento/avviso, mai come blocco.
export function ActionChart({ onClose }: { onClose: () => void }) {
  const t = useT()
  const chart = useStore((s) => s.playthrough?.actionChart)
  const setChart = useStore((s) => s.setActionChart)
  if (!chart) return null

  const patch = (p: Partial<Chart>) => setChart({ ...chart, ...p })

  const rollInitial = (kind: 'cs' | 'en') => {
    const n = Math.floor(Math.random() * 10)
    if (kind === 'cs') patch({ combatSkill: 10 + n })
    else patch({ endurance: { current: 20 + n, max: 20 + n } })
  }

  return (
    <Sheet title={t('chart.title')} icon="📋" onClose={onClose}>
      <div className="flex flex-col gap-5">
        {/* Combat Skill — MAI read-only definitivo. */}
        <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold text-[var(--color-gold)]">{t('chart.combatSkill')}</h3>
            <button
              className="touch rounded-lg border border-[var(--color-line)] bg-[var(--color-panel-2)] px-3 text-sm active:bg-[var(--color-line)]"
              onClick={() => rollInitial('cs')}
            >
              🎲 10 + (0–9)
            </button>
          </div>
          <Stepper value={chart.combatSkill} onChange={(v) => patch({ combatSkill: v })} hint={t('chart.csHint')} />
        </section>

        {/* Endurance — corrente e max, può salire o scendere a mano. */}
        <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold text-[var(--color-gold)]">{t('chart.endurance')}</h3>
            <button
              className="touch rounded-lg border border-[var(--color-line)] bg-[var(--color-panel-2)] px-3 text-sm active:bg-[var(--color-line)]"
              onClick={() => rollInitial('en')}
            >
              🎲 20 + (0–9)
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stepper
              label={t('chart.enduranceCurrent')}
              value={chart.endurance.current}
              onChange={(v) => patch({ endurance: { ...chart.endurance, current: v } })}
              warn={chart.endurance.current <= 0 ? t('chart.enduranceCritical') : undefined}
            />
            <Stepper
              label={t('chart.enduranceMax')}
              value={chart.endurance.max}
              onChange={(v) => patch({ endurance: { ...chart.endurance, max: v } })}
            />
          </div>
        </section>

        {/* Kai Disciplines — lista liberamente editabile: variano e aumentano
            nel corso dei libri, quindi si gestiscono come lo zaino. */}
        <EditableList
          title={t('chart.kai')}
          items={chart.kaiDisciplines}
          onChange={(kaiDisciplines) => patch({ kaiDisciplines })}
          addPlaceholder={t('chart.kaiPlaceholder')}
        />

        {/* Belt Pouch — oro. */}
        <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 p-3">
          <h3 className="mb-2 font-semibold text-[var(--color-gold)]">{t('chart.gold')}</h3>
          <Stepper
            value={chart.goldCrowns}
            onChange={(v) => patch({ goldCrowns: v })}
            hint={t('chart.goldHint')}
            warn={chart.goldCrowns > 50 ? t('chart.goldWarn') : undefined}
          />
        </section>

        <p className="text-center text-xs text-[var(--color-ink)]/50">{t('chart.itemsNote')}</p>
      </div>
    </Sheet>
  )
}
