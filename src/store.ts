import { create } from 'zustand'
import {
  db,
  type Playthrough,
  type ActionChart,
  type CombatState,
  type WarLogEntry,
} from './db'

// ---------------------------------------------------------------------------
// Stato globale (Zustand). Sorgente di verità in-memory del playthrough attivo;
// ogni mutazione viene persistita su Dexie. La location del reader è persistita
// con debounce (vedi persist()/scheduleSave) per non scrivere ad ogni scroll.
// ---------------------------------------------------------------------------

export type PanelId = 'number' | 'chart' | 'inventory' | 'warlog' | 'combat' | 'goto' | null

interface AppState {
  view: 'library' | 'reader'
  bookId: number | null
  playthrough: Playthrough | null
  openPanel: PanelId
  darkMode: boolean
  fontSize: number // percentuale per il reader

  // navigazione app
  openReader: (bookId: number, playthroughId: number) => Promise<void>
  goLibrary: () => void
  setPanel: (p: PanelId) => void
  toggleDark: () => void
  setFontSize: (f: number) => void

  // mutazioni del playthrough (tutte persistono)
  patchPlaythrough: (patch: Partial<Playthrough>, opts?: { debounce?: boolean }) => void
  setActionChart: (chart: ActionChart) => void
  setCombat: (combat: CombatState | null) => void
  setLocation: (cfi: string) => void
  addWarLog: (entry: Omit<WarLogEntry, 'ts'>) => void
}

let saveTimer: ReturnType<typeof setTimeout> | null = null

async function persistNow(pt: Playthrough) {
  if (pt.id == null) return
  await db.playthroughs.put(pt)
}

function scheduleSave(pt: Playthrough, debounce: boolean) {
  if (!debounce) {
    void persistNow(pt)
    return
  }
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => void persistNow(pt), 500)
}

export const useStore = create<AppState>((set, get) => ({
  view: 'library',
  bookId: null,
  playthrough: null,
  openPanel: null,
  darkMode: true,
  fontSize: 100,

  openReader: async (bookId, playthroughId) => {
    const pt = await db.playthroughs.get(playthroughId)
    if (!pt) return
    set({ view: 'reader', bookId, playthrough: pt, openPanel: null })
  },

  goLibrary: () => set({ view: 'library', openPanel: null }),

  setPanel: (p) => set((s) => ({ openPanel: s.openPanel === p ? null : p })),

  toggleDark: () => set((s) => ({ darkMode: !s.darkMode })),

  setFontSize: (f) => set({ fontSize: Math.max(70, Math.min(180, f)) }),

  patchPlaythrough: (patch, opts) => {
    const cur = get().playthrough
    if (!cur) return
    const next: Playthrough = { ...cur, ...patch, updatedAt: Date.now() }
    set({ playthrough: next })
    scheduleSave(next, opts?.debounce ?? false)
  },

  setActionChart: (chart) => get().patchPlaythrough({ actionChart: chart }),

  setCombat: (combat) => get().patchPlaythrough({ activeCombat: combat }),

  setLocation: (cfi) => get().patchPlaythrough({ currentLocation: cfi }, { debounce: true }),

  addWarLog: (entry) => {
    const cur = get().playthrough
    if (!cur) return
    const full: WarLogEntry = { ...entry, ts: Date.now() }
    get().patchPlaythrough({ warLog: [...cur.warLog, full] })
  },
}))
