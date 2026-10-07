import type { MotivationPage, Photo } from './types'

// Part 6: the page Gavriil will come back to, and its two sections.
// Sections have their own addresses: …/#gavriil and …/#motivation.

const ph = (file: string, alt: string, caption?: string, ratio = 1): Photo => ({
  src: `/media/placeholders/${file}.svg`,
  alt,
  caption,
  ratio,
})

export const choice = {
  title: 'Ну что, Гавриил?',
  letter: [
    'Ты прошёл всё: коробки, замок, хроники и даже турнир.',
    'Эта страница останется здесь. Возвращайся, когда захочешь, — мы всегда рядом.',
  ],
  signature: 'Твоя группа',
  restart: 'Пройти всё сначала',
  back: 'К выбору',
}

export const gavriilSection = {
  id: 'gavriil' as const,
  tab: 'Гавриил',
  tabNote: 'Если тебе плохо или кажется, что ты никому не нужен, — загляни сюда.',
  title: 'Гавриил',
  intro: 'Посмотри, кем ты был. Посмотри, кем ты стал.',
  /** Mostly childhood photos. Two per page, like a family album. */
  photos: [
    ph('album-1', 'Детское фото', 'года три', 4 / 5),
    ph('album-2', 'Детское фото', 'первый велосипед', 3 / 2),
    ph('album-3', 'Детское фото'),
    ph('album-4', 'Детское фото', 'море', 4 / 5),
    ph('album-5', 'Детское фото', undefined, 3 / 2),
    ph('album-6', 'Детское фото', 'первое сентября', 4 / 5),
    ph('album-7', 'Детское фото'),
    ph('album-8', 'Детское фото', 'уже почти взрослый', 3 / 2),
  ],
  outro: 'Этот мальчик очень нужен. Тогда и сейчас.',
}

export const motivationSection = {
  id: 'motivation' as const,
  tab: 'Мотивация',
  tabNote: 'Если нужен пинок вперёд.',
  title: 'Мотивация',
  intro: 'Прочитай. Посмотри. Встань и сделай.',
  pages: [
    {
      kind: 'words',
      title: 'От группы',
      notes: [
        { from: 'Друг №1', text: 'Ты уже справлялся с худшим. Справишься и с этим.' },
        { from: 'Друг №2', text: 'Хватит думать. Делай. Мы прикроем.' },
      ],
    },
    {
      kind: 'video',
      title: 'Включи звук',
      video: { src: '/media/video/placeholder-film.mp4', poster: '/media/video/placeholder-film-poster.jpg', title: 'Видео от группы' },
      caption: 'Записали специально для тебя',
    },
    { kind: 'photos', title: 'Помнишь?', photos: [ph('moti-1', 'Горы', 'мы залезли', 4 / 5), ph('moti-2', 'Море', 'и ты сможешь', 3 / 2)] },
    {
      kind: 'words',
      title: 'Ещё немного',
      notes: [
        { from: 'Друг №3', text: 'Маленький шаг сегодня лучше идеального плана на завтра.' },
        { from: 'Вся группа', text: 'Мы в тебя верим. Даже когда ты сам не веришь.' },
      ],
    },
    { kind: 'photos', title: 'Вперёд', photos: [ph('moti-3', 'Дорога', 'дальше — больше'), ph('moti-4', 'Рассвет', 'новый день', 4 / 5)] },
  ] satisfies MotivationPage[],
  outro: 'Всё. Теперь иди и сделай.',
}
