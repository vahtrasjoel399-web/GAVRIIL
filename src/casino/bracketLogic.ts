import type { Contender } from '../content'

// Single-elimination bracket where everyone plays from the first round. Contenders are split
// in content order into first-round matches; when the count is not a power of two, some of
// those matches are three-way (21 girls → 8 matches: five of three, three of two).
// From the second round on it is pairs: winners of matches 1 and 2 meet, 3 and 4, and so on.
// The bracket is drawn in two halves that meet in the final.

/** First-round matches: each holds two or more contenders. */
export type Field = Contender[][]

/** picks[round][match] = id of the contender Gavriil picked to win that match. */
export type Picks = (string | null)[][]

export interface MatchRef {
  round: number
  match: number
}

export function seeded(contenders: Contender[]): Field {
  let matches = 1
  while (matches * 4 <= contenders.length) matches *= 2
  // Bigger matches are spread evenly, so both halves get a fair share.
  const extra = contenders.length - Math.floor(contenders.length / matches) * matches
  const big = new Set(Array.from({ length: extra }, (_, i) => Math.floor((i * matches) / extra)))
  const base = Math.floor(contenders.length / matches)
  const field: Field = []
  let next = 0
  for (let m = 0; m < matches; m++) {
    const size = base + (big.has(m) ? 1 : 0)
    field.push(contenders.slice(next, next + size))
    next += size
  }
  return field
}

export const roundCount = (field: Field) => Math.log2(field.length) + 1

export function emptyPicks(field: Field): Picks {
  return Array.from({ length: roundCount(field) }, (_, r) => Array<string | null>(field.length / 2 ** r).fill(null))
}

/** Names from the end: Финал, 1/2 финала, 1/4 финала… */
export function roundName(field: Field, round: number) {
  const fromEnd = roundCount(field) - 1 - round
  return fromEnd === 0 ? 'Финал' : `1/${2 ** fromEnd} финала`
}

/** Who plays the match; in later rounds a slot is null until its feeder match is picked. */
export function participants(field: Field, picks: Picks, { round, match }: MatchRef): (Contender | null)[] {
  if (round === 0) return field[match]
  const find = (id: string | null) => field.flat().find((c) => c.id === id) ?? null
  return [find(picks[round - 1][match * 2]), find(picks[round - 1][match * 2 + 1])]
}

/** Pick a winner; later picks that no longer make sense are cleared. */
export function pickWinner(field: Field, picks: Picks, ref: MatchRef, id: string): Picks {
  const next = picks.map((round) => [...round])
  next[ref.round][ref.match] = id
  for (let r = ref.round + 1; r < next.length; r++) {
    next[r] = next[r].map((picked, m) => {
      const ids = participants(field, next, { round: r, match: m }).map((c) => c?.id)
      return picked && ids.includes(picked) ? picked : null
    })
  }
  return next
}

/** All matches in playing order: first round left to right, then the next round… */
export function matchOrder(picks: Picks): MatchRef[] {
  return picks.flatMap((round, r) => round.map((_, m) => ({ round: r, match: m })))
}

export interface Selection extends MatchRef {
  winner: Contender
  losers: Contender[]
}

export function selections(field: Field, picks: Picks): Selection[] {
  return matchOrder(picks).flatMap((ref) => {
    const players = participants(field, picks, ref).filter((c): c is Contender => !!c)
    const winner = players.find((c) => c.id === picks[ref.round][ref.match])
    return winner ? [{ ...ref, winner, losers: players.filter((c) => c !== winner) }] : []
  })
}

export const isComplete = (picks: Picks) => picks.every((round) => round.every(Boolean))

/** «Эля», «Эля и Ева», «Эля, Ева и Анна Мария». */
export function listNames(names: string[]) {
  return names.length < 2 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} и ${names.at(-1)}`
}
