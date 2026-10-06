import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { SecretModal } from '../components/SecretModal'
import { secret } from '../content'
import { modalStack } from '../lib/modalStack'
import { isEditableTarget } from '../lib/scroll'

interface SecretApi {
  reveal: () => void
  found: boolean
}

const SecretContext = createContext<SecretApi | null>(null)
const CODE = secret.code.toLowerCase()

export function SecretProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [found, setFound] = useState(false)

  const reveal = useCallback(() => {
    setFound(true)
    setOpen(true)
  }, [])

  // Typed code. Tracks both the produced character and the physical key, so a
  // Latin code still works while a Cyrillic keyboard layout is active.
  useEffect(() => {
    if (!CODE) return
    let typed = ''
    let physical = ''
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || modalStack.isOpen() || isEditableTarget(e.target)) return
      if (e.key.length === 1) typed = (typed + e.key.toLowerCase()).slice(-CODE.length)
      if (/^Key[A-Z]$/.test(e.code)) physical = (physical + e.code.slice(3).toLowerCase()).slice(-CODE.length)
      if (typed === CODE || physical === CODE) {
        typed = ''
        physical = ''
        reveal()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [reveal])

  const value = useMemo(() => ({ reveal, found }), [reveal, found])

  return (
    <SecretContext value={value}>
      {children}
      <SecretModal open={open} onClose={() => setOpen(false)} />
    </SecretContext>
  )
}

export function useSecret() {
  const ctx = useContext(SecretContext)
  if (!ctx) throw new Error('useSecret must be used inside SecretProvider')
  return ctx
}
