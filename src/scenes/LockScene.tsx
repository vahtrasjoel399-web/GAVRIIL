import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Flourish } from '../book/parts'
import { lock } from '../content'
import { usePreferences } from '../context/PreferencesContext'
import { useSfx } from '../context/SfxContext'
import { isCorrectAnswer } from '../lib/answer'
import './LockScene.css'

const ease = [0.22, 1, 0.36, 1] as const
type Stage = 'inserting' | 'asking' | 'unlocking' | 'opening'

/** Part 2: the key fits the lock of the album, but the lock asks a question. */
export function LockScene({ onOpened }: { onOpened: (gaveUp: boolean) => void }) {
  const { reduced } = usePreferences()
  const sfx = useSfx()
  const [stage, setStage] = useState<Stage>('inserting')
  const [answer, setAnswer] = useState('')
  const [wrong, setWrong] = useState(0)
  const [shake, setShake] = useState(0)
  const timers = useRef<number[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, reduced ? Math.min(ms, 150) : ms))
  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])

  useEffect(() => {
    later(1300, () => setStage('asking'))
  }, [])

  useEffect(() => {
    if (stage === 'asking') inputRef.current?.focus({ preventScroll: true })
  }, [stage])

  const unlock = (gaveUp: boolean) => {
    setStage('unlocking')
    later(450, () => sfx.play('click'))
    later(1500, () => {
      setStage('opening')
      sfx.play('flip')
    })
    later(2700, () => onOpened(gaveUp))
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!answer.trim()) return
    if (isCorrectAnswer(answer, lock.answers)) unlock(false)
    else {
      setWrong((w) => w + 1)
      setShake((n) => n + 1)
      setAnswer('')
      inputRef.current?.focus()
    }
  }

  const unlocked = stage === 'unlocking' || stage === 'opening'

  return (
    <div className="scene scene--lock">
      <div className="lock-layout">
        <div className={`closed-book ${stage === 'opening' ? 'is-opening' : ''}`}>
          <div className="closed-book__paper" aria-hidden="true">
            <p className="closed-book__paper-title">{lock.bookTitle}</p>
            <Flourish />
          </div>

          <motion.div
            className="closed-book__cover"
            initial={false}
            animate={stage === 'opening' ? { rotateY: -168 } : { rotateY: 0 }}
            transition={{ duration: reduced ? 0 : 1.15, ease: [0.6, 0, 0.3, 1] }}
          >
            {/* Rendered in Blender: leather, gold corners and the embossed title. */}
            <div className="cover__face">
              <h1 className="visually-hidden">{lock.bookTitle}</h1>
            </div>
            <div className="cover__inside" aria-hidden="true" />
          </motion.div>

          <motion.div
            className="strap"
            initial={false}
            animate={stage === 'opening' ? { x: 60, opacity: 0 } : { x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease }}
          >
            <div className="padlock3d">
              <motion.img
                key={unlocked ? 'open' : stage === 'inserting' ? 'closed' : 'key'}
                className="padlock3d__img"
                src={`/media/3d/padlock-${unlocked ? 'open' : stage === 'inserting' ? 'closed' : 'key'}.webp`}
                alt=""
                draggable={false}
                initial={unlocked ? { y: 6, scale: 0.97 } : false}
                animate={{ y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 12 }}
              />
              {stage === 'inserting' && (
                <motion.img
                  className="padlock3d__flying-key"
                  src="/media/3d/key.webp"
                  alt=""
                  draggable={false}
                  initial={{ x: -260, y: 260, rotate: -60, opacity: 0, scale: 1.3 }}
                  animate={{ x: 0, y: 0, rotate: 0, opacity: [0, 1, 1, 0], scale: 0.6 }}
                  transition={{ duration: 1.15, ease }}
                />
              )}
            </div>
          </motion.div>
        </div>

        <div className="lock-side">
          <AnimatePresence mode="wait">
            {stage === 'inserting' && (
              <motion.p key="intro" className="lock-intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {lock.intro}
              </motion.p>
            )}
            {stage === 'asking' && (
              <motion.form
                key="form"
                className="lock-tag"
                onSubmit={submit}
                initial={{ opacity: 0, y: 24, rotate: 2 }}
                animate={{ opacity: 1, y: 0, rotate: -1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6, ease }}
              >
                <span className="lock-tag__hole" aria-hidden="true" />
                <label className="lock-tag__question" htmlFor="lock-answer">
                  {lock.question}
                </label>
                <motion.div
                  className="lock-tag__row"
                  key={shake}
                  animate={shake ? { x: [0, -10, 10, -7, 7, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <input
                    ref={inputRef}
                    id="lock-answer"
                    className="lock-tag__input"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder={lock.placeholder}
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    aria-describedby="lock-feedback"
                  />
                  <button type="submit" className="ink-btn ink-btn--dark">
                    {lock.submit}
                  </button>
                </motion.div>
                <div id="lock-feedback" className="lock-tag__feedback" aria-live="polite">
                  {wrong > 0 && <p className="lock-tag__wrong">{lock.wrong[Math.min(wrong - 1, lock.wrong.length - 1)]}</p>}
                  {wrong >= 2 && <p className="lock-tag__hint">{lock.hint}</p>}
                </div>
                <button type="button" className="lock-tag__giveup" onClick={() => unlock(true)}>
                  {lock.giveUp}
                </button>
              </motion.form>
            )}
            {unlocked && (
              <motion.p key="click" className="lock-intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                Щёлк.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
