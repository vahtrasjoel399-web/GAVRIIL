import type { Contender } from '../content'

// Single-elimination bracket. Contenders are seeded in content order:
// 1st vs 2nd, 3rd vs 4th, … The size is cut down to a power of two (2, 4, 8, 16).

/** picks[round][match] = id of the contender Gavriil picked to win that match. */
export type Picks = (string | null)[][]

export interface MatchRef {
  round: number
  match: number
}

export function seeded(contenders: Contender[]): Contender[] {
  let size = 2
  while (size * 2 <= contenders.length) size *= 2
  return contenders.slice(0, size)
}

export const roundCount = (field: Contender[]) => Math.log2(field.length)

export function emptyPicks(field: Contender[]): Picks {
  const rounds = roundCount(field)
  return Array.from({ length: rounds }, (_, r) => Array<string | null>(field.length / 2 ** (r + 1)).fill(null))
}

/** Names from the end: Финал, 1/2 финала, 1/4 финала… */
export function roundName(round: number, rounds: number) {
  const fromEnd = rounds - 1 - round
  return fromEnd === 0 ? 'Финал' : `1/${2 ** fromEnd} финала`
}

export function participants(field: Contender[], picks: Picks, { round, match }: MatchRef): [Contender | null, Contender | null] {
  if (round === 0) return [field[match * 2] ?? null, field[match * 2 + 1] ?? null]
  const find = (id: string | null) => field.find((c) => c.id === id) ?? null
  return [find(picks[round - 1][match * 2]), find(picks[round - 1][match * 2 + 1])]
}

/** Pick a winner; later picks that no longer make sense are cleared. */
export function pickWinner(field: Contender[], picks: Picks, ref: MatchRef, id: string): Picks {
  const next = picks.map((round) => [...round])
  next[ref.round][ref.match] = id
  for (let r = ref.round + 1; r < next.length; r++) {
    next[r] = next[r].map((picked, m) => {
      const [a, b] = participants(field, next, { round: r, match: m })
      return picked && (picked === a?.id || picked === b?.id) ? picked : null
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
  loser: Contender | null
}

export function selections(field: Contender[], picks: Picks): Selection[] {
  return matchOrder(picks).flatMap((ref) => {
    const id = picks[ref.round][ref.match]
    const [a, b] = participants(field, picks, ref)
    const winner = id === a?.id ? a : id === b?.id ? b : null
    return winner ? [{ ...ref, winner, loser: winner === a ? b : a }] : []
  })
}

export const isComplete = (picks: Picks) => picks.every((round) => round.every(Boolean))

/** Express odds: product of the odds of every picked winner. */
export const totalOdds = (sel: Selection[]) => sel.reduce((acc, s) => acc * s.winner.odds, 1)
