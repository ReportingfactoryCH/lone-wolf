import { type CombatState, type CombatLogEntry, type ActionChart } from '../db'
import { lookupCrt, type CrtResult } from '../data/crt'

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
export function describeEntry(e: CombatLogEntry): string {
  switch (e.kind) {
    case 'start':
      return e.importedFromChart
        ? 'Inizio combattimento (valori importati dal registro)'
        : 'Inizio combattimento (valori inseriti a mano)'
    case 'round': {
      const num = e.randomNumber === null ? 'manuale' : `n.${e.randomNumber}`
      const lwLoss = isFinite(e.lwLoss) ? `−${e.lwLoss}` : 'MORTE'
      const enLoss = isFinite(e.enemyLoss) ? `−${e.enemyLoss}` : 'MORTE'
      return `Round — ${num}, CR ${fmtRatio(e.combatRatio)} → LW ${lwLoss} (${e.lwAfter}), Nemico ${enLoss} (${e.enemyAfter})`
    }
    case 'manual': {
      const who = e.target === 'lw' ? 'LW' : 'Nemico'
      const f = e.field === 'endurance' ? 'Endurance' : 'Combat Skill'
      return `Modifica manuale — ${who} ${f} ${e.from} → ${e.to}${e.note ? ` (${e.note})` : ''}`
    }
    case 'evade':
      return `Fuga — LW −${e.lwLoss}${e.toSection ? `, vai alla sez. ${e.toSection}` : ''}`
    case 'sync':
      return 'Resistenza aggiornata nel registro'
    case 'end': {
      const map: Record<string, string> = {
        won: 'vittoria',
        fled: 'fuga',
        'lw-down': 'LW a terra',
        closed: 'chiuso',
      }
      return `Fine combattimento (${map[e.outcome] ?? e.outcome})`
    }
  }
}

export function fmtRatio(r: number): string {
  return r > 0 ? `+${r}` : `${r}`
}
