import { motion } from 'motion/react'
import { IconClose } from './Icons'
import { Modal } from './Modal'
import './ShortcutsHelp.css'

const SHORTCUTS: [string[], string][] = [
  [['→', 'J'], 'Следующая глава'],
  [['←', 'K'], 'Предыдущая глава'],
  [['M'], 'Музыка вкл / выкл'],
  [['?'], 'Эта подсказка'],
  [['Esc'], 'Закрыть окно'],
  [['←', '→'], 'Листать фото в просмотрщике'],
  [['Пробел', 'K'], 'Видео: пауза / воспроизведение'],
  [['F'], 'Видео: на весь экран'],
]

export function ShortcutsHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} label="Горячие клавиши" className="shortcuts">
      <motion.div
        className="shortcuts__panel"
        initial={{ y: 24, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 16, scale: 0.98 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="shortcuts__head">
          <h2>Горячие клавиши</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Закрыть" data-autofocus>
            <IconClose />
          </button>
        </div>
        <dl className="shortcuts__list">
          {SHORTCUTS.map(([keys, label]) => (
            <div key={label}>
              <dt>
                {keys.map((k) => (
                  <kbd key={k}>{k}</kbd>
                ))}
              </dt>
              <dd>{label}</dd>
            </div>
          ))}
        </dl>
        <p className="shortcuts__note">И ещё кое-что секретное. Попробуй найти — подсказка где-то внизу страницы.</p>
      </motion.div>
    </Modal>
  )
}
