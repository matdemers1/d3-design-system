import { useEffect, useRef } from 'react'
import { cn } from '../../lib/cn'
import './PageHeader.css'

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** The page's `<h1>`, and the only one on the page. A noun, in sentence case. */
  title: string
  /** Part of the accessible name: "Inbox, 48 items", not a bare number after a title. */
  count?: number
  countLabel?: string
  /** One line. If it needs two it belongs on the page, not in the header. */
  description?: React.ReactNode
  /** Right-aligned. At most one `primary`, per the Button spec. */
  actions?: React.ReactNode
  /** A single named link to the parent — "Inbox", never "Back". Not a breadcrumb. */
  backTo?: { href: string; label: string }
  backIcon?: React.ReactNode
  /**
   * Moves focus to the `<h1>` on mount so a screen reader announces the new
   * page. A PageHeader mounts once per route, so this *is* the route change.
   *
   * **None of the four apps does this today** — every client-side navigation is
   * currently silent to assistive technology. Opt out only when the header is
   * not the top of a page.
   */
  focusOnMount?: boolean
}

export function PageHeader({
  title, count, countLabel, description, actions, backTo, backIcon,
  focusOnMount = true, className, ...rest
}: PageHeaderProps) {
  const h1 = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (focusOnMount) h1.current?.focus()
  }, [focusOnMount])

  const name = count !== undefined ? (countLabel ?? `${title}, ${count.toLocaleString()} items`) : undefined

  return (
    <div className={cn('d3-ph', className)} {...rest}>
      <div className="d3-ph__lead">
        {backTo ? (
          <a className="d3-ph__back" href={backTo.href}>
            {backIcon ? <span aria-hidden="true" style={{ display: 'flex' }}>{backIcon}</span> : null}
            {backTo.label}
          </a>
        ) : null}
        <h1 ref={h1} tabIndex={-1} className="d3-ph__title" aria-label={name}>
          {title}
          {count !== undefined ? (
            <span className="d3-ph__count" aria-hidden="true">{count.toLocaleString()} items</span>
          ) : null}
        </h1>
        {description ? <p className="d3-ph__desc">{description}</p> : null}
      </div>
      {actions ? <div className="d3-ph__actions">{actions}</div> : null}
    </div>
  )
}
