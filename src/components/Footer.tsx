import { useState, type CSSProperties } from 'react'
import { person, secret, timeline } from '../content'
import { useSecret } from '../context/SecretContext'
import { IconArrowUp } from './Icons'
import './Footer.css'

const first = person.birthDate.slice(0, 4)
const last = timeline[timeline.length - 1]?.year ?? new Date().getFullYear()

export function Footer({ onTop }: { onTop: () => void }) {
  const { reveal, found } = useSecret()
  const [clicks, setClicks] = useState(0)

  const tapStar = () => {
    const next = clicks + 1
    if (next >= secret.starClicks) {
      setClicks(0)
      reveal()
    } else {
      setClicks(next)
    }
  }

  return (
    <footer className="footer">
      <div className="footer__inner">
        <button
          className={`footer__star ${found ? 'is-found' : ''}`}
          style={{ '--charge': clicks / secret.starClicks } as CSSProperties}
          onClick={tapStar}
          aria-label="Загадочная звезда"
          title={secret.hint}
        >
          ✦
        </button>
        <p className="footer__text">
          {person.footer.text} · {person.name} · {first} — {last}
        </p>
        <p className="footer__keys">
          Нажми <kbd>?</kbd> — горячие клавиши
        </p>
        <button className="btn btn--ghost btn--small" onClick={onTop}>
          <IconArrowUp width={15} height={15} /> В начало
        </button>
      </div>
    </footer>
  )
}
