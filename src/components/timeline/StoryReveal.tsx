import { AnimatePresence, motion } from 'motion/react'
import { useId, useState } from 'react'
import { IconArrowDown } from '../Icons'

const ease = [0.22, 1, 0.36, 1] as const

const wordParent = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.035, delayChildren: 0.1 } },
}
const word = {
  hidden: { opacity: 0, y: '0.5em', filter: 'blur(6px)' },
  visible: { opacity: 1, y: '0em', filter: 'blur(0px)', transition: { duration: 0.7, ease } },
}

/** Lead paragraph appears word by word; the rest fade in; extra paragraphs open on demand. */
export function StoryReveal({ story, more }: { story: string[]; more?: string[] }) {
  const [expanded, setExpanded] = useState(false)
  const moreId = useId()
  const [lead, ...rest] = story

  return (
    <div className="story">
      {lead && (
        <motion.p
          className="story__lead"
          variants={wordParent}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <span className="visually-hidden">{lead}</span>
          {lead.split(' ').map((w, i) => (
            <motion.span key={i} variants={word} className="story__word" aria-hidden="true">
              {w}{' '}
            </motion.span>
          ))}
        </motion.p>
      )}

      {rest.map((p, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9, delay: 0.15, ease }}
        >
          {p}
        </motion.p>
      ))}

      {more && more.length > 0 && (
        <>
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                id={moreId}
                key="more"
                className="story__more"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.6, ease }}
              >
                {more.map((p, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 + i * 0.12, ease }}
                  >
                    {p}
                  </motion.p>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          <button
            className={`story__toggle ${expanded ? 'is-open' : ''}`}
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls={expanded ? moreId : undefined}
          >
            <span>{expanded ? 'Свернуть' : 'Читать дальше'}</span>
            <IconArrowDown />
          </button>
        </>
      )}
    </div>
  )
}
