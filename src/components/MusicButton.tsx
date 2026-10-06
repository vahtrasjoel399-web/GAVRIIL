import type { CSSProperties } from 'react'
import { music } from '../content'
import { useMusic } from '../context/MusicContext'
import './MusicButton.css'

export function MusicButton() {
  const { playing, status, toggle } = useMusic()
  const label = status === 'error' ? 'Музыка недоступна — попробовать снова' : playing ? 'Выключить музыку' : 'Включить музыку'
  return (
    <button
      className={`icon-btn music-btn ${playing ? 'is-playing' : ''} ${status === 'error' ? 'is-error' : ''}`}
      onClick={toggle}
      aria-pressed={playing}
      aria-label={label}
      title={`${label} · «${music.title}» (M)`}
    >
      <span className="music-btn__bars" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} style={{ '--i': i } as CSSProperties} />
        ))}
      </span>
    </button>
  )
}
