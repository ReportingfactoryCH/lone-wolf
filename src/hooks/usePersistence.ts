import { useEffect, useState } from 'react'

// ---------------------------------------------------------------------------
// Richiede a iOS/Safari lo storage PERSISTENTE (riduce il rischio di eviction
// di IndexedDB + Cache Storage). Va chiamato all'avvio. Espone lo stato per
// mostrare un piccolo indicatore in UI.
// ---------------------------------------------------------------------------

export type PersistState = 'unknown' | 'granted' | 'denied' | 'unsupported'

export function usePersistence(): { state: PersistState; estimate: StorageEstimate | null } {
  const [state, setState] = useState<PersistState>('unknown')
  const [estimate, setEstimate] = useState<StorageEstimate | null>(null)

  useEffect(() => {
    let active = true
    async function run() {
      if (!('storage' in navigator) || !navigator.storage?.persist) {
        if (active) setState('unsupported')
        return
      }
      try {
        const already = await navigator.storage.persisted?.()
        const granted = already ? true : await navigator.storage.persist()
        if (active) setState(granted ? 'granted' : 'denied')
        if (navigator.storage.estimate) {
          const est = await navigator.storage.estimate()
          if (active) setEstimate(est)
        }
      } catch {
        if (active) setState('denied')
      }
    }
    void run()
    return () => {
      active = false
    }
  }, [])

  return { state, estimate }
}
