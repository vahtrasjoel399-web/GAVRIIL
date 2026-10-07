// Shapes of all replaceable content. Every text, photo and number of the site
// lives in src/content/*.ts — components only read from here.

export interface Photo {
  /** Path inside /public (e.g. "/media/photos/dacha.jpg") or a full URL. */
  src: string
  /** Short description for screen readers. */
  alt: string
  /** Handwritten caption under the photo. */
  caption?: string
  /** Width / height. Reserves space before the image loads. Default 1 (square). */
  ratio?: number
}

// ---------- 1. Boxes ----------

export interface GiftBox {
  /** Caption under the closed box. */
  caption: string
  /** Note found inside after opening. */
  note: string
  /** Button under the note — goes into the next box (on the last box — takes the key). */
  button: string
  wrap: string
  ribbon: string
}

// ---------- 3. Chronicle ----------

export interface Story {
  id: string
  title: string
  /** Free-form date label: "Лето 2021", "14 февраля". */
  date: string
  /** Who tells the story. */
  narrator: string
  paragraphs: string[]
  /** 1–3 photos, shown as polaroids on the left page. */
  photos: Photo[]
  /** Optional group meme scribbled on the margin. */
  meme?: string
}

// ---------- 4–5. Tournament ----------

export interface Contender {
  id: string
  name: string
  /** Second line under the name. */
  nickname?: string
  photo: string
  /** Decimal odds, e.g. 1.85. */
  odds: number
  /** Funny stats: label → value. */
  stats: { label: string; value: string }[]
}

// ---------- 6. Choice sections ----------

export interface FriendNote {
  from: string
  text: string
}

export type MotivationPage =
  | { kind: 'words'; title?: string; notes: FriendNote[] }
  | { kind: 'photos'; title?: string; photos: Photo[] }
  | { kind: 'video'; title?: string; video: VideoContent; caption?: string }

export interface VideoContent {
  src: string
  /** Optional extra sources (e.g. webm) for wider browser support. */
  sources?: { src: string; type: string }[]
  poster?: string
  title: string
  chapters?: { time: number; label: string }[]
}

export interface MusicContent {
  src: string
  title: string
  /** 0..1 */
  volume: number
}
