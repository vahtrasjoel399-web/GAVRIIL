import { Starfield } from './Starfield'
import './Backdrop.css'

/** Fixed ambient layer behind the page: accent-tinted light, stars, vignette. */
export function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop__glow backdrop__glow--a" />
      <div className="backdrop__glow backdrop__glow--b" />
      <Starfield />
      <div className="backdrop__vignette" />
    </div>
  )
}
