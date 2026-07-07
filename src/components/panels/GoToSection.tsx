import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Sheet } from '../Sheet'
import { useStore } from '../../store'
import { useT } from '../../i18n/useT'
import { db, type Bookmark } from '../../db'
import { navigateToSection, getSectionIndex, getCurrentCfi, goToCfi } from '../../utils/readerControl'

// Navigazione del libro: per numero di sezione + segnalibri (del libro, condivisi
// tra le partite). Ogni salto viene loggato nel war log.
export function GoToSection({ onClose }: { onClose: () => void }) {
  const t = useT()
  const addWarLog = useStore((s) => s.addWarLog)
  const setPanel = useStore((s) => s.setPanel)
  const bookId = useStore((s) => s.bookId)
  const [n, setN] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [addErr, setAddErr] = useState<string | null>(null)
  const knownCount = Object.keys(getSectionIndex()).length

  // Segnalibri del libro, reattivi.
  const book = useLiveQuery(() => (bookId != null ? db.books.get(bookId) : undefined), [bookId])
  const bookmarks = book?.bookmarks ?? []

  const saveBookmarks = async (next: Bookmark[]) => {
    if (bookId == null) return
    await db.books.update(bookId, { bookmarks: next })
  }

  const go = async () => {
    const num = n.trim()
    if (!num) return
    const ok = await navigateToSection(num)
    if (ok) {
      addWarLog({ type: 'navigation', text: t('goto.logGo', { n: num }), section: num })
      setPanel(null)
    } else {
      setErr(t('goto.notFound', { n: num }))
    }
  }

  const addBookmark = async () => {
    const cfi = getCurrentCfi()
    if (!cfi) {
      setAddErr(t('goto.posUnavailable'))
      return
    }
    const label = draft.trim() || t('goto.bookmarkDefault', { n: bookmarks.length + 1 })
    const bm: Bookmark = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      label,
      cfi,
      createdAt: Date.now(),
    }
    await saveBookmarks([...bookmarks, bm])
    setDraft('')
    setAddErr(null)
  }

  const jumpTo = async (bm: Bookmark) => {
    const ok = await goToCfi(bm.cfi)
    if (ok) {
      addWarLog({ type: 'navigation', text: t('goto.logBookmark', { label: bm.label }), cfi: bm.cfi })
      setPanel(null)
    } else {
      setAddErr(t('goto.readerNotReady'))
    }
  }

  const removeBookmark = (id: string) => void saveBookmarks(bookmarks.filter((b) => b.id !== id))

  return (
    <Sheet title={t('goto.title')} icon="🧭" onClose={onClose}>
      <div className="flex flex-col gap-6">
        {/* --- Vai alla sezione N --- */}
        <section className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-[var(--color-ink)]/80">{t('goto.sectionNumber')}</span>
            <input
              className="touch w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 text-center text-2xl text-[var(--color-ink)]"
              inputMode="numeric"
              pattern="[0-9]*"
              value={n}
              onChange={(e) => {
                setN(e.target.value.replace(/[^0-9]/g, ''))
                setErr(null)
              }}
              onKeyDown={(e) => e.key === 'Enter' && void go()}
              placeholder="es. 217"
            />
          </label>
          <button
            className="touch rounded-xl border border-[var(--color-gold-dim)] bg-[var(--color-panel-2)] px-6 py-3 text-lg font-semibold text-[var(--color-gold)] active:bg-[var(--color-line)]"
            onClick={() => void go()}
          >
            {t('goto.go')}
          </button>
          {err && <p className="text-sm text-[var(--color-blood)]">{err}</p>}
          <p className="text-center text-xs text-[var(--color-ink)]/50">
            {knownCount > 0 ? t('goto.indexed', { n: knownCount }) : t('goto.indexUnavailable')}
          </p>
        </section>

        {/* --- Segnalibri del libro --- */}
        <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 p-3">
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className="font-semibold text-[var(--color-gold)]">📑 {t('goto.bookmarks')}</h3>
            <span className="text-xs text-[var(--color-gold-dim)]">{t('goto.ofBook')}</span>
          </div>

          <ul className="flex flex-col gap-2">
            {bookmarks.map((bm) => (
              <li key={bm.id} className="flex items-center gap-2">
                <button
                  className="touch min-w-0 flex-1 truncate rounded-lg border border-[var(--color-line)] bg-[var(--color-panel-2)] px-3 text-left text-[var(--color-ink)] active:bg-[var(--color-line)]"
                  onClick={() => void jumpTo(bm)}
                >
                  {bm.label}
                </button>
                <button
                  className="touch rounded-lg border border-[var(--color-line)] bg-[var(--color-panel-2)] px-3 active:bg-[var(--color-line)]"
                  onClick={() => removeBookmark(bm.id)}
                  aria-label={t('goto.removeBookmark', { label: bm.label })}
                >
                  🗑
                </button>
              </li>
            ))}
            {bookmarks.length === 0 && (
              <li className="text-sm text-[var(--color-ink)]/50">{t('goto.noBookmarks')}</li>
            )}
          </ul>

          <div className="mt-3 flex items-center gap-2">
            <input
              className="touch w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 text-[var(--color-ink)]"
              value={draft}
              placeholder={t('goto.bookmarkPlaceholder')}
              onChange={(e) => {
                setDraft(e.target.value)
                setAddErr(null)
              }}
              onKeyDown={(e) => e.key === 'Enter' && void addBookmark()}
            />
          </div>
          <button
            className="touch mt-2 w-full rounded-lg border border-[var(--color-gold-dim)] bg-[var(--color-panel-2)] px-4 py-2 font-semibold text-[var(--color-gold)] active:bg-[var(--color-line)]"
            onClick={() => void addBookmark()}
          >
            ＋ {t('goto.addPage')}
          </button>
          {addErr && <p className="mt-2 text-sm text-[var(--color-blood)]">{addErr}</p>}
        </section>
      </div>
    </Sheet>
  )
}
