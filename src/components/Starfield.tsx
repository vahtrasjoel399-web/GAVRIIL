import { useEffect, useRef } from 'react'
import { usePreferences } from '../context/PreferencesContext'

interface Star {
  x: number
  y: number
  r: number
  depth: number
  phase: number
  speed: number
}

interface Meteor {
  x: number
  y: number
  vx: number
  vy: number
  life: number
}

/** Canvas starfield: twinkles, drifts with scroll depth, occasional shooting star. Static when motion is reduced. */
export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null)
  const { reduced } = usePreferences()

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let stars: Star[] = []
    let meteor: Meteor | null = null
    let width = 0
    let height = 0
    let raf = 0
    let last = performance.now()
    let nextMeteor = last + 4000

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round(Math.min(220, (width * height) / 7000))
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.2 + 0.25,
        depth: Math.random() * 0.8 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 1.2 + 0.4,
      }))
    }

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height)
      const scroll = reduced ? 0 : window.scrollY
      for (const s of stars) {
        const y = (((s.y - scroll * s.depth * 0.08) % height) + height) % height
        const twinkle = reduced ? 0.7 : 0.55 + Math.sin(time * 0.001 * s.speed + s.phase) * 0.45
        ctx.globalAlpha = twinkle * (0.35 + s.depth * 0.65)
        ctx.fillStyle = '#fff6e6'
        ctx.beginPath()
        ctx.arc(s.x, y, s.r * (0.6 + s.depth * 0.6), 0, Math.PI * 2)
        ctx.fill()
      }
      if (meteor) {
        const tail = 16
        const grad = ctx.createLinearGradient(meteor.x, meteor.y, meteor.x - meteor.vx * tail, meteor.y - meteor.vy * tail)
        grad.addColorStop(0, 'rgba(255,240,215,0.9)')
        grad.addColorStop(1, 'rgba(255,240,215,0)')
        ctx.globalAlpha = Math.min(1, meteor.life)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.4
        ctx.beginPath()
        ctx.moveTo(meteor.x, meteor.y)
        ctx.lineTo(meteor.x - meteor.vx * tail, meteor.y - meteor.vy * tail)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }

    const loop = (time: number) => {
      const dt = Math.min(64, time - last) / 16.67
      last = time
      if (!meteor && time > nextMeteor) {
        meteor = { x: Math.random() * width * 0.7 + width * 0.2, y: Math.random() * height * 0.35, vx: -7, vy: 3.2, life: 1.4 }
      }
      if (meteor) {
        meteor.x += meteor.vx * dt
        meteor.y += meteor.vy * dt
        meteor.life -= 0.02 * dt
        if (meteor.life <= 0) {
          meteor = null
          nextMeteor = time + 6000 + Math.random() * 9000
        }
      }
      draw(time)
      raf = requestAnimationFrame(loop)
    }

    resize()
    const onResize = () => {
      resize()
      if (reduced) draw(0)
    }
    window.addEventListener('resize', onResize)

    const onVisibility = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden && !reduced) {
        last = performance.now()
        raf = requestAnimationFrame(loop)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    if (reduced) draw(0)
    else raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reduced])

  return <canvas ref={ref} className="starfield" />
}
