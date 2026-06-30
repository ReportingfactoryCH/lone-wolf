// ===========================================================================
// Combat Results Table (CRT) — Lupo Solitario / Lone Wolf
// ===========================================================================
//
//  ⚠️  TEMPLATE — VALORI NON COMPILATI  ⚠️
//
// I valori esatti della CRT provengono dai materiali ufficiali di PROJECT AON
// (https://www.projectaon.org), pubblicati con licenza. NON sono stati inseriti
// qui per non inventare numeri non verificati.
//
// COME COMPILARLA:
// 1. Apri la Combat Results Table dal libro (Appendice / "How To Fight Creatures
//    Of Darkness") su Project Aon.
// 2. Per ogni RIGA (bucket di Combat Ratio) e ogni COLONNA (numero estratto 0–9)
//    inserisci la coppia { lwLoss, enemyLoss } indicata dalla tabella.
//    - lwLoss   = punti Endurance persi da Lupo Solitario quel round
//    - enemyLoss= punti Endurance persi dal nemico quel round
//    - Usa il valore speciale `K` (importato sotto) per "morte istantanea"
//      (nella tabella cartacea spesso indicato come "K" = Killed).
//
// Finché i valori restano `null`, l'helper di combattimento funziona comunque:
// segnala che la CRT non è disponibile e lascia l'utente inserire i danni a mano
// (vedi src/utils/combat.ts e components/panels/Combat.tsx).
// ===========================================================================

/** Sentinella per "morte istantanea" (Killed) in una cella della CRT. */
export const K = Infinity

export interface CrtResult {
  /** Endurance persa da Lupo Solitario in questo round. */
  lwLoss: number
  /** Endurance persa dal nemico in questo round. (Usa K per morte istantanea.) */
  enemyLoss: number
}

/**
 * Bucket di Combat Ratio della CRT classica, dal più sfavorevole a LW al più
 * favorevole. Ogni bucket copre un intervallo di Combat Ratio (LW CS − nemico CS).
 *
 * I limiti qui sotto seguono la struttura standard della tabella; restano dati
 * da verificare su Project Aon ma NON sono "valori di gioco" (sono solo i confini
 * delle righe), quindi sono indicati come riferimento. Modificali se la tua
 * edizione differisce.
 */
export interface CrtBucket {
  /** Estremo inferiore del Combat Ratio incluso (può essere -Infinity). */
  min: number
  /** Estremo superiore del Combat Ratio incluso (può essere +Infinity). */
  max: number
  /** Etichetta leggibile, es. "-11 o meno", "0 / -1", "+11 o più". */
  label: string
  /**
   * 10 risultati, uno per numero estratto 0..9 (indice = numero estratto).
   * `null` = cella non ancora compilata dall'utente.
   *
   * TODO(Project Aon): sostituire ogni `null` con { lwLoss, enemyLoss }.
   */
  results: Array<CrtResult | null>
}

const empty10 = (): Array<CrtResult | null> => [null, null, null, null, null, null, null, null, null, null]

// Struttura delle righe della CRT standard di Lupo Solitario.
// (Solo i confini dei bucket; le celle dei danni sono da compilare.)
export const CRT: CrtBucket[] = [
  { min: -Infinity, max: -11, label: '−11 o meno', results: empty10() },
  { min: -10, max: -9, label: '−10 / −9', results: empty10() },
  { min: -8, max: -7, label: '−8 / −7', results: empty10() },
  { min: -6, max: -5, label: '−6 / −5', results: empty10() },
  { min: -4, max: -3, label: '−4 / −3', results: empty10() },
  { min: -2, max: -1, label: '−2 / −1', results: empty10() },
  { min: 0, max: 1, label: '0 / +1', results: empty10() },
  { min: 2, max: 3, label: '+2 / +3', results: empty10() },
  { min: 4, max: 5, label: '+4 / +5', results: empty10() },
  { min: 6, max: 7, label: '+6 / +7', results: empty10() },
  { min: 8, max: 9, label: '+8 / +9', results: empty10() },
  { min: 10, max: 11, label: '+10 / +11', results: empty10() },
  { min: 12, max: Infinity, label: '+12 o più', results: empty10() },
]

/** Trova il bucket di CRT per un dato Combat Ratio. */
export function bucketForRatio(ratio: number): CrtBucket | undefined {
  return CRT.find((b) => ratio >= b.min && ratio <= b.max)
}

/**
 * Restituisce il risultato CRT proposto, oppure null se:
 * - il bucket non esiste, oppure
 * - la cella non è ancora stata compilata (template non popolato).
 * In entrambi i casi l'helper di combattimento ricade sull'inserimento manuale.
 */
export function lookupCrt(ratio: number, randomNumber: number): CrtResult | null {
  if (randomNumber < 0 || randomNumber > 9) return null
  const bucket = bucketForRatio(ratio)
  if (!bucket) return null
  return bucket.results[randomNumber] ?? null
}

/** true se almeno una cella della CRT è stata compilata (per avvisi UI). */
export function crtIsPopulated(): boolean {
  return CRT.some((b) => b.results.some((r) => r !== null))
}
