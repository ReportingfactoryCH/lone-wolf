import { db, type Playthrough } from '../db'

// ---------------------------------------------------------------------------
// Export/Import JSON dei salvataggi — rete di sicurezza contro l'eviction iOS.
// Esportiamo lo stato di gioco (Action Chart, war log, combattimento, location).
// NON includiamo il blob EPUB: è pesante e l'utente lo ricarica dalla libreria.
// ---------------------------------------------------------------------------

const FORMAT = 'lupo-solitario-save'
const VERSION = 1

interface SaveFile {
  format: typeof FORMAT
  version: number
  exportedAt: number
  bookTitle?: string
  playthrough: Omit<Playthrough, 'id'>
}

export async function exportPlaythrough(p: Playthrough): Promise<void> {
  const book = await db.books.get(p.bookId)
  const payload: SaveFile = {
    format: FORMAT,
    version: VERSION,
    exportedAt: Date.now(),
    bookTitle: book?.title,
    playthrough: {
      bookId: p.bookId,
      name: p.name,
      currentLocation: p.currentLocation,
      actionChart: p.actionChart,
      activeCombat: p.activeCombat,
      warLog: p.warLog,
      updatedAt: p.updatedAt,
    },
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const safeName = (p.name || 'partita').replace(/[^\w.-]+/g, '_')
  a.href = url
  a.download = `${safeName}.lupo.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Revoca dell'objectURL per non leakare memoria.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export interface ImportResult {
  newPlaythroughId: number
  bookId: number
  bookKnown: boolean
}

/**
 * Importa un file di salvataggio. Crea un NUOVO playthrough (non sovrascrive).
 * Se il bookId referenziato non esiste più, lo associa al primo libro disponibile
 * (l'utente potrà comunque rileggere il war log / Action Chart).
 */
export async function importPlaythrough(file: File): Promise<ImportResult> {
  const text = await file.text()
  const data = JSON.parse(text) as Partial<SaveFile>
  if (data.format !== FORMAT || !data.playthrough) {
    throw new Error('File di salvataggio non valido')
  }
  const pt = data.playthrough

  let bookId = pt.bookId
  let bookKnown = !!(await db.books.get(bookId))
  if (!bookKnown) {
    const first = await db.books.orderBy('addedAt').first()
    if (first?.id != null) {
      bookId = first.id
      bookKnown = false
    }
  }

  const id = await db.playthroughs.add({
    bookId,
    name: `${pt.name || 'Partita'} (importata)`,
    currentLocation: pt.currentLocation ?? null,
    actionChart: pt.actionChart,
    activeCombat: pt.activeCombat ?? null,
    warLog: pt.warLog ?? [],
    updatedAt: Date.now(),
  })

  return { newPlaythroughId: id, bookId, bookKnown }
}
