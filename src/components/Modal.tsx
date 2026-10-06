import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { modalStack } from '../lib/modalStack'
import './Modal.css'

interface ModalProps {
  open: boolean
  onClose: () => void
  label: string
  className?: string
  children: ReactNode
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"]), video[controls]'

/** Accessible dialog: portal, focus trap, Escape to close, scroll lock, focus restore. */
export function Modal({ open, onClose, label, className, children }: ModalProps) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <ModalInner onClose={onClose} label={label} className={className}>
          {children}
        </ModalInner>
      )}
    </AnimatePresence>,
    document.body,
  )
}

function ModalInner({ onClose, label, className, children }: Omit<ModalProps, 'open'>) {
  const ref = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    modalStack.push()
    const node = ref.current
    const first = node?.querySelector<HTMLElement>('[data-autofocus]') ?? node?.querySelector<HTMLElement>(FOCUSABLE)
    ;(first ?? node)?.focus({ preventScroll: true })

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab' || !node) return
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null)
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const firstItem = items[0]
      const lastItem = items[items.length - 1]
      if (e.shiftKey && (document.activeElement === firstItem || !node.contains(document.activeElement))) {
        e.preventDefault()
        lastItem.focus()
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault()
        firstItem.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      modalStack.pop()
      // Restore focus unless something outside the dialog (e.g. navigation) already took it.
      const active = document.activeElement
      if (!active || active === document.body || node?.contains(active)) previous?.focus?.({ preventScroll: true })
    }
  }, [])

  return (
    <motion.div
      ref={ref}
      className={`modal ${className ?? ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="modal__backdrop" onClick={onClose} aria-hidden="true" />
      {children}
    </motion.div>
  )
}
