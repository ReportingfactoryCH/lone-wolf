import Dexie, { type Table } from 'dexie'

// ---------------------------------------------------------------------------
// Modello dati (Dexie / IndexedDB). Vedi CLAUDE.md.
// L'EPUB è salvato come Blob; lo stato di gioco vive nei playthrough.
// ---------------------------------------------------------------------------

export interface Bookmark {
  id: string
  label: string
  cfi: string // posizione esatta epub.js → rendition.display(cfi)
  createdAt: number
}

export interface BookRecord {
  id?: number
  title: string
  blob: Blob // l'EPUB, non indicizzato
  addedAt: number
  // Indice sezione -> CFI/href, costruito alla prima apertura (vedi utils/sections.ts).
  sectionIndex?: Record<string, string>
  // Segnalibri del LIBRO: condivisi tra tutte le partite (es. la mappa del mondo).
  // Campo non indicizzato → nessuna migrazione; i record vecchi lo leggono come [].
  bookmarks?: Bookmark[]
}

export interface ActionChart {
  combatSkill: number // 10 + (0..9)
  endurance: { current: number; max: number } // 20 + (0..9)
  kaiDisciplines: string[] // 5 nel libro 1, +1 per libro successivo
  weapons: string[] // riferimento: max 2 (soft)
  backpack: string[] // riferimento: max 8 (soft)
  specialItems: string[] // nessun limite fisso
  goldCrowns: number // Belt Pouch, riferimento max 50 (soft)
  meals: number
}

// Ogni evento dello scontro produce una riga nello storico-diario (append-only).
export type CombatLogEntry =
  | { kind: 'start'; ts: number; importedFromChart: boolean; note?: string }
  | {
      kind: 'round'
      ts: number
      randomNumber: number | null
      combatRatio: number
      lwLoss: number
      enemyLoss: number
      lwAfter: number
      enemyAfter: number
      note?: string
    }
  | {
      kind: 'manual'
      ts: number
      target: 'lw' | 'enemy'
      field: 'endurance' | 'combatSkill'
      from: number
      to: number
      note?: string
    }
  | { kind: 'evade'; ts: number; lwLoss: number; toSection?: string; note?: string }
  | { kind: 'sync'; ts: number; note?: string }
  | { kind: 'end'; ts: number; outcome: 'won' | 'fled' | 'lw-down' | 'closed'; note?: string }

export interface CombatState {
  enemyName: string
  // Valori CORRENTI dei combattenti — sempre editabili a mano. Sono una COPIA:
  // l'Action Chart non viene mai toccata in automatico.
  lwEndurance: number
  lwCombatSkill: number
  enemyCombatSkill: number
  enemyEndurance: number
  lwBonus: number // modificatori temporanei al Combat Ratio
  history: CombatLogEntry[] // diario di sola lettura
  open: boolean // l'utente non l'ha ancora chiuso esplicitamente
}

export interface WarLogEntry {
  ts: number
  type: 'navigation' | 'combat' | 'roll' | 'note'
  text: string
}

export interface Playthrough {
  id?: number
  bookId: number
  name: string
  currentLocation: string | null // CFI di epub.js
  actionChart: ActionChart
  activeCombat: CombatState | null
  warLog: WarLogEntry[]
  updatedAt: number
}

export class GameDB extends Dexie {
  books!: Table<BookRecord, number>
  playthroughs!: Table<Playthrough, number>
  constructor() {
    super('lupo-solitario')
    this.version(1).stores({
      books: '++id, title, addedAt',
      playthroughs: '++id, bookId, updatedAt',
    })
  }
}

export const db = new GameDB()

// --- Factory dei default --------------------------------------------------

export function emptyActionChart(): ActionChart {
  return {
    combatSkill: 10,
    endurance: { current: 25, max: 25 },
    kaiDisciplines: [],
    weapons: [],
    backpack: [],
    specialItems: [],
    goldCrowns: 0,
    meals: 0,
  }
}

export function newPlaythrough(bookId: number, name = 'Partita 1'): Omit<Playthrough, 'id'> {
  return {
    bookId,
    name,
    currentLocation: null,
    actionChart: emptyActionChart(),
    activeCombat: null,
    warLog: [],
    updatedAt: Date.now(),
  }
}
