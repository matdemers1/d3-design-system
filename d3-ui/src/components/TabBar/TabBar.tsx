import { Children, forwardRef, isValidElement } from 'react'
import { cn } from '../../lib/cn'
import { devWarn } from '../../lib/dev'
import { CountBadge } from '../Badge/Badge'
import './TabBar.css'

export interface TabBarItemProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
  /** Where it goes. A tab is a destination, so it is always a link. */
  href: string
  /** The icon. Rendered `aria-hidden` and sized to 22px — `label` carries the name. */
  icon: React.ReactNode
  /** The visible label, drawn under the icon. It is also the accessible name. */
  label: string
  /** This is the page on screen. Sets `aria-current="page"`; absent otherwise, never `"false"`. */
  current?: boolean
  /** Work waiting there. Drawn as a badge on the icon and folded into the link's name. */
  count?: number
  /** Overrides the count's spoken name: "Activity, 3 failed deploys". Defaults to "Activity, 3 new". */
  countLabel?: string
}

/**
 * One destination: an icon over a label, always an `<a>`. Items share the bar's
 * width equally and are never under 44 x 44px.
 *
 * A count is drawn once and spoken once: the badge is `aria-hidden` and the
 * link's name carries it ("Activity, 3 new"), so a screen reader does not read
 * the number twice. The badge hangs off the icon's top-right corner, outside the
 * icon's box, so it never covers the glyph it is annotating.
 */
export const TabBarItem = forwardRef<HTMLAnchorElement, TabBarItemProps>(function TabBarItem(
  { href, icon, label, current = false, count, countLabel, className, ...rest },
  ref,
) {
  if (process.env.NODE_ENV !== 'production') {
    if (!label) {
      devWarn('TabBar.Item.label', 'TabBar.Item: `label` is required. The bar shows a word under ' +
        'every icon; an unlabelled icon is the thing this component exists to prevent.')
    }
    if (!href) {
      devWarn('TabBar.Item.href', 'TabBar.Item: `href` is required. A tab is a destination, and a ' +
        'destination is a link.')
    }
  }
  const hasCount = typeof count === 'number' && Number.isFinite(count) && count > 0
  const name = hasCount && label ? (countLabel ?? `${label}, ${count.toLocaleString()} new`) : undefined
  return (
    <a
      ref={ref}
      {...rest}
      href={href}
      aria-current={current ? 'page' : undefined}
      aria-label={name ?? rest['aria-label']}
      className={cn('d3-tbar__item', className)}
    >
      <span className="d3-tbar__glyph">
        <span className="d3-tbar__icon" aria-hidden="true">{icon}</span>
        {hasCount ? (
          <CountBadge
            count={count}
            label={name ?? String(count)}
            size="sm"
            max={99}
            aria-hidden="true"
            className="d3-tbar__badge"
          />
        ) : null}
      </span>
      <span className="d3-tbar__label">{label}</span>
    </a>
  )
})

export interface TabBarProps extends Omit<React.HTMLAttributes<HTMLElement>, 'aria-label'> {
  /** Names the landmark — "Primary", "Sections". Required: a page with two navs needs them told apart. */
  'aria-label': string
  /**
   * Show the bar at every width. By default it is a phone pattern and is hidden
   * from `lg` (1024px, the AppShell breakpoint) upward, where the same
   * destinations belong in the SideNav.
   */
  forceVisible?: boolean
}

/**
 * A phone bottom tab bar: three to five destinations, each an icon over a
 * visible label, the current one marked.
 *
 * **Semantics: a `<nav>` of links** — the destinations are the app's navigation,
 * so this is a landmark, unlike ActionBar's `role="group"` of actions. The
 * current destination is `aria-current="page"`, not a `role="tab"`: these are
 * page links, not panels of one page, and a tablist would promise arrow-key
 * roving the bar does not do. Every item is a tab stop.
 *
 * **Three to five.** Fewer is a toggle, more does not fit under a thumb at
 * 390px with a readable label; a sixth destination belongs behind a "More"
 * item. A development warning says so.
 *
 * **Position is the caller's**, as with ActionBar: last in a `100dvh` flex
 * column, or `position: sticky; bottom: 0`. It pads the bottom by the larger of
 * `--space-8` and the device's safe-area inset (the page needs
 * `viewport-fit=cover` for the inset to be non-zero).
 */
export const TabBar = forwardRef<HTMLElement, TabBarProps>(function TabBar(
  { forceVisible = false, className, children, ...rest },
  ref,
) {
  if (process.env.NODE_ENV !== 'production') {
    if (!rest['aria-label']) {
      devWarn('TabBar.aria-label', 'TabBar: `aria-label` is required. A bare <nav> is announced as ' +
        '"navigation" and cannot be told apart from the page\'s other navigation.')
    }
    const n = Children.toArray(children).filter(isValidElement).length
    if (n < 3 || n > 5) {
      devWarn(`TabBar.count.${n}`, `TabBar: has ${n} destinations; use three to five. Fewer is a toggle, ` +
        'more will not fit under a thumb with a readable label — put the rest behind a "More" item.')
    }
  }
  return (
    <nav ref={ref} {...rest} className={cn('d3-tbar', forceVisible && 'd3-tbar--force', className)}>
      {children}
    </nav>
  )
}) as React.ForwardRefExoticComponent<TabBarProps & React.RefAttributes<HTMLElement>> & {
  Item: typeof TabBarItem
}
TabBar.Item = TabBarItem
