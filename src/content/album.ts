import type { AlbumPage, Photo } from './types'

// Part 5, the finale: the album — cute photos and videos, no stories. It opens after the
// casino, and later visits open it right away. One page holds one or two photos (or a video);
// two pages make a spread. The last page is the birthday wish.
// Photos live in /public/media/photos/gavriil, videos (with poster frames) in
// /public/media/video/album. `ratio` is width / height of the file.

const ph = (file: string, alt: string, caption: string, ratio: number): Photo => ({
  src: `/media/photos/gavriil/${file}.jpg`,
  alt,
  caption,
  ratio,
})

const WIDE = 3 / 2
const LANDSCAPE = 4 / 3
const PORTRAIT = 3 / 4
const TALL = 2 / 3
const PHONE = 9 / 16

/** A vertical phone clip; the title is written over its poster. */
const clip = (file: string, title: string): AlbumPage => ({
  kind: 'video',
  video: { src: `/media/video/album/${file}.mp4`, poster: `/media/video/album/${file}.jpg`, title, ratio: PHONE },
})

export const album = {
  title: 'Альбом Гавриила',
  epigraph: 'Здесь нет историй. Только ты — маленький, смешной и очень милый.',
  pages: [
    {
      kind: 'photos',
      photos: [
        ph('01', 'Маленький Гавриил в костюме с бабочкой у ёлки', 'джентльмен в бабочке', WIDE),
        ph('03', 'Гавриил в костюме среди детей на выступлении', 'самый серьёзный в хоре', WIDE),
      ],
      note: 'костюм сидит лучше, чем сейчас',
    },
    { kind: 'photos', photos: [ph('02', 'Маленькому Гавриилу завязывают шнурки перед выступлением', 'звезда готовится к выходу', PHONE)] },
    {
      kind: 'photos',
      photos: [
        ph('04', 'Гавриил в полосатой шапке в машине', 'шапка на вырост', PHONE),
        ph('05', 'Гавриил в красной толстовке с Молнией Маккуином', 'Кчау!', PORTRAIT),
      ],
    },
    {
      kind: 'photos',
      photos: [
        ph('06', 'Гавриил на скамейке со старшими', 'скамейка запасных', LANDSCAPE),
        ph('08', 'Гавриил поёт в микрофон', 'первый концерт', WIDE),
      ],
    },
    { kind: 'photos', photos: [ph('07', 'Гавриил в голубой куртке в обнимку', 'в обнимку', TALL)], note: 'взгляд: «я тут главный»' },
    { kind: 'photos', photos: [ph('09', 'Гавриил в полосатой кофте с номером 56', 'фирменный серьёзный вид', TALL)] },
    {
      kind: 'photos',
      photos: [
        ph('10', 'Гавриил с друзьями у школы', '1 сентября', LANDSCAPE),
        ph('12', 'Гавриил смеётся, лёжа в снегу', 'снег — его стихия', WIDE),
      ],
    },
    { kind: 'photos', photos: [ph('21', 'Гавриил с друзьями на траве показывает класс', 'оценка: класс', WIDE)] },
    { kind: 'photos', photos: [ph('11', 'Гавриил в кафе за столом', 'сосредоточен на еде', PORTRAIT)] },
    {
      kind: 'photos',
      photos: [
        ph('13', 'Гавриил улыбается рядом с курсантом в форме', 'парадный день', WIDE),
        ph('17', 'Гавриил с компанией на стадионе', 'болеем!', LANDSCAPE),
      ],
    },
    {
      kind: 'photos',
      photos: [
        ph('14', 'Гавриил катается на ледянках', 'трасса открыта', PORTRAIT),
        ph('15', 'Гавриил в футболке с номером 23 играет в приставку', '№23. матч века', PORTRAIT),
      ],
      note: 'зимой — горка, вечером — FIFA',
    },
    { kind: 'photos', photos: [ph('16', 'Гавриил в школьной форме', 'снова в школу', PORTRAIT)] },
    {
      kind: 'photos',
      photos: [
        ph('18', 'Гавриил играет в футбол', 'мяч мой', WIDE),
        ph('19', 'Гавриил с краской на щеке', 'create something out of nothing', PORTRAIT),
      ],
    },
    { kind: 'photos', photos: [ph('20', 'Гавриил в белой рубашке', 'почти взрослый', TALL)], note: 'когда успел?' },
    clip('01', '№96 выходит на поле'),
    clip('02', 'в игре'),
    clip('03', 'дежурный по столу'),
    clip('04', 'селфи-режим'),
    clip('05', 'домашний концерт'),
    clip('06', 'очень важное совещание'),
    clip('07', 'лучший аниматор'),
    clip('08', 'маленькими шажками'),
    clip('09', 'фестиваль'),
    clip('10', 'ночной перекус'),
    clip('11', 'отдыхает как король'),
    clip('12', 'в дороге'),
    clip('13', 'и дальше — вместе'),
  ] satisfies AlbumPage[],
  ending: 'С днём рождения, Гавриил!',
  endingNote: 'Этот альбом останется здесь. Возвращайся, когда захочешь.',
  signature: 'Твоя группа',
  restart: 'Пройти всё сначала',
}
