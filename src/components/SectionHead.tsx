import type { ReactNode } from 'react'
import { Reveal } from './Reveal'

interface SectionHeadProps {
  id: string
  eyebrow: string
  title: string
  description?: string
  children?: ReactNode
}

export function SectionHead({ id, eyebrow, title, description, children }: SectionHeadProps) {
  return (
    <header className="section-head">
      <Reveal>
        <p className="eyebrow">{eyebrow}</p>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 id={id}>{title}</h2>
      </Reveal>
      {description && (
        <Reveal delay={0.16}>
          <p>{description}</p>
        </Reveal>
      )}
      {children}
    </header>
  )
}
