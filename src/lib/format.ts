/** Russian plural form: plural(5, ['год', 'года', 'лет']) → 'лет'. */
export function plural(n: number, forms: [string, string, string]) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return forms[0]
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1]
  return forms[2]
}

export function ageLabel(birthYear: number, year: number) {
  const age = year - birthYear
  if (age <= 0) return 'Год рождения'
  return `${age} ${plural(age, ['год', 'года', 'лет'])}`
}

export function formatDate(iso: string) {
  const date = new Date(`${iso}T12:00:00`)
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    .format(date)
    .replace(/\s?г\.$/, '')
}

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export const pad2 = (n: number) => n.toString().padStart(2, '0')
