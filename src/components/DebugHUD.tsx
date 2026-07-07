import { useEffect, useState } from 'react'

// DIAGNOSTICO TEMPORANEO: stampa a schermo le misure reali del dispositivo per
// capire perché in PWA standalone la colonna non arriva al fondo. Da rimuovere.
export function DebugHUD() {
  const [info, setInfo] = useState('…')

  useEffect(() => {
    // Sonde per leggere i valori di env(safe-area-inset-*) misurandone l'altezza.
    const mkProbe = (edge: 'top' | 'bottom') => {
      const el = document.createElement('div')
      el.style.cssText = `position:fixed;${edge}:0;left:0;width:0;height:env(safe-area-inset-${edge});pointer-events:none;`
      document.body.appendChild(el)
      return el
    }
    const pTop = mkProbe('top')
    const pBot = mkProbe('bottom')

    const measure = () => {
      const root = document.getElementById('root')
      const vv = window.visualViewport
      const rootRect = root?.getBoundingClientRect()
      setInfo(
        [
          `build ${__BUILD_ID__}`,
          window.matchMedia('(display-mode: standalone)').matches ? 'STANDALONE' : 'browser',
          `scr ${screen.width}x${screen.height}`,
          `inner ${window.innerWidth}x${window.innerHeight}`,
          `vv ${vv ? `${Math.round(vv.width)}x${Math.round(vv.height)}` : '-'}`,
          `docCH ${document.documentElement.clientHeight}`,
          `rootH ${root?.offsetHeight ?? '-'}`,
          `rootBot ${rootRect ? Math.round(rootRect.bottom) : '-'}`,
          `sat ${pTop.offsetHeight} sab ${pBot.offsetHeight}`,
        ].join(' | '),
      )
    }

    measure()
    const t = setInterval(measure, 1000)
    window.addEventListener('resize', measure)
    window.visualViewport?.addEventListener('resize', measure)
    return () => {
      clearInterval(t)
      window.removeEventListener('resize', measure)
      window.visualViewport?.removeEventListener('resize', measure)
      pTop.remove()
      pBot.remove()
    }
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: 'env(safe-area-inset-top)',
        left: 0,
        right: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.88)',
        color: '#39ff14',
        font: '10px/1.35 ui-monospace, monospace',
        padding: '3px 5px',
        pointerEvents: 'none',
        wordBreak: 'break-word',
      }}
    >
      {info}
    </div>
  )
}
