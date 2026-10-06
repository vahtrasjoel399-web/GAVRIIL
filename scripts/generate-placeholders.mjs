// Generates soft, abstract placeholder "photos" (SVG) into public/media/photos.
// Replace them with real photos and update src/content/*.ts — this script is only
// needed for the demo content.
//
//   node scripts/generate-placeholders.mjs

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'media', 'photos')
mkdirSync(outDir, { recursive: true })

const RATIOS = {
  portrait: [1200, 1500],
  landscape: [1500, 1000],
  square: [1300, 1300],
  wide: [1600, 900],
}

const PALETTES = [
  { name: 'dawn', sky: ['#2b1d4a', '#f0a3a0', '#ffd9b0'], sun: '#fff1d6', hills: ['#6b3f6e', '#4a2b57', '#2a1a3a'] },
  { name: 'dusk', sky: ['#14183a', '#5b3b8c', '#f08a6c'], sun: '#ffd0a1', hills: ['#3d2a66', '#271c47', '#140f2b'] },
  { name: 'night', sky: ['#05081c', '#122451', '#2f4f8f'], sun: '#e8f0ff', hills: ['#1a2a55', '#101b3b', '#070c21'] },
  { name: 'mint', sky: ['#0f3a3f', '#5fb7a6', '#e6f4d8'], sun: '#fffbe8', hills: ['#2f7d71', '#1d5752', '#103633'] },
  { name: 'peach', sky: ['#4a1f2e', '#ef8f7a', '#ffe4c2'], sun: '#fff6e5', hills: ['#a14d5a', '#6e2f44', '#3d1a2b'] },
  { name: 'lavender', sky: ['#24193f', '#9b85d6', '#f3dff3'], sun: '#fff7ff', hills: ['#6c55a8', '#463478', '#251a46'] },
  { name: 'ocean', sky: ['#061a2e', '#1f6f9c', '#a8e1f0'], sun: '#f4fdff', hills: ['#1a587d', '#0f3a57', '#061f33'] },
  { name: 'golden', sky: ['#3a2108', '#d98e32', '#ffe7a8'], sun: '#fffae6', hills: ['#a0601d', '#6b3d12', '#3a1f08'] },
]

// file name -> [ratio, palette index, scene]
const PHOTOS = [
  ['2000-a', 'portrait', 0, 'hills'],
  ['2000-b', 'landscape', 5, 'bokeh'],
  ['2001-a', 'landscape', 4, 'hills'],
  ['2001-b', 'portrait', 7, 'bokeh'],
  ['2002-a', 'square', 3, 'hills'],
  ['2003-a', 'landscape', 7, 'sea'],
  ['2003-b', 'portrait', 4, 'hills'],
  ['2003-c', 'square', 1, 'bokeh'],
  ['2005-a', 'landscape', 3, 'hills'],
  ['2005-b', 'portrait', 7, 'sea'],
  ['2007-a', 'portrait', 6, 'hills'],
  ['2007-b', 'landscape', 0, 'bokeh'],
  ['2010-a', 'square', 2, 'stars'],
  ['2010-b', 'portrait', 5, 'hills'],
  ['2013-a', 'landscape', 4, 'sea'],
  ['2013-b', 'portrait', 1, 'hills'],
  ['2013-c', 'square', 7, 'bokeh'],
  ['2016-a', 'landscape', 2, 'stars'],
  ['2016-b', 'portrait', 6, 'sea'],
  ['2018-a', 'portrait', 5, 'bokeh'],
  ['2018-b', 'landscape', 1, 'hills'],
  ['2020-a', 'landscape', 3, 'sea'],
  ['2020-b', 'square', 0, 'hills'],
  ['2022-a', 'wide', 6, 'sea'],
  ['2022-b', 'portrait', 7, 'hills'],
  ['2022-c', 'square', 4, 'bokeh'],
  ['2024-a', 'landscape', 1, 'stars'],
  ['2024-b', 'portrait', 3, 'hills'],
  ['2026-a', 'portrait', 0, 'bokeh'],
  ['2026-b', 'landscape', 5, 'hills'],
  ['extra-a', 'portrait', 2, 'stars'],
  ['extra-b', 'landscape', 7, 'hills'],
  ['extra-c', 'square', 5, 'sea'],
  ['extra-d', 'portrait', 4, 'bokeh'],
  ['extra-e', 'landscape', 6, 'stars'],
  ['extra-f', 'square', 3, 'bokeh'],
  ['gift-photo', 'landscape', 0, 'hills'],
]

