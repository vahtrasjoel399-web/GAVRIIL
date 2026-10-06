export function scrollToId(id: string, reduced: boolean) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  // Move keyboard focus along with the view (sections carry tabIndex=-1).
  if (el.tabIndex === -1) el.focus({ preventScroll: true })
}

export function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
}
