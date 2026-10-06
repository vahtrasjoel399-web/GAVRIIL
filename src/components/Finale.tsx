import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState, type CSSProperties } from 'react'
import { person } from '../content'
import { burst, fireworks, originOf } from '../lib/confetti'
import { IconRotate } from './Icons'
import { Reveal } from './Reveal'
import './Finale.css'

const ease = [0.22, 1, 0.36, 1] as const

export function Finale() {
  const { finale } = person
  const [lit, setLit] = useState<boolean[]>(() => Array(finale.candles).fill(true))
  const cakeRef = useRef<HTMLDivElement>(null)
  const allOut = lit.every((on) => !on)

  const blow = (index: number) => {
    if (!lit[index]) return
    const next = lit.map((on, i) => (i === index ? false : on))
    setLit(next)
    if (next.every((on) => !on)) {
      burst(originOf(cakeRef.current), 1.4)
      window.setTimeout(() => fireworks(3200), 500)
    }
  }

  const words = finale.title.split(' ')

  return (
    <section id="finale" className="section finale" tabIndex={-1} aria-labelledby="finale-title">
      <div className="finale__inner">
        <Reveal>
          <p className="eyebrow finale__eyebrow">{finale.eyebrow}</p>
        </Reveal>

        <motion.h2
          id="finale-title"
          className="finale__title display"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
        >
          <span className="visually-hidden">{finale.title}</span>
          {words.map((word, wi) => (
            <span key={wi} className="finale__word" aria-hidden="true">
              {Array.from(word).map((ch, ci) => (
                <motion.span
                  key={ci}
                  className="finale__char"
                  variants={{
                    hidden: { opacity: 0, y: '0.6em', rotate: 8 },
                    visible: { opacity: 1, y: '0em', rotate: 0, transition: { duration: 0.8, ease } },
                  }}
                >
                  {ch}
                </motion.span>
              ))}
            </span>
          ))}
        </motion.h2>

        <Reveal delay={0.2}>
          <p className="finale__name display">{person.name}</p>
        </Reveal>
        <Reveal delay={0.3}>
          <p className="finale__message">{finale.message}</p>
        </Reveal>

        <ul className="finale__wishes" aria-label="Пожелания">
          {finale.wishes.map((wish, i) => (
            <motion.li
              key={wish}
              style={{ '--i': i } as CSSProperties}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.08, ease }}
            >
              <span>✦ {wish}</span>
            </motion.li>
          ))}
        </ul>

        <Reveal y={60}>
          <div className={`cake ${allOut ? 'is-out' : ''}`} ref={cakeRef}>
            <div className="cake__candles">
              {lit.map((on, i) => (
                <button
                  key={i}
                  className={`candle ${on ? 'is-lit' : 'is-out'}`}
                  onClick={() => blow(i)}
                  disabled={!on}
                  aria-label={on ? `Задуть свечу ${i + 1}` : `Свеча ${i + 1} задута`}
                  style={{ '--i': i } as CSSProperties}
                >
                  <span className="candle__flame" aria-hidden="true" />
                  <span className="candle__smoke" aria-hidden="true" />
                  <span className="candle__stick" aria-hidden="true" />
                </button>
              ))}
            </div>
            <div className="cake__tier cake__tier--top" aria-hidden="true" />
            <div className="cake__tier cake__tier--bottom" aria-hidden="true" />
            <div className="cake__plate" aria-hidden="true" />
          </div>
        </Reveal>

        <div className="finale__after" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.p
              key={allOut ? 'done' : 'hint'}
              className={allOut ? 'finale__wish' : 'finale__hint'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              {allOut ? finale.afterCandles : finale.cakeHint}
            </motion.p>
          </AnimatePresence>
          <div className="finale__actions">
            {allOut && (
              <button className="btn btn--ghost btn--small" onClick={() => setLit(Array(finale.candles).fill(true))}>
                <IconRotate width={15} height={15} /> {finale.relight}
              </button>
            )}
            <button className="btn btn--small" onClick={(e) => burst(originOf(e.currentTarget), 1.2)}>
              🎉 Ещё конфетти
            </button>
          </div>
        </div>

        <Reveal>
          <p className="finale__signature">{finale.signature}</p>
        </Reveal>
      </div>
    </section>
  )
}
