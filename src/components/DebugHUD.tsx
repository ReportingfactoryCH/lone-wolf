import { useEffect, useState } from 'react'

// DIAGNOSTICO TEMPORANEO: misura dove atterra la toolbar rispetto al viewport e
// allo schermo fisico, per capire perché in standalone appare staccata. Da rimuovere.
export function DebugHUD() {
  const [info, setInfo] = useState('…')

  useEffect(() => {
    // Sonda: misura quanto valgono in px le varie unità di viewport, per capire
    // quale copre lo schermo fisico pieno (844) invece del viewport ridotto (797).
    const probe = (unit: string) => {
      const el = document.createElement('div')
      el.style.cssText = `position:fixed;top:0;left:0;width:0;height:100${unit};pointer-events:none;visibility:hidden;`
      document.body.appendChild(el)
      const h = el.offsetHeight
      el.remove()
      return h
    }
    const measure = () => {
      const nav = document.querySelector('nav')
      const navB = nav ? Math.round(nav.getBoundingClientRect().bottom) : -1
      const vv = window.visualViewport
      setInfo(
        [
          `build ${__BUILD_ID__}`,
          window.matchMedia('(display-mode: standalone)').matches ? 'STANDALONE' : 'browser',
          `scrH ${screen.height} innerH ${window.innerHeight}`,
          `navBottom ${navB} gap ${window.innerHeight - navB}`,
          `vh ${probe('vh')} lvh ${probe('lvh')} svh ${probe('svh')} dvh ${probe('dvh')}`,
        ].join(' | '),
      )
    }
    measure()
    const t = setInterval(measure, 800)
    window.addEventListener('resize', measure)
    window.visualViewport?.addEventListener('resize', measure)
    window.visualViewport?.addEventListener('scroll', measure)
    return () => {
      clearInterval(t)
      window.removeEventListener('resize', measure)
      window.visualViewport?.removeEventListener('resize', measure)
      window.visualViewport?.removeEventListener('scroll', measure)
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
