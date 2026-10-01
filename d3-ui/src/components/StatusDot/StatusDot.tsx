import { forwardRef } from 'react'
import { cn } from '../../lib/cn'
import { devOneOf } from '../../lib/dev'
import './StatusDot.css'

export type StatusDotTone = 'neutral' | 'attention' | 'warning' | 'danger' | 'idle'
export type StatusDotSize = 'sm' | 'md'

const TONES = ['neutral', 'attention', 'warning', 'danger', 'idle'] as const

export interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * `neutral` for anything healthy, running, in progress or done — the default.
   * `attention` only where seeing it should change what you do next — new, or
   * waiting on you. `warning` (1.5, D-086) for degraded, delayed or retrying: it
   * needs a look, not action now. `danger` for failed or blocked. `idle` for
   * parked or switched off: a dimmer neutral.
   * There is no `success` tone and no `color` prop (D-016).
   */
  tone?: StatusDotTone
  size?: StatusDotSize
  /** The status in words. The dot is decoration; this text carries the meaning. */
  children: React.ReactNode
}

/**
 * A status as a dot and a word. The dot is `aria-hidden`, so colour is never the
 * only signal (WCAG 1.4.1) and a screen reader reads just the text.
 */
export const StatusDot = forwardRef<HTMLSpanElement, StatusDotProps>(function StatusDot(
  { tone = 'neutral', size = 'md', className, children, ...rest },
  ref,
) {
  if (process.env.NODE_ENV !== 'production') {
    devOneOf('StatusDot', 'tone', tone, TONES)
  }
  return (
    <span
      ref={ref}
      className={cn('d3-sdot', `d3-sdot--${tone}`, `d3-sdot--${size}`, className)}
      {...rest}
    >
      <span className="d3-sdot__dot" aria-hidden="true" />
      {children}
    </span>
  )
})
