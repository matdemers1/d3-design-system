import { Children, cloneElement, isValidElement, useId } from 'react'
import { cn } from '../../lib/cn'
import { devWarn } from '../../lib/dev'
import { countLabel as countLabelOf } from '../../lib/countLabel'
import { CountBadge } from '../Badge/Badge'
import { Tooltip } from '../Tooltip/Tooltip'
import { useAppShell } from '../AppShell/AppShellContext'
import './SideNav.css'

export interface SideNavProps {
  /** `SideNavGroup`s, or `SideNavItem`s directly when there are few. */
  children?: React.ReactNode
  /**
   * Names the landmark. "Main" is right for an app's primary navigation; give
   * a second navigation on the same page a different name.
   */
  'aria-label'?: string
  className?: string
}

/**
 * The app's primary navigation: a `<nav>` landmark holding a list.
 *
 * Group past seven items (Bindery's rule, D-065). Destinations you set up once
 * and then forget — account, people, settings — belong in the AccountMenu, not
 * here: they make a daily list longer without being used daily.
 */
export function SideNav({ children, 'aria-label': label = 'Main', className }: SideNavProps) {
  const { collapsed } = useAppShell()
  return (
    <nav aria-label={label} className={cn('d3-snav', collapsed && 'd3-snav--collapsed', className)}>
      <ul className="d3-snav__list" role="list">{children}</ul>
    </nav>
  )
}

export interface SideNavGroupProps {
  /**
   * Names the group for assistive technology, and is shown above it. When the
   * shell collapses to a rail it is hidden visually and still names the group.
   */
  title?: string
  /** Keep the title as the group's name but do not show it. */
  hideTitle?: boolean
  children?: React.ReactNode
  className?: string
}

/**
 * A titled set of items. A `role="group"` labelled by its title, so a screen
 * reader hears "Find, group" before the links in it — the same grouping a
 * sighted reader gets from the heading and the space around it.
 */
export function SideNavGroup({ title, hideTitle = false, children, className }: SideNavGroupProps) {
  const { collapsed } = useAppShell()
  const id = useId()
  if (!title) {
    return (
      <li className={cn('d3-snav__group', className)}>
        <ul className="d3-snav__list" role="list">{children}</ul>
      </li>
    )
  }
  return (
    <li className={cn('d3-snav__group', className)}>
      <div role="group" aria-labelledby={id}>
        <span id={id} className={cn('d3-snav__title', (hideTitle || collapsed) && 'd3-snav__vh')}>{title}</span>
        <ul className="d3-snav__list" role="list">{children}</ul>
      </div>
    </li>
  )
}

interface SideNavItemBase {
  /** Decorative. Required in practice: a collapsed rail shows nothing else. */
  icon?: React.ReactNode
  /** The destination's name — and the tooltip on a collapsed rail. */
  label: string
  /** This is the page on screen. Sets `aria-current="page"`. */
  current?: boolean
  /** Work waiting there. Joins the name: "Review, 3 items". */
  count?: number
  /** Overrides the count's name: "Review, 3 waiting for review". */
  countLabel?: string
  className?: string
}

/**
 * Either `href`, or `asChild` with one empty link element inside — a router's
 * own link, so client-side navigation keeps working. The item supplies the
 * link's content:
 *
 * ```tsx
 * <SideNavItem asChild icon={<Search />} label="Search" current={isActive}>
 *   <RouterLink to="/search" />
 * </SideNavItem>
 * ```
 */
export type SideNavItemProps = SideNavItemBase & (
  | { href: string; asChild?: false; children?: never }
  | { asChild: true; href?: never; children: React.ReactElement }
)

export function SideNavItem(props: SideNavItemProps) {
  const { icon, label, current, count, countLabel, className } = props
  const { collapsed } = useAppShell()
  if (process.env.NODE_ENV !== 'production') {
    if (!label) devWarn('SideNavItem.label', 'SideNavItem: `label` is required — it is the link\'s name, and the ' +
      'only thing a collapsed rail can show on hover.')
    if (!props.href && !props.asChild) devWarn('SideNavItem.href', 'SideNavItem: pass `href`, or `asChild` with ' +
      'a router link inside. A navigation item that goes nowhere is not navigation.')
  }

  const hasCount = typeof count === 'number' && Number.isFinite(count)
  const name = hasCount && label ? (countLabel ?? countLabelOf(label, count)) : undefined
  const cls = cn('d3-snav__item', className)
  const content = (
    <>
      {icon ? <span className="d3-snav__icon" aria-hidden="true">{icon}</span> : null}
      <span className={cn('d3-snav__label', collapsed && 'd3-snav__vh')}>{label}</span>
      {hasCount && count > 0 && collapsed ? <span className="d3-snav__dot" aria-hidden="true" /> : null}
      {hasCount && count > 0 && !collapsed ? (
        <CountBadge
          count={count}
          label={name ?? String(count)}
          size="sm"
          max={99}
          aria-hidden="true"
          className="d3-snav__count"
        />
      ) : null}
    </>
  )
  const linkProps = {
    'aria-current': current ? ('page' as const) : undefined,
    'aria-label': name,
  }

  let link: React.ReactElement | null
  if (props.asChild) {
    const child = Children.toArray(props.children).find(isValidElement) as
      React.ReactElement<{ className?: unknown }> | undefined
    if (!child) {
      link = null
    } else {
      const own = child.props.className
      // A router's NavLink takes className as a function of its state.
      const merged = typeof own === 'function'
        ? (state: unknown) => cn(cls, (own as (s: unknown) => string)(state))
        : cn(cls, own as string | undefined)
      link = cloneElement(child, {
        className: merged,
        ...(current !== undefined ? { 'aria-current': linkProps['aria-current'] } : null),
        ...(name ? { 'aria-label': name } : null),
      } as Record<string, unknown>, content)
    }
  } else {
    link = <a href={props.href} className={cls} {...linkProps}>{content}</a>
  }

  return (
    <li className="d3-snav__li">
      {link && collapsed && label ? <Tooltip content={label} side="right">{link}</Tooltip> : link}
    </li>
  )
}
