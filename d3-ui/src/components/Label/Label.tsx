import { forwardRef } from 'react'
import { cn } from '../../lib/cn'
import './Label.css'

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Marks the field optional. Required is the default, and is never asterisked. */
  optional?: boolean
  /**
   * `span` for a group label, where a real `<label>` would attach itself to a
   * control that already has one. Used by FormField's `as="group"` mode.
   */
  as?: 'label' | 'span'
}

/**
 * Names a control. Rarely used directly — FormField renders it, which is what
 * guarantees the `htmlFor`/`id` association exists.
 */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { optional = false, as = 'label', className, children, ...rest }, ref,
) {
  const Tag = as as 'label'
  return (
    <Tag ref={ref} className={cn('d3-lb', className)} {...rest}>
      {children}
      {optional ? <span className="d3-lb__optional">optional</span> : null}
    </Tag>
  )
})
