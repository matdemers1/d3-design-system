import { Children, forwardRef, useEffect, useRef } from 'react'
import { cn } from '../../lib/cn'
import { devWarn, useMergedRef } from '../../lib/dev'
import './DataList.css'

export interface DataListProps extends React.HTMLAttributes<HTMLUListElement> {
  /** `DataListRow`s. */
  children?: React.ReactNode
  /**
   * Rendered instead of the list when there are no rows — an `EmptyState`,
   * with the `kind` that fits: `empty` before anything exists, `no-results`
   * when a filter matched nothing. Its `size` is usually `inline`.
   */
  empty?: React.ReactNode
}

/**
 * A list of like things, one row each: people, apps, sessions, log entries.
 *
 * **Rows, not a table** (D-067). A real `ul` of `li`s, because a person with a
 * name, a badge and two buttons is an item, not a record of cells — and a table
 * would promise column headers, sorting and cell navigation that this does not
 * have. Meta and actions still line up down the list.
 */
export const DataList = forwardRef<HTMLUListElement, DataListProps>(function DataList(
  { className, children, empty, ...rest }, ref,
) {
  const rows = Children.toArray(children)
  if (rows.length === 0 && empty) return <div className="d3-dlist-empty">{empty}</div>
  return (
    // role="list" restores the list semantics Safari drops from a list styled
    // with `list-style: none`.
    <ul ref={ref} role="list" className={cn('d3-dlist', className)} {...rest}>{children}</ul>
  )
})

interface DataListRowBase extends Omit<React.HTMLAttributes<HTMLLIElement>, 'title'> {
  /** Required. What the row is — a name, an event. A Link when the row has actions. */
  title: React.ReactNode
  /** A secondary line: an email address, the actor and target. */
  description?: React.ReactNode
  /** Leads the row: an Avatar or an icon. */
  leading?: React.ReactNode
  /** Badges, a timestamp, a count. Tabular figures; aligned down the list. */
  meta?: React.ReactNode
  /**
   * One line each for title and description, truncated with an ellipsis
   * (D-019). `false` lets them wrap — for a log line whose detail is the point.
   */
  truncate?: boolean
}

/**
 * **A row is either a link or it holds actions — never both.** The same rule as
 * Card: a control inside a control is unreachable in some screen-reader modes
 * and takes the whole row's text as its name.
 *
 * - `href` makes the whole row one link, with no `actions`.
 * - `actions` keeps the row inert; make the `title` a `Link` to navigate.
 */
export type DataListRowProps = DataListRowBase & (
  | { href?: undefined; actions?: React.ReactNode }
  | { href: string; actions?: never }
)

const INTERACTIVE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'

export const DataListRow = forwardRef<HTMLLIElement, DataListRowProps>(function DataListRow(
  { title, description, leading, meta, actions, href, truncate = true, className, ...rest }, ref,
) {
  const link = useRef<HTMLAnchorElement | null>(null)
  const local = useRef<HTMLLIElement | null>(null)
  const setRef = useMergedRef(ref, local)

  if (process.env.NODE_ENV !== 'production') {
    if (title === undefined || title === null || title === '') {
      devWarn('DataListRow.title', 'DataListRow: `title` is required — it is what the row is.')
    }
    if (href && actions) {
      devWarn('DataListRow.href+actions', 'DataListRow: a row with `href` is one link, so its `actions` are not ' +
        'rendered — a control inside a control is unreachable in some screen-reader modes. ' +
        'Drop `href` and make the `title` a Link instead.')
    }
  }

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' || !href) return
    if (link.current?.querySelector(INTERACTIVE)) {
      devWarn('DataListRow.nested', 'DataListRow: a row with `href` contains its own interactive element. ' +
        'A control inside a control is unreachable in some screen-reader modes. ' +
        'Drop `href` and make the `title` a Link instead.')
    }
  }, [href, title, description, leading, meta])

  const body = (
    <>
      {leading ? <span className="d3-dlrow__leading">{leading}</span> : null}
      <span className="d3-dlrow__text">
        <span className="d3-dlrow__title">{title}</span>
        {description ? <span className="d3-dlrow__desc">{description}</span> : null}
      </span>
      {meta ? <span className="d3-dlrow__meta">{meta}</span> : null}
    </>
  )
  const cls = cn('d3-dlrow', truncate && 'd3-dlrow--truncate')

  return (
    <li ref={setRef} className={cn('d3-dlist__item', className)} {...rest}>
      {href ? (
        <a ref={link} href={href} className={cls}>{body}</a>
      ) : (
        <div className={cls}>
          {body}
          {actions ? <div className="d3-dlrow__actions">{actions}</div> : null}
        </div>
      )}
    </li>
  )
})
