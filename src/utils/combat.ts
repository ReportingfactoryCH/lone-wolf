import { type CombatState, type CombatLogEntry, type ActionChart } from '../db'
import { lookupCrt, type CrtResult } from '../data/crt'
import type { TFunc, TKey } from '../i18n'

// ---------------------------------------------------------------------------
// Helper di combattimento — PURO e SCAVALCABILE.
// Tutto ciò che è qui PROPONE un risultato; l'applicazione e ogni override
// avvengono nel componente, su azione esplicita dell'utente. Nessuna scrittura
// automatica sull'Action Chart.
// ---------------------------------------------------------------------------

/** Combat Ratio = (CS di LW + bonus) − CS nemico. */
export function combatRatio(lwCombatSkill: number, enemyCombatSkill: number, lwBonus: number): number {
  return lwCombatSkill + lwBonus - enemyCombatSkill
}

export interface ProposedRound {
  combatRatio: number
  randomNumber: number
  /** Risultato CRT, o null se la tabella non è compilata (→ inserimento manuale). */
  crt: CrtResult | null
  lwLoss: number | null
  enemyLoss: number | null
  /** true se la CRT non ha fornito valori e servono input manuali. */
  needsManual: boolean
}

/**
 * Calcola la proposta di un round dato il numero estratto. Non muta nulla.
 * Se la CRT non è popolata, ritorna needsManual=true con lwLoss/enemyLoss null.
 */
export function proposeRound(state: CombatState, randomNumber: number): ProposedRound {
  const ratio = combatRatio(state.lwCombatSkill, state.enemyCombatSkill, state.lwBonus)
  const crt = lookupCrt(ratio, randomNumber)
  return {
    combatRatio: ratio,
    randomNumber,
    crt,
    lwLoss: crt ? crt.lwLoss : null,
    enemyLoss: crt ? crt.enemyLoss : null,
    needsManual: crt === null,
  }
}

/** Crea uno stato di combattimento pulito. */
export function newCombat(chart: ActionChart | null, importFromChart: boolean): CombatState {
  const now = Date.now()
  return {
    enemyName: '',
    lwEndurance: importFromChart && chart ? chart.endurance.current : 0,
    lwCombatSkill: importFromChart && chart ? chart.combatSkill : 0,
    enemyCombatSkill: 0,
    enemyEndurance: 0,
    lwBonus: 0,
    open: true,
    history: [{ kind: 'start', ts: now, importedFromChart: importFromChart }],
  }
}

/** Applica una perdita di Endurance, ritornando il nuovo valore (consentendo lo sforamento). */
export function applyLoss(current: number, loss: number): number {
  if (!isFinite(loss)) return 0 // K = morte istantanea
  return current - loss
}

/** Costruisce la riga di storico per un round applicato. */
export function roundEntry(
  randomNumber: number | null,
  ratio: number,
  lwLoss: number,
  enemyLoss: number,
  lwAfter: number,
  enemyAfter: number,
  note?: string,
): CombatLogEntry {
  return {
    kind: 'round',
    ts: Date.now(),
    randomNumber,
    combatRatio: ratio,
    lwLoss,
    enemyLoss,
    lwAfter,
    enemyAfter,
    note,
  }
}

/** Riga di storico per una modifica manuale di un valore (LW o nemico). */
export function manualEntry(
  target: 'lw' | 'enemy',
  field: 'endurance' | 'combatSkill',
  from: number,
  to: number,
  note?: string,
): CombatLogEntry {
  return { kind: 'manual', ts: Date.now(), target, field, from, to, note }
}

/** Descrizione testuale leggibile di una riga di storico (per UI e war log). */
export function describeEntry(e: CombatLogEntry, t: TFunc): string {
  const death = t('combat.death')
  switch (e.kind) {
    case 'start':
      return e.importedFromChart ? t('clog.startImported') : t('clog.startManual')
    case 'round': {
      const num = e.randomNumber === null ? t('clog.roundManual') : t('clog.roundNum', { n: e.randomNumber })
      const lwLoss = isFinite(e.lwLoss) ? `−${e.lwLoss}` : death
      const enLoss = isFinite(e.enemyLoss) ? `−${e.enemyLoss}` : death
      return t('clog.round', {
        num,
        cr: fmtRatio(e.combatRatio),
        lwLoss,
        lwAfter: e.lwAfter,
        enLoss,
        enAfter: e.enemyAfter,
      })
    }
    case 'manual': {
      const who = t(e.target === 'lw' ? 'clog.manualLw' : 'clog.manualEnemy')
      const f = t(e.field === 'endurance' ? 'clog.manualEndurance' : 'clog.manualCs')
      const vars = { who, field: f, from: e.from, to: e.to, note: e.note ?? '' }
      return t(e.note ? 'clog.manualNote' : 'clog.manual', vars)
    }
    case 'evade':
      return e.toSection
        ? t('clog.evadeSection', { loss: e.lwLoss, section: e.toSection })
        : t('clog.evade', { loss: e.lwLoss })
    case 'sync':
      return t('clog.sync')
    case 'end': {
      const map: Record<string, TKey> = {
        won: 'clog.outcomeWon',
        fled: 'clog.outcomeFled',
        'lw-down': 'clog.outcomeLwDown',
        closed: 'clog.outcomeClosed',
      }
      const key = map[e.outcome]
      return t('clog.end', { outcome: key ? t(key) : e.outcome })
    }
  }
}

export function fmtRatio(r: number): string {
  return r > 0 ? `+${r}` : `${r}`
}
