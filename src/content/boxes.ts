import type { GiftBox } from './types'

// Part 1: boxes inside boxes on a desk. One click opens a box — a note falls out, a smaller
// box rises from inside, and after a moment the next box comes up by itself. The last box
// holds the locked book «Альбом Гавриила» with its key. Add or remove boxes freely.

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
      wrap: '#c8556a',
      ribbon: '#f3d08a',
    },
    {
      caption: 'Коробка поменьше',
      note: 'Почти…',
      wrap: '#3f7fb5',
      ribbon: '#f4efe4',
    },
    {
      caption: 'Ещё меньше',
      note: 'Ладно, последняя.',
      wrap: '#5d8a5a',
      ribbon: '#f3d08a',
    },
    {
      caption: 'Самая маленькая. Честно.',
      note: 'А вот и она — книга. Ключ прилагается.',
      wrap: '#6d55a8',
      ribbon: '#f3d08a',
    },
  ] satisfies GiftBox[],
}
