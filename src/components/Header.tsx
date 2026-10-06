import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'motion/react'
import { useState } from 'react'
import { person, timeline } from '../content'
import { pad2 } from '../lib/format'
import { IconMenu, IconSparkle } from './Icons'
import { MusicButton } from './MusicButton'
import { Odometer } from './Odometer'
import './Header.css'

interface HeaderProps {
  chapterIndex: number
  onHome: () => void
  onOpenMenu: () => void
}

export function Header({ chapterIndex, onHome, onOpenMenu }: HeaderProps) {
  const chapter = timeline[chapterIndex]
  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 })
  const [scrolled, setScrolled] = useState(false)
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 40))

  return (
    <header className={`hud ${scrolled ? 'is-scrolled' : ''}`}>
      <motion.div className="hud__progress" style={{ scaleX: progress }} aria-hidden="true" />
      <button className="hud__brand" onClick={onHome} aria-label={`${person.name} — в начало`}>
        <IconSparkle />
        <span>{person.name}</span>
      </button>

      <AnimatePresence>
        {chapter && (
          <motion.div
            className="hud__chapter"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <span className="hud__chapter-label">
              Глава {pad2(chapterIndex + 1)} <span>/ {pad2(timeline.length)}</span>
            </span>
            <Odometer value={chapter.year} className="hud__year" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hud__actions">
        <MusicButton />
        <button className="icon-btn" onClick={onOpenMenu} aria-label="Открыть меню" aria-haspopup="dialog">
          <IconMenu />
        </button>
      </div>
    </header>
  )
}
