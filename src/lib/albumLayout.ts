import type { Photo } from '../content'

// Lays the album photos out by themselves: they go two to a row, both the same height and
// together as wide as the page, and a page takes as many rows as still leave them a decent size.
// Lengths are in page widths (the photo area of a page is 1 wide).

/** Height of the photo area of a page; a little under the real one, so nothing overflows. */
const PAGE_HEIGHT = 1.37
/** White polaroid border above and below a photo (parts.css), and the gap between rows. */
const FRAME = 0.1
const GAP = 0.03
/** The polaroid border left and right of a photo. */
const SIDE_FRAME = 0.08
/** Two photos of a row share what is left of the page width after their borders, the gap and a little air. */
const ROW_WIDTH = 1 - 2 * SIDE_FRAME - 0.08
/** A photo left alone in its row. */
const SINGLE_WIDE_WIDTH = 0.76
const SINGLE_UPRIGHT_HEIGHT = 0.72
/** A page takes rows while they need not shrink below this, and never more than this many photos. */
const MIN_SCALE = 0.8
const MAX_PHOTOS = 6

export interface PlacedPhoto {
  photo: Photo
  /** Position in the whole album, for the full-screen viewer. */
  index: number
  /** Largest size of the photo itself: width in % of the page width, height in % of the page height. */
  width: number
  height: number
}

export interface AlbumRow {
  items: PlacedPhoto[]
}

const ratioOf = (p: Photo) => p.ratio ?? 1

/** Height of the photos in a row at full width. */
function rowHeight(row: Photo[]) {
  if (row.length > 1) return ROW_WIDTH / row.reduce((sum, p) => sum + ratioOf(p), 0)
  const ratio = ratioOf(row[0])
  return ratio < 1 ? SINGLE_UPRIGHT_HEIGHT : SINGLE_WIDE_WIDTH / ratio
}

/** Share of that height the rows get when they fill the page: under 1 they shrink to fit. */
function pageScale(rows: Photo[][]) {
  const photos = rows.reduce((sum, row) => sum + rowHeight(row), 0)
  const room = PAGE_HEIGHT - FRAME * rows.length - GAP * (rows.length - 1)
  return room / photos
}

export function albumPages(photos: Photo[]): AlbumRow[][] {
  const rows: Photo[][] = []
  for (let i = 0; i < photos.length; i += 2) rows.push(photos.slice(i, i + 2))

  // pages: fill greedily
  const pages: Photo[][][] = []
  for (const row of rows) {
    const page = pages.at(-1)
    const fits = page && page.flat().length + row.length <= MAX_PHOTOS && pageScale([...page, row]) >= MIN_SCALE
    if (page && fits) page.push(row)
    else pages.push([row])
  }

  let index = 0
  return pages.map((page) => {
    const scale = pageScale(page)
    return page.map((row) => {
      const height = rowHeight(row)
      return {
        items: row.map((photo) => ({
          photo,
          index: index++,
          width: height * ratioOf(photo) * 100,
          height: ((height * scale) / PAGE_HEIGHT) * 100,
        })),
      }
    })
  })
}
