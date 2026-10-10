import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Odometer } from '../components/Odometer'
import { person, tournament, type Contender } from '../content'
import { useSfx } from '../context/SfxContext'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { burst, fireworks } from '../lib/confetti'
import { Avatar } from './Avatar'
import { Bracket } from './Bracket'
import {
  emptyPicks,
  isComplete,
  listNames,
  matchOrder,
  participants,
  pickWinner,
  roundName,
  seeded,
  selections,
  type Picks,
  type Field,
  type Selection,
} from './bracketLogic'
import './CasinoApp.css'

type Screen = 'bracket' | 'accepted' | 'live' | 'won' | 'wallet' | 'processing' | 'done'

const money = (value: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: tournament.currency }).format(value)
const ease = [0.22, 1, 0.36, 1] as const

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.35 },
}

/** Parts 3–4: a fictional betting app. Gavriil fills in the bracket; the express always wins `prize`. */
export function CasinoApp({ onDone }: { onDone: () => void }) {
  const { texts } = tournament
  const sfx = useSfx()
  const wide = useMediaQuery('(min-width: 900px)')
  const field = useMemo(() => seeded(tournament.contenders), [])
  const [picks, setPicks] = useState<Picks>(() => emptyPicks(field))
  const [screen, setScreen] = useState<Screen>('bracket')
  const [balance, setBalance] = useState(0)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [closing, setClosing] = useState(false)
  const timers = useRef<number[]>([])
  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms))
  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])

  const sel = selections(field, picks)
  const complete = isComplete(picks)
  const stake = tournament.stake
  const champion = sel.at(-1)?.winner ?? null

  const placeBet = () => {
    if (!complete) return
    sfx.play('coin')
    setScreen('accepted')
    later(1500, () => setScreen('live'))
  }

  const finishLive = () => {
    setScreen('won')
    sfx.play('win')
    burst({ x: 0.5, y: 0.45 }, 1.3)
    later(400, () => fireworks(1800))
    later(700, () => setBalance(tournament.prize))
  }

  const confirmWithdraw = () => {
    setWithdrawOpen(false)
    setScreen('processing')
    later(2400, () => {
      setBalance(0)
      setScreen('done')
      sfx.play('coin')
      later(2200, () => setShowNext(true))
    })
  }

  const close = () => {
    setClosing(true)
    later(650, onDone)
  }

  const coupon = (
    <Coupon
      compact={!wide}
      field={field}
      sel={sel}
      stake={stake}
      complete={complete}
      matches={matchOrder(picks).length}
      onPlace={placeBet}
      onClear={() => setPicks(emptyPicks(field))}
    />
  )

  return (
    <motion.div className="casino" initial={{ opacity: 0 }} animate={{ opacity: closing ? 0 : 1 }} transition={{ duration: 0.5 }}>
      <motion.div
        className="casino__app"
        initial={{ y: 80, scale: 0.94, opacity: 0 }}
        animate={closing ? { scale: 0.85, opacity: 0, y: 40 } : { y: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease }}
      >
        <header className="cas-top">
          <span className="cas-logo">
            <span className="cas-logo__mark" aria-hidden="true">
              G
            </span>
            {tournament.brand}
          </span>
          {wide && (
            <nav className="cas-topnav" aria-hidden="true">
              <span>Спорт</span>
              <span className="is-active">
                <i className="cas-dot" /> LIVE
              </span>
              <span>Казино</span>
              <span>Акции</span>
            </nav>
          )}
          <span className="cas-balance" aria-label={`${texts.balance}: ${money(balance)}`}>
            <span className="cas-balance__icon" aria-hidden="true">
              ◈
            </span>
            <Odometer value={money(balance)} />
          </span>
          <span className="cas-avatar" aria-hidden="true">
            {person.name[0]}
          </span>
        </header>

        <div className={`cas-body ${wide && screen === 'bracket' ? 'cas-body--split' : ''}`}>
          <div className={`cas-screen ${!wide && screen === 'bracket' && complete ? 'cas-screen--sheet' : ''}`}>
            <AnimatePresence mode="wait">
              {screen === 'bracket' && (
                <motion.div key="bracket" {...fade}>
                  {!wide && (
                    <nav className="cas-tabs" aria-hidden="true">
                      <span>Спорт</span>
                      <span className="is-active">
                        <i className="cas-dot" /> LIVE
                      </span>
                      <span>Казино</span>
                    </nav>
                  )}
                  <p className="cas-promo">🎁 {tournament.promo}</p>
                  <section className="cas-event">
                    <div className="cas-event__top">
                      <span className="cas-muted">{tournament.league}</span>
                      <span className="cas-badge">
                        <i className="cas-dot" /> скоро
                      </span>
                    </div>
                    <h1 className="cas-event__title">{tournament.event}</h1>
                    <div className="cas-market__head">
                      <b>{tournament.market}</b>
                      <span className="cas-muted">{tournament.marketHint}</span>
                    </div>
                    <div className="cas-bracket-scroll">
                      <Bracket
                        field={field}
                        picks={picks}
                        onPick={(ref, id) => {
                          sfx.play('pop')
                          setPicks((p) => pickWinner(field, p, ref, id))
                        }}
                      />
                    </div>
                  </section>
                </motion.div>
              )}
              {screen === 'accepted' && (
                <motion.div key="accepted" className="cas-center" {...fade}>
                  <motion.span
                    className="cas-check"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 14 }}
                  >
                    ✓
                  </motion.span>
                  <h2 className="cas-h2">{texts.accepted}</h2>
                  <p className="cas-muted">
                    {texts.express} · {sel.length} · {money(stake)}
                  </p>
                </motion.div>
              )}
              {screen === 'live' && (
                <motion.div key="live" {...fade}>
                  <Live field={field} picks={picks} onFinish={finishLive} />
                </motion.div>
              )}
              {screen === 'won' && (
                <motion.div key="won" className="cas-center" {...fade}>
                  <p className="cas-badge cas-badge--win">WIN</p>
                  <motion.h2
                    className="cas-won"
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 12 }}
                  >
                    {texts.won}
                  </motion.h2>
                  <p className="cas-amount">+{money(tournament.prize)}</p>
                  <p className="cas-muted">
                    {texts.expressWon}: {sel.length} из {sel.length}
                  </p>
                  {champion && (
                    <p className="cas-won__champion">
                      <Avatar contender={champion} className="cas-won__photo" /> 👑 {champion.name}
                    </p>
                  )}
                  <button type="button" className="cas-btn" onClick={() => setScreen('wallet')}>
                    {texts.toWallet}
                  </button>
                </motion.div>
              )}
              {(screen === 'wallet' || screen === 'processing' || screen === 'done') && (
                <motion.div key="wallet" className="cas-narrow" {...fade}>
                  <Wallet
                    balance={balance}
                    screen={screen}
                    showNext={showNext}
                    onWithdraw={() => setWithdrawOpen(true)}
                    onNext={close}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {wide && screen === 'bracket' && <aside className="cas-side">{coupon}</aside>}
        </div>

        {/* Narrow screens: the coupon slides up once the bracket is filled in. */}
        <AnimatePresence>
          {!wide && screen === 'bracket' && complete && (
            <motion.div
              className="cas-sheet"
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              exit={{ y: '110%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            >
              {coupon}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Withdrawal: buttons only, no card or account fields. */}
        <AnimatePresence>
          {withdrawOpen && (
            <>
              <motion.div
                className="cas-dim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setWithdrawOpen(false)}
              />
              <motion.div
                className="cas-sheet cas-sheet--center"
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                exit={{ y: '110%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                role="dialog"
                aria-label={texts.withdrawTitle}
              >
                <div className="cas-sheet__head">
                  <span>{texts.withdrawTitle}</span>
                  <button type="button" className="cas-sheet__x" onClick={() => setWithdrawOpen(false)} aria-label="Закрыть">
                    ×
                  </button>
                </div>
                <p className="cas-withdraw__amount">{money(tournament.prize)}</p>
                <p className="cas-muted cas-withdraw__method">⚡ {texts.withdrawMethod}</p>
                <button type="button" className="cas-btn cas-btn--wide" onClick={confirmWithdraw}>
                  {texts.confirm}
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

interface CouponProps {
  /** Phones: only the totals; the list opens on demand. */
  compact?: boolean
  field: Field
  sel: Selection[]
  stake: number
  complete: boolean
  matches: number
  onPlace: () => void
  onClear: () => void
}

function Coupon({ compact, field, sel, stake, complete, matches, onPlace, onClear }: CouponProps) {
  const { texts } = tournament
  const [expanded, setExpanded] = useState(false)
  const showList = !compact || expanded
  return (
    <div className="coupon" role="region" aria-label={texts.slipTitle}>
      <div className="cas-sheet__head">
        <span>
          {texts.slipTitle} <em>{texts.express}</em>
        </span>
        {compact ? (
          <button type="button" className="coupon__clear" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
            {expanded ? 'свернуть' : `подробнее (${sel.length})`}
          </button>
        ) : (
          sel.length > 0 && (
            <button type="button" className="coupon__clear" onClick={onClear}>
              очистить
            </button>
          )
        )}
      </div>

      {!showList ? null : sel.length === 0 ? (
        <p className="coupon__empty">{texts.emptySlip}</p>
      ) : (
        <ul className="coupon__list">
          <AnimatePresence initial={false}>
            {sel.map((s) => (
              <motion.li
                key={`${s.round}-${s.match}`}
                layout
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
              >
                <span className="coupon__item">
                  <span className="coupon__round">{roundName(field, s.round)}</span>
                  <b>{s.winner.name}</b>
                  {s.losers.length > 0 && <span className="cas-muted">против: {listNames(s.losers.map((c) => c.name))}</span>}
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {!compact && (
        <>
          <div className="coupon__progress">
            <span style={{ width: `${(sel.length / matches) * 100}%` }} />
          </div>
          <p className="cas-muted">
            {texts.picked}: {sel.length} из {matches}
          </p>
        </>
      )}

      <div className="cas-slip__rows">
        <p>
          <span>{texts.stake}</span>
          <b>{money(stake)}</b>
        </p>
        <p>
          <span>{texts.potential}</span>
          <b className="cas-green">{money(tournament.prize)}</b>
        </p>
      </div>
      <button type="button" className="cas-btn cas-btn--wide" onClick={onPlace} disabled={!complete}>
        {texts.place}
      </button>
    </div>
  )
}

/** The broadcast: matches are played one by one in the bracket; Gavriil's picks always win. */
function Live({ field, picks, onFinish }: { field: Field; picks: Picks; onFinish: () => void }) {
  const order = useMemo(() => matchOrder(picks), [picks])
  const rounds = picks.length
  // A big bracket plays faster, so the whole broadcast stays around half a minute.
  const matchMs = Math.min(3400, Math.max(1300, 10500 / order.length))
  const [elapsed, setElapsed] = useState(0)
  const finishRef = useRef(onFinish)
  useEffect(() => {
    finishRef.current = onFinish
  })

  useEffect(() => {
    const start = performance.now()
    let done = false
    const id = window.setInterval(() => {
      const ms = performance.now() - start
      setElapsed(ms)
      if (ms >= matchMs * order.length && !done) {
        done = true
        window.clearInterval(id)
        window.setTimeout(() => finishRef.current(), 900)
      }
    }, 80)
    return () => window.clearInterval(id)
  }, [matchMs, order.length])

  const current = Math.min(order.length - 1, Math.floor(elapsed / matchMs))
  const decided = Math.min(order.length, Math.floor(elapsed / matchMs))
  const t = Math.min(1, (elapsed - current * matchMs) / matchMs)
  const finished = decided >= order.length

  // Commentary: three lines per match.
  const feed = useMemo(() => {
    const fill = (line: string, players: string, w: string, l: string) =>
      line.replace('{players}', players).replace('{winner}', w).replace('{loser}', l)
    return order.map((ref, i) => {
      const players = participants(field, picks, ref).filter((c): c is Contender => !!c)
      const winner = players.find((c) => c.id === picks[ref.round][ref.match])
      const loser = players.find((c) => c !== winner)
      const names = [listNames(players.map((c) => c.name)), winner?.name ?? '', loser?.name ?? ''] as const
      const moment = tournament.matchMoments[i % tournament.matchMoments.length]
      const end = ref.round === rounds - 1 ? tournament.finalEnd : tournament.matchEnd
      return {
        label: roundName(field, ref.round),
        lines: [fill(tournament.matchStart, ...names), fill(moment, ...names), fill(end, ...names)],
      }
    })
  }, [order, field, picks, rounds])

  const shown = feed.flatMap((m, i) => {
    if (i > current) return []
    const count = i < current || finished ? 3 : t > 0.88 ? 3 : t > 0.42 ? 2 : 1
    return m.lines.slice(0, count).map((line, j) => ({ key: `${i}-${j}`, label: m.label, line }))
  })

  const ref = order[current]
  const players = participants(field, picks, ref)
  const winnerId = picks[ref.round][ref.match]
  const score = (c: Contender | null) => {
    if (!c) return 0
    const p = finished ? 1 : t
    return c.id === winnerId ? 10 + 90 * Math.pow(p, 1.3) : 12 + 70 * Math.sin(Math.min(1, p * 1.2) * Math.PI * 0.62)
  }

  return (
    <div className="cas-live">
      <div className="cas-live__head">
        <span className="cas-badge">
          <i className="cas-dot" /> LIVE
        </span>
        <span className="cas-live__min">{roundName(field, ref.round)}</span>
      </div>
      <h2 className="cas-h2">{tournament.event}</h2>

      <div className={`cas-match cas-match--${players.length}`}>
        {players.map((c) =>
          c ? (
            <div key={c.id} className={`cas-match__side ${c.id === winnerId && (t > 0.9 || finished) ? 'is-win' : ''}`}>
              <Avatar contender={c} className="cas-match__photo" />
              <span className="cas-match__name">{c.name}</span>
              <span className="cas-bars__track">
                <span className="cas-bars__fill" style={{ width: `${Math.min(100, score(c))}%` }} />
              </span>
            </div>
          ) : null,
        )}
      </div>

      <div className="cas-bracket-scroll cas-bracket-scroll--live">
        <Bracket field={field} picks={picks} decided={decided} live={finished ? undefined : current} />
      </div>

      <ol className="cas-feed" aria-live="polite">
        {shown
          .slice()
          .reverse()
          .slice(0, 6)
          .map((item) => (
            <motion.li key={item.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <span className="cas-feed__min">{item.label}</span>
              {item.line}
            </motion.li>
          ))}
      </ol>
    </div>
  )
}

function Wallet({
  balance,
  screen,
  showNext,
  onWithdraw,
  onNext,
}: {
  balance: number
  screen: Screen
  showNext: boolean
  onWithdraw: () => void
  onNext: () => void
}) {
  const { texts } = tournament
  return (
    <div className="cas-wallet">
      <h2 className="cas-h2">{texts.wallet}</h2>
      <div className="cas-wallet__card">
        <p className="cas-muted">{texts.balance}</p>
        <p className="cas-wallet__balance">
          <Odometer value={money(balance)} />
        </p>
        {screen === 'wallet' && (
          <button type="button" className="cas-btn cas-btn--wide" onClick={onWithdraw}>
            {texts.withdraw}
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {screen === 'processing' && (
          <motion.div key="processing" className="cas-center cas-center--small" {...fade}>
            <span className="cas-spinner" aria-hidden="true" />
            <p>{texts.processing}</p>
          </motion.div>
        )}
        {screen === 'done' && (
          <motion.div key="done" className="cas-center cas-center--small" {...fade}>
            <p className="cas-done">{texts.done}</p>
            <p className="cas-muted">{texts.doneNote}</p>
            <AnimatePresence>
              {showNext && (
                <motion.button
                  type="button"
                  className="cas-btn cas-btn--next"
                  onClick={onNext}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {texts.next}
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="cas-history">
        <p className="cas-muted">{texts.history}</p>
        <p className="cas-history__row">
          <span>{texts.winRow}</span>
          <b className="cas-green">+{money(tournament.prize)}</b>
        </p>
        {screen === 'done' && (
          <motion.p className="cas-history__row" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span>{texts.withdrawTitle}</span>
            <b>−{money(tournament.prize)}</b>
          </motion.p>
        )}
      </div>
    </div>
  )
}
