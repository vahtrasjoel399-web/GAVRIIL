import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { readStorage, writeStorage } from '../lib/storage'

// Small sound effects synthesised with Web Audio — no files to download.
// Page rustle, lock click, coin and win jingle. Can be switched off; the choice is remembered.

type Effect = 'flip' | 'click' | 'pop' | 'coin' | 'win'

interface SfxApi {
  enabled: boolean
  toggle: () => void
  play: (effect: Effect) => void
}

const SfxContext = createContext<SfxApi | null>(null)
const KEY = 'pref:sfx'

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext }

export function SfxProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(() => readStorage(KEY, true))
  const ctxRef = useRef<AudioContext | null>(null)
  const noiseRef = useRef<AudioBuffer | null>(null)

  const getContext = useCallback(() => {
    if (!ctxRef.current) {
      const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext
      if (!Ctor) return null
      ctxRef.current = new Ctor()
    }
    const ctx = ctxRef.current
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  }, [])

  const noise = useCallback((ctx: AudioContext) => {
    if (!noiseRef.current) {
      const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
      noiseRef.current = buffer
    }
    return noiseRef.current
  }, [])

  const play = useCallback(
    (effect: Effect) => {
      if (!enabled) return
      const ctx = getContext()
      if (!ctx) return
      const t = ctx.currentTime + 0.01
      const out = ctx.createGain()
      out.gain.value = 0.9
      out.connect(ctx.destination)

      const tone = (freq: number, start: number, dur: number, gain: number, type: OscillatorType = 'sine') => {
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.type = type
        osc.frequency.setValueAtTime(freq, start)
        g.gain.setValueAtTime(0.0001, start)
        g.gain.exponentialRampToValueAtTime(gain, start + 0.01)
        g.gain.exponentialRampToValueAtTime(0.0001, start + dur)
        osc.connect(g).connect(out)
        osc.start(start)
        osc.stop(start + dur + 0.05)
      }

      const rustle = (start: number, dur: number, gain: number, from: number, to: number) => {
        const src = ctx.createBufferSource()
        src.buffer = noise(ctx)
        const band = ctx.createBiquadFilter()
        band.type = 'bandpass'
        band.Q.value = 0.7
        band.frequency.setValueAtTime(from, start)
        band.frequency.exponentialRampToValueAtTime(to, start + dur)
        const g = ctx.createGain()
        g.gain.setValueAtTime(0.0001, start)
        g.gain.exponentialRampToValueAtTime(gain, start + dur * 0.15)
        g.gain.exponentialRampToValueAtTime(0.0001, start + dur)
        src.connect(band).connect(g).connect(out)
        src.start(start, Math.random() * 0.5)
        src.stop(start + dur + 0.05)
      }

      switch (effect) {
        case 'flip':
          rustle(t, 0.34, 0.5, 2600 + Math.random() * 600, 700)
          rustle(t + 0.2, 0.16, 0.22, 1800, 600)
          break
        case 'click':
          tone(2200, t, 0.03, 0.25, 'square')
          tone(140, t, 0.09, 0.5, 'triangle')
          rustle(t + 0.05, 0.06, 0.2, 4000, 2500)
          break
        case 'pop':
          tone(520, t, 0.12, 0.25, 'triangle')
          tone(780, t + 0.06, 0.14, 0.2, 'triangle')
          break
        case 'coin':
          tone(1318, t, 0.12, 0.2, 'square')
          tone(1760, t + 0.08, 0.35, 0.18, 'square')
          break
        case 'win':
          ;[523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, t + i * 0.09, 0.5, 0.18, 'triangle'))
          break
      }
    },
    [enabled, getContext, noise],
  )

  const toggle = useCallback(() => {
    setEnabled((v) => {
      writeStorage(KEY, !v)
      return !v
    })
  }, [])

  const value = useMemo(() => ({ enabled, toggle, play }), [enabled, toggle, play])
  return <SfxContext value={value}>{children}</SfxContext>
}

export function useSfx() {
  const ctx = useContext(SfxContext)
  if (!ctx) throw new Error('useSfx must be used inside SfxProvider')
  return ctx
}
