import { motion } from 'motion/react'
import { useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { memories, person, type Memory } from '../content'
import { burst, originOf } from '../lib/confetti'
import { IconRotate, IconShuffle } from './Icons'
import { SectionHead } from './SectionHead'
import './Memories.css'

const ease = [0.22, 1, 0.36, 1] as const

function shuffled<T>(items: T[]) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function Memories() {
  const [order, setOrder] = useState(memories)
  const [flipped, setFlipped] = useState<ReadonlySet<string>>(new Set())
  const [seen, setSeen] = useState<ReadonlySet<string>>(new Set())
  const counterRef = useRef<HTMLParagraphElement>(null)
  const { memories: copy } = person.sections

  const flip = (id: string) => {
    setFlipped((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    if (!seen.has(id)) {
      const nextSeen = new Set(seen).add(id)
      setSeen(nextSeen)
      if (nextSeen.size === memories.length) burst(originOf(counterRef.current), 0.8)
    }
  }

  return (
    <section id="memories" className="section memories" tabIndex={-1} aria-labelledby="memories-title">
      <SectionHead id="memories-title" eyebrow={copy.eyebrow} title={copy.title} description={copy.hint}>
        <div className="memories__tools">
          <button className="chip" onClick={() => setOrder((o) => shuffled(o))}>
            <IconShuffle width={16} height={16} />
            Перемешать
          </button>
          <p className="memories__counter" ref={counterRef} aria-live="polite">
            Прочитано <strong>{seen.size}</strong> из {memories.length}
          </p>
        </div>
      </SectionHead>

      <ul className="memories__grid container">
        {order.map((memory, i) => (
          <motion.li key={memory.id} layout transition={{ layout: { duration: 0.7, ease } }}>
            <MemoryCard memory={memory} index={i} flipped={flipped.has(memory.id)} onFlip={() => flip(memory.id)} />
          </motion.li>
        ))}
      </ul>
    </section>
  )
}

interface CardProps {
  memory: Memory
  index: number
  flipped: boolean
  onFlip: () => void
}

function MemoryCard({ memory, index, flipped, onFlip }: CardProps) {
  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
    e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
  }

  return (
    <motion.button
      type="button"
      className={`memory ${flipped ? 'is-flipped' : ''}`}
      style={{ '--memory-accent': memory.accent ?? 'var(--gold)' } as CSSProperties}
      onClick={onFlip}
      onPointerMove={onMove}
      aria-pressed={flipped}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay: (index % 4) * 0.08, ease }}
    >
      <span className="memory__inner">
        <span className="memory__face memory__front" aria-hidden={flipped}>
          <span className="memory__emoji" aria-hidden="true">
            {memory.emoji}
          </span>
          <span className="memory__date">{memory.date}</span>
          <span className="memory__title">{memory.title}</span>
          <span className="memory__teaser">{memory.teaser}</span>
          <span className="memory__hint">
            <IconRotate width={14} height={14} /> Перевернуть
          </span>
        </span>
        <span className="memory__face memory__back" aria-hidden={!flipped}>
          <span className="memory__back-title">{memory.title}</span>
          <span className="memory__story">{memory.story}</span>
          <span className="memory__date">{memory.date}</span>
        </span>
      </span>
    </motion.button>
  )
}
