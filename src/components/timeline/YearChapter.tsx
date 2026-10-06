import { motion, useScroll, useTransform } from 'motion/react'
import { useRef, type CSSProperties } from 'react'
import { person, type YearChapter as Chapter } from '../../content'
import { ageLabel, pad2 } from '../../lib/format'
import { chapterId } from '../../lib/sections'
import { Reveal } from '../Reveal'
import { PhotoCollage } from './PhotoCollage'
import { StoryReveal } from './StoryReveal'

const birthYear = Number(person.birthDate.slice(0, 4))

interface Props {
  chapter: Chapter
  index: number
  active: boolean
  passed: boolean
}

export function YearChapter({ chapter, index, active, passed }: Props) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const yearY = useTransform(scrollYProgress, [0, 1], ['25%', '-25%'])
  const id = chapterId(chapter.year)
  const side = index % 2 === 0 ? 'left' : 'right'
  const hasPhotos = !!chapter.photos?.length

  return (
    <article
      id={id}
      ref={ref}
      className={`chapter chapter--${side} ${active ? 'is-active' : ''} ${passed ? 'is-passed' : ''} ${hasPhotos ? '' : 'chapter--text-only'}`}
      style={{ '--chapter-accent': chapter.accent ?? 'var(--gold)' } as CSSProperties}
      tabIndex={-1}
      aria-labelledby={`${id}-title`}
    >
      <span className="chapter__node" aria-hidden="true">
        <span />
      </span>
      <motion.div className="chapter__bigyear display" style={{ y: yearY }} aria-hidden="true">
        {chapter.year}
      </motion.div>

      <div className="chapter__grid">
        <div className="chapter__text">
          <Reveal className="chapter__meta">
            {chapter.icon && (
              <span className="chapter__icon" aria-hidden="true">
                {chapter.icon}
              </span>
            )}
            <span>Глава {pad2(index + 1)}</span>
            <span className="chapter__dot" aria-hidden="true" />
            <span>{ageLabel(birthYear, chapter.year)}</span>
          </Reveal>

          <Reveal delay={0.06}>
            <h3 id={`${id}-title`} className="chapter__title display">
              <span className="chapter__year">{chapter.year}</span>
              {chapter.title}
            </h3>
          </Reveal>

          {chapter.subtitle && (
            <Reveal delay={0.12}>
              <p className="chapter__subtitle">{chapter.subtitle}</p>
            </Reveal>
          )}

          {chapter.milestone && (
            <Reveal delay={0.16}>
              <p className="chapter__milestone">
                <span aria-hidden="true">✦</span> {chapter.milestone.label}
              </p>
            </Reveal>
          )}

          <StoryReveal story={chapter.story} more={chapter.more} />

          {chapter.quote && (
            <Reveal delay={0.1}>
              <blockquote className="chapter__quote">
                <p>«{chapter.quote.text}»</p>
                {chapter.quote.author && <footer>— {chapter.quote.author}</footer>}
              </blockquote>
            </Reveal>
          )}
        </div>

        {hasPhotos && <PhotoCollage photos={chapter.photos!} />}
      </div>
    </article>
  )
}
