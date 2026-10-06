import { useEffect, useState } from 'react'

/**
 * Returns the id of the element currently crossing the vertical centre of the
 * viewport. Keeps the last value while the centre line sits between elements.
 */
export function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState<string | null>(null)
  const key = ids.join('|')

  useEffect(() => {
    const elements = key
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [key])

  return active
}
