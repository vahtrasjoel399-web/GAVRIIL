import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Book, type BookHandle, type BookSpread } from '../book/Book'
import { KeyArt, MarginNote } from '../book/parts'
import { boxes, type GiftBox } from '../content'
import { usePreferences } from '../context/PreferencesContext'
import { useSfx } from '../context/SfxContext'
import { burst, originOf } from '../lib/confetti'
import './BoxesScene.css'

const ease = [0.22, 1, 0.36, 1] as const

/** Part 1: a book of boxes, each one smaller. The last box holds the key. */
export function BoxesScene({ onKey }: { onKey: () => void }) {
  const book = useRef<BookHandle>(null)
  const [opened, setOpened] = useState<boolean[]>(() => boxes.items.map(() => false))
  const last = boxes.items.length - 1

  const spreads: BookSpread[] = boxes.items.map((item, i) => ({
    id: `box-${i}`,
    left: i === 0 ? <TitlePage /> : <AsidePage index={i} text={item.aside} />,
    right: (
      <BoxPage
        item={item}
        index={i}
        total={boxes.items.length}
        opened={opened[i]}
        isLast={i === last}
        onOpened={() => setOpened((prev) => prev.map((v, j) => (j === i ? true : v)))}
        onNext={() => (i === last ? onKey() : book.current?.next())}
      />
    ),
    mobile: 'right',
    unnumbered: true,
    // The note's button turns the page; the last page is left through the key.
    lockForward: !opened[i] || i === last,
  }))

  return (
    <div className="scene scene--boxes">
      <Book spreads={spreads} label="Книга подарков" ref={book} cover="cloth" />
    </div>
  )
}

function TitlePage() {
  return (
    <div className="boxes-title">
      <p className="boxes-title__small">{boxes.titlePage.dedication}</p>
      <h1 className="boxes-title__title">{boxes.titlePage.title}</h1>
      <MarginNote color="red" rotate={-4}>
        {boxes.titlePage.rule}
      </MarginNote>
      <svg className="boxes-title__arrow" viewBox="0 0 120 60" aria-hidden="true">
        <path d="M4 40c30-30 70-34 104-10" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M96 18l13 12-17 4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

function AsidePage({ index, text }: { index: number; text?: string }) {
  return (
    <div className="boxes-aside">
      <p className="boxes-aside__num">№{index + 1}</p>
      {text && (
        <MarginNote color="blue" rotate={-2}>
          {text}
        </MarginNote>
      )}
    </div>
  )
}

interface BoxPageProps {
  item: GiftBox
  index: number
  total: number
  opened: boolean
  isLast: boolean
  onOpened: () => void
  onNext: () => void
}

function BoxPage({ item, index, total, opened, isLast, onOpened, onNext }: BoxPageProps) {
  const { reduced } = usePreferences()
  const sfx = useSfx()
  const [phase, setPhase] = useState<'closed' | 'opening' | 'open'>(opened ? 'open' : 'closed')
  const boxRef = useRef<HTMLButtonElement>(null)
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const open = () => {
    if (phase !== 'closed') return
    if (reduced) {
      setPhase('open')
      sfx.play('pop')
      onOpened()
      return
    }
    setPhase('opening')
    timer.current = window.setTimeout(() => {
      setPhase('open')
      sfx.play('pop')
      burst(originOf(boxRef.current), 0.7)
      onOpened()
    }, 700)
  }

  const scale = 1 - (index / Math.max(1, total - 1)) * 0.42
  const isOpen = phase === 'open'

  return (
    <div className="boxpage">
      <p className="boxpage__counter">
        коробка {index + 1} из {total}
      </p>

      <div className="boxpage__stage">
        <AnimatePresence>
          {isOpen && isLast && (
            <motion.div
              className="boxpage__key"
              initial={{ opacity: 0, y: 40, rotate: -30, scale: 0.6 }}
              animate={{ opacity: 1, y: 0, rotate: -12, scale: 1 }}
              transition={{ duration: 1, delay: 0.15, ease }}
            >
              <KeyArt />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          ref={boxRef}
          type="button"
          className={`gift gift--${phase}`}
          style={{ '--wrap': item.wrap, '--ribbon': item.ribbon, '--s': scale } as CSSProperties}
          onClick={open}
          disabled={phase !== 'closed'}
          aria-label={isOpen ? 'Коробка открыта' : `Открыть коробку ${index + 1}`}
          animate={
            phase === 'opening'
              ? { rotate: [0, -7, 7, -6, 6, -3, 3, 0], scale: [1, 1.04, 1.04, 1.07, 1.07, 1.1, 1.1, 1] }
              : { rotate: 0, scale: 1 }
          }
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        >
          <span className="gift__rays" aria-hidden="true" />
          <motion.span
            className="gift__lid"
            aria-hidden="true"
            initial={false}
            animate={isOpen ? { y: '-160%', x: '30%', rotate: 24, opacity: 0 } : { y: 0, x: 0, rotate: 0, opacity: 1 }}
            transition={{ duration: opened && phase === 'open' ? 0 : 0.8, ease }}
          >
            <span className="gift__lid-inner">
              <span className="gift__bow">
                <i />
                <i />
              </span>
            </span>
          </motion.span>
          <span className="gift__body" aria-hidden="true" />
        </motion.button>
      </div>

      <div className="boxpage__bottom">
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.div
              key="note"
              className="boxnote"
              initial={{ opacity: 0, y: 30, rotate: 3 }}
              animate={{ opacity: 1, y: 0, rotate: -1.5 }}
              transition={{ duration: 0.7, delay: 0.25, ease }}
            >
              <span className="boxnote__tape" aria-hidden="true" />
              <p className="boxnote__text">{item.note}</p>
              <button type="button" className="ink-btn" onClick={onNext}>
                {item.button}
              </button>
            </motion.div>
          ) : (
            <motion.p key="caption" className="boxpage__caption" exit={{ opacity: 0, y: 10 }}>
              {item.caption}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
