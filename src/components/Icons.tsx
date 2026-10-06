import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = (props: IconProps): IconProps => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
  ...props,
})

export const IconPlay = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7 4.8v14.4a.8.8 0 0 0 1.2.7l11.6-7.2a.8.8 0 0 0 0-1.4L8.2 4.1a.8.8 0 0 0-1.2.7Z" fill="currentColor" stroke="none" />
  </svg>
)

export const IconPause = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="6" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" stroke="none" />
    <rect x="14" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" stroke="none" />
  </svg>
)

export const IconVolume = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4Z" fill="currentColor" stroke="none" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" />
  </svg>
)

export const IconMute = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4Z" fill="currentColor" stroke="none" />
    <path d="m16 9.5 5 5M21 9.5l-5 5" />
  </svg>
)

export const IconFullscreen = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4" />
  </svg>
)

export const IconClose = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const IconChevronLeft = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m14.5 5-7 7 7 7" />
  </svg>
)

export const IconChevronRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m9.5 5 7 7-7 7" />
  </svg>
)

export const IconArrowUp = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
)

export const IconArrowDown = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </svg>
)

export const IconMenu = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 8h16M4 16h11" />
  </svg>
)

export const IconShuffle = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M16 4h4v4M4 20 20 4M16 20h4v-4M4 4l6 6M14 14l6 6" />
  </svg>
)

export const IconRotate = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6" />
  </svg>
)

export const IconKeyboard = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
    <path d="M6.5 10h.01M10 10h.01M13.5 10h.01M17 10h.01M8 14h8" />
  </svg>
)

export const IconSparkle = (p: IconProps) => (
  <svg {...base(p)}>
    <path
      d="M12 2.5c.9 5.6 3 7.7 8.5 8.5-5.5.9-7.6 3-8.5 8.5-.9-5.5-3-7.6-8.5-8.5 5.5-.8 7.6-2.9 8.5-8.5Z"
      fill="currentColor"
      stroke="none"
    />
  </svg>
)

export const IconExpand = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" />
  </svg>
)
