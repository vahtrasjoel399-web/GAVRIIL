import type { MusicContent, VideoContent } from './types'

// Video for the "Кино" section and the background music.
// Put your files in /public/media and update the paths.

export const film: VideoContent = {
  src: '/media/video/placeholder-film.mp4',
  poster: '/media/video/placeholder-film-poster.jpg',
  eyebrow: 'Кино',
  title: 'Фильм о тебе',
  description:
    'Восемнадцать секунд, в которых уместились самые первые кадры, бесконечное лето и сегодняшний день. Включи звук.',
  chapters: [
    { time: 0, label: 'Самое начало' },
    { time: 6, label: 'Лето, которое не кончалось' },
    { time: 11.8, label: 'Мы — сегодня' },
  ],
}

export const music: MusicContent = {
  src: '/media/audio/placeholder-theme.mp3',
  title: 'Тема истории',
  artist: 'Placeholder',
  volume: 0.45,
}
