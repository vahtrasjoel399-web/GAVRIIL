// Shapes of all replaceable content. Every personal detail of the site lives in
// src/content/*.ts — components only read from here.

export interface Photo {
  /** Path inside /public (e.g. "/media/photos/2005-summer.jpg") or a full URL. */
  src: string
  /** Short description for screen readers. */
  alt: string
  /** Optional caption shown under the photo and in the lightbox. */
  caption?: string
  /** Width / height. Used to reserve space before the image loads. Default 4/5. */
  ratio?: number
}

export interface Quote {
  text: string
  author?: string
}

export interface YearChapter {
  year: number
  /** Chapter headline, e.g. "Первые шаги". */
  title: string
  subtitle?: string
  /** Emoji or short symbol shown on the timeline rail. */
  icon?: string
  /** Paragraphs shown as the chapter scrolls into view. The first one is the lead. */
  story: string[]
  /** Extra paragraphs revealed by the "Читать дальше" button. */
  more?: string[]
  quote?: Quote
  photos?: Photo[]
  /** Highlight badge. With `celebrate: true` confetti fires the first time the chapter is reached. */
  milestone?: { label: string; celebrate?: boolean }
  /** Accent colour of the chapter (any CSS colour). The whole page tints towards it. */
  accent?: string
}

export interface GalleryPhoto extends Photo {
  /** Used by the year filter in the gallery. */
  year?: number
}

export interface Memory {
  id: string
  emoji: string
  title: string
  /** Free-form date label, e.g. "Лето 2009". */
  date: string
  /** Short teaser on the front of the card. */
  teaser: string
  /** Full story on the back of the card. */
  story: string
  accent?: string
}

export type GiftContent =
  | { kind: 'letter'; title: string; text: string; signature?: string }
  | { kind: 'coupon'; title: string; text: string; code: string; validUntil?: string }
  | { kind: 'photo'; title: string; text: string; photo: Photo }

export interface Gift {
  id: string
  /** Label on the box before opening. */
  label: string
  wrap: string
  ribbon: string
  content: GiftContent
}

export interface VideoChapter {
  /** Seconds from the start. */
  time: number
  label: string
}

export interface VideoContent {
  src: string
  /** Optional additional sources (e.g. webm) for wider browser support. */
  sources?: { src: string; type: string }[]
  poster?: string
  eyebrow: string
  title: string
  description: string
  chapters?: VideoChapter[]
}

export interface MusicContent {
  src: string
  title: string
  artist?: string
  /** 0..1 */
  volume: number
}
