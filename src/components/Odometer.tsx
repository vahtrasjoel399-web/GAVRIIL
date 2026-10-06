import type { CSSProperties } from 'react'
import './Odometer.css'

const DIGITS = '0123456789'.split('')

/** Rolling-digit number. Each column slides to its digit; columns are slightly staggered. */
export function Odometer({ value, className }: { value: number | string; className?: string }) {
  const chars = String(value).split('')
  return (
    <span className={`odometer ${className ?? ''}`} role="img" aria-label={String(value)}>
      {chars.map((ch, i) =>
        /\d/.test(ch) ? (
          <span className="odometer__col" key={chars.length - i} aria-hidden="true">
            <span
              className="odometer__strip"
              style={{ transform: `translateY(-${Number(ch) * 10}%)`, '--i': i } as CSSProperties}
            >
              {DIGITS.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </span>
          </span>
        ) : (
          <span key={chars.length - i} aria-hidden="true">
            {ch}
          </span>
        ),
      )}
    </span>
  )
}
