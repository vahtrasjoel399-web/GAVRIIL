import confetti from 'canvas-confetti'

const COLORS = ['#f1c88a', '#f0a3a0', '#b39ddb', '#7fc8a9', '#fff4e0', '#7ea6e0']
const Z = 120

let reduced = false

/** Mirrors the user's motion preference — confetti is skipped entirely when motion is reduced. */
export function setConfettiReduced(value: boolean) {
  reduced = value
  if (value) confetti.reset()
}

export type Origin = { x: number; y: number }

/** Viewport-relative centre of an element, in the 0..1 coordinates canvas-confetti expects. */
export function originOf(el: Element | null): Origin {
  if (!el) return { x: 0.5, y: 0.5 }
  const r = el.getBoundingClientRect()
  return {
    x: (r.left + r.width / 2) / window.innerWidth,
    y: (r.top + r.height / 2) / window.innerHeight,
  }
}

export function burst(origin: Origin = { x: 0.5, y: 0.6 }, scale = 1) {
  if (reduced) return
  confetti({
    particleCount: Math.round(90 * scale),
    spread: 75,
    startVelocity: 38 * Math.sqrt(scale),
    origin,
    colors: COLORS,
    scalar: 0.95,
    ticks: 240,
    zIndex: Z,
  })
}

/** Two cannons from the bottom corners — for milestones. */
export function sideCannons() {
  if (reduced) return
  const end = Date.now() + 900
  const frame = () => {
    confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0, y: 0.85 }, colors: COLORS, zIndex: Z })
    confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1, y: 0.85 }, colors: COLORS, zIndex: Z })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
}

/** A short firework show — for the finale and "all gifts opened". */
export function fireworks(duration = 2600) {
  if (reduced) return
  const end = Date.now() + duration
  const tick = () => {
    const left = end - Date.now()
    if (left <= 0) return
    confetti({
      particleCount: 40,
      startVelocity: 30,
      spread: 360,
      ticks: 70,
      gravity: 0.9,
      origin: { x: 0.15 + Math.random() * 0.7, y: 0.15 + Math.random() * 0.35 },
      colors: COLORS,
      zIndex: Z,
    })
    window.setTimeout(tick, 260)
  }
  tick()
}

let heartShape: confetti.Shape | null = null

export function hearts(origin: Origin = { x: 0.5, y: 0.5 }) {
  if (reduced) return
  heartShape ??= confetti.shapeFromText({ text: '❤', scalar: 2, color: '#f0a3a0' })
  const sparkle = confetti.shapeFromText({ text: '✦', scalar: 2, color: '#f1c88a' })
  confetti({
    particleCount: 60,
    spread: 100,
    startVelocity: 32,
    origin,
    shapes: [heartShape, sparkle],
    scalar: 2,
    ticks: 260,
    zIndex: Z,
  })
}
