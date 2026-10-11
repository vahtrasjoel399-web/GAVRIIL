import type { CSSProperties, ReactNode } from 'react'
import { Book, type BookSpread } from '../book/Book'
import { Flourish, MarginNote, Polaroid } from '../book/parts'
import { VideoPlayer } from '../components/VideoPlayer'
import { album, lock, type VideoContent } from '../content'
import { useLightbox } from '../context/LightboxContext'
import { albumPages, type AlbumRow } from '../lib/albumLayout'
import './AlbumScene.css'

/** Photos lie a little askew, as if glued in by hand. */
const ROTATIONS = [-2.5, 2, 1.5, -2, 2.5, -1.5]
const PHOTO_PAGES = albumPages(album.photos)

/** Part 5, the finale: the album of photos and videos. Next visits open it right away. */
export function AlbumScene({ gaveUp, onRestart }: { gaveUp: boolean; onRestart: () => void }) {
  return (
    <div className="scene scene--album">
      <div className="album-book">
        <Book spreads={albumSpreads(gaveUp, onRestart)} label={album.title} cover="leather" />
      </div>
    </div>
  )
}

/** Title, then the photo pages and the videos two by two, then the birthday wish. */
function albumSpreads(gaveUp: boolean, onRestart: () => void): BookSpread[] {
  const pages: ReactNode[] = [
    <TitlePage key="title" gaveUp={gaveUp} />,
    ...PHOTO_PAGES.map((rows, i) => <PhotoPage key={`photos-${i}`} rows={rows} />),
    ...album.videos.map((video) => <VideoPage key={video.src} video={video} />),
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

/** A page of photos; a click opens the photo full screen, with the whole album to leaf through. */
function PhotoPage({ rows }: { rows: AlbumRow[] }) {
  const { open } = useLightbox()
  return (
    <div className="album-page">
      <div className="album-photos">
        {rows.map((row, r) => (
          <div key={r} className="album-row">
            {row.items.map(({ photo, index, width, height }) => (
              <Polaroid
                key={photo.src}
                photo={photo}
                rotate={ROTATIONS[index % ROTATIONS.length]}
                className="album-photos__item"
                style={{ '--ratio': photo.ratio ?? 1, '--w': width, '--h': height } as CSSProperties}
                onOpen={() => open(album.photos, index)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function VideoPage({ video }: { video: VideoContent }) {
  return (
    <div className="album-page">
      <div className="album-video">
        <VideoPlayer video={video} />
      </div>
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
