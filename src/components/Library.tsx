import { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, newPlaythrough, type BookRecord, type Playthrough } from '../db'
import { useStore } from '../store'
import type { PersistState } from '../hooks/usePersistence'

// Schermata iniziale: libreria dei libri salvati in IndexedDB + caricamento EPUB.
export function Library({ persist }: { persist: PersistState }) {
  const books = useLiveQuery(() => db.books.orderBy('addedAt').reverse().toArray(), [], [] as BookRecord[])
  const openReader = useStore((s) => s.openReader)
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const onFile = async (file: File) => {
    setBusy(true)
    try {
      const title = file.name.replace(/\.epub$/i, '')
      // Un File È già un Blob: lo salviamo direttamente.
      await db.books.add({ title, blob: file, addedAt: Date.now() })
    } finally {
      setBusy(false)
    }
  }

  const open = async (bookId: number) => {
    let pt: Playthrough | undefined = await db.playthroughs
      .where('bookId')
      .equals(bookId)
      .reverse()
      .sortBy('updatedAt')
      .then((a) => a[0])
    if (!pt) {
      const existing = await db.playthroughs.where('bookId').equals(bookId).count()
      const id = await db.playthroughs.add(newPlaythrough(bookId, `Partita ${existing + 1}`))
      pt = await db.playthroughs.get(id)
    }
    if (pt?.id != null) await openReader(bookId, pt.id)
  }

  // Nuova partita: azione DISTRUTTIVA → conferma esplicita. Se si procede,
  // i playthrough esistenti di QUESTO libro vengono cancellati e se ne crea uno pulito.
  const startNewGame = async (bookId: number) => {
    const ok = window.confirm(
      'Iniziare una nuova partita?\n\nI salvataggi precedenti di questo libro verranno cancellati. Se vuoi conservarli, esportali prima dal Registro.',
    )
    if (!ok) return
    await db.playthroughs.where('bookId').equals(bookId).delete()
    const id = await db.playthroughs.add(newPlaythrough(bookId, 'Partita 1'))
    await openReader(bookId, id)
  }

  const removeBook = async (bookId: number) => {
    await db.transaction('rw', db.books, db.playthroughs, async () => {
      await db.playthroughs.where('bookId').equals(bookId).delete()
      await db.books.delete(bookId)
    })
  }

  const persistNote =
    persist === 'denied'
      ? 'Storage non persistente: iOS potrebbe cancellare i dati. Esporta i salvataggi dal Registro.'
      : persist === 'granted'
        ? 'Storage persistente concesso.'
        : null

  return (
    <div className="min-h-app flex flex-col pt-safe pb-safe">
      <header className="px-4 pt-4">
        <h1 className="text-2xl font-bold text-[var(--color-gold)]">Lupo Solitario</h1>
        {/* Marcatore di build: cambia a ogni deploy → conferma di non essere in cache. */}
        <p className="font-mono text-[10px] text-[var(--color-gold-dim)]">build {__BUILD_ID__}</p>
        <p className="text-sm text-[var(--color-ink)]/60">Reader offline per gamebook</p>
        {persistNote && <p className="mt-1 text-xs text-[var(--color-gold-dim)]">{persistNote}</p>}
      </header>

      <div className="px-4 py-4">
        <button
          className="touch w-full rounded-xl border border-[var(--color-gold-dim)] bg-[var(--color-panel-2)] px-4 py-3 text-lg font-semibold text-[var(--color-gold)] active:bg-[var(--color-line)] disabled:opacity-50"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
        >
          {busy ? 'Caricamento…' : '＋ Carica EPUB'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".epub,application/epub+zip"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void onFile(f)
            e.target.value = ''
          }}
        />
      </div>

      <div className="scroll-area flex-1 px-4">
        {books.length === 0 && (
          <p className="py-12 text-center text-sm text-[var(--color-ink)]/50">
            Nessun libro. Carica un EPUB (es. i gamebook di Project Aon) per iniziare.
          </p>
        )}
        <ul className="flex flex-col gap-3">
          {books.map((b) => (
            <li
              key={b.id}
              className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--color-line)] bg-[var(--color-panel-2)] text-2xl">
                  📖
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-[var(--color-ink)]">{b.title}</div>
                  <div className="text-xs text-[var(--color-ink)]/40">
                    {new Date(b.addedAt).toLocaleDateString('it-IT')}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  className="touch flex-1 rounded-lg border border-[var(--color-gold-dim)] bg-[var(--color-panel-2)] px-3 font-semibold text-[var(--color-gold)] active:bg-[var(--color-line)]"
                  onClick={() => b.id != null && open(b.id)}
                >
                  Apri
                </button>
                <button
                  className="touch rounded-lg border border-[var(--color-line)] bg-[var(--color-panel-2)] px-3 text-sm active:bg-[var(--color-line)]"
                  onClick={() => b.id != null && startNewGame(b.id)}
                >
                  Nuova partita
                </button>
                <button
                  className="touch rounded-lg border border-[var(--color-line)] bg-[var(--color-panel-2)] px-3 active:bg-[var(--color-line)]"
                  onClick={() => b.id != null && removeBook(b.id)}
                  aria-label="Rimuovi libro"
                >
                  🗑
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
