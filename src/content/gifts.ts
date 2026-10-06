import type { Gift } from './types'

// Gift boxes. `content.kind` decides how the surprise looks once opened:
// "letter" — a note, "coupon" — a voucher with a code, "photo" — a framed picture.

export const gifts: Gift[] = [
  {
    id: 'letter',
    label: 'Открой меня первым',
    wrap: '#d9667a',
    ribbon: '#f6d28b',
    content: {
      kind: 'letter',
      title: 'Письмо',
      text: 'Если ты это читаешь — значит, путь от первого вдоха до сегодняшнего дня пройден целиком. Спасибо, что ты есть. Ты делаешь этот мир теплее.',
      signature: 'Навсегда твои',
    },
  },
  {
    id: 'trip',
    label: 'Для приключений',
    wrap: '#4f8fc0',
    ribbon: '#f3efe6',
    content: {
      kind: 'coupon',
      title: 'Путешествие выходного дня',
      text: 'Сертификат на поездку туда, куда ты давно мечтаешь. Сборы — за нами, впечатления — за тобой.',
      code: 'ADVENTURE-2026',
      validUntil: 'действует, пока не надоест мечтать',
    },
  },
  {
    id: 'photo',
    label: 'Самый тёплый',
    wrap: '#6d58b0',
    ribbon: '#f6d28b',
    content: {
      kind: 'photo',
      title: 'Кадр, который мы хранили',
      text: 'Его никто не видел. До сегодняшнего дня.',
      photo: { src: '/media/photos/gift-photo.svg', ratio: 3 / 2, alt: 'Секретная фотография', caption: 'Где-то в 2004-м' },
    },
  },
]
