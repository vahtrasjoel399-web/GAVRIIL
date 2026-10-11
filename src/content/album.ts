import type { Photo, VideoContent } from './types'

// Part 3, the finale: the album — photos and videos, no captions and no stories. It opens when
// the lock does, and later visits open it right away. The photos are laid out by themselves, three
// or four to a page (src/lib/albumLayout.ts); a click opens one full screen. Every video gets its
// own page. The last page is the birthday wish.
// Photos live in /public/media/photos/gavriil, videos (with poster frames) in
// /public/media/video/album. `ratio` is width / height of the file.

const ph = (file: string, alt: string, ratio: number): Photo => ({
  src: `/media/photos/gavriil/${file}.jpg`,
  alt,
  ratio,
})

const WIDE = 3 / 2
const LANDSCAPE = 4 / 3
const PORTRAIT = 3 / 4
const TALL = 2 / 3
const PHONE = 9 / 16

/** A vertical phone clip. */
const clip = (file: string): VideoContent => ({
  src: `/media/video/album/${file}.mp4`,
  poster: `/media/video/album/${file}.jpg`,
  ratio: PHONE,
})

export const album = {
  title: 'Альбом Гавриила',
  epigraph: 'Здесь нет историй. Только ты — маленький, смешной и очень милый.',
  /** In album order, the youngest first. */
  photos: [
    ph('22', 'Малыш за столом показывает рожки', WIDE),
    ph('23', 'Двое малышей в воде у берега', WIDE),
    ph('25', 'Малыш в шапке и девушка рядом', WIDE),
    ph('27', 'Мальчик на берегу моря держит руки на голове', WIDE),
    ph('24', 'Мальчик у коляски с малышкой', PHONE),
    ph('28', 'Четверо ребят во дворе', TALL),
    ph('26', 'Мальчик в жилетке с бабочкой', TALL),
    ph('02', 'Мальчику завязывают шнурки перед выступлением', PHONE),
    ph('01', 'Мальчик в костюме с бабочкой у ёлки', WIDE),
    ph('03', 'Дети в костюмах на выступлении', WIDE),
    ph('04', 'Мальчик в полосатой шапке в машине', PHONE),
    ph('05', 'Мальчик в красной толстовке', PORTRAIT),
    ph('06', 'Ребята на скамейке', LANDSCAPE),
    ph('08', 'Дети поют в микрофоны', WIDE),
    ph('07', 'Двое в обнимку на прогулке', TALL),
    ph('09', 'Мальчик в полосатой кофте с номером 56', TALL),
    ph('10', 'Ребята у школы', LANDSCAPE),
    ph('12', 'Мальчик смеётся, лёжа в снегу', WIDE),
    ph('29', 'Компания на диване', LANDSCAPE),
    ph('21', 'Компания на траве', WIDE),
    ph('11', 'Ребята в кафе за столом', PORTRAIT),
    ph('13', 'Мальчик рядом с курсантом в форме', WIDE),
    ph('17', 'Компания на стадионе', LANDSCAPE),
    ph('30', 'Футбольная команда на площадке', LANDSCAPE),
    ph('31', 'Компания с мячом зимним вечером', WIDE),
    ph('14', 'Катание на ледянках', PORTRAIT),
    ph('15', 'Двое в футболках играют в приставку', PORTRAIT),
    ph('16', 'Трое ребят в школьной форме', PORTRAIT),
    ph('18', 'Игра в футбол на поле', WIDE),
    ph('19', 'Парень с краской на щеке', PORTRAIT),
    ph('20', 'Двое в белых рубашках', TALL),
    ph('32', 'Трое ребят в рубашках у флагов', PORTRAIT),
    ph('33', 'Двое ребят у круглого озера', PORTRAIT),
    ph('34', 'Пятеро друзей на скамейке у деревянного дома', LANDSCAPE),
    ph('35', 'Четверо друзей у пианино', LANDSCAPE),
    ph('36', 'Пятеро друзей на конференции', PHONE),
  ] satisfies Photo[],
  videos: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13'].map(clip),
  ending: 'С днём рождения, Гавриил!',
  endingNote: 'Этот альбом останется здесь. Возвращайся, когда захочешь.',
  signature: 'Твои братки',
  restart: 'Пройти всё сначала',
}
