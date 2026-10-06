// Page sections in order. `accent` tints the background while the section is on screen
// (the timeline uses the accent of the current chapter instead).

export const SECTIONS = [
  { id: 'start', label: 'Начало', accent: '#f1c88a' },
  { id: 'timeline', label: 'Хроника', accent: null },
  { id: 'film', label: 'Кино', accent: '#7ea6e0' },
  { id: 'memories', label: 'Воспоминания', accent: '#f0a3a0' },
  { id: 'gallery', label: 'Галерея', accent: '#b39ddb' },
  { id: 'gifts', label: 'Подарки', accent: '#e98a9a' },
  { id: 'finale', label: 'Финал', accent: '#f1c88a' },
] as const

export type SectionId = (typeof SECTIONS)[number]['id']

export const chapterId = (year: number) => `year-${year}`
