import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { Lightbox } from '../components/Lightbox'
import type { Photo } from '../content'

interface LightboxApi {
  open: (items: Photo[], index: number) => void
}

const LightboxContext = createContext<LightboxApi | null>(null)

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ items: Photo[]; index: number } | null>(null)
  const open = useCallback((items: Photo[], index: number) => setState({ items, index }), [])
  const value = useMemo(() => ({ open }), [open])

  return (
    <LightboxContext value={value}>
      {children}
      <Lightbox
        items={state?.items ?? []}
        index={state?.index ?? 0}
        open={state !== null}
        onIndexChange={(index) => setState((s) => (s ? { ...s, index } : s))}
        onClose={() => setState(null)}
      />
    </LightboxContext>
  )
}

export function useLightbox() {
  const ctx = useContext(LightboxContext)
  if (!ctx) throw new Error('useLightbox must be used inside LightboxProvider')
  return ctx
}
