import { motion } from 'motion/react'
import { person, timeline } from '../content'
import { useMusic } from '../context/MusicContext'
import { usePreferences, type MotionPreference } from '../context/PreferencesContext'
import { pad2 } from '../lib/format'
import { SECTIONS, chapterId } from '../lib/sections'
import { IconClose, IconKeyboard, IconSparkle } from './Icons'
import { Modal } from './Modal'
import { MusicButton } from './MusicButton'
import './NavMenu.css'

interface NavMenuProps {
  open: boolean
  onClose: () => void
  activeSection: string | null
  activeChapter: number
  onNavigate: (id: string) => void
  onShowHelp: () => void
}

const MOTION_OPTIONS: { value: MotionPreference; label: string }[] = [
  { value: 'system', label: 'Как в системе' },
  { value: 'full', label: 'Полные' },
  { value: 'reduced', label: 'Минимум' },
]

const ease = [0.22, 1, 0.36, 1] as const

export function NavMenu({ open, onClose, activeSection, activeChapter, onNavigate, onShowHelp }: NavMenuProps) {
  const { motion: motionPref, setMotion } = usePreferences()
  const { playing } = useMusic()

  return (
    <Modal open={open} onClose={onClose} label="Меню" className="menu">
      <motion.div
        className="menu__panel"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.5, ease }}
      >
        <div className="menu__top">
          <span className="menu__brand">
            <IconSparkle /> {person.name}
          </span>
          <button className="icon-btn" onClick={onClose} aria-label="Закрыть меню" data-autofocus>
            <IconClose />
          </button>
        </div>

        <div className="menu__grid">
          <nav aria-label="Разделы">
            <ol className="menu__sections">
              {SECTIONS.map((s, i) => (
                <motion.li
                  key={s.id}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.08 + i * 0.05, ease }}
                >
                  <button
                    className="menu__link"
                    onClick={() => onNavigate(s.id)}
                    aria-current={activeSection === s.id ? 'location' : undefined}
                  >
                    <span className="menu__num">{pad2(i + 1)}</span>
                    <span className="menu__label">{s.label}</span>
                  </button>
                </motion.li>
              ))}
            </ol>
          </nav>

          <div className="menu__aside">
            <div>
              <p className="menu__heading">Годы</p>
              <div className="menu__years">
                {timeline.map((c, i) => (
                  <button
                    key={c.year}
                    className="chip"
                    aria-current={i === activeChapter ? 'true' : undefined}
                    onClick={() => onNavigate(chapterId(c.year))}
                    title={c.title}
                  >
                    {c.year}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="menu__heading">Настройки</p>
              <div className="menu__setting">
                <MusicButton />
                <span>Музыка: {playing ? 'играет' : 'выключена'}</span>
              </div>
              <div className="menu__setting menu__setting--motion">
                <span id="motion-label">Анимации</span>
                <div className="menu__segmented" role="radiogroup" aria-labelledby="motion-label">
                  {MOTION_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      role="radio"
                      aria-checked={motionPref === o.value}
                      onClick={() => setMotion(o.value)}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <button className="menu__help" onClick={onShowHelp}>
                <IconKeyboard /> Горячие клавиши
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </Modal>
  )
}
