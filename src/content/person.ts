// Who the story is about. Change the name, dates and texts here.

export const person = {
  /** Display name used in the hero, finale and throughout the site. */
  name: 'Gavrika',
  /** ISO date of birth. Age labels on the timeline are calculated from it. */
  birthDate: '2000-10-12',

  intro: {
    eyebrow: 'Интерактивная история жизни',
    lead: 'История начинается в',
    tagline: 'Каждый год — новая глава. Листай медленно: здесь спрятаны фотографии, воспоминания, кино и подарки.',
    startWithMusic: 'Начать с музыкой',
    startSilent: 'Без звука',
  },

  sections: {
    timeline: { eyebrow: 'Хроника', title: 'Год за годом' },
    film: { eyebrow: 'Кино', title: 'Фильм о тебе' },
    memories: {
      eyebrow: 'Воспоминания',
      title: 'Маленькие истории',
      hint: 'Переверни карточку, чтобы прочитать историю целиком',
    },
    gallery: { eyebrow: 'Галерея', title: 'Все кадры' },
    gifts: {
      eyebrow: 'Подарки',
      title: 'Открой по одному',
      hint: 'Нажми на коробку. Не торопись — каждый подарок со своим секретом.',
      allOpened: 'Все подарки открыты. Но главный подарок — это ты.',
    },
  },

  finale: {
    eyebrow: 'Сегодня',
    title: 'С днём рождения!',
    message:
      'Спасибо за каждый год этой истории. Пусть следующая глава будет самой светлой, смелой и тёплой из всех — а мы будем рядом, чтобы её записать.',
    wishes: ['Смелых решений', 'Тихих утр', 'Громкого смеха', 'Новых городов', 'Людей, рядом с которыми легко'],
    cakeHint: 'Задуй свечи — нажми на каждую',
    afterCandles: 'Желание загадано. Оно обязательно сбудется ✨',
    relight: 'Зажечь снова',
    signature: 'С любовью — твои близкие',
    candles: 7,
  },

  footer: {
    text: 'Сделано с любовью',
  },
}
