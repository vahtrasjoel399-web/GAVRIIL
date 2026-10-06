import { useCallback, useEffect, useRef, useState } from 'react'
import { Backdrop } from './components/Backdrop'
import { Finale } from './components/Finale'
import { FilmSection } from './components/FilmSection'
import { Footer } from './components/Footer'
import { Gallery } from './components/Gallery'
import { Gifts } from './components/Gifts'
import { Header } from './components/Header'
import { Intro } from './components/Intro'
import { Memories } from './components/Memories'
import { NavMenu } from './components/NavMenu'
import { ShortcutsHelp } from './components/ShortcutsHelp'
import { Timeline } from './components/timeline/Timeline'
import { TimelineRail } from './components/timeline/TimelineRail'
import { timeline } from './content'
import { LightboxProvider } from './context/LightboxContext'
import { MusicProvider, useMusic } from './context/MusicContext'
import { PreferencesProvider, usePreferences } from './context/PreferencesContext'
import { SecretProvider } from './context/SecretContext'
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts'
import { useScrollSpy } from './hooks/useScrollSpy'
import { sideCannons } from './lib/confetti'
import { scrollToId } from './lib/scroll'
import { SECTIONS, chapterId } from './lib/sections'

const SECTION_IDS = SECTIONS.map((s) => s.id)
const CHAPTER_IDS = timeline.map((c) => chapterId(c.year))
// Every stop the arrow keys walk through, top to bottom.
const STOPS = ['start', 'timeline', ...CHAPTER_IDS, ...SECTION_IDS.slice(2)]
const DEFAULT_ACCENT = '#f1c88a'

export default function App() {
  return (
    <PreferencesProvider>
      <MusicProvider>
        <LightboxProvider>
          <SecretProvider>
            <Experience />
          </SecretProvider>
        </LightboxProvider>
      </MusicProvider>
    </PreferencesProvider>
  )
}

function Experience() {
  const { reduced } = usePreferences()
  const music = useMusic()
  const [menuOpen, setMenuOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  const activeSection = useScrollSpy(SECTION_IDS)
  const activeChapterId = useScrollSpy(CHAPTER_IDS)
  const inTimeline = activeSection === 'timeline'
  const activeIndex = activeChapterId ? CHAPTER_IDS.indexOf(activeChapterId) : -1
  const chapterIndex = inTimeline ? activeIndex : -1

  // The whole page slowly tints towards the accent of what's on screen.
  useEffect(() => {
    const accent = inTimeline
      ? timeline[activeIndex]?.accent
      : SECTIONS.find((s) => s.id === activeSection)?.accent
    document.documentElement.style.setProperty('--accent', accent ?? DEFAULT_ACCENT)
  }, [activeSection, activeIndex, inTimeline])

  // Confetti the first time a celebratory chapter is reached.
  const celebrated = useRef(new Set<number>())
  useEffect(() => {
    const chapter = timeline[chapterIndex]
    if (!chapter?.milestone?.celebrate || celebrated.current.has(chapter.year)) return
    const t = window.setTimeout(() => {
      celebrated.current.add(chapter.year)
      sideCannons()
    }, 450)
    return () => window.clearTimeout(t)
  }, [chapterIndex])

  const goTo = useCallback((id: string) => scrollToId(id, reduced), [reduced])

  // Arrow keys: jump to the next stop below the top of the viewport, or the previous one above it.
  const step = useCallback(
    (delta: 1 | -1) => {
      const tops = STOPS.map((id) => document.getElementById(id)?.getBoundingClientRect().top ?? NaN)
      const target =
        delta > 0
          ? STOPS.find((_, i) => tops[i] > 8)
          : STOPS.findLast((_, i) => tops[i] < -8)
      if (target) goTo(target)
    },
    [goTo],
  )

  useGlobalShortcuts({
    nextChapter: () => step(1),
    prevChapter: () => step(-1),
    toggleMusic: music.toggle,
    openHelp: () => setHelpOpen(true),
  })

  const navigateFromMenu = (id: string) => {
    setMenuOpen(false)
    // Wait for the dialog to release the scroll lock.
    window.setTimeout(() => goTo(id), reduced ? 30 : 380)
  }

  const start = (withMusic: boolean) => {
    if (withMusic) music.play()
    goTo('timeline')
  }

  return (
    <>
      <a className="skip-link" href="#timeline">
        Перейти к истории
      </a>
      <Backdrop />
      <Header
        chapterIndex={chapterIndex}
        onHome={() => goTo('start')}
        onOpenMenu={() => setMenuOpen(true)}
      />
      <TimelineRail visible={inTimeline} activeIndex={chapterIndex} onSelect={(i) => goTo(CHAPTER_IDS[i])} />

      <main id="main">
        <Intro onStart={start} />
        <Timeline activeIndex={chapterIndex} />
        <FilmSection />
        <Memories />
        <Gallery />
        <Gifts />
        <Finale />
      </main>
      <Footer onTop={() => goTo('start')} />

      <NavMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        activeSection={activeSection}
        activeChapter={chapterIndex}
        onNavigate={navigateFromMenu}
        onShowHelp={() => {
          setMenuOpen(false)
          window.setTimeout(() => setHelpOpen(true), 380)
        }}
      />
      <ShortcutsHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  )
}
