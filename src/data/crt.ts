// ===========================================================================
// Combat Results Table (CRT) — Lupo Solitario / Lone Wolf
// ===========================================================================
//
// Valori trascritti dalla Combat Results Table ufficiale (Project Aon).
// In ogni cella della tabella cartacea:
//   • numero in ALTO a SINISTRA = Endurance persa dal NEMICO (enemyLoss)
//   • numero in BASSO a DESTRA   = Endurance persa da LUPO SOLITARIO (lwLoss)
//   • "K" = morte istantanea (Killed) → qui rappresentato dalla sentinella K.
//
// Le righe sono il numero estratto 0–9 (indice dell'array = numero estratto;
// results[0] = riga "0", results[1] = riga "1", … results[9] = riga "9").
// Le colonne sono i bucket di Combat Ratio (LW CS − nemico CS).
//
// NB: i valori restano PROPOSTE. L'helper di combattimento li suggerisce e
// l'utente può sempre accettarli, correggerli o ignorarli (vedi Combat.tsx).
// ===========================================================================

/** Sentinella per "morte istantanea" (Killed) in una cella della CRT. */
export const K = Infinity

export interface CrtResult {
  /** Endurance persa da Lupo Solitario in questo round. (K = morte istantanea.) */
  lwLoss: number
  /** Endurance persa dal nemico in questo round. (K = morte istantanea.) */
  enemyLoss: number
}

export interface CrtBucket {
  /** Estremo inferiore del Combat Ratio incluso (può essere -Infinity). */
  min: number
  /** Estremo superiore del Combat Ratio incluso (può essere +Infinity). */
  max: number
  /** Etichetta leggibile, es. "−11 o meno", "0", "+11 o più". */
  label: string
  /** 10 risultati, indice = numero estratto 0..9. results[0] = riga "0". */
  results: CrtResult[]
}

/** Helper compatto: r(lwLoss, enemyLoss). */
const r = (lwLoss: number, enemyLoss: number): CrtResult => ({ lwLoss, enemyLoss })

