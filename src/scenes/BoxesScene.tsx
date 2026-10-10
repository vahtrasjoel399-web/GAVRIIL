import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { boxes, lock } from '../content'
import { usePreferences } from '../context/PreferencesContext'
import { useSfx } from '../context/SfxContext'
import { burst, originOf } from '../lib/confetti'
import './BoxesScene.css'

const ease = [0.22, 1, 0.36, 1] as const
type Phase = 'closed' | 'opening' | 'open'

/** How long an open box stays before we dive into the next one: time to read the note. */
const READ_MS = 2200

/** Each next box is drawn a bit smaller. */
const scaleFor = (level: number) => 1 - (level / Math.max(1, boxes.items.length - 1)) * 0.3

/** Rendered in Blender: scripts/blender/render_assets.py → public/media/3d. */
const art = (level: number, part: 'closed' | 'body' | 'lid') => `/media/3d/box-${level + 1}-${part}.webp`

/**
 * Part 1: a box on the desk. One click opens it: a note drops out, a smaller box rises
 * from inside, and a moment later we dive into it by ourselves. The last one holds the
 * locked book, which then opens the lock scene. Clicking the inner box skips the wait.
 */
export function BoxesScene({ onBook }: { onBook: () => void }) {
  const { reduced } = usePreferences()
  const sfx = useSfx()
  const [level, setLevel] = useState(0)
  const [phase, setPhase] = useState<Phase>('closed')
  const [leaving, setLeaving] = useState(false)
  const boxRef = useRef<HTMLButtonElement>(null)
  const timer = useRef(0)
  /** The open box is moving on (by itself or by a click) — ignore further clicks. */
  const moving = useRef(false)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  useEffect(() => preloadBoxArt(), [])

  const total = boxes.items.length
  const item = boxes.items[level]
  const isLast = level === total - 1

  const open = () => {
    if (phase !== 'closed') return
    moving.current = false
    const reveal = () => {
      setPhase('open')
      sfx.play('pop')
      burst(originOf(boxRef.current), 0.8)
      timer.current = window.setTimeout(advance, reduced ? 1400 : READ_MS)
    }
    if (reduced) return reveal()
    setPhase('opening')
    timer.current = window.setTimeout(reveal, 700)
  }

  const advance = () => {
    if (moving.current) return
    moving.current = true
    window.clearTimeout(timer.current)
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

              <AnimatePresence>
                {phase === 'open' && (
                  <motion.div
                    className={`nest__inner ${isLast ? 'nest__inner--book' : ''}`}
                    // the opening of the rendered box sits a little right of the picture centre
                    style={{ left: `calc(50% + ${(isLast ? 2 : 15) * scaleFor(level)}cqw)` }}
                    initial={{ y: '70%', opacity: 0 }}
                    animate={
                      leaving
                        ? { y: '30%', scale: 1.9, opacity: 0, rotate: 0 }
                        : { y: '0%', opacity: 1, rotate: isLast ? -4 : 0, scale: 1 }
                    }
                    transition={{ duration: leaving ? 0.7 : 0.9, delay: leaving ? 0 : 0.2, ease }}
                  >
                    {isLast ? (
                      <button type="button" className="nest__peek" onClick={advance} aria-label={`Открыть книгу «${lock.bookTitle}»`}>
                        <img className="nest__book" src="/media/3d/book-standing.webp" alt="" draggable={false} />
                        <img className="nest__key" src="/media/3d/key.webp" alt="" draggable={false} />
                      </button>
                    ) : (
                      <button type="button" className="nest__peek" onClick={advance} aria-label="Открыть коробку поменьше">
                        <img className="nest__peek-box" src={art(level + 1, 'closed')} alt="" draggable={false} />
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                ref={boxRef}
                type="button"
                className="nest__box"
                onClick={phase === 'open' ? advance : open}
                disabled={phase === 'opening' || leaving}
                aria-label={phase === 'closed' ? `Открыть коробку ${level + 1}` : 'Дальше'}
                animate={
                  phase === 'opening'
                    ? { rotate: [0, -7, 7, -6, 6, -3, 3, 0], scale: [1, 1.04, 1.04, 1.07, 1.07, 1.1, 1.1, 1] }
                    : { rotate: 0, scale: 1 }
                }
                transition={{ duration: 0.7, ease: 'easeInOut' }}
              >
                <BoxArt level={level} scale={scaleFor(level)} phase={phase} />
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

/** A rendered gift box. Closed: one picture; open: the body stays, the lid flies off. */
function BoxArt({ level, scale, phase }: { level: number; scale: number; phase: Phase }) {
  const open = phase === 'open'
  return (
    <span className={`gift3d gift3d--${phase}`} style={{ '--s': scale } as CSSProperties}>
      {open ? (
        <>
          <img className="gift3d__img" src={art(level, 'body')} alt="" draggable={false} />
          <motion.img
            className="gift3d__img gift3d__lid"
            src={art(level, 'lid')}
            alt=""
            draggable={false}
            initial={{ y: '0%', x: '0%', rotate: 0, opacity: 1 }}
            animate={{ y: '-62%', x: '26%', rotate: 22, opacity: 0 }}
            transition={{ duration: 0.9, ease }}
          />
        </>
      ) : (
        <img className="gift3d__img" src={art(level, 'closed')} alt="" draggable={false} />
      )}
    </span>
  )
}

/** Warm the browser cache so every box and the book appear instantly. */
export function preloadBoxArt() {
  const urls = boxes.items.flatMap((_, i) => [art(i, 'closed'), art(i, 'body'), art(i, 'lid')])
  urls.push('/media/3d/book-standing.webp', '/media/3d/key.webp', '/media/3d/cover-front.webp')
  urls.push('/media/3d/padlock-closed.webp', '/media/3d/padlock-key.webp', '/media/3d/padlock-open.webp')
  for (const src of urls) {
    const img = new Image()
    img.src = src
  }
}
