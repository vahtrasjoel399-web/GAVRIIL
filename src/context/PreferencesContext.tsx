import { MotionConfig } from 'motion/react'
import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { setConfettiReduced } from '../lib/confetti'
import { readStorage, writeStorage } from '../lib/storage'

export type MotionPreference = 'system' | 'reduced' | 'full'

interface Preferences {
  motion: MotionPreference
  setMotion: (value: MotionPreference) => void
  /** Final answer: should animations be minimised right now? */
  reduced: boolean
}

const PreferencesContext = createContext<Preferences | null>(null)
const QUERY = '(prefers-reduced-motion: reduce)'

function subscribeSystem(callback: () => void) {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', callback)
  return () => mq.removeEventListener('change', callback)
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const systemReduced = useSyncExternalStore(subscribeSystem, () => window.matchMedia(QUERY).matches)
  const [motion, setMotionState] = useState<MotionPreference>(() => readStorage('pref:motion', 'system'))
  const reduced = motion === 'system' ? systemReduced : motion === 'reduced'

  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? 'reduced' : 'full'
    setConfettiReduced(reduced)
  }, [reduced])

  const value = useMemo<Preferences>(
    () => ({
      motion,
      reduced,
      setMotion: (next) => {
        setMotionState(next)
        writeStorage('pref:motion', next)
      },
    }),
    [motion, reduced],
  )

  return (
    <PreferencesContext value={value}>
      <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>{children}</MotionConfig>
    </PreferencesContext>
  )
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used inside PreferencesProvider')
  return ctx
}
