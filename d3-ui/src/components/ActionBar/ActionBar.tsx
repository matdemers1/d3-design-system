import { forwardRef } from 'react'
import { cn } from '../../lib/cn'
import { devOneOf, devWarn } from '../../lib/dev'
import './ActionBar.css'

export type ActionBarItemTone = 'default' | 'accent'

interface ActionBarItemBaseProps {
  /** The icon. Rendered `aria-hidden` and sized to 22px — `label` carries the name. */
  icon: React.ReactNode
  /** The visible label, drawn under the icon. It is also the accessible name. */
  label: string
  /** `accent` marks the one action the screen is for — Reply, Compose. One per bar. */
  tone?: ActionBarItemTone
  disabled?: boolean
  className?: string
}

export type ActionBarItemProps = ActionBarItemBaseProps & (
  | ({ href?: undefined } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'disabled'>)
  | ({ href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'>)
)

/**
 * One action: an icon over a label. A `<button>` by default, an `<a>` when
 * `href` is given. Items share the bar's width equally and are never under
 * 44 x 44px.
 *
 * A disabled link has no `href` — an anchor cannot be disabled, so it renders
 * as `aria-disabled` and leaves the tab order, rather than a link that looks
 * dead and still navigates.
 */
export const ActionBarItem = forwardRef<HTMLButtonElement | HTMLAnchorElement, ActionBarItemProps>(
  function ActionBarItem(props, ref) {
    const { icon, label, tone = 'default', disabled = false, className, ...rest } = props
    if (process.env.NODE_ENV !== 'production') {
      devOneOf('ActionBar.Item', 'tone', tone, ['default', 'accent'])
      if (!label) {
        devWarn('ActionBar.Item.label', 'ActionBar.Item: `label` is required. The bar shows a word under ' +
          'every icon; an unlabelled icon is the thing this component exists to prevent.')
      }
    }
    const cls = cn('d3-abar__item', tone === 'accent' && 'd3-abar__item--accent', className)
    const inner = (
      <>
        <span className="d3-abar__icon" aria-hidden="true">{icon}</span>
        <span className="d3-abar__label">{label}</span>
      </>
    )

    if ('href' in rest && rest.href !== undefined) {
      const { href, ...anchor } = rest as React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          {...anchor}
          href={disabled ? undefined : href}
          aria-disabled={disabled || undefined}
          className={cls}
        >
          {inner}
        </a>
      )
    }
    const { type = 'button', href: _unused, ...button } = rest as React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }
    void _unused
    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} type={type} {...button} disabled={disabled} className={cls}>
        {inner}
      </button>
    )
  },
)

export interface ActionBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'aria-label'> {
  /** Names the group — "Conversation actions". Required: a bare group is announced as nothing. */
  'aria-label': string
  /**
   * Show the bar at every width. By default it is a phone pattern and is hidden
   * from `lg` (1024px, the AppShell breakpoint) upward, where the same actions
   * belong in the page header or a toolbar.
   */
  forceVisible?: boolean
}

/**
 * A phone bottom bar of labelled icon actions — the thumb-reach row under a
 * conversation, a message or a photo.
 *
 * **Semantics: a labelled `role="group"` of plain buttons in tab order** — not a
 * `toolbar` and not a `<nav>`. APG makes a toolbar one tab stop with arrow-key
 * roving, which is right for a dense row on a keyboard and wrong for five
 * targets under a thumb, where every item should be reachable directly. And the
 * items are actions, not destinations, so `<nav>` would add a landmark that is
 * mostly not navigation. Items that are links are still links inside the group.
 *
 * **Position is the caller's.** It is a normal block; to pin it to the bottom
 * of a phone screen, put it last in a flex column that is `100dvh` tall, or
 * `position: sticky; bottom: 0` it. `position: fixed` also needs the content
 * above it to reserve the bar's height, which only the caller knows.
 *
 * It sits on `surface` with a top hairline, and pads the bottom by the larger
 * of `--space-8` and the device's safe-area inset, so the home indicator never
 * overlaps a label (the page needs `viewport-fit=cover` for the inset to be non-zero).
 */
export const ActionBar = forwardRef<HTMLDivElement, ActionBarProps>(function ActionBar(
  { forceVisible = false, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="group"
      {...rest}
      className={cn('d3-abar', forceVisible && 'd3-abar--force', className)}
    >
      {children}
    </div>
  )
}) as React.ForwardRefExoticComponent<ActionBarProps & React.RefAttributes<HTMLDivElement>> & {
  Item: typeof ActionBarItem
}
ActionBar.Item = ActionBarItem
