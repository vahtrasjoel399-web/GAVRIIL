import { useEffect, useRef, useState } from 'react'
import { spotify } from '../content'
import { useMusic } from '../context/MusicContext'
import './SpotifyDock.css'

interface Controller {
  loadUri: (uri: string) => void
  play: () => void
  addListener: (event: 'playback_update', fn: (e: { data: { isPaused: boolean } }) => void) => void
  destroy: () => void
}
interface IFrameApi {
  createController: (el: HTMLElement, options: { uri: string; width: string; height: number }, cb: (c: Controller) => void) => void
}
declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: IFrameApi) => void
  }
}

const API_SRC = 'https://open.spotify.com/embed/iframe-api/v1'
let apiPromise: Promise<IFrameApi> | null = null

/** Loads Spotify's iFrame API once. */
function loadApi() {
  apiPromise ??= new Promise<IFrameApi>((resolve, reject) => {
    window.onSpotifyIframeApiReady = resolve
    const script = document.createElement('script')
    script.src = API_SRC
    script.async = true
    script.onerror = () => {
      apiPromise = null
      reject(new Error('Spotify iFrame API failed to load'))
    }
    document.body.append(script)
  })
  return apiPromise
}

const uri = (id: string) => `spotify:track:${id}`

/**
 * A small Spotify player in the corner. It lives outside the book, so a song keeps playing
 * while pages turn; the background music goes quiet while it plays.
 */
export function SpotifyDock() {
  const { duck } = useMusic()
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)
  const host = useRef<HTMLDivElement>(null)
  const controller = useRef<Controller | null>(null)
  const created = useRef(false)
  const mounted = useRef(false)
  const playingRef = useRef(false)
  const duckRef = useRef(duck)
  duckRef.current = duck

  // The player is created on first open, so nothing loads from Spotify before that.
  useEffect(() => {
    if (!open || created.current || !host.current) return
    created.current = true
    const target = document.createElement('div')
    host.current.append(target)
    loadApi()
      .then((api) =>
        api.createController(target, { uri: uri(spotify.tracks[0].id), width: '100%', height: 80 }, (c) => {
          if (!mounted.current) return c.destroy()
          controller.current = c
          c.addListener('playback_update', (e) => {
            const on = !e.data.isPaused
            if (on === playingRef.current) return
            playingRef.current = on
            setPlaying(on)
            duckRef.current(on)
          })
        }),
      )
      .catch(() => setFailed(true))
  }, [open])

  // Leaving the page with a song on: give the background music back.
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      controller.current?.destroy()
      if (playingRef.current) duckRef.current(false)
    }
  }, [])

  const choose = (i: number) => {
    setCurrent(i)
    controller.current?.loadUri(uri(spotify.tracks[i].id))
    controller.current?.play()
  }

  return (
    <div className={`spotify-dock ${open ? 'is-open' : ''}`}>
      <div className="spotify-dock__panel" aria-hidden={!open} inert={!open}>
        {spotify.tracks.length > 1 && (
          <div className="spotify-dock__tracks">
            {spotify.tracks.map((t, i) => (
              <button key={t.id} type="button" className={i === current ? 'is-current' : ''} onClick={() => choose(i)}>
                {t.title}
              </button>
            ))}
          </div>
        )}
        {failed ? (
          <a className="spotify-dock__fallback" href={`https://open.spotify.com/track/${spotify.tracks[current].id}`} target="_blank" rel="noreferrer">
            Открыть «{spotify.tracks[current].title}» в Spotify
          </a>
        ) : (
          <div className="spotify-dock__player" ref={host} />
        )}
      </div>
      <button
        type="button"
        className={`icon-btn spotify-dock__toggle ${playing ? 'is-playing' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? 'Свернуть плеер' : `${spotify.label}: открыть плеер`}
        title={spotify.label}
      >
        <span aria-hidden="true">♫</span>
        <span className="spotify-dock__label">{spotify.label}</span>
      </button>
    </div>
  )
}
