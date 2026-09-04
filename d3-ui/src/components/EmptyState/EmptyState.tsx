import { forwardRef } from 'react'
import { cn } from '../../lib/cn'
import './EmptyState.css'

/**
 * The four situations the apps currently render with the same string.
 *
 * "No items", "No feedback items found" and "No users found" are all used today
 * for *nothing exists yet*, *this filter matched nothing* and *we could not find
 * out* — which need different words and completely different actions. Offering
 * "Create your first item" to someone whose search failed is useless; offering
 * "Clear search" on someone's first day is confusing.
 */
export type EmptyStateKind = 'empty' | 'no-results' | 'error' | 'no-access'
export type EmptyStateSize = 'page' | 'inline' | 'row'

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Required, and it determines the action. This is what makes "No items" impossible. */
  kind: EmptyStateKind
  /** What is absent, specific to the situation. Never "No results". */
  heading: string
  /** One line of context — why it is empty, or what would fill it. */
  children?: React.ReactNode
  /** Only if one genuinely exists. No action is better than a fake one. */
  action?: React.ReactNode
  size?: EmptyStateSize
  icon?: React.ReactNode
  /** The heading level for the region this sits in. Defaults to `h3`. */
  headingLevel?: 2 | 3 | 4
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { kind, heading, children, action, size = 'page', icon, headingLevel = 3, className, ...rest },
  ref,
) {
  const Heading = `h${headingLevel}` as 'h3'
  return (
    <div
      ref={ref}
      // The error kind is rendered as part of the region, not fired at the user
      // mid-task — so it is polite, never role="alert".
      role={kind === 'error' ? 'status' : undefined}
      data-kind={kind}
      className={cn('d3-es', size !== 'page' && `d3-es--${size}`, className)}
      {...rest}
    >
      {icon ? <span className="d3-es__icon" aria-hidden="true">{icon}</span> : null}
      <div className="d3-es__text">
        <Heading className="d3-es__heading">{heading}</Heading>
        {children ? <p className="d3-es__body">{children}</p> : null}
      </div>
      {action ? <div className="d3-es__actions">{action}</div> : null}
    </div>
  )
})
