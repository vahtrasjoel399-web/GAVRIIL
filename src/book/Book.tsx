import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type Ref,
} from 'react'
import { IconChevronLeft, IconChevronRight } from '../components/Icons'
import { usePreferences } from '../context/PreferencesContext'
import { useSfx } from '../context/SfxContext'
import {
  IDENTITY,
  apply,
  bandMatrix,
  computeFold,
  constrainCorner,
  cssMatrix,
  cssPolygon,
  mirrorX,
  multiply,
  translate,
  type Matrix,
  type Vec,
} from '../lib/fold'
import { modalStack } from '../lib/modalStack'
import { isEditableTarget } from '../lib/scroll'
import { useBookSize, type BookMode } from './useBookSize'
import './Book.css'

export interface BookSpread {
  id: string
  /** Left page content. Missing → plain paper. */
  left?: ReactNode
  right?: ReactNode
  /** Which pages are kept on a phone, where one page is shown at a time. Default: both. */
  mobile?: 'both' | 'left' | 'right'
  /** Turning forward from this spread is blocked (e.g. until a box is opened). */
  lockForward?: boolean
  /** Hide page numbers on this spread. */
  unnumbered?: boolean
}

export interface BookHandle {
  next: () => void
  prev: () => void
  goToSpread: (index: number) => void
}

interface BookProps {
  spreads: BookSpread[]
  /** Accessible name of the book. */
  label: string
  initialSpread?: number
  onSpreadChange?: (index: number) => void
  /** Called after the last page is turned. Without it the last page stays put. */
  onEnd?: () => void
  /** Revealed under the last page while it turns (e.g. the inside of the back cover). */
  endUnder?: ReactNode
  /** Extra layer drawn over the book (ribbons, notes). Receives the current page size. */
  overlay?: (size: { width: number; height: number; mode: BookMode }) => ReactNode
  cover?: 'leather' | 'cloth'
  ref?: Ref<BookHandle>
}

type Side = 'left' | 'right'
interface View {
  spread: number
  side: Side
}
interface Flip {
  dir: 1 | -1
  from: number
  /** Target view; equal to views.length when turning the very last page. */
  to: number
  corner: 'top' | 'bottom'
}
type Layer = 'base' | 'under' | 'front' | 'flap'
interface Slot {
  key: string
  order: number
  content: ReactNode
  /** Paper side: decides where the spine shadow falls. */
  side: Side
  pos: 'left' | 'right' | 'single' | 'flap'
  layer: Layer
  number?: number
  kind: 'page' | 'blank' | 'end'
}

const AUTO_MS = 820
const EASE = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const INTERACTIVE = 'button, a, input, textarea, select, label, video, [data-no-flip]'

