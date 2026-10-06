import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useImperativeHandle, useRef, useState, type CSSProperties, type KeyboardEvent, type Ref } from 'react'
import type { VideoContent } from '../content'
import { useMusic } from '../context/MusicContext'
import { formatTime } from '../lib/format'
import { IconFullscreen, IconMute, IconPause, IconPlay, IconVolume } from './Icons'
import './VideoPlayer.css'

type FullscreenVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void }

export interface VideoPlayerHandle {
  /** Jump to a moment and start playing. */
  playFrom: (seconds: number) => void
}

interface VideoPlayerProps {
  video: VideoContent
  onChapterChange?: (index: number) => void
  ref?: Ref<VideoPlayerHandle>
}

export function VideoPlayer({ video, onChapterChange, ref }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const idleTimer = useRef(0)
  const { duck } = useMusic()

  const [playing, setPlaying] = useState(false)
  const [started, setStarted] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [buffering, setBuffering] = useState(false)
  const [error, setError] = useState(false)
  const [idle, setIdle] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  const chapters = video.chapters ?? []
  const chapterIndex = chapters.reduce((acc, c, i) => (time >= c.time ? i : acc), -1)

  useEffect(() => {
    onChapterChange?.(chapterIndex)
  }, [chapterIndex, onChapterChange])

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused || v.ended) v.play().catch(() => setError(true))
    else v.pause()
  }, [])

  const seek = useCallback((t: number) => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = Math.max(0, Math.min(v.duration || t, t))
    setTime(v.currentTime)
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      playFrom: (seconds) => {
        seek(seconds)
        videoRef.current?.play().catch(() => setError(true))
      },
    }),
    [seek],
  )

  const toggleMute = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    if (!v.muted && v.volume === 0) v.volume = 0.6
  }, [])

  const toggleFullscreen = useCallback(() => {
    const wrap = wrapRef.current
    const v = videoRef.current as FullscreenVideo | null
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    } else if (wrap?.requestFullscreen) {
      wrap.requestFullscreen().catch(() => v?.webkitEnterFullscreen?.())
    } else {
      v?.webkitEnterFullscreen?.() // iOS Safari
    }
  }, [])

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === wrapRef.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  // Pause when the player scrolls out of view.
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        const v = videoRef.current
        if (!entry.isIntersecting && v && !v.paused && !document.fullscreenElement) v.pause()
      },
      { threshold: 0.15 },
    )
    observer.observe(wrap)
    return () => observer.disconnect()
  }, [])

  // Hand the soundtrack back to the background music when leaving.
  useEffect(() => () => duck(false), [duck])

  const wake = () => {
    setIdle(false)
    window.clearTimeout(idleTimer.current)
    idleTimer.current = window.setTimeout(() => setIdle(true), 2600)
  }
  useEffect(() => () => window.clearTimeout(idleTimer.current), [])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    const onSlider = target.getAttribute('type') === 'range'
    switch (e.code) {
      case 'Space':
      case 'KeyK':
        if (target.tagName === 'BUTTON' && e.code === 'Space') return
        e.preventDefault()
        togglePlay()
        break
      case 'ArrowLeft':
        if (onSlider) return
        e.preventDefault()
        seek(time - 5)
        break
      case 'ArrowRight':
        if (onSlider) return
        e.preventDefault()
        seek(time + 5)
        break
      case 'KeyM':
        e.preventDefault()
        toggleMute()
        break
      case 'KeyF':
        e.preventDefault()
        toggleFullscreen()
        break
    }
    wake()
  }

  const progress = duration ? (time / duration) * 100 : 0
  const showControls = !playing || !idle

  return (
    <div
      ref={wrapRef}
      className={`player ${started ? 'is-started' : ''} ${playing ? 'is-playing' : ''} ${showControls ? '' : 'is-idle'} ${fullscreen ? 'is-fullscreen' : ''}`}
      onPointerMove={wake}
      onKeyDown={onKeyDown}
      data-own-keys
      tabIndex={0}
      role="region"
      aria-label={`Видеоплеер: ${video.title}`}
    >
      <video
        ref={videoRef}
        className="player__video"
        poster={video.poster}
        preload="metadata"
        playsInline
        onClick={togglePlay}
        onPlay={() => {
          setPlaying(true)
          setStarted(true)
          setError(false)
          duck(true)
          wake()
        }}
        onPause={() => {
          setPlaying(false)
          duck(false)
        }}
        onEnded={() => {
          setPlaying(false)
          duck(false)
        }}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onCanPlay={() => setBuffering(false)}
        onVolumeChange={(e) => {
          setMuted(e.currentTarget.muted)
          setVolume(e.currentTarget.volume)
        }}
        onError={() => setError(true)}
      >
        {video.sources?.map((s) => <source key={s.src} src={s.src} type={s.type} />)}
        <source src={video.src} />
      </video>

      <AnimatePresence>
        {!started && !error && (
          <motion.button
            className="player__poster"
            onClick={togglePlay}
            aria-label={`Смотреть: ${video.title}`}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.6 }}
          >
            <span className="player__big-play" aria-hidden="true">
              <IconPlay />
            </span>
            <span className="player__poster-text">
              <span className="player__poster-title">{video.title}</span>
              {duration > 0 && <span className="player__poster-time">{formatTime(duration)}</span>}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {buffering && playing && <span className="player__spinner" aria-hidden="true" />}

      {error && (
        <div className="player__error" role="alert">
          <p>Видео пока не загрузилось.</p>
          <p className="player__error-hint">Проверьте путь к файлу в src/content/media.ts</p>
        </div>
      )}

      <div className="player__controls" inert={!started}>
        <button className="player__btn" onClick={togglePlay} aria-label={playing ? 'Пауза' : 'Воспроизвести'}>
          {playing ? <IconPause /> : <IconPlay />}
        </button>

        <span className="player__time">
          {formatTime(time)} <span>/ {formatTime(duration)}</span>
        </span>

        <div className="player__seek">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={time}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Перемотка"
            aria-valuetext={`${formatTime(time)} из ${formatTime(duration)}`}
            style={{ '--progress': `${progress}%` } as CSSProperties}
          />
          {duration > 0 &&
            chapters.map((c) => (
              <span
                key={c.time}
                className="player__marker"
                style={{ left: `${(c.time / duration) * 100}%` }}
                title={c.label}
                aria-hidden="true"
              />
            ))}
        </div>

        <button className="player__btn" onClick={toggleMute} aria-label={muted ? 'Включить звук' : 'Выключить звук'}>
          {muted || volume === 0 ? <IconMute /> : <IconVolume />}
        </button>
        <input
          className="player__volume"
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={muted ? 0 : volume}
          onChange={(e) => {
            const v = videoRef.current
            if (!v) return
            v.volume = Number(e.target.value)
            v.muted = v.volume === 0
          }}
          aria-label="Громкость"
          style={{ '--progress': `${(muted ? 0 : volume) * 100}%` } as CSSProperties}
        />
        <button className="player__btn" onClick={toggleFullscreen} aria-label={fullscreen ? 'Выйти из полноэкранного режима' : 'На весь экран'}>
          <IconFullscreen />
        </button>
      </div>
    </div>
  )
}

