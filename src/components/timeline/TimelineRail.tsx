import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { timeline } from '../../content'
import { IconChevronLeft, IconChevronRight } from '../Icons'
import './TimelineRail.css'

interface Props {
  visible: boolean
  activeIndex: number
  onSelect: (index: number) => void
}

/** Year navigator: vertical rail on desktop, swipeable strip at the bottom on phones. */
export function TimelineRail({ visible, activeIndex, onSelect }: Props) {
  const listRef = useRef<HTMLOListElement>(null)

  // Keep the active year centred in the mobile strip (scrolls the strip, never the page).
  useEffect(() => {
    const list = listRef.current
    const item = list?.children[activeIndex] as HTMLElement | undefined
    if (!list || !item || list.scrollWidth <= list.clientWidth) return
    list.scrollTo({ left: item.offsetLeft - list.clientWidth / 2 + item.clientWidth / 2, behavior: 'smooth' })
  }, [activeIndex, visible])

  const last = timeline.length - 1

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          className="rail"
          aria-label="Годы"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <button
            className="rail__step rail__step--prev"
            onClick={() => onSelect(Math.max(0, activeIndex - 1))}
            disabled={activeIndex <= 0}
            aria-label="Предыдущий год"
          >
            <IconChevronLeft />
          </button>
          <ol className="rail__list" ref={listRef}>
            {timeline.map((chapter, i) => (
              <li key={chapter.year}>
                <button
                  className={`rail__item ${i === activeIndex ? 'is-active' : ''} ${i < activeIndex ? 'is-passed' : ''}`}
                  onClick={() => onSelect(i)}
                  aria-current={i === activeIndex ? 'step' : undefined}
                  aria-label={`${chapter.year} — ${chapter.title}`}
                >
                  <span className="rail__year">{chapter.year}</span>
                  <span className="rail__tick" aria-hidden="true" />
                  <span className="rail__tip" aria-hidden="true">
                    {chapter.icon && <span>{chapter.icon}</span>}
                    {chapter.title}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <button
            className="rail__step rail__step--next"
            onClick={() => onSelect(Math.min(last, activeIndex + 1))}
            disabled={activeIndex >= last}
            aria-label="Следующий год"
          >
            <IconChevronRight />
          </button>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}
