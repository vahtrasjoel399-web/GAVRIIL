import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Book, type BookHandle, type BookSpread } from '../book/Book'
import { Flourish, MarginNote, Polaroid } from '../book/parts'
import { IconChevronLeft } from '../components/Icons'
import { VideoPlayer } from '../components/VideoPlayer'
import { choice, gavriilSection, motivationSection, type MotivationPage } from '../content'
import { useLightbox } from '../context/LightboxContext'
import './ChoiceScene.css'

export type SectionId = 'gavriil' | 'motivation'

export const sectionFromHash = (hash: string): SectionId | null =>
  hash === '#gavriil' ? 'gavriil' : hash === '#motivation' ? 'motivation' : null

/** Part 6: the page Gavriil comes back to, with two sections behind bookmarks. */
export function ChoiceScene({ onRestart }: { onRestart: () => void }) {
  const book = useRef<BookHandle>(null)
  const initial = sectionFromHash(window.location.hash)
  const [section, setSection] = useState<SectionId | null>(initial)
  const [spread, setSpread] = useState(initial ? 1 : 0)
  const pending = useRef<number | null>(null)

  const pages = section === 'gavriil' ? gavriilPages() : section === 'motivation' ? motivationPages() : []
  const spreads: BookSpread[] = [
    {
      id: 'choice',
      left: <LetterPage />,
      right: <TabsPage onPick={(s) => pick(s)} onRestart={onRestart} />,
      mobile: 'right',
      unnumbered: true,
    },
    ...pairs(pages, section ?? 'none', () => backToChoice()),
  ]

  const pick = (s: SectionId) => {
    if (window.location.hash !== `#${s}`) window.history.pushState(null, '', `#${s}`)
    if (s === section) book.current?.goToSpread(1)
    else {
      pending.current = 1
      setSection(s)
    }
  }

  const backToChoice = () => {
    if (window.location.hash) window.history.pushState(null, '', window.location.pathname + window.location.search)
    book.current?.goToSpread(0)
  }

  // After a new section's pages are in the book, turn to them.
  useEffect(() => {
    if (pending.current !== null) {
      book.current?.goToSpread(pending.current)
      pending.current = null
    }
  }, [section])

  // Browser back/forward and bookmarks.
  useEffect(() => {
    const sync = () => {
      const s = sectionFromHash(window.location.hash)
      if (!s) book.current?.goToSpread(0)
      else if (s !== section) {
        pending.current = 1
        setSection(s)
      } else book.current?.goToSpread(1)
    }
    window.addEventListener('popstate', sync)
    window.addEventListener('hashchange', sync)
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener('hashchange', sync)
    }
  }, [section])

  return (
    <div className="scene scene--choice">
      {spread > 0 && (
        <button type="button" className="back-to-choice" onClick={backToChoice}>
          <IconChevronLeft width={16} height={16} /> {choice.back}
        </button>
      )}
      <Book
        key="choice-book"
        ref={book}
        spreads={spreads}
        label="Выбор"
        cover="leather"
        initialSpread={initial ? 1 : 0}
        onSpreadChange={setSpread}
      />
    </div>
  )
}

/** Lays section pages out as spreads; the last page leads back to the choice. */
function pairs(pages: ReactNode[], prefix: string, onBack: () => void): BookSpread[] {
  if (pages.length === 0) return []
  const all = [...pages, <BackPage key="back" onBack={onBack} />]
  const out: BookSpread[] = []
  for (let i = 0; i < all.length; i += 2) out.push({ id: `${prefix}-${i / 2}`, left: all[i], right: all[i + 1] })
  return out
}

function LetterPage() {
  return (
    <div className="letter">
      <h1 className="letter__title">{choice.title}</h1>
      {choice.letter.map((p, i) => (
        <p key={i} className="letter__text">
          {p}
        </p>
      ))}
      <p className="letter__signature">{choice.signature}</p>
    </div>
  )
}