export function Book({ spreads, label, initialSpread = 0, onSpreadChange, onEnd, endUnder, overlay, cover = 'cloth', ref }: BookProps) {
  const { reduced } = usePreferences()
  const sfx = useSfx()
  const fitRef = useRef<HTMLDivElement>(null)
  const { mode, width: W, height: H } = useBookSize(fitRef)

  // ---------- views: what one "screen" of the book shows ----------
  const views = useMemo<View[]>(() => {
    if (mode === 'spread') return spreads.map((_, i) => ({ spread: i, side: 'left' as Side }))
    return spreads.flatMap((s, i) => {
      const keep = s.mobile ?? 'both'
      const out: View[] = []
      if (keep !== 'right' && s.left !== undefined) out.push({ spread: i, side: 'left' })
      if (keep !== 'left' && s.right !== undefined) out.push({ spread: i, side: 'right' })
      if (out.length === 0) out.push({ spread: i, side: s.right !== undefined ? 'right' : 'left' })
      return out
    })
  }, [mode, spreads])

  const [at, setAt] = useState<View>(() => ({ spread: Math.min(initialSpread, spreads.length - 1), side: 'left' }))
  const [flip, setFlip] = useState<Flip | null>(null)
  const [ended, setEnded] = useState(false)
  const [shaking, setShaking] = useState(false)
  const [turned, setTurned] = useState(false)

  const pos = useMemo(() => {
    let i = views.findIndex((v) => v.spread === at.spread && (mode === 'spread' || v.side === at.side))
    if (i < 0) i = views.findIndex((v) => v.spread === at.spread)
    if (i < 0) i = Math.max(0, views.findLastIndex((v) => v.spread < at.spread))
    return i
  }, [views, at, mode])

  const setPos = useCallback((i: number) => setAt({ spread: views[i].spread, side: views[i].side }), [views])

  useEffect(() => {
    if (views[pos]) onSpreadChange?.(views[pos].spread)
  }, [pos, views, onSpreadChange])

  // Hide the "how to turn pages" hint after the first turn.
  const firstPos = useRef(pos)
  useEffect(() => {
    if (pos !== firstPos.current) setTurned(true)
  }, [pos])

  const canForward = (from: number) => {
    const v = views[from]
    if (!v) return false
    const lastOfSpread = views[from + 1]?.spread !== v.spread
    if (spreads[v.spread]?.lockForward && lastOfSpread) return false
    return from + 1 < views.length || !!onEnd
  }
  const canBack = (from: number) => from > 0

  // ---------- page slots for the current state ----------
  const slots = useMemo<Slot[]>(() => {
    const page = (view: View | undefined, side: Side, pos: Slot['pos'], layer: Layer): Slot | null => {
      if (!view) return null
      const s = spreads[view.spread]
      const content = s?.[side]
      const index = view.spread * 2 + (side === 'right' ? 1 : 0)
      return {
        key: `${s.id}:${side}`,
        order: index,
        content,
        side: mode === 'single' ? (pos === 'flap' ? 'left' : 'right') : side,
        pos,
        layer,
        number: s.unnumbered || content === undefined ? undefined : index + 1,
        kind: content === undefined ? 'blank' : 'page',
      }
    }
    const blank = (side: Side, pos: Slot['pos'], layer: Layer, key = 'blank'): Slot => ({
      key,
      order: 100000,
      content: null,
      side,
      pos,
      layer,
      kind: 'blank',
    })
    const end = (pos: Slot['pos'], layer: Layer): Slot => ({
      key: 'end',
      order: 100001,
      content: endUnder,
      side: 'right',
      pos,
      layer,
      kind: 'end',
    })
    const out: (Slot | null)[] = []

    if (mode === 'spread') {
      const cur = views[pos]
      if (ended) {
        out.push(blank('left', 'left', 'base', 'end-back'), end('right', 'base'))
      } else if (!flip) {
        out.push(page(cur, 'left', 'left', 'base'), page(cur, 'right', 'right', 'base'))
      } else {
        const a = views[flip.from]
        const b = views[flip.to]
        if (flip.dir === 1) {
          out.push(
            page(a, 'left', 'left', 'base'),
            b ? page(b, 'right', 'right', 'under') : end('right', 'under'),
            page(a, 'right', 'right', 'front'),
            b ? page(b, 'left', 'flap', 'flap') : blank('left', 'flap', 'flap', 'end-back'),
          )
        } else {
          out.push(
            page(a, 'right', 'right', 'base'),
            page(b, 'left', 'left', 'under'),
            page(a, 'left', 'left', 'front'),
            page(b, 'right', 'flap', 'flap'),
          )
        }
      }
    } else {
      const single = (view: View | undefined, layer: Layer) => (view ? page(view, view.side, 'single', layer) : null)
      if (ended) out.push(end('single', 'base'))
      else if (!flip) out.push(single(views[pos], 'base'))
      else if (flip.dir === 1) {
        out.push(
          views[flip.to] ? single(views[flip.to], 'under') : end('single', 'under'),
          single(views[flip.from], 'front'),
          blank('left', 'flap', 'flap'),
        )
      } else {
        out.push(single(views[flip.from], 'under'), single(views[flip.to], 'front'), blank('left', 'flap', 'flap'))
      }
    }
    return out.filter((s): s is Slot => s !== null).sort((x, y) => x.order - y.order)
  }, [mode, views, pos, flip, ended, spreads, endUnder])

  // ---------- flip engine (imperative, one rAF loop, no React renders per frame) ----------
  const frontRef = useRef<HTMLDivElement | null>(null)
  const flapRef = useRef<HTMLDivElement | null>(null)
  const shadeRef = useRef<HTMLDivElement | null>(null)
  const castRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const engine = useRef({
    P: { x: 0, y: 0 } as Vec,
    raf: 0,
    pending: null as null | 'auto' | 'drag' | 'peek',
    peek: false,
    flip: null as Flip | null,
    touched: new Set<HTMLElement>(),
  })

  /** Frame of the turning leaf: where its box is and whether it is mirrored. */
  const frame = useCallback(
    (f: Flip) => {
      const mirrored = mode === 'spread' && f.dir === -1
      const origin: Vec = mode === 'spread' && f.dir === 1 ? { x: W, y: 0 } : { x: 0, y: 0 }
      const reversed = mode === 'single' && f.dir === -1
      const cy = f.corner === 'bottom' ? H : 0
      return {
        mirrored,
        origin,
        reversed,
        C: { x: W, y: cy },
        open: { x: -W, y: cy },
        toBox: mirrored ? mirrorX(W) : IDENTITY,
        beta: mirrored ? IDENTITY : mirrorX(W),
        cy,
      }
    },
    [mode, W, H],
  )

  const draw = useCallback(
    (P: Vec) => {
      const f = engine.current.flip
      const front = frontRef.current
      const flap = flapRef.current
      if (!f || !front || !flap) return
      const fr = frame(f)
      const Pc = constrainCorner(P, W, H, fr.cy)
      engine.current.P = Pc
      const fold = computeFold(W, H, fr.C, Pc)
      engine.current.touched.add(front)
      engine.current.touched.add(flap)
      if (!fold) {
        front.style.clipPath = 'none'
        flap.style.visibility = 'hidden'
        if (castRef.current) castRef.current.style.opacity = '0'
        return
      }
      front.style.clipPath = cssPolygon(fold.front.map((p) => apply(fr.toBox, p)))
      const S: Matrix = multiply(translate(fr.origin.x, fr.origin.y), multiply(fr.toBox, multiply(fold.reflect, fr.beta)))
      flap.style.visibility = 'visible'
      flap.style.transform = cssMatrix(S)
      flap.style.clipPath = cssPolygon(fold.folded.map((p) => apply(fr.beta, p)))

      const L = (W + H) * 3
      const nBack = fr.mirrored ? fold.n : { x: -fold.n.x, y: fold.n.y }
      if (shadeRef.current) {
        const band = shadeRef.current
        band.style.width = `${L}px`
        band.style.height = `${Math.max(1, fold.depth / 2)}px`
        band.style.transform = cssMatrix(bandMatrix(apply(fr.beta, fold.M), nBack, L))
      }
      if (castRef.current) {
        const band = castRef.current
        const t = Math.min(1, fold.depth / (2 * W))
        band.style.width = `${L}px`
        band.style.height = `${Math.max(1, Math.min(W * 0.45, fold.depth * 0.45))}px`
        band.style.opacity = String(Math.pow(Math.sin(Math.PI * t), 0.6))
        band.style.transform = cssMatrix(multiply(fr.toBox, bandMatrix(fold.M, fold.n, L)))
      }
    },
    [frame, W, H],
  )

  const finish = useCallback(
    (committed: boolean) => {
      const f = engine.current.flip
      cancelAnimationFrame(engine.current.raf)
      engine.current.peek = false
      engine.current.pending = null
      if (!f) return
      if (committed) {
        if (f.to >= views.length) {
          setEnded(true)
          window.setTimeout(() => onEnd?.(), 120)
        } else setPos(f.to)
      }
      engine.current.flip = null
      setFlip(null)
    },
    [views.length, onEnd, setPos],
  )

  /** Tween the corner to `target`; `arc` lifts the corner like a hand turning a page. */
  const animateTo = useCallback(
    (target: Vec, duration: number, done: () => void, arc = false) => {
      cancelAnimationFrame(engine.current.raf)
      const from = { ...engine.current.P }
      const start = performance.now()
      const lift = H * 0.14 * (engine.current.flip?.corner === 'top' ? 1 : -1)
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration)
        const e = EASE(t)
        draw({
          x: from.x + (target.x - from.x) * e,
          y: from.y + (target.y - from.y) * e + (arc ? Math.sin(Math.PI * e) * lift : 0),
        })
        if (t < 1) engine.current.raf = requestAnimationFrame(step)
        else done()
      }
      engine.current.raf = requestAnimationFrame(step)
    },
    [draw, H],
  )

  const startFlip = useCallback(
    (dir: 1 | -1, kind: 'auto' | 'drag' | 'peek', corner: 'top' | 'bottom' = 'bottom', to?: number) => {
      if (engine.current.flip || ended) return false
      const target = to ?? pos + dir
      if (target < 0 || target > views.length || target === pos) return false
      if (target === views.length && !onEnd) return false
      const f: Flip = { dir, from: pos, to: target, corner }
      engine.current.flip = f
      engine.current.pending = kind
      if (kind !== 'peek') sfx.play('flip')
      setFlip(f)
      return true
    },
    [ended, pos, views.length, onEnd, sfx],
  )

  // Runs after React has mounted the layers of a new flip: place them, then animate.
  useLayoutEffect(() => {
    const e = engine.current
    if (!flip) {
      // Hand the pages back to normal layout.
      for (const el of e.touched) {
        el.style.clipPath = ''
        el.style.transform = ''
        el.style.visibility = ''
      }
      e.touched.clear()
      return
    }
    const kind = e.pending
    if (!kind) return
    e.pending = null
    const fr = frame(flip)
    e.P = fr.reversed ? fr.open : fr.C
    draw(e.P)
    if (kind === 'auto') {
      animateTo(fr.reversed ? fr.C : fr.open, AUTO_MS, () => finish(true), true)
    } else if (kind === 'peek') {
      e.peek = true
      const dy = flip.corner === 'bottom' ? -46 : 46
      animateTo({ x: W - 64, y: fr.cy + dy }, 280, () => {})
    }
  }, [flip, frame, draw, animateTo, finish, W])

  useEffect(() => () => cancelAnimationFrame(engine.current.raf), [])

  // ---------- navigation API ----------
  const shake = useCallback(() => {
    setShaking(true)
    window.setTimeout(() => setShaking(false), 450)
  }, [])

  const go = (dir: 1 | -1, to?: number) => {
      const target = to ?? pos + dir
      if (dir === 1 && to === undefined && !canForward(pos)) {
        if (views[pos] && spreads[views[pos].spread]?.lockForward) shake()
        return
      }
      if (dir === -1 && to === undefined && !canBack(pos)) return
      if (reduced) {
        if (target >= views.length) {
          if (onEnd) {
            setEnded(true)
            onEnd()
          }
          return
        }
        if (target < 0) return
        sfx.play('flip')
        setPos(target)
        return
      }
      startFlip(dir, 'auto', 'bottom', target)
  }

  useImperativeHandle(ref, () => ({
    next: () => go(1),
    prev: () => go(-1),
    goToSpread: (index: number) => {
      setEnded(false)
      const target = views.findIndex((v) => v.spread === index)
      if (target < 0 || target === pos) return
      go(target > pos ? 1 : -1, target)
    },
  }))

  // Arrow keys.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || modalStack.isOpen()) return
      if (isEditableTarget(e.target) || (e.target instanceof HTMLElement && e.target.closest('[data-own-keys]'))) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        go(1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        go(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // ---------- pointer: drag, swipe, edge clicks, corner peek ----------
  const gesture = useRef({
    active: false,
    dragging: false,
    id: 0,
    x: 0,
    y: 0,
    P0: { x: 0, y: 0 } as Vec,
    lastX: 0,
    lastT: 0,
    vx: 0,
    suppressClick: false,
  })

  const local = (e: { clientX: number; clientY: number }) => {
    const r = stageRef.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || ended) return
    if (engine.current.flip && !engine.current.peek) return
    if (isEditableTarget(e.target)) return
    const g = gesture.current
    g.active = true
    g.dragging = false
    g.id = e.pointerId
    g.x = e.clientX
    g.y = e.clientY
    g.lastX = e.clientX
    g.lastT = performance.now()
    g.vx = 0
  }

  const beginDrag = (dir: 1 | -1, e: ReactPointerEvent<HTMLDivElement>) => {
    const g = gesture.current
    const eng = engine.current
    const corner = local({ clientX: g.x, clientY: g.y }).y < H / 2 ? 'top' : 'bottom'
    if (eng.peek && eng.flip?.dir === dir) {
      // Grab the corner that is already peeking.
      eng.peek = false
      cancelAnimationFrame(eng.raf)
      g.P0 = { ...eng.P }
    } else {
      if (eng.flip || !startFlip(dir, 'drag', corner)) return false
      const fr = frame({ dir, from: pos, to: pos + dir, corner })
      g.P0 = fr.reversed ? fr.open : fr.C
    }
    g.dragging = true
    g.suppressClick = true
    stageRef.current?.setPointerCapture(e.pointerId)
    return true
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const g = gesture.current
    if (g.active && !g.dragging) {
      const dx = e.clientX - g.x
      const dy = e.clientY - g.y
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        const dir: 1 | -1 = dx < 0 ? 1 : -1
        const start = local({ clientX: g.x, clientY: g.y })
        const onCorrectPage = mode === 'single' || (dir === 1 ? start.x > W : start.x < W)
        const allowed = dir === 1 ? canForward(pos) : canBack(pos)
        if (!allowed || !onCorrectPage) {
          if (dir === 1 && !allowed && views[pos] && spreads[views[pos].spread]?.lockForward) shake()
          g.active = false
          return
        }
        if (reduced) {
          g.active = false
          g.suppressClick = true
          go(dir)
          return
        }
        if (!beginDrag(dir, e)) g.active = false
      }
      return
    }
    if (g.dragging) {
      const f = engine.current.flip
      if (!f) return
      const fr = frame(f)
      const k = mode === 'single' ? 2 : 1
      const dx = (e.clientX - g.x) * k
      const dy = e.clientY - g.y
      draw({ x: g.P0.x + (fr.mirrored ? -dx : dx), y: g.P0.y + dy })
      const now = performance.now()
      const dt = Math.max(1, now - g.lastT)
      g.vx = 0.7 * g.vx + 0.3 * ((e.clientX - g.lastX) / dt)
      g.lastX = e.clientX
      g.lastT = now
      return
    }
    // Hover: peek at a corner on desktop.
    if (e.pointerType === 'mouse' && mode === 'spread' && !reduced && e.buttons === 0) updatePeek(local(e))
  }

  const onPointerUp = () => {
    const g = gesture.current
    g.active = false
    if (!g.dragging) return
    g.dragging = false
    const f = engine.current.flip
    if (!f) return
    const fr = frame(f)
    const P = engine.current.P
    // Velocity in the leaf frame: positive = towards the free edge.
    const v = (fr.mirrored ? -g.vx : g.vx) * (mode === 'single' ? 2 : 1)
    const commit = fr.reversed ? P.x > 0 || v > 0.45 : P.x < 0 || v < -0.45
    const target = commit === !fr.reversed ? fr.open : fr.C
    const remaining = Math.abs(target.x - P.x) / (2 * W)
    animateTo(target, 220 + remaining * 520, () => finish(commit))
  }

  const updatePeek = (p: Vec) => {
    const zone = 90
    const nearY = p.y < zone ? 'top' : p.y > H - zone ? 'bottom' : null
    let want: { dir: 1 | -1; corner: 'top' | 'bottom' } | null = null
    if (nearY && p.x > 2 * W - zone && canForward(pos)) want = { dir: 1, corner: nearY }
    else if (nearY && p.x < zone && canBack(pos)) want = { dir: -1, corner: nearY }
    const e = engine.current
    if (want && !e.flip) startFlip(want.dir, 'peek', want.corner)
    else if (!want && e.peek && e.flip) {
      e.peek = false
      const fr = frame(e.flip)
      animateTo(fr.C, 220, () => finish(false))
    }
  }

  const onPointerLeave = () => {
    const e = engine.current
    if (e.peek && e.flip && !gesture.current.dragging) {
      e.peek = false
      const fr = frame(e.flip)
      animateTo(fr.C, 220, () => finish(false))
    }
  }

  const onClickCapture = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (gesture.current.suppressClick) {
      gesture.current.suppressClick = false
      e.stopPropagation()
      e.preventDefault()
    }
  }

  const onClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest(INTERACTIVE)) return
    const eng = engine.current
    if (eng.peek && eng.flip) {
      // Finish the peeked turn.
      eng.peek = false
      sfx.play('flip')
      const fr = frame(eng.flip)
      animateTo(fr.open, AUTO_MS * 0.8, () => finish(true), true)
      return
    }
    if (eng.flip) return
    const p = local(e)
    const total = mode === 'spread' ? 2 * W : W
    if (p.x > total - W * 0.22) go(1)
    else if (p.x < W * 0.22) go(-1)
  }

  // ---------- render ----------
  const stageWidth = mode === 'spread' ? 2 * W : W
  const pageNumbers = views[pos]
    ? mode === 'spread'
      ? `${views[pos].spread * 2 + 1}–${views[pos].spread * 2 + 2}`
      : `${views[pos].spread * 2 + (views[pos].side === 'right' ? 2 : 1)}`
    : ''
  const castBox = flip && mode === 'spread' && flip.dir === 1 ? W : 0

  return (
    <div className="book-area" role="region" aria-roledescription="книга" aria-label={label}>
      <div className="book-fit" ref={fitRef}>
        {W > 0 && (
          <div
            className={`book book--${mode} book--${cover} ${shaking ? 'is-shaking' : ''} ${flip ? 'is-flipping' : ''}`}
            style={{ width: stageWidth, height: H }}
          >
            <div className="book__block" aria-hidden="true" />
            <div
              className="book__stage"
              ref={stageRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onPointerLeave={onPointerLeave}
              onClickCapture={onClickCapture}
              onClick={onClick}
            >
              {slots.map((slot) => (
                <PageSlot
                  key={slot.key}
                  slot={slot}
                  W={W}
                  H={H}
                  reduced={reduced}
                  slotRef={slot.layer === 'front' ? frontRef : slot.layer === 'flap' ? flapRef : undefined}
                  shadeRef={slot.layer === 'flap' ? shadeRef : undefined}
                />
              ))}
              {flip && (
                <div className="book__cast" style={{ left: castBox, width: W, height: H }} aria-hidden="true">
                  <div className="book__cast-band" ref={castRef} />
                </div>
              )}
            </div>
            {overlay?.({ width: W, height: H, mode })}
          </div>
        )}
      </div>
      <nav className="book__nav" aria-label="Страницы">
        <button className="book__nav-btn" onClick={() => go(-1)} disabled={ended || !canBack(pos)} aria-label="Предыдущая страница">
          <IconChevronLeft />
        </button>
        <span className="book__nav-label" aria-live="polite">
          {ended ? '' : `стр. ${pageNumbers}`}
        </span>
        <button className="book__nav-btn" onClick={() => go(1)} disabled={ended || !canForward(pos)} aria-label="Следующая страница">
          <IconChevronRight />
        </button>
        {mode === 'spread' && !turned && !ended && canForward(pos) && (
          <span className="book__hint">листай стрелками ← → или кликом по краю страницы</span>
        )}
      </nav>
    </div>
  )
}

interface PageSlotProps {
  slot: Slot
  W: number
  H: number
  reduced: boolean
  slotRef?: Ref<HTMLDivElement>
  shadeRef?: Ref<HTMLDivElement>
}

function PageSlot({ slot, W, H, reduced, slotRef, shadeRef }: PageSlotProps) {
  const style: CSSProperties = { width: W, height: H, left: slot.pos === 'right' ? W : 0 }
  const hidden = slot.layer !== 'base'
  return (
    <div
      ref={slotRef}
      className={[
        'page',
        `page--${slot.side}`,
        `page--${slot.kind}`,
        `page--${slot.layer}`,
        slot.pos === 'flap' ? 'page--flap' : '',
        reduced && slot.layer === 'base' ? 'page--fade' : '',
      ].join(' ')}
      style={style}
      aria-hidden={hidden || undefined}
      inert={hidden}
    >
      <div className="page__inner">{slot.content}</div>
      {slot.number !== undefined && <span className="page__number">{slot.number}</span>}
      {slot.layer === 'flap' && (
        <div className="page__shade" aria-hidden="true">
          <div className="page__shade-band" ref={shadeRef} />
        </div>
      )}
    </div>
  )
}
