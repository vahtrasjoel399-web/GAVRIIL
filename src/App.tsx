import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { CasinoApp } from './casino/CasinoApp'
import { SoundToggles } from './components/SoundToggles'
import { LightboxProvider } from './context/LightboxContext'
import { MusicProvider, useMusic } from './context/MusicContext'
import { PreferencesProvider } from './context/PreferencesContext'
import { SfxProvider } from './context/SfxContext'
import { readStorage, writeStorage } from './lib/storage'
import { BoxesScene } from './scenes/BoxesScene'
import { ChoiceScene, sectionFromHash } from './scenes/ChoiceScene'
import { LockScene } from './scenes/LockScene'
import { StoriesScene } from './scenes/StoriesScene'

type Scene = 'boxes' | 'lock' | 'stories' | 'casino' | 'choice'

/** Set once the whole path is done: next visits open the choice page right away. */
const COMPLETED = 'progress:completed'

function initialScene(): Scene {
  if (sectionFromHash(window.location.hash)) return 'choice'
  return readStorage(COMPLETED, false) ? 'choice' : 'boxes'
}

export default function App() {
  return (
    <PreferencesProvider>
      <SfxProvider>
        <MusicProvider>
          <LightboxProvider>
            <Experience />
          </LightboxProvider>
        </MusicProvider>
      </SfxProvider>
    </PreferencesProvider>
  )
}

const sceneMotion = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -16, scale: 0.98 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
}

function Experience() {
  const music = useMusic()
  const [scene, setScene] = useState<Scene>(initialScene)
  const [gaveUp, setGaveUp] = useState(false)

  // Music can only start after a gesture; the first tap anywhere is enough.
  useEffect(() => {
    const start = (e: PointerEvent) => {
      // The music button handles its own first press.
      if (e.target instanceof Element && e.target.closest('.music-btn')) return
      music.startIfAllowed()
    }
    window.addEventListener('pointerdown', start, { once: true })
    return () => window.removeEventListener('pointerdown', start)
  }, [music])

  // A bookmarked section address opens the choice book wherever we are.
  useEffect(() => {
    const onHash = () => {
      if (sectionFromHash(window.location.hash)) setScene('choice')
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const restart = () => {
    writeStorage(COMPLETED, false)
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    setGaveUp(false)
    setScene('boxes')
  }

  return (
    <div className={`app app--${scene}`}>
      {scene !== 'casino' && <SoundToggles />}
      <AnimatePresence mode="wait">
        <motion.main key={scene} className="app__scene" {...sceneMotion}>
          {scene === 'boxes' && <BoxesScene onBook={() => setScene('lock')} />}
          {scene === 'lock' && (
            <LockScene
              onOpened={(g) => {
                setGaveUp(g)
                setScene('stories')
              }}
            />
          )}
          {scene === 'stories' && <StoriesScene gaveUp={gaveUp} onCasino={() => setScene('casino')} />}
          {scene === 'casino' && (
            <CasinoApp
              onDone={() => {
                writeStorage(COMPLETED, true)
                setScene('choice')
              }}
            />
          )}
          {scene === 'choice' && <ChoiceScene onRestart={restart} />}
        </motion.main>
      </AnimatePresence>
    </div>
  )
}
