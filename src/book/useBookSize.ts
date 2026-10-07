import { useLayoutEffect, useState, type RefObject } from 'react'

export type BookMode = 'spread' | 'single'

/** Page proportions (width / height). */
const SPREAD_RATIO = 0.72
const MIN_SINGLE_RATIO = 0.56
const MAX_SINGLE_RATIO = 0.8

/**
 * Fits the book into the available box: a two-page spread on wide screens,
 * one page on phones and narrow windows.
 */
export function useBookSize(ref: RefObject<HTMLElement | null>) {
  const [box, setBox] = useState({ w: 0, h: 0 })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])

  const mode: BookMode = box.w >= 860 && box.w / Math.max(1, box.h) >= 1.2 ? 'spread' : 'single'
  const availW = Math.max(0, box.w - (mode === 'spread' ? 48 : 24))
  const availH = Math.max(0, box.h - 24)

  let width: number
  let height: number
  if (mode === 'spread') {
    height = Math.min(availH, availW / (2 * SPREAD_RATIO), 860)
    width = height * SPREAD_RATIO
  } else {
    width = Math.min(availW, 540)
    height = Math.min(availH, width / MIN_SINGLE_RATIO)
    if (width / height > MAX_SINGLE_RATIO) width = height * MAX_SINGLE_RATIO
  }

  return { mode, width: Math.floor(width), height: Math.floor(height) }
}
