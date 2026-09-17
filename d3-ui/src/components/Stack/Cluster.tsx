import { forwardRef } from 'react'
import { cn } from '../../lib/cn'
import { devOneOf } from '../../lib/dev'
import { layoutClasses, layoutElement, type LayoutElement, type LayoutFormAttributes, type SpaceStep } from './Stack'
import './Stack.css'

export type ClusterAlign = 'start' | 'center' | 'end' | 'baseline' | 'stretch'
export type ClusterJustify = 'start' | 'center' | 'end' | 'between'

export interface ClusterProps extends React.HTMLAttributes<HTMLElement>, LayoutFormAttributes {
  /** A step on the spacing scale. Defaults to `8`, the gap between two buttons. */
  gap?: SpaceStep
  /** Cross-axis alignment. Defaults to `center`; use `baseline` for mixed text sizes. */
  align?: ClusterAlign
  justify?: ClusterJustify
  as?: LayoutElement
}

/**
 * Children in a row that wraps: badges beside a timestamp, a set of buttons,
 * a title with its meta.
 *
 * It always wraps. A row that does not wrap is a row that overflows on a phone,
 * and the fix for too much in one row is less in the row.
 */
export const Cluster = forwardRef<HTMLElement, ClusterProps>(function Cluster(
  { gap = '8', align = 'center', justify, as = 'div', className, children, ...rest }, ref,
) {
  if (process.env.NODE_ENV !== 'production') {
    devOneOf('Cluster', 'align', align, ['start', 'center', 'end', 'baseline', 'stretch'])
  }
  const Element = layoutElement('Cluster', as)
  return (
    <Element ref={ref as React.Ref<HTMLDivElement>}
      className={cn('d3-cluster', layoutClasses('Cluster', gap, align, justify), className)} {...rest}>
      {children}
    </Element>
  )
})
