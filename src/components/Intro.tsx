import { motion, useScroll, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { person } from '../content'
import { usePreferences } from '../context/PreferencesContext'
import { formatDate } from '../lib/format'
import { IconPlay } from './Icons'
import { Odometer } from './Odometer'
import './Intro.css'

const birthYear = person.birthDate.slice(0, 4)
// Every digit starts five steps away so all columns visibly roll into place.
const scrambled = birthYear.replace(/\d/g, (d) => String((Number(d) + 5) % 10))
const ease = [0.22, 1, 0.36, 1] as const

export function Intro({ onStart }: { onStart: (withMusic: boolean) => void }) {
  const { reduced } = usePreferences()
  const ref = useRef<HTMLElement>(null)
  const [year, setYear] = useState(reduced ? birthYear : scrambled)

  useEffect(() => {
    const t = window.setTimeout(() => setYear(birthYear), reduced ? 0 : 450)
    return () => window.clearTimeout(t)
  }, [reduced])

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, -140])
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94])

  const letters = Array.from(person.name)

  return (
    <section id="start" ref={ref} className="intro" tabIndex={-1} aria-labelledby="intro-title">
      <motion.div className="intro__inner" style={{ y, opacity, scale }}>
        <motion.p
          className="eyebrow intro__eyebrow"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease }}
        >
          {person.intro.eyebrow}
        </motion.p>

        <motion.p
          className="intro__lead"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.25 }}
        >
          {person.intro.lead}
        </motion.p>

        <motion.div
          className="intro__year display"
          initial={{ opacity: 0, scale: 0.92, filter: 'blur(12px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.4, delay: 0.2, ease }}
        >
          <Odometer value={year} />
        </motion.div>

        <h1 id="intro-title" className="intro__name display" aria-label={person.name}>
          {letters.map((ch, i) => (
            <span key={i} className="intro__letter-mask" aria-hidden="true">
              <motion.span
                className="intro__letter"
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 1, delay: 0.9 + i * 0.06, ease }}
              >
                {ch === ' ' ? ' ' : ch}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.div
          className="intro__meta"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.4, ease }}
        >
          <p className="intro__date">{formatDate(person.birthDate)}</p>
          <p className="intro__tagline">{person.intro.tagline}</p>
          <div className="intro__actions">
            <button className="btn" onClick={() => onStart(true)}>
              <IconPlay width={16} height={16} />
              {person.intro.startWithMusic}
            </button>
            <button className="btn btn--ghost" onClick={() => onStart(false)}>
              {person.intro.startSilent}
            </button>
          </div>
        </motion.div>
      </motion.div>

      <motion.button
        className="intro__scroll"
        onClick={() => onStart(false)}
        aria-label="Прокрутить к первой главе"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
      >
        <span>Листай</span>
        <i aria-hidden="true" />
      </motion.button>
    </section>
  )
}
