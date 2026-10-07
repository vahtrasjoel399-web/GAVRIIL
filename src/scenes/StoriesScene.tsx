import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Book, type BookHandle, type BookSpread } from '../book/Book'
import { Flourish, MarginNote, Polaroid } from '../book/parts'
import { SpamBanner } from '../casino/SpamBanner'
import { chronicle, lock, type Story } from '../content'
import { useLightbox } from '../context/LightboxContext'
import { useSfx } from '../context/SfxContext'
import './StoriesScene.css'

const ROTATIONS = [-4, 3, -2]

/** Part 3: the chronicle. Turning its last page brings the betting app. */
export function StoriesScene({ gaveUp, onCasino }: { gaveUp: boolean; onCasino: () => void }) {
  const book = useRef<BookHandle>(null)
  const sfx = useSfx()
  const [banner, setBanner] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [spread, setSpread] = useState(0)
  const jump = (storyIndex: number) => book.current?.goToSpread(storyIndex + 1)

  const spreads: BookSpread[] = [
    {
      id: 'title',
      left: <TitlePage gaveUp={gaveUp} />,
      right: <TocPage onJump={jump} />,
      unnumbered: true,
    },
    ...chronicle.stories.map((story) => ({
      id: story.id,
      left: <PhotosPage story={story} />,
      right: <StoryPage story={story} />,
    })),
    {
      id: 'ending',
      left: <EndingPage />,
      right: <EndpaperPage />,
      mobile: 'left' as const,
      unnumbered: true,
    },
  ]

  const accept = () => {
    setBanner(false)
    setLeaving(true)
    window.setTimeout(onCasino, 750)
  }

  return (
    <div className="scene scene--stories">
      <motion.div
        className="stories-book"
        animate={leaving ? { x: '-115vw', rotate: -14, opacity: 0.6 } : { x: 0, rotate: 0, opacity: 1 }}
        transition={{ duration: 0.75, ease: [0.6, 0, 0.4, 1] }}
      >
        <Book
          ref={book}
          spreads={spreads}
          label={chronicle.title}
          cover="leather"
          onSpreadChange={setSpread}
          onEnd={() => {
            sfx.play('pop')
            setBanner(true)
          }}
          endUnder={<div className="endcover" aria-hidden="true" />}
          overlay={({ width, mode }) => (
            <Ribbon
              left={mode === 'spread' ? width * 2 - 70 : width - 58}
              current={spread - 1}
              onJump={jump}
            />
          )}
        />
      </motion.div>
      <SpamBanner open={banner} onAccept={accept} />
    </div>
  )
}

function TitlePage({ gaveUp }: { gaveUp: boolean }) {
  return (
    <div className="chron-title">
      <p className="chron-title__volume">{lock.bookVolume}</p>
      <h1 className="chron-title__title">{chronicle.title}</h1>
      <Flourish />
      <p className="chron-title__epigraph">{chronicle.epigraph}</p>
      {gaveUp && (
        <MarginNote color="red" rotate={-6} className="chron-title__gaveup">
          {lock.giveUpNote}
        </MarginNote>
      )}
    </div>
  )
}

function TocPage({ onJump }: { onJump: (i: number) => void }) {
  return (
    <div className="toc">
      <h2 className="toc__title">{chronicle.tocTitle}</h2>
      <ol className="toc__list">
        {chronicle.stories.map((story, i) => (
          <li key={story.id}>
            <button type="button" className="toc__item" onClick={() => onJump(i)}>
              <span className="toc__name">{story.title}</span>
              <span className="toc__dots" aria-hidden="true" />
              <span className="toc__page">{(i + 1) * 2 + 1}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}

function PhotosPage({ story }: { story: Story }) {
  const { open } = useLightbox()
  const count = Math.min(story.photos.length, 3)
  return (
    <div className={`photos photos--${count}`}>
      {story.photos.slice(0, 3).map((photo, i) => (
        <Polaroid
          key={photo.src}
          photo={photo}
          rotate={ROTATIONS[i]}
          className={`photos__item photos__item--${i}`}
          onOpen={() => open(story.photos, i)}
        />
      ))}
    </div>
  )
}

function StoryPage({ story }: { story: Story }) {
  return (
    <article className="story">
      <p className="story__date">{story.date}</p>
      <h2 className="story__title">{story.title}</h2>
      <div className="story__text">
        {story.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <p className="story__narrator">— рассказывает {story.narrator}</p>
      {story.meme && (
        <MarginNote color="red" rotate={-5} className="story__meme">
          {story.meme}
        </MarginNote>
      )}
    </article>
  )
}

function EndingPage() {
  return (
    <div className="ending">
      <p className="ending__text">{chronicle.ending}</p>
      <p className="ending__hint">{chronicle.endingHint} →</p>
    </div>
  )
}

function EndpaperPage() {
  return <div className="endpaper" aria-hidden="true" />
}

/** Bookmark ribbon: quick jump to any story. */
function Ribbon({ left, current, onJump }: { left: number; current: number; onJump: (i: number) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key !== 'Escape') return
      if (e instanceof PointerEvent && ref.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    window.addEventListener('pointerdown', close)
    window.addEventListener('keydown', close)
    return () => {
      window.removeEventListener('pointerdown', close)
      window.removeEventListener('keydown', close)
    }
  }, [open])

  return (
    <div className="ribbon" style={{ left }} ref={ref}>
      <button
        type="button"
        className="ribbon__tail"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={chronicle.ribbon}
        title={chronicle.ribbon}
      />
      <AnimatePresence>
        {open && (
          <motion.ul
            className="ribbon__menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {chronicle.stories.map((story, i) => (
              <li key={story.id}>
                <button
                  type="button"
                  className={i === current ? 'is-current' : ''}
                  onClick={() => {
                    setOpen(false)
                    onJump(i)
                  }}
                >
                  {story.title}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
