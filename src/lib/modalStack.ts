// Tracks how many dialogs are open, so page-level keyboard shortcuts and
// scroll locking know when to stay out of the way.

let count = 0

export const modalStack = {
  push() {
    count += 1
    if (count === 1) document.documentElement.classList.add('is-locked')
  },
  pop() {
    count = Math.max(0, count - 1)
    if (count === 0) document.documentElement.classList.remove('is-locked')
  },
  isOpen: () => count > 0,
}
