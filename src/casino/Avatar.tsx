import type { CSSProperties } from 'react'
import type { Contender } from '../content'

/** A contender's photo, or a coloured circle with her initial when there is no photo. */
export function Avatar({ contender, className }: { contender: Contender; className: string }) {
  if (contender.photo) return <img className={className} src={contender.photo} alt="" />
  // FNV-1a hash of the id → one of 12 well-separated hues.
  const hash = [...contender.id].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0, 2166136261)
  const hue = (hash % 12) * 30
  return (
    <span className={`${className} avatar`} style={{ '--hue': hue } as CSSProperties} aria-hidden="true">
      {contender.name.trim().charAt(0).toUpperCase()}
    </span>
  )
}
