import { AnimatePresence, motion } from 'motion/react'
import { tournament, type Contender } from '../content'
import { matchOrder, participants, roundName, type MatchRef, type Picks } from './bracketLogic'
import './Bracket.css'

const odds = (value: number) => value.toFixed(2)

interface BracketProps {
  field: Contender[]
  picks: Picks
  /** Pick mode: called when a contender is chosen in a match. */
  onPick?: (ref: MatchRef, id: string) => void
  /** Live mode: how many matches (in playing order) are already decided, and which one is on now. */
  decided?: number
  live?: number
}

export function Bracket({ field, picks, onPick, decided, live }: BracketProps) {
  const rounds = picks.length
  const isLive = decided !== undefined
  const order = matchOrder(picks)
  const indexOf = (ref: MatchRef) => order.findIndex((o) => o.round === ref.round && o.match === ref.match)

  // In live mode later rounds fill in only as earlier matches finish.
  const shown = (ref: MatchRef, slot: 0 | 1): Contender | null => {
    const [a, b] = participants(field, picks, ref)
    const c = slot === 0 ? a : b
    if (!isLive || ref.round === 0) return c
    const feeder = { round: ref.round - 1, match: ref.match * 2 + slot }
    return indexOf(feeder) < (decided ?? 0) ? c : null
  }

  const championId = picks[rounds - 1]?.[0] ?? null
  const champion = field.find((c) => c.id === championId) ?? null
  const championShown = champion && (!isLive || (decided ?? 0) >= order.length)

  return (
    <div className="bracket" style={{ ['--rounds' as string]: rounds + 1 }}>
      {picks.map((matches, round) => (
        <div key={round} className="bracket__round">
          <p className="bracket__title">{roundName(round, rounds)}</p>
          <div className="bracket__matches">
            {matches.map((pickedId, match) => {
              const ref = { round, match }
              const index = indexOf(ref)
              const done = isLive && index < (decided ?? 0)
              const onAir = isLive && index === live
              return (
                <div key={match} className={`bm ${onAir ? 'is-live' : ''} ${round === rounds - 1 ? 'bm--final' : ''}`}>
                  {onAir && <span className="bm__live">LIVE</span>}
                  {([0, 1] as const).map((slot) => {
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
                        aria-label={c ? `${c.name}, кэф ${odds(c.odds)}` : 'Ждёт победительницу пары'}
                      >
                        {c ? (
                          <>
                            <img className="bs__photo" src={c.photo} alt="" />
                            <span className="bs__body">
                              <span className="bs__name">{c.name}</span>
                              {c.nickname && <span className="bs__nick">{c.nickname}</span>}
                            </span>
                            <span className="bs__odd">{odds(c.odds)}</span>
                          </>
                        ) : (
                          <span className="bs__wait">победительница пары</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <div className="bracket__round bracket__round--champion">
        <p className="bracket__title">{tournament.champion}</p>
        <div className="bracket__matches">
          <div className={`champion ${championShown ? 'is-set' : ''}`}>
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
                  <img src={champion.photo} alt="" />
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
    </div>
  )
}
