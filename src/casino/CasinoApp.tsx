import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Odometer } from '../components/Odometer'
import { person, tournament, type Contender } from '../content'
import { useSfx } from '../context/SfxContext'
import { burst, fireworks } from '../lib/confetti'
import './CasinoApp.css'

type Screen = 'market' | 'accepted' | 'live' | 'won' | 'wallet' | 'processing' | 'done'

const money = (value: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: tournament.currency }).format(value)
const odds = (value: number) => value.toFixed(2)
const LIVE_MS = 8400
const ease = [0.22, 1, 0.36, 1] as const

/** Parts 4–5: a fictional betting app. The bet always wins exactly `prize`. */
export function CasinoApp({ onDone }: { onDone: () => void }) {
  const { texts } = tournament
  const sfx = useSfx()
  const [screen, setScreen] = useState<Screen>('market')
  const [pick, setPick] = useState<Contender | null>(null)
  const [balance, setBalance] = useState(0)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [closing, setClosing] = useState(false)
  const timers = useRef<number[]>([])
  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms))
  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])

  const stake = pick ? Math.round((tournament.prize / pick.odds) * 100) / 100 : 0

  const placeBet = () => {
    if (!pick) return
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

  return (
    <motion.div
      className="casino"
      initial={{ opacity: 0 }}
      animate={{ opacity: closing ? 0 : 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="casino__phone"
        initial={{ y: 80, scale: 0.92, opacity: 0 }}
        animate={closing ? { scale: 0.8, opacity: 0, y: 40 } : { y: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease }}
      >
        <header className="cas-top">
          <span className="cas-logo">
            <span className="cas-logo__mark" aria-hidden="true">
              G
            </span>
            {tournament.brand}
          </span>
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

        <div className="cas-screen">
          <AnimatePresence mode="wait">
            {screen === 'market' && (
              <motion.div key="market" {...fade}>
                <Market pick={pick} onPick={setPick} />
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
                  {pick?.name} · {odds(pick?.odds ?? 0)} · {money(stake)}
                </p>
              </motion.div>
            )}
            {screen === 'live' && pick && (
              <motion.div key="live" {...fade}>
                <Live pick={pick} onFinish={finishLive} />
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
                  {pick?.name} — {tournament.market.toLowerCase()} · {odds(pick?.odds ?? 0)}
                </p>
                <button type="button" className="cas-btn" onClick={() => setScreen('wallet')}>
                  {texts.toWallet}
                </button>
              </motion.div>
            )}
            {(screen === 'wallet' || screen === 'processing' || screen === 'done') && (
              <motion.div key="wallet" {...fade}>
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

        {/* Bet slip */}
        <AnimatePresence>
          {screen === 'market' && pick && (
            <motion.div
              className="cas-sheet"
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              exit={{ y: '110%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              role="dialog"
              aria-label={texts.slipTitle}
            >
              <div className="cas-sheet__head">
                <span>
                  {texts.slipTitle} <em>{texts.single}</em>
                </span>
                <button type="button" className="cas-sheet__x" onClick={() => setPick(null)} aria-label="Убрать из купона">
                  ×
                </button>
              </div>
              <div className="cas-slip">
                <div>
                  <p className="cas-slip__name">{pick.name}</p>
                  <p className="cas-muted">
                    {tournament.event} · {tournament.market}
                  </p>
                </div>
                <span className="cas-odd cas-odd--static">{odds(pick.odds)}</span>
              </div>
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
              <button type="button" className="cas-btn cas-btn--wide" onClick={placeBet}>
                {texts.place} · {money(stake)}
              </button>
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
                className="cas-sheet"
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

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.35 },
}

function Market({ pick, onPick }: { pick: Contender | null; onPick: (c: Contender) => void }) {
  return (
    <div className="cas-market">
      <nav className="cas-tabs" aria-label="Разделы">
        <span>Спорт</span>
        <span className="is-active">
          <i className="cas-dot" /> LIVE
        </span>
        <span>Казино</span>
        <span>Акции</span>
      </nav>
      <p className="cas-promo">🎁 {tournament.promo}</p>

      <section className="cas-event">
        <div className="cas-event__top">
          <span className="cas-muted">{tournament.league}</span>
          <span className="cas-badge">
            <i className="cas-dot" /> LIVE
          </span>
        </div>
        <h1 className="cas-event__title">{tournament.event}</h1>
        <div className="cas-market__head">
          <b>{tournament.market}</b>
          <span className="cas-muted">{tournament.marketHint}</span>
        </div>

        <ul className="cas-list">
          {tournament.contenders.map((c, i) => (
            <motion.li
              key={c.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * i, duration: 0.4 }}
            >
              <button
                type="button"
                className={`cas-card ${pick?.id === c.id ? 'is-picked' : ''}`}
                onClick={() => onPick(c)}
                aria-pressed={pick?.id === c.id}
              >
                <img className="cas-card__photo" src={c.photo} alt="" loading="lazy" />
                <span className="cas-card__body">
                  <span className="cas-card__name">{c.name}</span>
                  {c.nickname && <span className="cas-card__nick">{c.nickname}</span>}
                  <span className="cas-card__stats">
                    {c.stats.map((s) => (
                      <span key={s.label}>
                        {s.label}: <b>{s.value}</b>
                      </span>
                    ))}
                  </span>
                </span>
                <span className="cas-odd">{odds(c.odds)}</span>
              </button>
            </motion.li>
          ))}
        </ul>
      </section>
    </div>
  )
}

/** Short dramatic "broadcast". The rival leads for a while, then the pick wins. */
function Live({ pick, onFinish }: { pick: Contender; onFinish: () => void }) {
  const [t, setT] = useState(0)
  const done = useRef(false)
  const finishRef = useRef(onFinish)
  useEffect(() => {
    finishRef.current = onFinish
  })

  const rival = useMemo(
    () => [...tournament.contenders].filter((c) => c.id !== pick.id).sort((a, b) => a.odds - b.odds)[0],
    [pick],
  )

  useEffect(() => {
    const start = performance.now()
    const id = window.setInterval(() => {
      const next = Math.min(1, (performance.now() - start) / LIVE_MS)
      setT(next)
      if (next >= 1 && !done.current) {
        done.current = true
        window.clearInterval(id)
        window.setTimeout(() => finishRef.current(), 700)
      }
    }, 80)
    return () => window.clearInterval(id)
  }, [])

  const score = (c: Contender, i: number) => {
    if (c.id === pick.id) return 8 + 92 * Math.pow(t, 1.25)
    if (c.id === rival.id) return 10 + 80 * Math.sin(Math.min(1, t * 1.15) * Math.PI * 0.62)
    return 6 + (40 - i * 6) * Math.sin(t * Math.PI * 0.5) + 6 * Math.sin(t * 9 + i)
  }

  const lines = tournament.broadcast.map((line) => line.replace('{pick}', pick.name).replace('{rival}', rival.name))
  const shown = lines.slice(0, Math.max(1, Math.ceil(t * lines.length)))
  const minute = Math.round(t * 90)

  return (
    <div className="cas-live">
      <div className="cas-live__head">
        <span className="cas-badge">
          <i className="cas-dot" /> LIVE
        </span>
        <span className="cas-live__min">{minute}'</span>
      </div>
      <h2 className="cas-h2">{tournament.event}</h2>
      <ul className="cas-bars">
        {tournament.contenders.map((c, i) => {
          const s = Math.max(4, Math.min(100, score(c, i)))
          return (
            <li key={c.id} className={c.id === pick.id ? 'is-pick' : ''}>
              <span className="cas-bars__name">
                <img src={c.photo} alt="" />
                {c.name}
              </span>
              <span className="cas-bars__track">
                <span className="cas-bars__fill" style={{ width: `${s}%` }} />
              </span>
            </li>
          )
        })}
      </ul>
      <ol className="cas-feed" aria-live="polite">
        {shown.map((line, i) => (
          <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <span className="cas-feed__min">{Math.round(((i + 1) / lines.length) * 90)}'</span>
            {line}
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
