import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react'
import { useRef, type PointerEvent } from 'react'
import type { Photo } from '../../content'
import { useLightbox } from '../../context/LightboxContext'
import { usePreferences } from '../../context/PreferencesContext'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { IconExpand } from '../Icons'

const DEPTH = [0.5, 1, 0.75]
const ease = [0.22, 1, 0.36, 1] as const

export function PhotoCollage({ photos }: { photos: Photo[] }) {
  const { open } = useLightbox()
  const layout = photos.length >= 3 ? 'trio' : photos.length === 2 ? 'pair' : 'single'
  return (
    <div className={`collage collage--${layout}`}>
      {photos.slice(0, 3).map((photo, i) => (
        <PhotoFrame key={photo.src} photo={photo} index={i} onOpen={() => open(photos, i)} />
      ))}
    </div>
  )
}

function PhotoFrame({ photo, index, onOpen }: { photo: Photo; index: number; onOpen: () => void }) {
  const { reduced } = usePreferences()
  const ref = useRef<HTMLElement>(null)
  const compact = useMediaQuery('(max-width: 720px)')
  const drift = (DEPTH[index] ?? 0.6) * (compact ? 26 : 70)

  // Parallax: each photo drifts at its own depth while the page scrolls.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [drift, -drift])

  // Hover tilt with a soft glare following the pointer.
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const rotateX = useSpring(rx, { stiffness: 160, damping: 18 })
  const rotateY = useSpring(ry, { stiffness: 160, damping: 18 })

  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (reduced || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    ry.set((px - 0.5) * 10)
    rx.set(-(py - 0.5) * 10)
    e.currentTarget.style.setProperty('--gx', `${px * 100}%`)
    e.currentTarget.style.setProperty('--gy', `${py * 100}%`)
  }
  const onLeave = () => {
    rx.set(0)
    ry.set(0)
  }

  // The in-view trigger lives on the figure: a fully clipped element never registers as visible.
  const frameVariants = reduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 1, clipPath: 'inset(100% 0% 0% 0% round 18px)' },
        visible: { opacity: 1, clipPath: 'inset(0% 0% 0% 0% round 18px)' },
      }
  const imageVariants = { hidden: { scale: reduced ? 1 : 1.3 }, visible: { scale: 1 } }

  return (
    <motion.figure
      ref={ref}
      className={`photo photo--${index}`}
      style={{ y }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
    >
      <motion.button
        type="button"
        className="photo__frame"
        style={{ rotateX, rotateY, aspectRatio: photo.ratio ?? 4 / 5 }}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onClick={onOpen}
        aria-label={`Открыть фото: ${photo.caption ?? photo.alt}`}
        variants={frameVariants}
        transition={{ duration: 1.3, delay: index * 0.18, ease }}
      >
        <span className="photo__kb">
          <motion.img
            src={photo.src}
            alt={photo.alt}
            loading="lazy"
            decoding="async"
            draggable={false}
            variants={imageVariants}
            transition={{ duration: 1.8, delay: index * 0.18, ease }}
          />
        </span>
        <span className="photo__glare" aria-hidden="true" />
        <span className="photo__zoom" aria-hidden="true">
          <IconExpand />
        </span>
      </motion.button>
      {photo.caption && <figcaption>{photo.caption}</figcaption>}
    </motion.figure>
  )
}
