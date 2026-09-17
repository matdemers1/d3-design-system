import { forwardRef } from 'react'
import { cn } from '../../lib/cn'
import { devOneOf } from '../../lib/dev'
import './Grid.css'

/** The narrowest a tile may be: `sm` 16rem · `md` 20rem · `lg` 24rem. */
export type GridMinItemWidth = 'sm' | 'md' | 'lg'
export type GridElement = 'div' | 'ul' | 'ol'
const MINS = ['sm', 'md', 'lg'] as const

export interface GridProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * The narrowest a tile may be before a column drops. Defaults to `sm`, a
   * status tile. As many columns fit as the width allows, on the 24px gutter;
   * below `md` there is always one.
   */
  minItemWidth?: GridMinItemWidth
  /** `ul` when the tiles are a list of like things, with each child an `li`. */
  as?: GridElement
}

/**
 * Tiles of equal width that reflow: a dashboard's status tiles, a set of cards.
 *
 * Not a 12-column layout system. There is no `span`, no per-breakpoint column
 * count and no arbitrary template — a page that needs an asymmetric layout
 * composes Stacks, and D-068 says why.
 */
export const Grid = forwardRef<HTMLElement, GridProps>(function Grid(
  { minItemWidth = 'sm', as = 'div', className, children, ...rest }, ref,
) {
  if (process.env.NODE_ENV !== 'production') {
    devOneOf('Grid', 'minItemWidth', minItemWidth, MINS)
    devOneOf('Grid', 'as', as, ['div', 'ul', 'ol'])
  }
  const Element = (['div', 'ul', 'ol'].includes(as) ? as : 'div') as 'div'
  const min = (MINS as readonly string[]).includes(minItemWidth) ? minItemWidth : 'sm'
  return (
    <Element ref={ref as React.Ref<HTMLDivElement>} className={cn('d3-grid', `d3-grid--${min}`, className)} {...rest}>
      {children}
    </Element>
  )
})
