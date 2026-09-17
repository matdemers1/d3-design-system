import { forwardRef } from 'react'
import { cn } from '../../lib/cn'
import './FilterBar.css'

export interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The filter controls, each with a visible label: a `Select` or `Input` inside
   * a `FormField`, a `SegmentedControl` with its `aria-label`. A placeholder is
   * not a label, and neither is an icon.
   */
  children?: React.ReactNode
  /** The far edge: a result count, an export button. */
  trailing?: React.ReactNode
  /**
   * Names the group — "Filter the audit trail". When given, the bar is a
   * `role="group"`, so a screen reader announces what the controls filter.
   */
  'aria-label'?: string
}

/**
 * The controls that narrow a list, in a row above it.
 *
 * Replaces the filter card that stacked every control and its export button
 * down the page. From `md` the controls share one wrapping row with the result
 * count at the far edge; below `md` they stack full width.
 */
export const FilterBar = forwardRef<HTMLDivElement, FilterBarProps>(function FilterBar(
  { trailing, className, children, ...rest }, ref,
) {
  return (
    <div ref={ref} role={rest['aria-label'] || rest['aria-labelledby'] ? 'group' : undefined}
      className={cn('d3-fb', className)} {...rest}>
      <div className="d3-fb__controls">{children}</div>
      {trailing ? <div className="d3-fb__trailing">{trailing}</div> : null}
    </div>
  )
})
