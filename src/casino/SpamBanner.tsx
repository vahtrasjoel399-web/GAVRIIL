import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Modal } from '../components/Modal'
import { tournament } from '../content'
import { useSfx } from '../context/SfxContext'
import './SpamBanner.css'

/** Pop-up "exclusive offer" that jumps over the book. The close button refuses to work. */
export function SpamBanner({ open, onAccept }: { open: boolean; onAccept: () => void }) {
  const { banner, brand } = tournament
  const sfx = useSfx()
  const [joke, setJoke] = useState(0)
  const [seconds, setSeconds] = useState(59)

  useEffect(() => {
    if (!open) return
    setSeconds(59)
    const id = window.setInterval(() => setSeconds((s) => (s > 1 ? s - 1 : 59)), 1000)
    return () => window.clearInterval(id)
  }, [open])

  const refuse = () => {
    setJoke((n) => n + 1)
    sfx.play('pop')
  }

  return (
    <Modal open={open} onClose={refuse} label={banner.title} className="spam">
      <motion.div
        className="spam__card"
        initial={{ scale: 0.2, rotate: -10, y: 80 }}
        animate={{ scale: 1, rotate: 0, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 14 }}
      >
        <span className="spam__glow" aria-hidden="true" />
        <div className="spam__inner">
          <motion.button
            type="button"
            className="spam__close"
            onClick={refuse}
            aria-label="Закрыть"
            key={joke}
            animate={joke ? { x: [0, -8, 8, -6, 6, 0], rotate: [0, -20, 20, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            ×
          </motion.button>
          <AnimatePresence>
            {joke > 0 && (
              <motion.p className="spam__joke" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {banner.closeJoke}
              </motion.p>
            )}
          </AnimatePresence>
          <p className="spam__brand">{brand}</p>
          <h2 className="spam__title">{banner.title}</h2>
          <p className="spam__text">{banner.text}</p>
          <p className="spam__timer">
            {banner.timer} <b>00:{String(seconds).padStart(2, '0')}</b>
          </p>
          <button type="button" className="spam__cta" onClick={onAccept} data-autofocus>
            {banner.cta}
          </button>
        </div>
      </motion.div>
    </Modal>
  )
}
