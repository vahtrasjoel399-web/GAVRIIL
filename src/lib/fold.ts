// Geometry of a page being turned by its corner.
//
// Everything is computed in a "leaf frame": the turning page occupies
// [0, W] × [0, H], the spine is the line x = 0 and the page turns towards
// negative x. The dragged corner C sits on the free edge (x = W); P is where
// that corner is now. The fold line is the perpendicular bisector of C and P:
// the part of the page on C's side is lifted and mirrored across that line.

export interface Vec {
  x: number
  y: number
}

/** 2D affine matrix in CSS order: x' = a·x + c·y + e, y' = b·x + d·y + f. */
export type Matrix = [number, number, number, number, number, number]

export const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0]

export const translate = (x: number, y: number): Matrix => [1, 0, 0, 1, x, y]

/** Mirror across the vertical line x = W/2: x → W − x. */
export const mirrorX = (W: number): Matrix => [-1, 0, 0, 1, W, 0]

/** m1 ∘ m2 — apply m2 first, then m1. */
export function multiply(m1: Matrix, m2: Matrix): Matrix {
  return [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
  ]
}

export function apply(m: Matrix, p: Vec): Vec {
  return { x: m[0] * p.x + m[2] * p.y + m[4], y: m[1] * p.x + m[3] * p.y + m[5] }
}

/** Keep the half of a convex polygon where (X − M)·n ≤ 0 (sign = -1) or ≥ 0 (sign = 1). */
function clipByLine(poly: Vec[], M: Vec, n: Vec, sign: 1 | -1): Vec[] {
  const side = (p: Vec) => sign * ((p.x - M.x) * n.x + (p.y - M.y) * n.y)
  const out: Vec[] = []
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]
    const b = poly[(i + 1) % poly.length]
    const sa = side(a)
    const sb = side(b)
    if (sa >= 0) out.push(a)
    if ((sa >= 0) !== (sb >= 0)) {
      const t = sa / (sa - sb)
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
    }
  }
  return out
}

/**
 * A sheet is fixed at the spine, so its corner can't travel anywhere:
 * it stays within one page width of the spine corner on the same edge
 * and within one diagonal of the opposite spine corner.
 */
export function constrainCorner(P: Vec, W: number, H: number, cornerY: number): Vec {
  let p = { ...P }
  const near = { x: 0, y: cornerY }
  const far = { x: 0, y: H - cornerY }
  let d = Math.hypot(p.x - near.x, p.y - near.y)
  if (d > W) p = { x: near.x + ((p.x - near.x) * W) / d, y: near.y + ((p.y - near.y) * W) / d }
  const diag = Math.hypot(W, H)
  d = Math.hypot(p.x - far.x, p.y - far.y)
  if (d > diag) p = { x: far.x + ((p.x - far.x) * diag) / d, y: far.y + ((p.y - far.y) * diag) / d }
  return p
}

export interface Fold {
  /** Still-flat part of the turning page (leaf frame). */
  front: Vec[]
  /** Lifted part of the page, before mirroring (leaf frame). */
  folded: Vec[]
  /** Reflection across the fold line (leaf frame → leaf frame). */
  reflect: Matrix
  /** A point on the fold line and the unit normal pointing to the corner. */
  M: Vec
  n: Vec
  /** |C − P|: how far the corner has travelled (0 … 2W). */
  depth: number
}

export function computeFold(W: number, H: number, C: Vec, P: Vec): Fold | null {
  const dx = C.x - P.x
  const dy = C.y - P.y
  const depth = Math.hypot(dx, dy)
  if (depth < 0.5) return null
  const n = { x: dx / depth, y: dy / depth }
  const M = { x: (C.x + P.x) / 2, y: (C.y + P.y) / 2 }
  const rect = [
    { x: 0, y: 0 },
    { x: W, y: 0 },
    { x: W, y: H },
    { x: 0, y: H },
  ]
  const k = M.x * n.x + M.y * n.y
  return {
    front: clipByLine(rect, M, n, -1),
    folded: clipByLine(rect, M, n, 1),
    reflect: [1 - 2 * n.x * n.x, -2 * n.x * n.y, -2 * n.x * n.y, 1 - 2 * n.y * n.y, 2 * k * n.x, 2 * k * n.y],
    M,
    n,
    depth,
  }
}

/**
 * Matrix that lays a band (long thin div, its top edge on the fold line) so it
 * extends from the line along the normal: local x runs along the fold, local y
 * goes into the side n points to.
 */
export function bandMatrix(M: Vec, n: Vec, length: number): Matrix {
  const t = { x: n.y, y: -n.x }
  return multiply(multiply(translate(M.x, M.y), [t.x, t.y, n.x, n.y, 0, 0]), translate(-length / 2, 0))
}

export const cssMatrix = (m: Matrix) => `matrix(${m.map((v) => v.toFixed(4)).join(',')})`

export function cssPolygon(points: Vec[]) {
  if (points.length < 3) return 'polygon(0 0, 0 0, 0 0)'
  return `polygon(${points.map((p) => `${p.x.toFixed(2)}px ${p.y.toFixed(2)}px`).join(',')})`
}
