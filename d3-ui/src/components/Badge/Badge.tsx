import { forwardRef } from 'react'
import { cn } from '../../lib/cn'
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
