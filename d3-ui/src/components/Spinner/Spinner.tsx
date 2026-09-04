import { forwardRef } from 'react'
import { cn } from '../../lib/cn'
import './Spinner.css'

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl'

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize
  /** For a spinner sitting on an accent fill, e.g. inside a primary Button. */
  onAccent?: boolean
  /**
   * What is being waited for. Rendered as the accessible name via `role="status"`.
   * Omit ONLY when adjacent text already announces the wait — then the spinner
   * is hidden from assistive technology instead.
   */
  label?: string
}

/** Three nodes on a ring of radius 8, starting at twelve o'clock. */
const N = [
  [12, 4],
  [18.93, 16],
  [5.07, 16],
] as const
const EDGES = [
  [0, 1],
  [1, 2],
  [2, 0],
] as const

/**
 * Indeterminate progress for an action in flight.
 *
 * **It is a graph, not a wheel.** D3 draws force-directed graphs and the cloud
 * is the link, so waiting is drawn as a small network that is still resolving
 * with a signal relaying around its edges — rather than the ring every
 * framework ships. The substrate leads: the triangle rotates and contracts as
 * if a simulation had not settled, and the relay is the detail on top of it.
 *
 * The two run on periods of 1200ms and 2400ms — exactly 2:1, so they never
 * drift into a beat against each other.
 *
 * Prefer `Skeleton` for anything whose shape is knowable — a spinner over a
 * blank region hides the shape, the count and the wait. "Loading…" as a lone
 * state is on the banned list (3g).
 */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = 'md', onAccent = false, label, className, ...rest },
  ref,
) {
  const a11y = label
    ? ({ role: 'status', 'aria-label': label } as const)
    : ({ 'aria-hidden': true } as const)

  return (
    <span
      ref={ref}
      className={cn('d3-spn', `d3-spn--${size}`, onAccent && 'd3-spn--on-accent', className)}
      {...a11y}
      {...rest}
    >
      {/* The name lives on the wrapper; the drawing never speaks. */}
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <g className="d3-spn__g">
          {EDGES.map(([a, b], i) => (
            <line
              key={i}
              className={`d3-spn__edge d3-spn__edge--${i + 1}`}
              x1={N[a][0]} y1={N[a][1]} x2={N[b][0]} y2={N[b][1]}
            />
          ))}
          {N.map(([x, y], i) => (
            <circle key={i} className={`d3-spn__node d3-spn__node--${i + 1}`} cx={x} cy={y} />
          ))}
        </g>
      </svg>
    </span>
  )
})
