import { db, type Playthrough, type Bookmark } from '../db'

// ---------------------------------------------------------------------------
// Export/Import JSON dei salvataggi — rete di sicurezza contro l'eviction iOS.
// Esportiamo lo stato di gioco (Action Chart, war log, combattimento, location,
// note libere) più i SEGNALIBRI del libro (che vivono sul BookRecord).
// NON includiamo il blob EPUB: è pesante e l'utente lo ricarica dalla libreria.
// ---------------------------------------------------------------------------

const FORMAT = 'lupo-solitario-save'
const VERSION = 2 // v2: + notes del playthrough, + bookmarks del libro

interface SaveFile {
  format: typeof FORMAT
  version: number
  exportedAt: number
  bookTitle?: string
  playthrough: Omit<Playthrough, 'id'>
  // Segnalibri del LIBRO al momento dell'export (assente nei file v1).
  bookmarks?: Bookmark[]
}

/**
 * Unione di segnalibri esistenti + importati, senza duplicati: un segnalibro
 * incoming è scartato se esiste già lo stesso id oppure la stessa coppia
 * cfi+label (re-import dello stesso file → nessun doppione).
 */
function mergeBookmarks(existing: Bookmark[] | undefined, incoming: Bookmark[] | undefined): Bookmark[] {
  const cur = existing ?? []
  const seenId = new Set(cur.map((b) => b.id))
  const seenPos = new Set(cur.map((b) => `${b.cfi}|${b.label}`))
  const merged = [...cur]
  for (const b of incoming ?? []) {
    if (!b || typeof b.cfi !== 'string' || !b.cfi) continue
    const pos = `${b.cfi}|${b.label}`
    if (seenId.has(b.id) || seenPos.has(pos)) continue
    merged.push(b)
    seenId.add(b.id)
    seenPos.add(pos)
  }
  return merged
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
      notes: p.notes ?? '',
      updatedAt: p.updatedAt,
    },
    bookmarks: book?.bookmarks ?? [],
  }
  const safeName = (p.name || 'partita').replace(/[^\w.-]+/g, '_')
  if (saveViaAndroid(`${safeName}.lupo.json`, payload)) return
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
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
    notes: pt.notes ?? '',
    updatedAt: Date.now(),
  })

  // Segnalibri: si ri-applicano SOLO se il libro originale è presente
  // (agganciare i segnalibri di un altro libro al fallback sarebbe sbagliato).
  if (bookKnown && data.bookmarks?.length) {
    const book = await db.books.get(bookId)
    if (book) await db.books.update(bookId, { bookmarks: mergeBookmarks(book.bookmarks, data.bookmarks) })
  }

  return { newPlaythroughId: id, bookId, bookKnown }
}

// ---------------------------------------------------------------------------
// Backup COMPLETO — tutti i playthrough di tutti i libri (+ i segnalibri di
// ogni libro), in un solo file. NON include gli EPUB (pesanti, ricaricabili
// dalla libreria).
//
// Il bookId numerico è un auto-increment LOCALE di IndexedDB: non è portabile
// tra dispositivi / reinstallazioni. Perciò salviamo il TITOLO del libro e, al
// reimport, ri-agganciamo per titolo al libro presente in libreria. Se il libro
// non c'è, il playthrough resta "orfano" (orphanBookTitle) e si ri-aggancia da
// solo appena quell'EPUB viene caricato (vedi relinkOrphanPlaythroughs).
// ---------------------------------------------------------------------------

const BACKUP_FORMAT = 'lupo-solitario-backup'
const BACKUP_VERSION = 2 // v2: + notes dei playthrough, + books[] coi segnalibri

interface BackupEntry {
  bookTitle: string // chiave di ri-aggancio (il bookId numerico non è portabile)
  name: string
  currentLocation: string | null
  actionChart: Playthrough['actionChart']
  activeCombat: Playthrough['activeCombat']
  warLog: Playthrough['warLog']
  notes?: string
  updatedAt: number
}

// Segnalibri per libro (sono del BookRecord, non del playthrough): stessa
// chiave di ri-aggancio per titolo. Assente nei backup v1.
interface BackupBookEntry {
  title: string
  bookmarks: Bookmark[]
}

interface BackupFile {
  format: typeof BACKUP_FORMAT
  version: number
  exportedAt: number
  playthroughs: BackupEntry[]
  books?: BackupBookEntry[]
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
      notes: p.notes ?? '',
      updatedAt: p.updatedAt,
    })),
    books: books
      .filter((b) => (b.bookmarks?.length ?? 0) > 0)
      .map((b) => ({ title: b.title, bookmarks: b.bookmarks! })),
  }
  if (saveViaAndroid('spielbuch-spielstaende.json', payload)) return payload.playthroughs.length
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

  await db.transaction('rw', db.playthroughs, db.books, db.pendingBookmarks, async () => {
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
        notes: e.notes ?? '',
        updatedAt: e.updatedAt ?? Date.now(),
        ...(isLinked ? {} : { orphanBookTitle: e.bookTitle }),
      })
    }

    // Segnalibri per libro: merge nel libro presente, altrimenti "parcheggio"
    // in pendingBookmarks (applicati appena l'EPUB con quel titolo viene caricato).
    for (const be of data.books ?? []) {
      if (!be?.title || !Array.isArray(be.bookmarks) || be.bookmarks.length === 0) continue
      const bookId = idByTitle.get(be.title)
      if (bookId != null) {
        const book = await db.books.get(bookId)
        if (book) await db.books.update(bookId, { bookmarks: mergeBookmarks(book.bookmarks, be.bookmarks) })
      } else {
        const pending = await db.pendingBookmarks.get(be.title)
        await db.pendingBookmarks.put({
          title: be.title,
          bookmarks: mergeBookmarks(pending?.bookmarks, be.bookmarks),
        })
        missing.add(be.title)
      }
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

/**
 * Applica al libro appena caricato i segnalibri rimasti "parcheggiati" da un
 * import di backup (il libro non era ancora in libreria). Da chiamare dopo
 * aver aggiunto un EPUB, insieme a relinkOrphanPlaythroughs.
 * Ritorna quanti segnalibri sono stati applicati.
 */
export async function applyPendingBookmarks(bookId: number, title: string): Promise<number> {
  const pending = await db.pendingBookmarks.get(title)
  if (!pending?.bookmarks?.length) return 0
  await db.transaction('rw', db.books, db.pendingBookmarks, async () => {
    const book = await db.books.get(bookId)
    if (book) await db.books.update(bookId, { bookmarks: mergeBookmarks(book.bookmarks, pending.bookmarks) })
    await db.pendingBookmarks.delete(title)
  })
  return pending.bookmarks.length
}

// Android-App (WebView): Downloads über blob-URLs funktionieren dort nicht.
// Die App stellt deshalb window.SpielbuchAndroid.saveFile bereit, das den
// Android-Dialog "Speichern unter" öffnet. Im Browser bleibt alles wie bisher.
function saveViaAndroid(fileName: string, payload: unknown): boolean {
  const bridge = (window as unknown as { SpielbuchAndroid?: { saveFile: (n: string, c: string) => void } })
    .SpielbuchAndroid
  if (!bridge) return false
  bridge.saveFile(fileName, JSON.stringify(payload, null, 2))
  return true
}
