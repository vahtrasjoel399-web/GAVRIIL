import type { Contender } from './types'

// Parts 4–5: the betting app. The brand is fictional on purpose.
// Gavriil fills in a tournament bracket: in every pair he picks who goes through.
// His picks form an express bet; its odds are the product of the picked odds.
// The bet always wins exactly `prize`; the stake is calculated as prize / total odds.

const photo = (file: string) => `/media/placeholders/${file}.svg`

export const tournament = {
  brand: 'GavriBet',
  currency: 'EUR',
  prize: 60,

  banner: {
    title: '🎰 Эксклюзивное предложение для Гавриила!',
    text: 'Бонус именинника уже на счету. Ставка на самый важный турнир года.',
    timer: 'Предложение сгорит через',
    cta: 'Забрать бонус',
    closeJoke: 'Отказаться нельзя 😏',
  },

  promo: 'Бонус именинника · ставка без риска',
  league: 'Лига сердец · Финал',
  event: 'Турнир девушек Гавриила',
  market: 'Турнирная сетка',
  marketHint: 'Выбери победительницу в каждой паре — она пройдёт дальше',
  champion: 'Победительница',

  /**
   * Bracket order: 1st plays 2nd, 3rd plays 4th, and so on.
   * Use 4 or 8 contenders. `odds` is shown next to the name from the start.
   */
  contenders: [
    {
      id: 'gym',
      name: 'Девушка из спортзала',
      nickname: 'жмёт больше, чем Гавриил',
      photo: photo('girl-1'),
      odds: 1.85,
      stats: [
        { label: 'Форма', value: '🔥🔥🔥🔥' },
        { label: 'Ответ на сообщение', value: '4 мин' },
      ],
    },
    {
      id: 'ex',
      name: 'Бывшая',
      nickname: 'камбэк сезона?',
      photo: photo('girl-2'),
      odds: 3.4,
      stats: [
        { label: 'Лайков в сторис', value: '147' },
        { label: '«Ты спишь?»', value: '3 раза' },
      ],
    },
    {
      id: 'stories',
      name: 'Та, что лайкает сторис',
      nickname: 'тёмная лошадка',
      photo: photo('girl-3'),
      odds: 5.5,
      stats: [
        { label: 'Реакции', value: '❤️‍🔥 ×58' },
        { label: 'Встреч вживую', value: '0' },
      ],
    },
    {
      id: 'match',
      name: 'Мэтч из приложения',
      nickname: 'пишет «привет» уже неделю',
      photo: photo('girl-4'),
      odds: 12,
      stats: [
        { label: 'Совпадение', value: '97%' },
        { label: 'Диалог', value: '«привет»' },
      ],
    },
  ] satisfies Contender[],

  /** Live commentary for every match. {winner} — who goes through, {loser} — who drops out. */
  matchStart: '{a} против {b}. Свисток!',
  matchMoments: [
    '{loser} пишет «ты спишь?» в два часа ночи. Опасный момент!',
    'VAR проверяет лайк в сторис… Засчитано!',
    '{loser} отправляет голосовое на 4 минуты. Судьи в шоке.',
    '{winner} отвечает мемом. Стадион ревёт!',
    '{loser} выкладывает фото с бывшим. Трибуны освистывают.',
  ],
  matchEnd: '{winner} проходит дальше!',
  finalEnd: '{winner} забирает сердце Гавриила!',

  texts: {
    slipTitle: 'Купон',
    express: 'Экспресс',
    emptySlip: 'Заполни сетку — купон соберётся сам',
    picked: 'Выбрано',
    totalOdds: 'Общий кэф',
    stake: 'Ставка',
    potential: 'Возможный выигрыш',
    place: 'Сделать ставку',
    accepted: 'Ставка принята',
    live: 'Трансляция',
    won: 'Ставка сыграла!',
    expressWon: 'Экспресс зашёл',
    toWallet: 'В кошелёк',
    wallet: 'Кошелёк',
    balance: 'Баланс',
    history: 'История',
    winRow: 'Выигрыш · экспресс на турнир девушек',
    withdraw: 'Вывести',
    withdrawTitle: 'Вывод средств',
    withdrawMethod: 'Мгновенный вывод',
    confirm: 'Подтвердить',
    processing: 'Обрабатываем вывод…',
    done: 'Средства выведены ✅',
    doneNote: 'Транзакция может занять до 5 минут',
    next: 'Что дальше?',
  },
}
