import { useSfx } from '../context/SfxContext'
import { IconMute, IconVolume } from './Icons'
import { MusicButton } from './MusicButton'
import './SoundToggles.css'

/** Top-right controls: page sounds and background music. */
export function SoundToggles() {
  const sfx = useSfx()
  const label = sfx.enabled ? 'Выключить звук страниц' : 'Включить звук страниц'
  return (
    <div className="sound-toggles">
      <button type="button" className="icon-btn" onClick={sfx.toggle} aria-pressed={sfx.enabled} aria-label={label} title={label}>
        {sfx.enabled ? <IconVolume /> : <IconMute />}
      </button>
      <MusicButton />
    </div>
  )
}
