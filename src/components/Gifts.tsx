import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { gifts, person, type Gift } from '../content'
import { useLightbox } from '../context/LightboxContext'
import { usePreferences } from '../context/PreferencesContext'
import { burst, fireworks, originOf } from '../lib/confetti'
import { readStorage, writeStorage } from '../lib/storage'
import { IconRotate } from './Icons'
import { SectionHead } from './SectionHead'
import './Gifts.css'

const STORAGE_KEY = 'gifts:opened'
const ease = [0.22, 1, 0.36, 1] as const

export function Gifts() {
  const [opened, setOpened] = useState<string[]>(() => readStorage<string[]>(STORAGE_KEY, []))
  const [resetKey, setResetKey] = useState(0)
  const allOpened = gifts.every((g) => opened.includes(g.id))
  const { gifts: copy } = person.sections

  // Ref mirror: gift timers may call markOpened from an older render.
  const openedRef = useRef(opened)

  const markOpened = (id: string) => {
    const prev = openedRef.current
    if (prev.includes(id)) return
    const next = [...prev, id]
    openedRef.current = next
    setOpened(next)
    writeStorage(STORAGE_KEY, next)
    if (gifts.every((g) => next.includes(g.id))) window.setTimeout(() => fireworks(), 900)
  }

  const reset = () => {
    openedRef.current = []
    setOpened([])
    writeStorage(STORAGE_KEY, [])
    setResetKey((k) => k + 1)
  }

  return (
    <section id="gifts" className="section gifts" tabIndex={-1} aria-labelledby="gifts-title">
      <SectionHead id="gifts-title" eyebrow={copy.eyebrow} title={copy.title} description={copy.hint}>
        <div className="gifts__progress" aria-live="polite">
          {gifts.map((g) => (
            <span key={g.id} className={`gifts__pip ${opened.includes(g.id) ? 'is-on' : ''}`} aria-hidden="true" />
          ))}
          <span>
            Открыто {opened.filter((id) => gifts.some((g) => g.id === id)).length} из {gifts.length}
          </span>
        </div>
      </SectionHead>

      <div className="gifts__grid container" key={resetKey}>
        {gifts.map((gift, i) => (
          <GiftItem key={gift.id} gift={gift} index={i} initiallyOpen={opened.includes(gift.id)} onOpened={() => markOpened(gift.id)} />
        ))}
      </div>

      <AnimatePresence>
        {allOpened && (
          <motion.div
            className="gifts__done container"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease }}
          >
            <p>{copy.allOpened}</p>
            <button className="btn btn--ghost btn--small" onClick={reset}>
              <IconRotate width={15} height={15} /> Упаковать заново
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

type Phase = 'closed' | 'opening' | 'open'

function GiftItem({ gift, index, initiallyOpen, onOpened }: { gift: Gift; index: number; initiallyOpen: boolean; onOpened: () => void }) {
  const { reduced } = usePreferences()
  const [phase, setPhase] = useState<Phase>(initiallyOpen ? 'open' : 'closed')
  const boxRef = useRef<HTMLButtonElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const open = () => {
    if (phase !== 'closed') return
    if (reduced) {
      setPhase('open')
      onOpened()
      return
    }
    setPhase('opening')
    timer.current = window.setTimeout(() => {
      setPhase('open')
      burst(originOf(boxRef.current), 1)
      onOpened()
    }, 750)
  }

  // Bring the surprise into view once it has been revealed.
  useEffect(() => {
    if (phase !== 'open' || initiallyOpen) return
    const t = window.setTimeout(() => {
      cardRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' })
    }, 700)
    return () => window.clearTimeout(t)
  }, [phase, initiallyOpen, reduced])

  const isOpen = phase === 'open'

  return (
    <motion.div
      className={`gift gift--${phase}`}
      style={{ '--wrap': gift.wrap, '--ribbon': gift.ribbon } as CSSProperties}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay: index * 0.12, ease }}
    >
      <motion.button
        ref={boxRef}
        className="gift__box"
        onClick={open}
        disabled={phase !== 'closed'}
        aria-label={isOpen ? `${gift.label} — открыт` : `Открыть подарок: ${gift.label}`}
        aria-expanded={isOpen}
        animate={phase === 'opening' ? { rotate: [0, -6, 6, -5, 5, -3, 3, 0], scale: [1, 1.04, 1.04, 1.06, 1.06, 1.08, 1.08, 1] } : { rotate: 0, scale: 1 }}
        transition={{ duration: 0.75, ease: 'easeInOut' }}
      >
        <span className="gift__rays" aria-hidden="true" />
        <motion.span
          className="gift__lid"
          aria-hidden="true"
          animate={isOpen ? { y: -90, x: index % 2 ? 40 : -40, rotate: index % 2 ? 22 : -22, opacity: 0 } : { y: 0, x: 0, rotate: 0, opacity: 1 }}
          transition={{ duration: initiallyOpen ? 0 : 0.8, ease }}
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
      <p className="gift__label">{gift.label}</p>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={cardRef}
            className="gift__reveal"
            initial={initiallyOpen ? false : { opacity: 0, y: -40, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.25, ease }}
          >
            <GiftCard gift={gift} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function GiftCard({ gift }: { gift: Gift }) {
  const { open } = useLightbox()
  const [copied, setCopied] = useState(false)
  const content = gift.content

  if (content.kind === 'letter') {
    return (
      <div className="gift-card gift-card--letter">
        <p className="gift-card__title">{content.title}</p>
        <p className="gift-card__text">{content.text}</p>
        {content.signature && <p className="gift-card__signature">{content.signature}</p>}
      </div>
    )
  }

  if (content.kind === 'coupon') {
    const copy = async () => {
      try {
        await navigator.clipboard.writeText(content.code)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1800)
      } catch {
        /* clipboard blocked — the code is still visible and selectable */
      }
    }
    return (
      <div className="gift-card gift-card--coupon">
        <p className="gift-card__title">{content.title}</p>
        <p className="gift-card__text">{content.text}</p>
        <div className="gift-card__ticket">
          <code>{content.code}</code>
          <button className="btn btn--small" onClick={copy}>
            {copied ? 'Скопировано ✓' : 'Скопировать'}
          </button>
        </div>
        {content.validUntil && <p className="gift-card__fine">{content.validUntil}</p>}
      </div>
    )
  }

  return (
    <div className="gift-card gift-card--photo">
      <button className="gift-card__photo" onClick={() => open([content.photo], 0)} aria-label={`Открыть фото: ${content.photo.alt}`}>
        <img src={content.photo.src} alt={content.photo.alt} style={{ aspectRatio: content.photo.ratio ?? 1.5 }} />
      </button>
      <p className="gift-card__title">{content.title}</p>
      <p className="gift-card__text">{content.text}</p>
    </div>
  )
}
