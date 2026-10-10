import type { Contender } from './types'

// Parts 3–4: the betting app. Its spam banner jumps over the book right after the lock
// opens; «Что дальше?» after the withdrawal opens the album. The brand is fictional on purpose.
// Gavriil fills in a tournament bracket: in every pair he picks who goes through.
// His picks form an express bet with a fixed `stake`; it always wins exactly `prize`.
// No odds are shown anywhere.

export const tournament = {
  brand: 'GavriBet',
  currency: 'EUR',
  prize: 60,
  /** What the express costs. */
  stake: 1,

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
   * Everyone plays from the first round. The list is cut in order into first-round matches;
   * with 21 girls that is 8 matches of 1/8 — five of three, three of two (11 girls on the left
   * half of the bracket, 10 on the right). Then pairs up to the final in the middle.
   * `photo` is optional — without it a coloured circle with her initial is shown.
   */
  contenders: [
    { id: 'g1', name: 'Эля' },
    { id: 'g2', name: 'Ева' },
    { id: 'g3', name: 'Анна Мария' },
    { id: 'g4', name: 'Полина Дубик' },
    { id: 'g5', name: 'Милана', nickname: 'израильтянка' },
    { id: 'g6', name: 'Лиана' },
    { id: 'g7', name: 'Кира' },
    { id: 'g8', name: 'Майсурян' },
    { id: 'g9', name: 'Крисанна' },
    { id: 'g10', name: 'Настя', nickname: 'одноклассница' },
    { id: 'g11', name: 'Чамян' },
    { id: 'g12', name: 'Кира', nickname: 'параллель' },
    { id: 'g13', name: 'Саша', nickname: 'подруга Дейнера' },
    { id: 'g14', name: 'S', nickname: 'с Узбекистана · вроде сейчас общаются' },
    { id: 'g15', name: 'Liisu', nickname: 'Tartu' },
    { id: 'g16', name: 'Настя', nickname: 'гимназия' },
    { id: 'g17', name: 'Куликова' },
    { id: 'g18', name: 'Вторникова' },
    { id: 'g19', name: 'Соня', nickname: 'нарвская (или как там её)' },
    { id: 'g20', name: 'Кармен', nickname: 'тоже какая-то эстонка' },
    { id: 'g21', name: 'Катя', nickname: 'из хора' },
  ] satisfies Contender[],

  /** Live commentary for every match. {players} — everyone in it, {winner} — who goes through, {loser} — who drops out. */
  matchStart: 'На поле: {players}. Свисток!',
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
