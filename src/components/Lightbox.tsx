import { AnimatePresence, motion, type PanInfo } from 'motion/react'
import { useEffect, useRef } from 'react'
import type { Photo } from '../content'
import { IconChevronLeft, IconChevronRight, IconClose } from './Icons'
import { Modal } from './Modal'
import './Lightbox.css'

interface LightboxProps {
  items: Photo[]
  index: number
  open: boolean
  onIndexChange: (index: number) => void
  onClose: () => void
}

const variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 120, scale: 0.96 }),
  center: { opacity: 1, x: 0, scale: 1 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -120, scale: 0.96 }),
}

export function Lightbox({ items, index, open, onIndexChange, onClose }: LightboxProps) {
  const count = items.length
  const photo = items[index]
  const dirRef = useRef(1)
  const stripRef = useRef<HTMLDivElement>(null)

  const go = (delta: number) => {
    if (count < 2) return
    dirRef.current = delta
    onIndexChange((index + delta + count) % count)
  }
  const goRef = useRef(go)
  goRef.current = go

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goRef.current(1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goRef.current(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Preload neighbours so swiping feels instant.
  useEffect(() => {
    if (!open || count < 2) return
    for (const i of [index + 1, index - 1]) {
      const img = new Image()
      img.src = items[(i + count) % count].src
    }
  }, [open, index, count, items])

  // Keep the active thumbnail visible without scrolling the page.
  useEffect(() => {
    const strip = stripRef.current
    const thumb = strip?.children[index] as HTMLElement | undefined
    if (!strip || !thumb) return
    strip.scrollTo({ left: thumb.offsetLeft - strip.clientWidth / 2 + thumb.clientWidth / 2, behavior: 'smooth' })
  }, [index, open])

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -70 || info.velocity.x < -500) go(1)
    else if (info.offset.x > 70 || info.velocity.x > 500) go(-1)
  }

  return (
    <Modal open={open && !!photo} onClose={onClose} label="Просмотр фотографий" className="lightbox">
      {photo && (
        <div className="lightbox__inner">
          <div className="lightbox__bar">
            <span className="lightbox__counter" aria-live="polite">
              {index + 1} <span>/ {count}</span>
            </span>
            <button className="icon-btn" onClick={onClose} aria-label="Закрыть" data-autofocus>
              <IconClose />
            </button>
          </div>

          <div className="lightbox__stage">
            {count > 1 && (
              <button className="icon-btn lightbox__nav lightbox__nav--prev" onClick={() => go(-1)} aria-label="Предыдущее фото">
                <IconChevronLeft />
              </button>
            )}
            <AnimatePresence initial={false} custom={dirRef.current} mode="popLayout">
              <motion.img
                key={photo.src + index}
                src={photo.src}
                alt={photo.alt}
                className="lightbox__img"
                custom={dirRef.current}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                drag={count > 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={onDragEnd}
                draggable={false}
              />
            </AnimatePresence>
            {count > 1 && (
              <button className="icon-btn lightbox__nav lightbox__nav--next" onClick={() => go(1)} aria-label="Следующее фото">
                <IconChevronRight />
              </button>
            )}
          </div>

          <div className="lightbox__footer">
            <p className="lightbox__caption">{photo.caption ?? photo.alt}</p>
            {count > 1 && (
              <div className="lightbox__strip" ref={stripRef}>
                {items.map((item, i) => (
                  <button
                    key={item.src + i}
                    className="lightbox__thumb"
                    aria-label={`Фото ${i + 1}: ${item.alt}`}
                    aria-current={i === index}
                    onClick={() => {
                      dirRef.current = i > index ? 1 : -1
                      onIndexChange(i)
                    }}
                  >
                    <img src={item.src} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
