import { motion, type HTMLMotionProps } from 'motion/react'

const ease = [0.22, 1, 0.36, 1] as const

/** Fades content up into place the first time it scrolls into view. */
export function Reveal({ delay = 0, y = 28, ...props }: HTMLMotionProps<'div'> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.9, delay, ease }}
      {...props}
    />
  )
}
