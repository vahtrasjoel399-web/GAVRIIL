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
