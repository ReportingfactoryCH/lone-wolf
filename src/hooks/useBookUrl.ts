import { useEffect, useState } from 'react'
import { db } from '../db'

// ---------------------------------------------------------------------------
// Legge il blob EPUB da Dexie e lo fornisce a EpubView.
//
// NOTA IMPORTANTE (deviazione motivata dal vincolo #2 della spec):
// La spec suggeriva URL.createObjectURL(blob) → prop `url`. In pratica epub.js
// determina il TIPO di input dall'ESTENSIONE dell'URL: un blob URL
// ("blob:http://…/uuid") non ha estensione → viene classificato come DIRECTORY
// e il libro NON viene mai caricato (nessun fetch dell'archivio). Verificato.
//
// La via corretta che mantiene l'intento (EPUB offline da Dexie, zero rete) è
// passare un ArrayBuffer: epub.js lo riconosce come BINARY e lo decomprime con
// JSZip. Nessun objectURL da revocare per il reader; l'ArrayBuffer viene
// rilasciato (GC) al cambio di libro/unmount. (L'objectURL+revoke resta usato
// per il download dell'export JSON, dove invece è appropriato.)
// ---------------------------------------------------------------------------

export function useBookData(bookId: number | null): {
  data: ArrayBuffer | null
  loading: boolean
  error: string | null
} {
  const [data, setData] = useState<ArrayBuffer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (bookId == null) {
      setData(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)

    db.books
      .get(bookId)
      .then(async (rec) => {
        if (cancelled) return
        if (!rec) {
          setError('Libro non trovato')
          setLoading(false)
          return
        }
        const buf = await rec.blob.arrayBuffer()
        if (cancelled) return
        setData(buf)
        setLoading(false)
      })
      .catch((e) => {
        if (cancelled) return
        setError(String(e))
        setLoading(false)
      })

    return () => {
      cancelled = true
      // Rilascia il riferimento: l'ArrayBuffer diventa eleggibile per il GC.
      setData(null)
    }
  }, [bookId])

  return { data, loading, error }
}
