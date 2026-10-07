import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { KeyArt, MiniBook } from '../book/parts'
import { boxes, lock, type GiftBox } from '../content'
import { usePreferences } from '../context/PreferencesContext'
import { useSfx } from '../context/SfxContext'
import { burst, originOf } from '../lib/confetti'
import './BoxesScene.css'

const ease = [0.22, 1, 0.36, 1] as const
type Phase = 'closed' | 'opening' | 'open'

/** Each next box is drawn a bit smaller. */
const scaleFor = (level: number) => 1 - (level / Math.max(1, boxes.items.length - 1)) * 0.3

/**
 * Part 1: a box on the desk. Opening it drops a note, and a smaller box rises
 * from inside. "Next" dives into that box. The last one holds the locked book.
 */
export function BoxesScene({ onBook }: { onBook: () => void }) {
  const { reduced } = usePreferences()
  const sfx = useSfx()
  const [level, setLevel] = useState(0)
  const [phase, setPhase] = useState<Phase>('closed')
  const [leaving, setLeaving] = useState(false)
  const boxRef = useRef<HTMLButtonElement>(null)
  const timer = useRef(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const total = boxes.items.length
  const item = boxes.items[level]
  const next = boxes.items[level + 1]
  const isLast = level === total - 1

  const open = () => {
    if (phase !== 'closed') return
    const reveal = () => {
      setPhase('open')
      sfx.play('pop')
      burst(originOf(boxRef.current), 0.8)
    }
    if (reduced) return reveal()
    setPhase('opening')
    timer.current = window.setTimeout(reveal, 700)
  }

  const advance = () => {
    if (phase !== 'open' || leaving) return
    if (isLast) {
      // The book comes out of the box towards the viewer, then the lock scene takes over.
      setLeaving(true)
      sfx.play('flip')
      timer.current = window.setTimeout(onBook, reduced ? 100 : 750)
      return
    }
    sfx.play('flip')
    setLevel((l) => l + 1)
    setPhase('closed')
  }

  return (
    <div className="scene scene--boxes">
      <div className="nest">
        <header className="nest__head">
          <p className="nest__dedication">{boxes.header.dedication}</p>
          <p className="nest__rule">{boxes.header.rule}</p>
        </header>

        <p className="nest__counter" aria-live="polite">
          коробка {level + 1} из {total}
        </p>

        <div className="nest__stage">
          <AnimatePresence initial={false}>
            <motion.div
              key={level}
              className="box-stage"
              // Diving into the box: the old one flies past the viewer, the inner one grows into place.
              initial={reduced ? { opacity: 0 } : { scale: 0.42, y: '-24%', opacity: 0 }}
              animate={{ scale: 1, y: '0%', opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { scale: 2.6, opacity: 0, transition: { duration: 0.45, ease: [0.6, 0, 0.8, 0.4] } }}
              transition={{ duration: 0.85, ease, delay: reduced ? 0 : 0.3 }}
            >
              <span
                className={`stage-rays ${phase === 'closed' ? '' : 'is-on'}`}
                style={{ '--ribbon': item.ribbon } as CSSProperties}
                aria-hidden="true"
              />
              <span className="box-stage__shadow" aria-hidden="true" />

              <AnimatePresence>
                {phase === 'open' && (
                  <motion.div
                    className={`nest__inner ${isLast ? 'nest__inner--book' : ''}`}
                    initial={{ y: '70%', opacity: 0 }}
                    animate={
                      leaving
                        ? { y: '30%', scale: 1.9, opacity: 0, rotate: 0 }
                        : { y: '0%', opacity: 1, rotate: isLast ? -4 : 0, scale: 1 }
                    }
                    transition={{ duration: leaving ? 0.7 : 0.9, delay: leaving ? 0 : 0.2, ease }}
                  >
                    {isLast ? (
                      <button type="button" className="nest__peek" onClick={advance} aria-label="Открыть книгу">
                        <MiniBook title={lock.bookTitle} />
                        <span className="nest__key" aria-hidden="true">
                          <KeyArt />
                        </span>
                      </button>
                    ) : (
                      <button type="button" className="nest__peek" onClick={advance} aria-label="Открыть коробку поменьше">
                        <BoxArt item={next} scale={0.5} phase="closed" />
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                ref={boxRef}
                type="button"
                className="nest__box"
                onClick={open}
                disabled={phase !== 'closed'}
                aria-label={phase === 'closed' ? `Открыть коробку ${level + 1}` : 'Коробка открыта'}
                animate={
                  phase === 'opening'
                    ? { rotate: [0, -7, 7, -6, 6, -3, 3, 0], scale: [1, 1.04, 1.04, 1.07, 1.07, 1.1, 1.1, 1] }
                    : { rotate: 0, scale: 1 }
                }
                transition={{ duration: 0.7, ease: 'easeInOut' }}
              >
                <BoxArt item={item} scale={scaleFor(level)} phase={phase} />
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="nest__bottom">
          <AnimatePresence mode="wait">
            {phase === 'open' ? (
              <motion.div
                key={`note-${level}`}
                className="boxnote"
                initial={{ opacity: 0, y: 30, rotate: 4 }}
                animate={{ opacity: 1, y: 0, rotate: -1.5 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.3, ease }}
              >
                <span className="boxnote__tape" aria-hidden="true" />
                <p className="boxnote__text">{item.note}</p>
                <button type="button" className="ink-btn" onClick={advance}>
                  {item.button}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={`caption-${level}`}
                className="nest__caption-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.4, delay: level === 0 ? 0 : 0.6 }}
              >
                <p className="nest__caption">{item.caption}</p>
                {phase === 'closed' && <p className="nest__hint">{boxes.hint}</p>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

/** A wrapped gift box: body, lid with bow, light rays when open. */
function BoxArt({ item, scale, phase }: { item: GiftBox; scale: number; phase: Phase }) {
  const open = phase === 'open'
  return (
    <span className={`gift gift--${phase}`} style={{ '--wrap': item.wrap, '--ribbon': item.ribbon, '--s': scale } as CSSProperties}>
      <motion.span
        className="gift__lid"
        aria-hidden="true"
        initial={false}
        animate={open ? { y: '-170%', x: '35%', rotate: 26, opacity: 0 } : { y: 0, x: 0, rotate: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease }}
      >
        <span className="gift__lid-inner">
          <span className="gift__bow">
            <i />
            <i />
          </span>
        </span>
      </motion.span>
      <span className="gift__body" aria-hidden="true" />
    </span>
  )
}
