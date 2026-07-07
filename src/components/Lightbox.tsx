import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'

// Blocca il pinch-zoom NATIVO solo dentro l'elemento passato (non globalmente,
// così lo zoom di accessibilità nel resto dell'app resta).
//  • iOS Safari: il pinch arriva come eventi `gesture*` → preventDefault.
//  • Chrome (anche DevTools iPhone): il pinch è un `wheel` con ctrlKey → preventDefault.
//  • touchmove con ≥2 dita → preventDefault (il pan a 1 dito continua a scrollare).
function blockPinch(el: HTMLElement): () => void {
  const prevent = (e: Event) => e.preventDefault()
  const onTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 1) e.preventDefault()
  }
  const onWheel = (e: WheelEvent) => {
    if (e.ctrlKey) e.preventDefault()
  }
  const opts = { passive: false } as const
  el.addEventListener('gesturestart', prevent, opts)
  el.addEventListener('gesturechange', prevent, opts)
  el.addEventListener('gestureend', prevent, opts)
  el.addEventListener('touchmove', onTouchMove, opts)
  el.addEventListener('wheel', onWheel, opts)
  return () => {
    el.removeEventListener('gesturestart', prevent)
    el.removeEventListener('gesturechange', prevent)
    el.removeEventListener('gestureend', prevent)
    el.removeEventListener('touchmove', onTouchMove)
    el.removeEventListener('wheel', onWheel)
  }
}

// Lightbox a tutto schermo per le immagini del libro (es. mappe).
// Zoom con i pulsanti +/− o doppio tap; pan tramite scroll nativo quando è
// ingrandita (ottimo su iOS). Chiusura con ✕ o tap sullo sfondo.
export function Lightbox() {
  const src = useStore((s) => s.lightboxSrc)
  const close = useStore((s) => s.closeLightbox)
  const [zoom, setZoom] = useState(1) // 1 = adatta alla larghezza
  const lastTap = useRef(0)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Reset dello zoom ad ogni nuova immagine.
  useEffect(() => {
    setZoom(1)
  }, [src])

  // Blocca il pinch-zoom nativo finché il lightbox è aperto.
  useEffect(() => {
    if (!src) return
    const el = overlayRef.current
    if (!el) return
    return blockPinch(el)
  }, [src])

  if (!src) return null

  const dec = () => setZoom((z) => Math.max(1, +(z - 0.5).toFixed(1)))
  const inc = () => setZoom((z) => Math.min(5, +(z + 0.5).toFixed(1)))
  const toggle = () => setZoom((z) => (z > 1 ? 1 : 2.5))

  const onImgClick = () => {
    const now = Date.now()
    if (now - lastTap.current < 300) toggle() // doppio tap
    lastTap.current = now
  }

  return (
    <div ref={overlayRef} className="pt-safe pb-safe fixed inset-0 z-50 flex flex-col bg-black/95">
      {/* Barra superiore: zoom + chiudi */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            className="touch flex items-center justify-center rounded-lg border border-white/30 bg-white/10 px-4 text-xl text-white active:bg-white/20"
            onClick={dec}
            aria-label="Riduci zoom"
          >
            −
          </button>
          <span className="min-w-12 text-center text-sm text-white/70">{zoom.toFixed(1)}×</span>
          <button
            className="touch flex items-center justify-center rounded-lg border border-white/30 bg-white/10 px-4 text-xl text-white active:bg-white/20"
            onClick={inc}
            aria-label="Aumenta zoom"
          >
            +
          </button>
        </div>
        <button
          className="touch flex items-center justify-center rounded-lg border border-white/30 bg-white/10 px-4 text-xl text-white active:bg-white/20"
          onClick={close}
          aria-label="Chiudi immagine"
        >
          ✕
        </button>
      </div>

      {/* Area immagine: scrollabile quando ingrandita (pan nativo). Tap sullo
          sfondo per chiudere; doppio tap sull'immagine per zoom rapido.
          - margin:auto sull'<img> centra SENZA clippare l'inizio (il bug del
            flex/justify-center che tagliava sinistra e alto quando si sfora).
          - touch-action: pan-x pan-y → consente il pan ma blocca il pinch-zoom. */}
      <div
        className="flex-1 overflow-auto p-2"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          touchAction: 'pan-x pan-y',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close()
        }}
      >
        <img
          src={src}
          alt="Immagine del libro"
          onClick={onImgClick}
          draggable={false}
          style={{
            display: 'block',
            margin: 'auto',
            width: zoom > 1 ? `${zoom * 100}%` : 'auto',
            maxWidth: zoom > 1 ? 'none' : '100%',
            height: 'auto',
            cursor: zoom > 1 ? 'zoom-out' : 'zoom-in',
          }}
        />
      </div>

      <p className="pb-1 text-center text-xs text-white/40">Doppio tap per zoom · trascina per spostarti</p>
    </div>
  )
}
