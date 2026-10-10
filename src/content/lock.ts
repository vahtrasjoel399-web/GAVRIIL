// Part 2: the locked book. The answer is checked ignoring case, spaces, «ё/е»
// and the keyboard layout (typing «ufdhbr» on an English layout counts as «гаврик»).

export const lock = {
  bookTitle: 'Альбом Гавриила',
  bookVolume: 'Самое милое',
  intro: 'Ключ подошёл. Но у замка есть второй секрет.',
  /** Placeholder question — replace with one only your group knows. */
  question: 'Как мы ласково зовём именинника?',
  answers: ['гаврик', 'гаврика', 'гаврюша'],
  placeholder: 'Твой ответ',
  submit: 'Открыть',
  /** Reactions to wrong answers, shown in order. */
  wrong: ['Не-а.', 'Мимо. Подумай ещё.', 'Ты точно из нашей группы?'],
  /** Appears after two wrong answers. */
  hint: 'Подсказка: начинается на «Гав…» и это точно не собака.',
  giveUp: 'Сдаюсь',
  /** Funny margin note on the first page when he gives up. */
  giveUpNote: 'Гавриил сдался на первом же вопросе. Записано в альбом навсегда.',
}
