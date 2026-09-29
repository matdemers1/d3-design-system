import { forwardRef } from 'react'
import { cn } from '../../lib/cn'
import './Stat.css'

export interface StatProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** What is measured: "Inbound queue". Read first. */
  label: React.ReactNode
  /** The number or word that answers it: "0", "89", "Delivering". Tabular figures. */
  value: React.ReactNode
  /** After the value, smaller and muted: "days", "waiting". */
  unit?: React.ReactNode
  /** A line of context under the tile: "Last delivery 4 min ago". */
  footnote?: React.ReactNode
  /** A `StatusDot`, shown under the value. */
  status?: React.ReactNode
}

/**
 * A number-forward tile. DOM order is label, value, unit, status, footnote, so
 * a screen reader says "Inbound queue, 0, waiting, Healthy" without any ARIA.
 * The status sits under the value, not beside the label: it reads after the
 * thing it qualifies and cannot be squeezed out of a narrow tile by a long label.
 */
export const Stat = forwardRef<HTMLDivElement, StatProps>(function Stat(
  { label, value, unit, footnote, status, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn('d3-stat', className)} {...rest}>
      <span className="d3-stat__label">{label}</span>
      <span className="d3-stat__value">
        <span className="d3-stat__number">{value}</span>
        {unit !== undefined && unit !== null && unit !== '' && (
          <span className="d3-stat__unit">{unit}</span>
        )}
      </span>
      {status !== undefined && status !== null && <span className="d3-stat__status">{status}</span>}
      {footnote !== undefined && footnote !== null && footnote !== '' && (
        <span className="d3-stat__foot">{footnote}</span>
      )}
    </div>
  )
})

export type StatGroupProps = React.HTMLAttributes<HTMLDivElement>

/**
 * `Stat` tiles in one row with 1px hairlines between them and equal widths,
 * two columns below `md`. A plain `div`: the tiles are not a list of items to
 * navigate but one strip to read left to right. Give it `role="group"` and an
 * `aria-label` when it needs a name.
 */
export const StatGroup = forwardRef<HTMLDivElement, StatGroupProps>(function StatGroup(
  { className, children, ...rest }, ref,
) {
  return <div ref={ref} className={cn('d3-stat-group', className)} {...rest}>{children}</div>
})
