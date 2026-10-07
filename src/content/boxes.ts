import type { GiftBox } from './types'

// Part 1: boxes inside boxes. Every box is one page; the last one holds the key.
// Add or remove boxes freely — each next box is drawn a bit smaller.

export const boxes = {
  /** Left page of the very first spread (computer only). */
  titlePage: {
    title: 'Книга подарков',
    dedication: 'Гавриилу — от нашей группы',
    rule: 'Открывать строго по порядку. Подглядывать нельзя.',
  },
  items: [
    {
      caption: 'С днём рождения, Гавриил!',
      note: 'Слишком просто. Дальше.',
      button: 'Листаем дальше →',
      aside: 'Коробка №1. Разминка.',
      wrap: '#c8556a',
      ribbon: '#f3d08a',
    },
    {
      caption: 'Коробка поменьше',
      note: 'Почти…',
      button: 'Ну давай ещё',
      aside: 'Терпение — тоже подарок.',
      wrap: '#3f7fb5',
      ribbon: '#f4efe4',
    },
    {
      caption: 'Ещё меньше',
      note: 'Ладно, последняя.',
      button: 'Верю. Дальше',
      aside: 'Мы бы не стали тебя обманывать. Наверное.',
      wrap: '#5d8a5a',
      ribbon: '#f3d08a',
    },
    {
      caption: 'Самая маленькая. Честно.',
      note: 'Это старый ключ. Где-то есть замок, который он открывает.',
      button: 'Взять ключ',
      aside: 'А вот теперь правда последняя.',
      wrap: '#6d55a8',
      ribbon: '#f3d08a',
    },
  ] satisfies GiftBox[],
}
