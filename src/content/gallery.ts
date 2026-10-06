import type { GalleryPhoto } from './types'

// Extra photos for the gallery. All timeline photos are added automatically,
// so list only the ones that don't belong to a specific chapter.

export const galleryExtras: GalleryPhoto[] = [
  { src: '/media/photos/extra-a.svg', ratio: 4 / 5, alt: 'Звёздная ночь', caption: 'Ночь на даче', year: 2011 },
  { src: '/media/photos/extra-b.svg', ratio: 3 / 2, alt: 'Золотой закат над холмами', caption: 'Дорога домой', year: 2015 },
  { src: '/media/photos/extra-c.svg', ratio: 1, alt: 'Сиреневое море', caption: 'Тишина', year: 2019 },
  { src: '/media/photos/extra-d.svg', ratio: 4 / 5, alt: 'Огни в персиковом небе', caption: 'Праздник во дворе', year: 2009 },
  { src: '/media/photos/extra-e.svg', ratio: 3 / 2, alt: 'Ночное небо над морем', caption: 'Август', year: 2021 },
  { src: '/media/photos/extra-f.svg', ratio: 1, alt: 'Мятные огни', caption: 'Зимний вечер', year: 2025 },
]
