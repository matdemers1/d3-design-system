import { useEffect, useRef } from 'react'
import { cn } from '../../lib/cn'
import { devWarn } from '../../lib/dev'
import { countLabel as countLabelOf, countWords, type CountNoun } from '../../lib/countLabel'
import './PageHeader.css'

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** The page's `<h1>`, and the only one on the page. A noun, in sentence case. */
  title: string
  /** Part of the accessible name: "Inbox, 48 items", not a bare number after a title. */
  count?: number
  /** Replaces the whole accessible name ("Inbox, 48 items"). The visible count is unchanged. */
  countLabel?: string
  /**
   * What the count counts, singular and plural: `{ one: 'person', other: 'people' }`
   * shows "5 people" and names the heading "People, 5 people". Default: items.
   */
  countNoun?: CountNoun
  /** One line. If it needs two it belongs on the page, not in the header. */
  description?: React.ReactNode
  /** Right-aligned. At most one `primary`, per the Button spec. */
  actions?: React.ReactNode
  /**
   * Leads the heading, decorative. Bindery repeats the sidebar's icon here, so a
   * screen confirms where you are instead of making you re-read the word you
   * just clicked.
   */
  icon?: React.ReactNode
  /**
   * A single named link to the parent — "Inbox", never "Back". Not a breadcrumb.
   * A slot rather than an `href`, so a router link keeps client-side navigation:
   * `back={<Link asChild><RouterLink to="/inbox">Inbox</RouterLink></Link>}`.
   */
  back?: React.ReactNode
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
  title, count, countLabel, countNoun, description, actions, back, icon,
  focusOnMount = true, className, ...rest
}: PageHeaderProps) {
  if (process.env.NODE_ENV !== 'production') {
    if (!title) devWarn('PageHeader.title', 'PageHeader: `title` is required — it is the page\'s <h1>.')
  }
  const h1 = useRef<HTMLHeadingElement>(null)
  const backRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (focusOnMount) h1.current?.focus()
  }, [focusOnMount])

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      const text = backRef.current?.textContent?.replace(/[←<‹\s]+/g, ' ').trim().toLowerCase()
      if (text === 'back' || text === 'go back') {
        devWarn('PageHeader.back', 'PageHeader: the back link should say where it goes — "Inbox", not "Back". ' +
          '"Back" tells a screen-reader user nothing about where they will land, so it names where it goes.')
      }
    }
  }, [back])

  const name = count !== undefined ? (countLabel ?? countLabelOf(title, count, countNoun)) : undefined

  return (
    <div className={cn('d3-ph', className)} {...rest}>
      <div className="d3-ph__lead">
        {back ? <div ref={backRef} className="d3-ph__back">{back}</div> : null}
        <h1 ref={h1} tabIndex={-1} className="d3-ph__title" aria-label={name}>
          {icon ? <span className="d3-ph__icon" aria-hidden="true">{icon}</span> : null}
          {title}
          {count !== undefined ? (
            // The visible count said "1 items" after the accessible name was fixed —
            // the two are built separately, so both use the same pluralisation now.
            <span className="d3-ph__count" aria-hidden="true">{countWords(count, countNoun)}</span>
          ) : null}
        </h1>
        {description ? <div className="d3-ph__desc">{description}</div> : null}
      </div>
      {actions ? <div className="d3-ph__actions">{actions}</div> : null}
    </div>
  )
}
