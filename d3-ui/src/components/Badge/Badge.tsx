import { forwardRef } from 'react'
import { cn } from '../../lib/cn'
import { devOneOf, devWarn } from '../../lib/dev'
import './Badge.css'

export type BadgeTone = 'neutral' | 'attention' | 'danger'
export type BadgeSize = 'sm' | 'md'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * `neutral` for anything in progress, parked or terminal. `attention` only
   * where seeing it should change what the user does next. `danger` for blocked
   * or failed. There is no `color` prop, and no `success` or `info` tone.
   */
  tone?: BadgeTone
  size?: BadgeSize
}

/** A compact status. Never interactive — a clickable badge is a Button. */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone = 'neutral', size = 'md', className, children, ...rest },
  ref,
) {
  if (process.env.NODE_ENV !== 'production') {
    devOneOf('Badge', 'tone', tone, ['neutral', 'attention', 'danger'])
    // React's types allow `color` on any HTML element, so this type-checks and
    // silently sets a meaningless attribute. It is the prop every other library has.
    if ('color' in rest) {
      devWarn('Badge.color', 'Badge: there is no `color` prop — it is passed to the <span> and does nothing. ' +
        'Use `tone` ("neutral", "attention" or "danger"). A status earns a hue only if seeing it changes what you do next.')
    }
  }
  return (
    <span
      ref={ref}
      className={cn('d3-bdg', `d3-bdg--${tone}`, `d3-bdg--${size}`, className)}
      {...rest}
    >
      {children}
    </span>
  )
})

export interface CountBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  count: number
  /** What is being counted. Becomes "48 unread items" rather than a bare "48". */
  label: string
  quiet?: boolean
  size?: BadgeSize
  /** Values above this render as e.g. "99+". */
  max?: number
}

export const CountBadge = forwardRef<HTMLSpanElement, CountBadgeProps>(function CountBadge(
  { count, label, quiet = false, size = 'md', max, className, ...rest },
  ref,
) {
  if (process.env.NODE_ENV !== 'production') {
    if (!label) {
      devWarn('CountBadge.label', 'CountBadge: `label` is required. Without it a screen reader reads a bare ' +
        'number with no unit — "3", not "3 waiting for review".')
    }
    if (typeof count !== 'number' || !Number.isFinite(count)) {
      devWarn('CountBadge.count', `CountBadge: \`count\` must be a finite number; received ${String(count)}.`)
    }
  }
  // A JS caller can pass anything. Render nothing rather than take the page
  // down; the development warning above says what was wrong.
  if (typeof count !== 'number' || !Number.isFinite(count)) return null
  const shown = max !== undefined && count > max ? `${max}+` : count.toLocaleString()
  return (
    <span
      ref={ref}
      aria-label={label}
      className={cn('d3-bdg', `d3-bdg--${size}`,
        quiet ? 'd3-bdg--count-quiet' : 'd3-bdg--count', className)}
      {...rest}
    >
      {shown}
    </span>
  )
})
