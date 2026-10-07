// Generates soft, abstract placeholder "photos" (SVG) into public/media/placeholders.
// Replace them with real photos and update src/content/*.ts — this script is only
// needed for the demo content.
//
//   node scripts/generate-placeholders.mjs

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'media', 'placeholders')
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
  { name: 'sepia', sky: ['#5a4632', '#b99c74', '#efe0c2'], sun: '#fff6e2', hills: ['#8a6f50', '#6a5238', '#45331f'] },
  { name: 'faded', sky: ['#4f5a5c', '#a9b3a8', '#efe8d4'], sun: '#fffbea', hills: ['#7d8a7b', '#5e6a5c', '#3c463b'] },
]

// file name -> [ratio, palette index, scene, label]
const PHOTOS = [
  ['story-1a', 'square', 7, 'hills', 'story 1'],
  ['story-1b', 'portrait', 3, 'bokeh', 'story 1'],
  ['story-1c', 'landscape', 0, 'hills', 'story 1'],
  ['story-2a', 'portrait', 2, 'stars', 'story 2'],
  ['story-2b', 'square', 4, 'sea', 'story 2'],
  ['story-3a', 'landscape', 6, 'sea', 'story 3'],
  ['story-4a', 'square', 1, 'bokeh', 'story 4'],
  ['story-4b', 'portrait', 2, 'stars', 'story 4'],
  ['story-4c', 'landscape', 5, 'bokeh', 'story 4'],
  ['album-1', 'portrait', 8, 'hills', 'детское фото'],
  ['album-2', 'landscape', 9, 'sea', 'детское фото'],
  ['album-3', 'square', 8, 'bokeh', 'детское фото'],
  ['album-4', 'portrait', 9, 'sea', 'детское фото'],
  ['album-5', 'landscape', 8, 'hills', 'детское фото'],
  ['album-6', 'portrait', 9, 'hills', 'детское фото'],
  ['album-7', 'square', 8, 'stars', 'детское фото'],
  ['album-8', 'landscape', 9, 'bokeh', 'детское фото'],
  ['moti-1', 'portrait', 7, 'hills', 'motivation'],
  ['moti-2', 'landscape', 6, 'sea', 'motivation'],
  ['moti-3', 'square', 0, 'hills', 'motivation'],
  ['moti-4', 'portrait', 4, 'sea', 'motivation'],
]

// Avatars for the tournament: file name -> [background colours]
const AVATARS = [
  ['girl-1', '#ff2bd6', '#7a2bff'],
  ['girl-2', '#00e5ff', '#2b5bff'],
  ['girl-3', '#ffb800', '#ff2b6b'],
  ['girl-4', '#a6ff00', '#00b38f'],
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

function svgFor([name, ratioKey, paletteIndex, scene, label]) {
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
  parts.push(
    `<text x="${f(w * 0.05)}" y="${f(h - h * 0.05)}" font-family="ui-monospace, Menlo, monospace" font-size="${f(Math.min(w, h) * 0.024)}" letter-spacing="4" fill="#fff" opacity="0.6">ЗАГЛУШКА · ${label.toUpperCase()}</text>`,
  )

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">\n${parts.join('\n')}\n</svg>\n`
}

function avatarFor([, a, b]) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
<radialGradient id="v" cx="0.5" cy="0.35" r="0.8"><stop offset="0.5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.45"/></radialGradient></defs>
<rect width="400" height="400" fill="url(#g)"/>
<circle cx="200" cy="165" r="78" fill="#0b0d1a" opacity="0.55"/>
<path d="M60 400c10-95 70-150 140-150s130 55 140 150z" fill="#0b0d1a" opacity="0.55"/>
<path d="M118 170c-6-70 40-112 86-112s92 40 80 118c-16-40-40-58-82-58s-66 20-84 52z" fill="#0b0d1a" opacity="0.35"/>
<rect width="400" height="400" fill="url(#v)"/>
<text x="200" y="378" text-anchor="middle" font-family="ui-monospace, Menlo, monospace" font-size="20" letter-spacing="4" fill="#fff" opacity="0.7">ФОТО</text>
</svg>
`
}

for (const photo of PHOTOS) writeFileSync(join(outDir, `${photo[0]}.svg`), svgFor(photo))
for (const avatar of AVATARS) writeFileSync(join(outDir, `${avatar[0]}.svg`), avatarFor(avatar))

console.log(`Generated ${PHOTOS.length + AVATARS.length} placeholders in ${outDir}`)
