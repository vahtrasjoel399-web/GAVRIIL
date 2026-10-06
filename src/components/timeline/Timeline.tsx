import { motion, useScroll, useSpring } from 'motion/react'
import { useRef } from 'react'
import { person, timeline } from '../../content'
import { SectionHead } from '../SectionHead'
import { YearChapter } from './YearChapter'
import './Timeline.css'

export function Timeline({ activeIndex }: { activeIndex: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start center', 'end center'] })
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 28, restDelta: 0.001 })

  return (
    <section id="timeline" className="section timeline" tabIndex={-1} aria-labelledby="timeline-title">
      <SectionHead id="timeline-title" eyebrow={person.sections.timeline.eyebrow} title={person.sections.timeline.title} />
      <div className="timeline__body" ref={ref}>
        <div className="timeline__spine" aria-hidden="true">
          <motion.div className="timeline__spine-fill" style={{ scaleY: fill }} />
        </div>
        <ol className="timeline__list">
          {timeline.map((chapter, i) => (
            <li key={chapter.year}>
              <YearChapter chapter={chapter} index={i} active={i === activeIndex} passed={i < activeIndex} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