function rng(seed) {
  let s = 0
  for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const f = (n) => Math.round(n * 10) / 10

function hillPath(w, h, baseY, amp, freq, phase, r) {
  const steps = 48
  let d = `M0 ${h} L0 ${f(baseY)}`
  for (let i = 0; i <= steps; i++) {
    const x = (w / steps) * i
    const y =
      baseY +
      Math.sin((i / steps) * Math.PI * freq + phase) * amp +
      Math.sin((i / steps) * Math.PI * freq * 2.3 + phase * 1.7) * amp * 0.35 +
      (r() - 0.5) * amp * 0.08
    d += ` L${f(x)} ${f(y)}`
  }
  return d + ` L${w} ${h} Z`
}

function svgFor([name, ratioKey, paletteIndex, scene]) {
  const [w, h] = RATIOS[ratioKey]
  const p = PALETTES[paletteIndex]
  const r = rng(name)
  const sunX = w * (0.25 + r() * 0.5)
  const sunY = h * (scene === 'sea' ? 0.52 : 0.3 + r() * 0.18)
  const sunR = Math.min(w, h) * (0.07 + r() * 0.05)
  const parts = []

  parts.push(`<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${p.sky[0]}"/>
    <stop offset="0.62" stop-color="${p.sky[1]}"/>
    <stop offset="1" stop-color="${p.sky[2]}"/>
  </linearGradient>
  <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="${p.sun}" stop-opacity="0.85"/>
    <stop offset="0.35" stop-color="${p.sun}" stop-opacity="0.25"/>
    <stop offset="1" stop-color="${p.sun}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="vig" cx="0.5" cy="0.45" r="0.75">
    <stop offset="0.55" stop-color="#000" stop-opacity="0"/>
    <stop offset="1" stop-color="#000" stop-opacity="0.45"/>
  </radialGradient>
  <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${p.hills[0]}"/>
    <stop offset="1" stop-color="${p.hills[2]}"/>
  </linearGradient>
</defs>`)
  parts.push(`<rect width="${w}" height="${h}" fill="url(#sky)"/>`)

  if (scene === 'stars' || paletteIndex === 2 || paletteIndex === 1) {
    for (let i = 0; i < 90; i++) {
      const x = r() * w
      const y = r() * h * 0.6
      const s = r() * 1.8 + 0.4
      parts.push(`<circle cx="${f(x)}" cy="${f(y)}" r="${f(s)}" fill="#fff" opacity="${f(0.25 + r() * 0.6)}"/>`)
    }
  }

  parts.push(`<circle cx="${f(sunX)}" cy="${f(sunY)}" r="${f(sunR * 5)}" fill="url(#glow)"/>`)
  parts.push(`<circle cx="${f(sunX)}" cy="${f(sunY)}" r="${f(sunR)}" fill="${p.sun}" opacity="0.95"/>`)

  if (scene === 'sea') {
    const horizon = h * 0.6
    parts.push(`<rect y="${f(horizon)}" width="${w}" height="${f(h - horizon)}" fill="url(#sea)"/>`)
    for (let i = 0; i < 26; i++) {
      const y = horizon + (h - horizon) * (i / 26) ** 1.4
      const len = sunR * (0.6 + (i / 26) * 3) * (0.6 + r() * 0.8)
      parts.push(
        `<rect x="${f(sunX - len / 2)}" y="${f(y)}" width="${f(len)}" height="${f(2 + i * 0.25)}" rx="2" fill="${p.sun}" opacity="${f(0.55 - i * 0.018)}"/>`,
      )
    }
    parts.push(`<path d="${hillPath(w, h, horizon - h * 0.02, h * 0.03, 2.2, r() * 6, r)}" fill="${p.hills[1]}" opacity="0.9"/>`)
  } else {
    parts.push(`<path d="${hillPath(w, h, h * 0.62, h * 0.06, 2.4, r() * 6, r)}" fill="${p.hills[0]}"/>`)
    parts.push(`<path d="${hillPath(w, h, h * 0.74, h * 0.05, 3.1, r() * 6, r)}" fill="${p.hills[1]}"/>`)
    parts.push(`<path d="${hillPath(w, h, h * 0.86, h * 0.04, 1.7, r() * 6, r)}" fill="${p.hills[2]}"/>`)
  }

  if (scene === 'bokeh') {
    for (let i = 0; i < 18; i++) {
      const cx = r() * w
      const cy = r() * h
      const cr = Math.min(w, h) * (0.02 + r() * 0.08)
      parts.push(`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(cr)}" fill="${p.sun}" opacity="${f(0.06 + r() * 0.16)}"/>`)
    }
  }

  parts.push(`<rect width="${w}" height="${h}" fill="url(#vig)"/>`)
  const label = name.startsWith('20') ? name.slice(0, 4) : 'memory'
  parts.push(
    `<text x="${f(w * 0.05)}" y="${f(h - h * 0.05)}" font-family="ui-monospace, Menlo, monospace" font-size="${f(Math.min(w, h) * 0.024)}" letter-spacing="4" fill="#fff" opacity="0.55">PLACEHOLDER · ${label.toUpperCase()}</text>`,
  )

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">\n${parts.join('\n')}\n</svg>\n`
}

for (const photo of PHOTOS) {
  writeFileSync(join(outDir, `${photo[0]}.svg`), svgFor(photo))
}

console.log(`Generated ${PHOTOS.length} placeholder photos in ${outDir}`)
