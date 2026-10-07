import type { CSSProperties, ReactNode } from 'react'
import type { Photo } from '../content'
import './parts.css'

/** A photo glued into the book as a polaroid with a strip of tape. Click → full screen. */
export function Polaroid({
  photo,
  rotate = 0,
  onOpen,
  className = '',
  style,
}: {
  photo: Photo
  rotate?: number
  onOpen?: () => void
  className?: string
  style?: CSSProperties
}) {
  return (
    <button
      type="button"
      className={`polaroid ${className}`}
      style={{ '--r': `${rotate}deg`, ...style } as CSSProperties}
      onClick={onOpen}
      aria-label={`Открыть фото: ${photo.caption ?? photo.alt}`}
    >
      <span className="polaroid__tape" aria-hidden="true" />
      <span className="polaroid__photo" style={{ aspectRatio: photo.ratio ?? 1 }}>
        <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" draggable={false} />
      </span>
      <span className="polaroid__caption">{photo.caption ?? ' '}</span>
    </button>
  )
}

/** Handwritten note on the margin. */
export function MarginNote({
  children,
  color = 'blue',
  rotate = -3,
  className = '',
}: {
  children: ReactNode
  color?: 'blue' | 'red' | 'graphite'
  rotate?: number
  className?: string
}) {
  return (
    <p className={`margin-note margin-note--${color} ${className}`} style={{ '--r': `${rotate}deg` } as CSSProperties}>
      {children}
    </p>
  )
}

/** Small ornament between blocks of text. */
export function Flourish() {
  return (
    <svg className="flourish" viewBox="0 0 120 12" aria-hidden="true">
      <path d="M2 6h44M74 6h44" stroke="currentColor" strokeWidth="1" />
      <path d="M60 1l5 5-5 5-5-5z" fill="currentColor" />
    </svg>
  )
}

/** Old brass key. */
export function KeyArt({ className = '' }: { className?: string }) {
  return (
    <svg className={`key-art ${className}`} viewBox="0 0 240 90" aria-hidden="true">
      <defs>
        <linearGradient id="key-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe9b0" />
          <stop offset="0.45" stopColor="#d6a04a" />
          <stop offset="1" stopColor="#8a5a1e" />
        </linearGradient>
      </defs>
      <circle cx="44" cy="45" r="30" fill="none" stroke="url(#key-gold)" strokeWidth="11" />
      <circle cx="44" cy="45" r="10" fill="none" stroke="url(#key-gold)" strokeWidth="5" />
      <circle cx="44" cy="12" r="5" fill="url(#key-gold)" />
      <circle cx="44" cy="78" r="5" fill="url(#key-gold)" />
      <circle cx="11" cy="45" r="5" fill="url(#key-gold)" />
      <rect x="72" y="38" width="138" height="14" rx="5" fill="url(#key-gold)" />
      <rect x="74" y="30" width="12" height="30" rx="4" fill="url(#key-gold)" />
      <rect x="92" y="33" width="6" height="24" rx="3" fill="url(#key-gold)" />
      <path d="M176 50h14v24h-14zM196 50h12v16h-12z" fill="url(#key-gold)" />
    </svg>
  )
}