function TabsPage({ onPick, onRestart }: { onPick: (s: SectionId) => void; onRestart: () => void }) {
  return (
    <div className="tabs-page">
      <h2 className="tabs-page__title">{choice.title}</h2>
      <div className="tabs-page__list">
        {[gavriilSection, motivationSection].map((s) => (
          <button key={s.id} type="button" className={`bookmark bookmark--${s.id}`} onClick={() => onPick(s.id)}>
            <span className="bookmark__title">{s.tab}</span>
            <span className="bookmark__note">{s.tabNote}</span>
          </button>
        ))}
      </div>
      <button type="button" className="tabs-page__restart" onClick={onRestart}>
        {choice.restart}
      </button>
    </div>
  )
}

function BackPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="section-end">
      <Flourish />
      <button type="button" className="ink-btn" onClick={onBack}>
        ← {choice.back}
      </button>
    </div>
  )
}

function IntroPage({ title, text }: { title: string; text: string }) {
  return (
    <div className="section-intro">
      <h2 className="section-intro__title">{title}</h2>
      <Flourish />
      <p className="section-intro__text">{text}</p>
    </div>
  )
}

function gavriilPages(): ReactNode[] {
  const s = gavriilSection
  const pages: ReactNode[] = [<IntroPage key="intro" title={s.title} text={s.intro} />]
  for (let i = 0; i < s.photos.length; i += 2) pages.push(<AlbumPage key={`album-${i}`} start={i} />)
  pages.push(
    <div key="outro" className="section-intro">
      <p className="section-intro__text section-intro__text--big">{s.outro}</p>
    </div>,
  )
  return pages
}

function AlbumPage({ start }: { start: number }) {
  const { open } = useLightbox()
  const photos = gavriilSection.photos
  return (
    <div className="album">
      {photos.slice(start, start + 2).map((photo, i) => (
        <figure key={photo.src} className={`album__photo album__photo--${i}`}>
          <button type="button" onClick={() => open(photos, start + i)} aria-label={`Открыть фото: ${photo.caption ?? photo.alt}`}>
            <img src={photo.src} alt={photo.alt} loading="lazy" draggable={false} style={{ aspectRatio: photo.ratio ?? 1 }} />
            <span className="album__corner album__corner--tl" aria-hidden="true" />
            <span className="album__corner album__corner--tr" aria-hidden="true" />
            <span className="album__corner album__corner--bl" aria-hidden="true" />
            <span className="album__corner album__corner--br" aria-hidden="true" />
          </button>
          {photo.caption && <figcaption>{photo.caption}</figcaption>}
        </figure>
      ))}
    </div>
  )
}

function motivationPages(): ReactNode[] {
  const s = motivationSection
  return [
    <IntroPage key="intro" title={s.title} text={s.intro} />,
    ...s.pages.map((page, i) => <MotivationPageView key={i} page={page} />),
    <div key="outro" className="section-intro">
      <p className="section-intro__text section-intro__text--big">{s.outro}</p>
    </div>,
  ]
}

function MotivationPageView({ page }: { page: MotivationPage }) {
  const { open } = useLightbox()
  return (
    <div className="moti">
      {page.title && <h3 className="moti__title">{page.title}</h3>}
      {page.kind === 'words' && (
        <div className="moti__notes">
          {page.notes.map((note, i) => (
            <div key={i} className={`sticky sticky--${i % 3}`}>
              <p className="sticky__text">{note.text}</p>
              <p className="sticky__from">— {note.from}</p>
            </div>
          ))}
        </div>
      )}
      {page.kind === 'photos' && (
        <div className={`photos photos--${Math.min(page.photos.length, 3)}`}>
          {page.photos.slice(0, 3).map((photo, i) => (
            <Polaroid
              key={photo.src}
              photo={photo}
              rotate={i % 2 ? 3 : -3}
              className={`photos__item photos__item--${i}`}
              onOpen={() => open(page.photos, i)}
            />
          ))}
        </div>
      )}
      {page.kind === 'video' && (
        <div className="moti__video">
          <VideoPlayer video={page.video} />
          {page.caption && (
            <MarginNote color="blue" rotate={-2}>
              {page.caption}
            </MarginNote>
          )}
        </div>
      )}
    </div>
  )
}
