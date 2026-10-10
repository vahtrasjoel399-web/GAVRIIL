import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { CasinoApp } from './casino/CasinoApp'
import { SpamBanner } from './casino/SpamBanner'
import { SoundToggles } from './components/SoundToggles'
import { SpotifyDock } from './components/SpotifyDock'
import { LightboxProvider } from './context/LightboxContext'
import { MusicProvider, useMusic } from './context/MusicContext'
import { PreferencesProvider } from './context/PreferencesContext'
import { SfxProvider } from './context/SfxContext'
import { readStorage, writeStorage } from './lib/storage'
import { AlbumScene } from './scenes/AlbumScene'
import { BoxesScene } from './scenes/BoxesScene'
import { LockScene } from './scenes/LockScene'

type Scene = 'boxes' | 'lock' | 'casino' | 'album'

/** Set once the casino is done: next visits open the album right away. */
const COMPLETED = 'progress:completed'

function initialScene(): Scene {
  return readStorage(COMPLETED, false) ? 'album' : 'boxes'
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
  const [banner, setBanner] = useState(false)

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

  const restart = () => {
    writeStorage(COMPLETED, false)
    setGaveUp(false)
    setBanner(false)
    setScene('boxes')
  }

  return (
    <div className={`app app--${scene}`}>
      {scene !== 'casino' && <SoundToggles />}
      {scene !== 'casino' && <SpotifyDock />}
      <AnimatePresence mode="wait">
        <motion.main key={scene} className="app__scene" {...sceneMotion}>
          {scene === 'boxes' && <BoxesScene onBook={() => setScene('lock')} />}
          {scene === 'lock' && (
            <LockScene
              onOpened={(g) => {
                // The book is open — and a betting spam banner jumps over it.
                setGaveUp(g)
                setBanner(true)
              }}
            />
          )}
          {scene === 'casino' && (
            <CasinoApp
              onDone={() => {
                writeStorage(COMPLETED, true)
                setScene('album')
              }}
            />
          )}
          {scene === 'album' && <AlbumScene gaveUp={gaveUp} onRestart={restart} />}
        </motion.main>
      </AnimatePresence>
      <SpamBanner
        open={banner}
        onAccept={() => {
          setBanner(false)
          setScene('casino')
        }}
      />
    </div>
  )
}
