import { useEffect, useRef } from 'react'
import { modalStack } from '../lib/modalStack'
import { isEditableTarget } from '../lib/scroll'

export interface ShortcutHandlers {
  nextChapter: () => void
  prevChapter: () => void
  toggleMusic: () => void
  openHelp: () => void
}

/** Page-level keyboard shortcuts. Ignored while a dialog is open or the user is typing. */
export function useGlobalShortcuts(handlers: ShortcutHandlers) {
  const ref = useRef(handlers)
  useEffect(() => {
    ref.current = handlers
  })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
      if (modalStack.isOpen() || isEditableTarget(e.target)) return
      // Let focused media/sliders keep their own arrow keys.
      if (e.target instanceof HTMLElement && e.target.closest('[data-own-keys]')) return

      const h = ref.current
      switch (e.code) {
        case 'ArrowRight':
        case 'KeyJ':
          e.preventDefault()
          h.nextChapter()
          break
        case 'ArrowLeft':
        case 'KeyK':
          e.preventDefault()
          h.prevChapter()
          break
        case 'KeyM':
          h.toggleMusic()
          break
        default:
          if (e.key === '?') h.openHelp()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
