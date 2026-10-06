import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { galleryExtras, person, timeline, type GalleryPhoto } from '../content'
import { useLightbox } from '../context/LightboxContext'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { plural } from '../lib/format'
import { SectionHead } from './SectionHead'
import './Gallery.css'

const ALL = 'all'
const ease = [0.22, 1, 0.36, 1] as const

const photos: GalleryPhoto[] = [
  ...timeline.flatMap((c) => (c.photos ?? []).map((p) => ({ ...p, year: c.year }))),
  ...galleryExtras,
].sort((a, b) => (a.year ?? 0) - (b.year ?? 0))

const decadeOf = (year?: number) => (year ? `${Math.floor(year / 10) * 10}` : 'other')
const decades = Array.from(new Set(photos.map((p) => decadeOf(p.year))))

/** Spread photos over columns, always filling the shortest one, so the masonry stays balanced. */
function toColumns(items: GalleryPhoto[], count: number) {
  const columns: { photo: GalleryPhoto; index: number }[][] = Array.from({ length: count }, () => [])
  const heights = new Array<number>(count).fill(0)
  items.forEach((photo, index) => {
    const target = heights.indexOf(Math.min(...heights))
    columns[target].push({ photo, index })
    heights[target] += 1 / (photo.ratio ?? 0.8)
  })
  return columns
}

export function Gallery() {
  const { open } = useLightbox()
  const [filter, setFilter] = useState(ALL)
  const wide = useMediaQuery('(min-width: 1100px)')
  const medium = useMediaQuery('(min-width: 720px)')
  const columnCount = wide ? 4 : medium ? 3 : 2

  const visible = useMemo(() => (filter === ALL ? photos : photos.filter((p) => decadeOf(p.year) === filter)), [filter])
  const columns = useMemo(() => toColumns(visible, columnCount), [visible, columnCount])
  const { gallery: copy } = person.sections

  return (
    <section id="gallery" className="section gallery" tabIndex={-1} aria-labelledby="gallery-title">
      <SectionHead id="gallery-title" eyebrow={copy.eyebrow} title={copy.title}>
        <div className="gallery__filters" role="group" aria-label="Фильтр по годам">
          <button className="chip" aria-pressed={filter === ALL} onClick={() => setFilter(ALL)}>
            Все
          </button>
          {decades.map((d) => (
            <button key={d} className="chip" aria-pressed={filter === d} onClick={() => setFilter(d)}>
              {d === 'other' ? 'Без даты' : `${d}-е`}
            </button>
          ))}
          <span className="gallery__count" aria-live="polite">
            {visible.length} {plural(visible.length, ['кадр', 'кадра', 'кадров'])}
          </span>
        </div>
      </SectionHead>

      <div className="gallery__grid container">
        {columns.map((column, ci) => (
          <div className="gallery__col" key={ci}>
            <AnimatePresence mode="popLayout" initial={false}>
              {column.map(({ photo, index }) => (
                <motion.button
                  layout
                  key={photo.src}
                  className="gallery__item"
                  onClick={() => open(visible, index)}
                  aria-label={`Открыть фото: ${photo.caption ?? photo.alt}${photo.year ? `, ${photo.year}` : ''}`}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.55, ease }}
                >
                  <motion.img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    decoding="async"
                    style={{ aspectRatio: photo.ratio ?? 0.8 }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                  />
                  <span className="gallery__overlay" aria-hidden="true">
                    {photo.year && <span className="gallery__year">{photo.year}</span>}
                    {photo.caption && <span className="gallery__caption">{photo.caption}</span>}
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  )
}