// Ogni array è indicizzato per numero estratto: [0]=riga"0", [1..9]=righe 1..9.
export const CRT: CrtBucket[] = [
  {
    min: -Infinity,
    max: -11,
    label: '−11 o meno',
    results: [
      r(0, 6), // 0
      r(K, 0), // 1
      r(K, 0), // 2
      r(8, 0), // 3
      r(8, 0), // 4
      r(7, 1), // 5
      r(6, 2), // 6
      r(5, 3), // 7
      r(4, 4), // 8
      r(3, 5), // 9
    ],
  },
  {
    min: -10,
    max: -9,
    label: '−10 / −9',
    results: [
      r(0, 7), // 0
      r(K, 0), // 1
      r(8, 0), // 2
      r(7, 0), // 3
      r(7, 1), // 4
      r(6, 2), // 5
      r(6, 3), // 6
      r(5, 4), // 7
      r(4, 5), // 8
      r(3, 6), // 9
    ],
  },
  {
    min: -8,
    max: -7,
    label: '−8 / −7',
    results: [
      r(0, 8), // 0
      r(8, 0), // 1
      r(7, 0), // 2
      r(6, 1), // 3
      r(6, 2), // 4
      r(5, 3), // 5
      r(5, 4), // 6
      r(4, 5), // 7
      r(3, 6), // 8
      r(2, 7), // 9
    ],
  },
  {
    min: -6,
    max: -5,
    label: '−6 / −5',
    results: [
      r(0, 9), // 0
      r(6, 0), // 1
      r(6, 1), // 2
      r(5, 2), // 3
      r(5, 3), // 4
      r(4, 4), // 5
      r(4, 5), // 6
      r(3, 6), // 7
      r(2, 7), // 8
      r(0, 8), // 9
    ],
  },
  {
    min: -4,
    max: -3,
    label: '−4 / −3',
    results: [
      r(0, 10), // 0
      r(6, 1), // 1
      r(5, 2), // 2
      r(5, 3), // 3
      r(4, 4), // 4
      r(4, 5), // 5
      r(3, 6), // 6
      r(2, 7), // 7
      r(1, 8), // 8
      r(0, 9), // 9
    ],
  },
  {
    min: -2,
    max: -1,
    label: '−2 / −1',
    results: [
      r(0, 11), // 0
      r(5, 2), // 1
      r(5, 3), // 2
      r(4, 4), // 3
      r(4, 5), // 4
      r(3, 6), // 5
      r(2, 7), // 6
      r(2, 8), // 7
      r(1, 9), // 8
      r(0, 10), // 9
    ],
  },
  {
    min: 0,
    max: 0,
    label: '0',
    results: [
      r(0, 12), // 0
      r(5, 3), // 1
      r(4, 4), // 2
      r(4, 5), // 3
      r(3, 6), // 4
      r(2, 7), // 5
      r(2, 8), // 6
      r(1, 9), // 7
      r(0, 10), // 8
      r(0, 11), // 9
    ],
  },
  {
    min: 1,
    max: 2,
    label: '+1 / +2',
    results: [
      r(0, 14), // 0
      r(5, 4), // 1
      r(4, 5), // 2
      r(3, 6), // 3
      r(3, 7), // 4
      r(2, 8), // 5
      r(2, 9), // 6
      r(1, 10), // 7
      r(0, 11), // 8
      r(0, 12), // 9
    ],
  },
  {
    min: 3,
    max: 4,
    label: '+3 / +4',
    results: [
      r(0, 16), // 0
      r(4, 5), // 1
      r(3, 6), // 2
      r(3, 7), // 3
      r(2, 8), // 4
      r(2, 9), // 5
      r(2, 10), // 6
      r(1, 11), // 7
      r(0, 12), // 8
      r(0, 14), // 9
    ],
  },
  {
    min: 5,
    max: 6,
    label: '+5 / +6',
    results: [
      r(0, 18), // 0
      r(4, 6), // 1
      r(3, 7), // 2
      r(3, 8), // 3
      r(2, 9), // 4
      r(2, 10), // 5
      r(1, 11), // 6
      r(0, 12), // 7
      r(0, 14), // 8
      r(0, 16), // 9
    ],
  },
  {
    min: 7,
    max: 8,
    label: '+7 / +8',
    results: [
      r(0, K), // 0
      r(4, 7), // 1
      r(3, 8), // 2
      r(2, 9), // 3
      r(2, 10), // 4
      r(2, 11), // 5
      r(1, 12), // 6
      r(0, 14), // 7
      r(0, 16), // 8
      r(0, 18), // 9
    ],
  },
  {
    min: 9,
    max: 10,
    label: '+9 / +10',
    results: [
      r(0, K), // 0
      r(3, 8), // 1
      r(3, 9), // 2
      r(2, 10), // 3
      r(2, 11), // 4
      r(2, 12), // 5
      r(1, 14), // 6
      r(0, 16), // 7
      r(0, 18), // 8
      r(0, K), // 9
    ],
  },
  {
    min: 11,
    max: Infinity,
    label: '+11 o più',
    results: [
      r(0, K), // 0
      r(3, 9), // 1
      r(2, 10), // 2
      r(2, 11), // 3
      r(2, 12), // 4
      r(1, 14), // 5
      r(1, 16), // 6
      r(0, 18), // 7
      r(0, K), // 8
      r(0, K), // 9
    ],
  },
]

/** Trova il bucket di CRT per un dato Combat Ratio. */
export function bucketForRatio(ratio: number): CrtBucket | undefined {
  return CRT.find((b) => ratio >= b.min && ratio <= b.max)
}

/**
 * Restituisce il risultato CRT proposto, oppure null se il bucket non esiste
 * o il numero estratto è fuori range. In tal caso l'helper ricade sull'inserimento manuale.
 */
export function lookupCrt(ratio: number, randomNumber: number): CrtResult | null {
  if (randomNumber < 0 || randomNumber > 9) return null
  const bucket = bucketForRatio(ratio)
  if (!bucket) return null
  return bucket.results[randomNumber] ?? null
}

/** true se la CRT è compilata (ora sempre vera; mantenuto per gli avvisi UI). */
export function crtIsPopulated(): boolean {
  return CRT.some((b) => b.results.length > 0)
}
