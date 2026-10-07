// Answer checking for the lock: ignores case, extra spaces, punctuation, «ё»
// and a wrong keyboard layout («ufdhbr» typed on QWERTY = «гаврик»).

const LATIN = "qwertyuiop[]asdfghjkl;'zxcvbnm,.`"
const CYRILLIC = 'йцукенгшщзхъфывапролджэячсмитьбюё'

const toCyrillic = (s: string) => Array.from(s, (ch) => (LATIN.includes(ch) ? CYRILLIC[LATIN.indexOf(ch)] : ch)).join('')
const toLatin = (s: string) => Array.from(s, (ch) => (CYRILLIC.includes(ch) ? LATIN[CYRILLIC.indexOf(ch)] : ch)).join('')

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

export function isCorrectAnswer(input: string, answers: string[]) {
  const raw = input.toLowerCase().trim()
  const variants = new Set([normalize(raw), normalize(toCyrillic(raw)), normalize(toLatin(raw))])
  return answers.some((answer) => variants.has(normalize(answer)))
}
