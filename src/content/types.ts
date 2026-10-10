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
  wrap: string
  ribbon: string
}

// ---------- 5. Album ----------

/** One page of the album: one or two photos, or a video. */
export type AlbumPage =
  | { kind: 'photos'; photos: Photo[]; note?: string }
  | { kind: 'video'; video: VideoContent; caption?: string; note?: string }

// ---------- 3–4. Tournament ----------

export interface Contender {
  id: string
  name: string
  /** Second line under the name. */
  nickname?: string
  /** Optional photo; without it the initial is shown in a coloured circle. */
  photo?: string
}

// ---------- media ----------

export interface VideoContent {
  src: string
  /** Optional extra sources (e.g. webm) for wider browser support. */
  sources?: { src: string; type: string }[]
  poster?: string
  title: string
  /** Width / height of the video. Default 16 / 9; vertical phone clips are 9 / 16. */
  ratio?: number
  chapters?: { time: number; label: string }[]
}

export interface MusicTrack {
  src: string
  title: string
}

export interface MusicContent {
  /** Played one after another in a loop. */
  tracks: MusicTrack[]
  /** 0..1 */
  volume: number
}
