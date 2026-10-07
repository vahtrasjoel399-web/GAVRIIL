import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { music } from '../content'
import { readStorage, writeStorage } from '../lib/storage'

type MusicStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

interface MusicApi {
  status: MusicStatus
  playing: boolean
  play: () => void
  pause: () => void
  toggle: () => void
  /** Temporarily silence the music (e.g. while a video plays) and restore it afterwards. */
  duck: (on: boolean) => void
  /** Start on the first interaction unless the visitor switched music off before. */
  startIfAllowed: () => void
}

const MusicContext = createContext<MusicApi | null>(null)
const FADE_MS = 1200
const PREF = 'pref:music'

export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeRef = useRef(0)
  const wantRef = useRef(false) // user intent: should music be on?
  const duckedRef = useRef(false)
  const [status, setStatus] = useState<MusicStatus>('idle')
  const [ducked, setDucked] = useState(false)

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio()
      audio.src = music.src
      audio.loop = true
      audio.preload = 'none'
      audio.volume = 0
      audio.addEventListener('error', () => setStatus('error'))
      audioRef.current = audio
    }
    return audioRef.current
  }, [])

  const fadeTo = useCallback((target: number, done?: () => void) => {
    const audio = audioRef.current
    if (!audio) return
    cancelAnimationFrame(fadeRef.current)
    const from = audio.volume
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / FADE_MS)
      audio.volume = Math.max(0, Math.min(1, from + (target - from) * t))
      if (t < 1) fadeRef.current = requestAnimationFrame(step)
      else done?.()
    }
    fadeRef.current = requestAnimationFrame(step)
  }, [])

  const startAudio = useCallback(() => {
    const audio = getAudio()
    setStatus((s) => (s === 'playing' ? s : 'loading'))
    audio
      .play()
      .then(() => {
        setStatus('playing')
        fadeTo(music.volume)
      })
      .catch(() => {
        wantRef.current = false
        setStatus('error')
      })
  }, [fadeTo, getAudio])

  const stopAudio = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    fadeTo(0, () => audio.pause())
  }, [fadeTo])

  const play = useCallback(() => {
    wantRef.current = true
    if (!duckedRef.current) startAudio()
  }, [startAudio])

  const pause = useCallback(() => {
    wantRef.current = false
    setStatus('paused')
    stopAudio()
  }, [stopAudio])

  const toggle = useCallback(() => {
    writeStorage(PREF, wantRef.current ? 'off' : 'on')
    if (wantRef.current) pause()
    else play()
  }, [pause, play])

  const startIfAllowed = useCallback(() => {
    if (!wantRef.current && readStorage<string>(PREF, 'on') !== 'off') play()
  }, [play])

  const duck = useCallback(
    (on: boolean) => {
      duckedRef.current = on
      setDucked(on)
      if (!wantRef.current) return
      if (on) stopAudio()
      else startAudio()
    },
    [startAudio, stopAudio],
  )

  // Don't keep playing in a background tab.
  useEffect(() => {
    const onVisibility = () => {
      if (!wantRef.current || duckedRef.current) return
      if (document.hidden) audioRef.current?.pause()
      else startAudio()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [startAudio])

  useEffect(
    () => () => {
      cancelAnimationFrame(fadeRef.current)
      audioRef.current?.pause()
    },
    [],
  )

  const value = useMemo<MusicApi>(
    () => ({
      status,
      playing: !ducked && (status === 'playing' || status === 'loading'),
      play,
      pause,
      toggle,
      duck,
      startIfAllowed,
    }),
    [status, ducked, play, pause, toggle, duck, startIfAllowed],
  )

  return <MusicContext value={value}>{children}</MusicContext>
}

export function useMusic() {
  const ctx = useContext(MusicContext)
  if (!ctx) throw new Error('useMusic must be used inside MusicProvider')
  return ctx
}
