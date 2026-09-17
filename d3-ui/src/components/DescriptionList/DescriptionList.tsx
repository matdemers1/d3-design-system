import { forwardRef } from 'react'
import { cn } from '../../lib/cn'
import { devWarn } from '../../lib/dev'
import './DescriptionList.css'

export interface DescriptionListProps extends React.HTMLAttributes<HTMLDListElement> {
  /** `DescriptionItem`s. */
  children?: React.ReactNode
}

/**
 * Terms and their values — the facts about one thing: a person's username and
 * last sign-in, an app's client type and redirect URIs.
 *
 * A real `<dl>`, so a screen reader announces the pairing. Two columns from
 * `sm`, stacked below it.
 */
export const DescriptionList = forwardRef<HTMLDListElement, DescriptionListProps>(function DescriptionList(
  { className, children, ...rest }, ref,
) {
  return <dl ref={ref} className={cn('d3-desc', className)} {...rest}>{children}</dl>
})

export interface DescriptionItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Required. What the value is: "Last signed in". */
  term: React.ReactNode
  /** The value. Text, a Badge, a Link, `code`. */
  children?: React.ReactNode
  /**
   * Tabular figures for a numeric value, so counts and timestamps line up
   * down the list and a polled value does not jitter in place (D-019).
   */
  numeric?: boolean
}

/** One term and its value, grouped in a `div` — valid inside a `dl`. */
export const DescriptionItem = forwardRef<HTMLDivElement, DescriptionItemProps>(function DescriptionItem(
  { term, numeric, className, children, ...rest }, ref,
) {
  if (process.env.NODE_ENV !== 'production') {
    if (term === undefined || term === null || term === '') {
      devWarn('DescriptionItem.term', 'DescriptionItem: `term` is required — a value with no term is announced with nothing to say what it is.')
    }
  }
  return (
    <div ref={ref} className={cn('d3-desc__item', className)} {...rest}>
      <dt className="d3-desc__term">{term}</dt>
      <dd className={cn('d3-desc__value', numeric && 'd3-desc__value--numeric')}>{children}</dd>
    </div>
  )
})
