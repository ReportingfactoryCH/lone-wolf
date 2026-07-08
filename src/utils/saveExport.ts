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

// ---------------------------------------------------------------------------
// Backup COMPLETO — tutti i playthrough di tutti i libri, in un solo file.
// NON include gli EPUB (pesanti, ricaricabili dalla libreria).
//
// Il bookId numerico è un auto-increment LOCALE di IndexedDB: non è portabile
// tra dispositivi / reinstallazioni. Perciò salviamo il TITOLO del libro e, al
// reimport, ri-agganciamo per titolo al libro presente in libreria. Se il libro
// non c'è, il playthrough resta "orfano" (orphanBookTitle) e si ri-aggancia da
// solo appena quell'EPUB viene caricato (vedi relinkOrphanPlaythroughs).
// ---------------------------------------------------------------------------

const BACKUP_FORMAT = 'lupo-solitario-backup'
const BACKUP_VERSION = 1

interface BackupEntry {
  bookTitle: string // chiave di ri-aggancio (il bookId numerico non è portabile)
  name: string
  currentLocation: string | null
  actionChart: Playthrough['actionChart']
  activeCombat: Playthrough['activeCombat']
  warLog: Playthrough['warLog']
  updatedAt: number
}

interface BackupFile {
  format: typeof BACKUP_FORMAT
  version: number
  exportedAt: number
  playthroughs: BackupEntry[]
}

export async function exportAllPlaythroughs(): Promise<number> {
  const [playthroughs, books] = await Promise.all([
    db.playthroughs.toArray(),
    db.books.toArray(),
  ])
  const titleById = new Map(books.map((b) => [b.id, b.title]))
  const payload: BackupFile = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: Date.now(),
    playthroughs: playthroughs.map((p) => ({
      // Se già orfano conserviamo il titolo atteso, altrimenti quello del libro.
      bookTitle: p.orphanBookTitle ?? titleById.get(p.bookId) ?? '',
      name: p.name,
      currentLocation: p.currentLocation,
      actionChart: p.actionChart,
      activeCombat: p.activeCombat,
      warLog: p.warLog,
      updatedAt: p.updatedAt,
    })),
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'lupo-solitario-salvataggi.json'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return payload.playthroughs.length
}

export interface BackupImportResult {
  imported: number // playthrough creati
  linked: number // agganciati a un libro presente
  missingTitles: string[] // titoli non trovati in libreria (playthrough orfani)
}

/**
 * Importa un backup completo. Crea SEMPRE nuovi playthrough (non sovrascrive).
 * Ri-aggancia ogni salvataggio al libro locale per TITOLO; i titoli assenti
 * diventano playthrough orfani (si ri-agganciano al successivo caricamento
 * dell'EPUB con quel titolo).
 */
export async function importAllPlaythroughs(file: File): Promise<BackupImportResult> {
  const text = await file.text()
  const data = JSON.parse(text) as Partial<BackupFile>
  if (data.format !== BACKUP_FORMAT || !Array.isArray(data.playthroughs)) {
    throw new Error('File di backup non valido')
  }

  const books = await db.books.toArray()
  const idByTitle = new Map(books.map((b) => [b.title, b.id]))

  let linked = 0
  const missing = new Set<string>()

  await db.transaction('rw', db.playthroughs, async () => {
    for (const e of data.playthroughs!) {
      const bookId = e.bookTitle ? idByTitle.get(e.bookTitle) : undefined
      const isLinked = bookId != null
      if (isLinked) linked++
      else if (e.bookTitle) missing.add(e.bookTitle)
      await db.playthroughs.add({
        bookId: isLinked ? bookId : -1, // -1 = orfano (nessun libro corrispondente)
        name: e.name || 'Partita',
        currentLocation: e.currentLocation ?? null,
        actionChart: e.actionChart,
        activeCombat: e.activeCombat ?? null,
        warLog: e.warLog ?? [],
        updatedAt: e.updatedAt ?? Date.now(),
        ...(isLinked ? {} : { orphanBookTitle: e.bookTitle }),
      })
    }
  })

  return {
    imported: data.playthroughs.length,
    linked,
    missingTitles: [...missing],
  }
}

/**
 * Ri-aggancia i playthrough orfani il cui orphanBookTitle combacia col titolo
 * appena caricato. Da chiamare dopo aver aggiunto un EPUB alla libreria.
 * Ritorna quanti playthrough sono stati ri-agganciati.
 */
export async function relinkOrphanPlaythroughs(bookId: number, title: string): Promise<number> {
  const orphans = await db.playthroughs.filter((p) => p.orphanBookTitle === title).toArray()
  if (orphans.length === 0) return 0
  await db.transaction('rw', db.playthroughs, async () => {
    for (const p of orphans) {
      if (p.id == null) continue
      const { orphanBookTitle: _drop, ...rest } = p
      void _drop
      await db.playthroughs.put({ ...rest, bookId })
    }
  })
  return orphans.length
}
