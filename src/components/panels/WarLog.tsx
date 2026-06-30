import { useRef, useState } from 'react'
import { Sheet } from '../Sheet'
import { useStore } from '../../store'
import type { WarLogEntry } from '../../db'
import { exportPlaythrough, importPlaythrough } from '../../utils/saveExport'

const ICONS: Record<WarLogEntry['type'], string> = {
  navigation: '🧭',
  combat: '⚔️',
  roll: '🎲',
  note: '📝',
}

function fmtTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleString('it-IT', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
}

export function WarLog({ onClose }: { onClose: () => void }) {
  const playthrough = useStore((s) => s.playthrough)
  const addWarLog = useStore((s) => s.addWarLog)
  const [note, setNote] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<string | null>(null)

  if (!playthrough) return null
  const entries = [...playthrough.warLog].reverse() // più recenti in alto

  const addNote = () => {
    const v = note.trim()
    if (!v) return
    addWarLog({ type: 'note', text: v })
    setNote('')
  }

  const onImportFile = async (file: File) => {
    try {
      const res = await importPlaythrough(file)
      setMsg(
        res.bookKnown
          ? 'Salvataggio importato come nuova partita.'
          : 'Importato (libro originale assente: associato a un libro esistente).',
      )
    } catch (e) {
      setMsg(`Import fallito: ${String(e)}`)
    }
  }

  return (
    <Sheet
      title="Registro di guerra"
      icon="📜"
      onClose={onClose}
      footer={
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              className="touch w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 text-[var(--color-ink)]"
              placeholder="Aggiungi una nota…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addNote()}
            />
            <button
              className="touch rounded-lg border border-[var(--color-gold-dim)] bg-[var(--color-panel-2)] px-4 font-semibold text-[var(--color-gold)] active:bg-[var(--color-line)]"
              onClick={addNote}
            >
              Aggiungi
            </button>
          </div>
          <div className="flex gap-2">
            <button
              className="touch flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel-2)] px-3 text-sm active:bg-[var(--color-line)]"
              onClick={() => exportPlaythrough(playthrough)}
            >
              ⬇︎ Esporta salvataggio
            </button>
            <button
              className="touch flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel-2)] px-3 text-sm active:bg-[var(--color-line)]"
              onClick={() => fileRef.current?.click()}
            >
              ⬆︎ Importa salvataggio
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void onImportFile(f)
                e.target.value = ''
              }}
            />
          </div>
          {msg && <p className="text-center text-xs text-[var(--color-gold-dim)]">{msg}</p>}
        </div>
      }
    >
      <ul className="flex flex-col gap-2">
        {entries.length === 0 && (
          <li className="py-8 text-center text-sm text-[var(--color-ink)]/50">Nessun evento ancora.</li>
        )}
        {entries.map((e, i) => (
          <li
            key={i}
            className="flex items-start gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)]/50 px-3 py-2"
          >
            <span aria-hidden>{ICONS[e.type]}</span>
            <div className="flex-1">
              <div className="text-sm text-[var(--color-ink)]">{e.text}</div>
              <div className="text-xs text-[var(--color-ink)]/40">{fmtTime(e.ts)}</div>
            </div>
          </li>
        ))}
      </ul>
    </Sheet>
  )
}
