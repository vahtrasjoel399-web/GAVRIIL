import type { GiftBox } from './types'

// Part 1: boxes inside boxes on a desk. Open a box — a note falls out and a smaller
// box rises from inside. The last box holds the locked book «Хроники нашей группы»
// with its key. Add or remove boxes freely.

export const boxes = {
  /** Small lines above the box. */
  header: {
    dedication: 'Гавриилу — от нашей группы',
    rule: 'Открывать строго по порядку. Подглядывать нельзя.',
  },
  /** Hint under a closed box. */
  hint: 'нажми на коробку',
  items: [
    {
      caption: 'С днём рождения, Гавриил!',
      note: 'Слишком просто. Дальше.',
      button: 'Открыть следующую →',
      wrap: '#c8556a',
      ribbon: '#f3d08a',
    },
    {
      caption: 'Коробка поменьше',
      note: 'Почти…',
      button: 'Ну давай ещё',
      wrap: '#3f7fb5',
      ribbon: '#f4efe4',
    },
    {
      caption: 'Ещё меньше',
      note: 'Ладно, последняя.',
      button: 'Верю. Дальше',
      wrap: '#5d8a5a',
      ribbon: '#f3d08a',
    },
    {
      caption: 'Самая маленькая. Честно.',
      note: 'А вот и она — книга. Ключ прилагается.',
      button: 'Открыть книгу',
      wrap: '#6d55a8',
      ribbon: '#f3d08a',
    },
  ] satisfies GiftBox[],
}
