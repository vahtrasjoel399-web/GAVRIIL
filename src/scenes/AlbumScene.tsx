import type { CSSProperties, ReactNode } from 'react'
import { Book, type BookSpread } from '../book/Book'
import { Flourish, MarginNote, Polaroid } from '../book/parts'
import { VideoPlayer } from '../components/VideoPlayer'
import { album, lock, type AlbumPage } from '../content'
import { useLightbox } from '../context/LightboxContext'
import './AlbumScene.css'

const ROTATIONS = [-3, 2.5]

/** Part 5, the finale: the album of cute photos and videos. Next visits open it right away. */
export function AlbumScene({ gaveUp, onRestart }: { gaveUp: boolean; onRestart: () => void }) {
  return (
    <div className="scene scene--album">
      <div className="album-book">
        <Book spreads={albumSpreads(gaveUp, onRestart)} label={album.title} cover="leather" />
      </div>
    </div>
  )
}

/** Title, then the album pages two by two, then the birthday wish. */
function albumSpreads(gaveUp: boolean, onRestart: () => void): BookSpread[] {
  const pages: ReactNode[] = [
    <TitlePage key="title" gaveUp={gaveUp} />,
    ...album.pages.map((page, i) => <AlbumPageView key={i} page={page} />),
    <EndingPage key="ending" onRestart={onRestart} />,
  ]
  const endsLeft = pages.length % 2 === 1
  if (endsLeft) pages.push(<EndpaperPage key="endpaper" />)

  const spreads: BookSpread[] = []
  for (let i = 0; i < pages.length; i += 2) spreads.push({ id: `album-${i / 2}`, left: pages[i], right: pages[i + 1] })
  spreads[0].unnumbered = true
  if (endsLeft) Object.assign(spreads[spreads.length - 1], { mobile: 'left', unnumbered: true })
  return spreads
}

function TitlePage({ gaveUp }: { gaveUp: boolean }) {
  return (
    <div className="album-title">
      <p className="album-title__volume">{lock.bookVolume}</p>
      <h1 className="album-title__title">{album.title}</h1>
      <Flourish />
      <p className="album-title__epigraph">{album.epigraph}</p>
      {gaveUp && (
        <MarginNote color="red" rotate={-6} className="album-title__gaveup">
          {lock.giveUpNote}
        </MarginNote>
      )}
    </div>
  )
}

function AlbumPageView({ page }: { page: AlbumPage }) {
  const { open } = useLightbox()
  return (
    <div className="album-page">
      {page.kind === 'photos' && (
        <div className={`album-photos album-photos--${Math.min(page.photos.length, 2)}`}>
          {page.photos.slice(0, 2).map((photo, i) => (
            <Polaroid
              key={photo.src}
              photo={photo}
              rotate={ROTATIONS[i]}
              className={`album-photos__item album-photos__item--${i} ${(photo.ratio ?? 1) < 1 ? 'is-tall' : ''}`}
              style={{ '--ratio': photo.ratio ?? 1 } as CSSProperties}
              onOpen={() => open(page.photos, i)}
            />
          ))}
        </div>
      )}
      {page.kind === 'video' && (
        <div className="album-video">
          <VideoPlayer video={page.video} />
          {page.caption && (
            <MarginNote color="blue" rotate={-2}>
              {page.caption}
            </MarginNote>
          )}
        </div>
      )}
      {page.note && (
        <MarginNote color="red" rotate={-4} className="album-page__note">
          {page.note}
        </MarginNote>
      )}
    </div>
  )
}

function EndingPage({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="ending">
      <p className="ending__text">{album.ending}</p>
      <p className="ending__note">{album.endingNote}</p>
      <p className="ending__signature">{album.signature}</p>
      <button type="button" className="ending__restart" onClick={onRestart}>
        {album.restart}
      </button>
    </div>
  )
}

function EndpaperPage() {
  return <div className="endpaper" aria-hidden="true" />
}
