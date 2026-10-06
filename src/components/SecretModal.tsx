import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { secret } from '../content'
import { usePreferences } from '../context/PreferencesContext'
import { hearts } from '../lib/confetti'
import { IconClose } from './Icons'
import { Modal } from './Modal'
import './SecretModal.css'

export function SecretModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} label={secret.title} className="secret-modal">
      <SecretContent onClose={onClose} />
    </Modal>
  )
}

function SecretContent({ onClose }: { onClose: () => void }) {
  const { reduced } = usePreferences()
  const [phase, setPhase] = useState<'envelope' | 'letter'>(reduced ? 'letter' : 'envelope')

  useEffect(() => {
    if (phase !== 'envelope') return
    const t = window.setTimeout(() => setPhase('letter'), 1500)
    return () => window.clearTimeout(t)
  }, [phase])

  useEffect(() => {
    if (phase === 'letter') hearts({ x: 0.5, y: 0.45 })
  }, [phase])

  return (
    <div className="secret">
      <button className="icon-btn modal__close" onClick={onClose} aria-label="Закрыть" data-autofocus>
        <IconClose />
      </button>
      <AnimatePresence mode="wait">
        {phase === 'envelope' ? (
          <motion.div
            key="envelope"
            className="envelope"
            initial={{ y: 40, opacity: 0, rotate: -4 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 60, opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setPhase('letter')}
            aria-hidden="true"
          >
            <div className="envelope__back" />
            <motion.div
              className="envelope__paper"
              initial={{ y: 0 }}
              animate={{ y: -70 }}
              transition={{ delay: 0.85, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
            <div className="envelope__front" />
            <motion.div
              className="envelope__flap"
              initial={{ rotateX: 0 }}
              animate={{ rotateX: 180 }}
              transition={{ delay: 0.35, duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
            />
            <div className="envelope__seal">✦</div>
          </motion.div>
        ) : (
          <motion.article
            key="letter"
            className="secret__letter"
            initial={{ y: 50, opacity: 0, scale: 0.92 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="secret__eyebrow">✦ только для тебя ✦</p>
            <h2 className="secret__title">{secret.title}</h2>
            <p className="secret__text">{secret.message}</p>
            <p className="secret__signature">{secret.signature}</p>
          </motion.article>
        )}
      </AnimatePresence>
    </div>
  )
}
