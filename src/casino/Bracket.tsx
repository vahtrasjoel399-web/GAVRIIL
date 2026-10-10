import { AnimatePresence, motion } from 'motion/react'
import type { CSSProperties } from 'react'
import { tournament, type Contender } from '../content'
import { Avatar } from './Avatar'
import { matchOrder, participants, roundName, type Field, type MatchRef, type Picks } from './bracketLogic'
import './Bracket.css'

interface BracketProps {
  field: Field
  picks: Picks
  /** Pick mode: called when a contender is chosen in a match. */
  onPick?: (ref: MatchRef, id: string) => void
  /** Live mode: how many matches (in playing order) are already decided, and which one is on now. */
  decided?: number
  live?: number
}

/** Two halves of the bracket run towards the final in the middle. */
export function Bracket({ field, picks, onPick, decided, live }: BracketProps) {
  const rounds = picks.length
  const isLive = decided !== undefined
  const order = matchOrder(picks)
  const indexOf = (ref: MatchRef) => order.findIndex((o) => o.round === ref.round && o.match === ref.match)

  // In live mode later rounds fill in only as earlier matches finish.
  const shown = (ref: MatchRef, slot: number): Contender | null => {
    const c = participants(field, picks, ref)[slot] ?? null
    if (!isLive || ref.round === 0) return c
    const feeder = { round: ref.round - 1, match: ref.match * 2 + slot }
    return indexOf(feeder) < (decided ?? 0) ? c : null
  }

  const championId = picks[rounds - 1]?.[0] ?? null
  const champion = field.flat().find((c) => c.id === championId) ?? null
  const championShown = champion && (!isLive || (decided ?? 0) >= order.length)

  const renderMatch = (round: number, match: number) => {
    const ref = { round, match }
    const pickedId = picks[round][match]
    const index = indexOf(ref)
    const done = isLive && index < (decided ?? 0)
    const onAir = isLive && index === live
    const slots = participants(field, picks, ref).length
    return (
      <div key={match} className={`bm ${onAir ? 'is-live' : ''} ${round === rounds - 1 ? 'bm--final' : ''}`}>
        {onAir && <span className="bm__live">LIVE</span>}
        {Array.from({ length: slots }, (_, slot) => {
          const c = shown(ref, slot)
          const picked = !!c && pickedId === c.id
          const out = !!c && (isLive ? done && !picked : !!pickedId && !picked)
          return (
            <button
              key={slot}
              type="button"
              className={`bs ${c ? '' : 'is-empty'} ${picked && (!isLive || done) ? 'is-picked' : ''} ${out ? 'is-out' : ''}`}
              disabled={!c || !onPick}
              onClick={() => c && onPick?.(ref, c.id)}
              aria-pressed={onPick ? picked : undefined}
              aria-label={c ? c.name : 'Ждёт победительницу'}
              title={c?.nickname ? `${c.name} — ${c.nickname}` : c?.name}
            >
              {c ? (
                <>
                  <Avatar contender={c} className="bs__photo" />
                  <span className="bs__body">
                    <span className="bs__name">{c.name}</span>
                    {c.nickname && <span className="bs__nick">{c.nickname}</span>}
                  </span>
                </>
              ) : (
                <span className="bs__wait">ждёт…</span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  // Every round but the final, split into its left and right half.
  const sides = Array.from({ length: rounds - 1 }, (_, round) => {
    const count = picks[round].length
    const all = Array.from({ length: count }, (_, m) => m)
    return { round, left: all.slice(0, count / 2), right: all.slice(count / 2) }
  })

  const column = (round: number, matches: number[], side: 'left' | 'right') => (
    <div key={`${side}-${round}`} className={`bracket__round bracket__round--${side}`}>
      <p className="bracket__title">{roundName(field, round)}</p>
      <div className="bracket__matches">{matches.map((m) => renderMatch(round, m))}</div>
    </div>
  )

  return (
    <div className="bracket" style={{ '--cols': rounds * 2 - 1 } as CSSProperties}>
      {sides.map((s) => column(s.round, s.left, 'left'))}

      <div className="bracket__round bracket__round--center">
        <p className="bracket__title">{roundName(field, rounds - 1)}</p>
        <div className="bracket__matches">
          {renderMatch(rounds - 1, 0)}
          <div className={`champion ${championShown ? 'is-set' : ''}`} aria-label={tournament.champion}>
            <span className="champion__crown" aria-hidden="true">
              👑
            </span>
            <AnimatePresence mode="wait">
              {championShown && champion ? (
                <motion.div
                  key={champion.id}
                  className="champion__body"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Avatar contender={champion} className="champion__photo" />
                  <span className="champion__name">{champion.name}</span>
                </motion.div>
              ) : (
                <motion.span key="empty" className="champion__wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  ?
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {sides
        .slice()
        .reverse()
        .map((s) => column(s.round, s.right, 'right'))}
    </div>
  )
}
