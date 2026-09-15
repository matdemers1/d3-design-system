import { forwardRef } from 'react'
import { cn } from '../../lib/cn'
import { ExternalGlyph } from '../../lib/glyphs'
import { devWarn } from '../../lib/dev'
import { Slot } from '../../lib/slot'
import './Link.css'

export type LinkVariant = 'standalone' | 'inline' | 'muted'

interface LinkBaseProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  variant?: LinkVariant
  /**
   * Opens in a new tab: adds `rel="noopener"`, a trailing external icon, and
   * "(opens in a new tab)" to the accessible name. Not with `asChild` — a router
   * link navigates inside the app.
   */
  external?: boolean
  /** Overrides the built-in external-link glyph. */
  externalIcon?: React.ReactNode
}

/**
 * Either an `href`, or `asChild` with a single link element inside — a router's
 * own link, so client-side navigation keeps working:
 *
 * ```tsx
 * <Link asChild><RouterLink to="/pipeline">Pipeline</RouterLink></Link>
 * ```
 */
export type LinkProps = LinkBaseProps & (
  | { href: string; asChild?: false }
  | { asChild: true; href?: never }
)

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, asChild = false, variant = 'standalone', external = false, externalIcon, className, children, ...rest },
  ref,
) {
  if (process.env.NODE_ENV !== 'production') {
    if (!href && !asChild) {
      devWarn('Link.href', 'Link: `href` is required. A link that goes nowhere is a button — use <Button variant="ghost">. ' +
        'For a router link, use <Link asChild><RouterLink to="…">…</RouterLink></Link>.')
    }
    if (asChild && external) {
      devWarn('Link.asChild.external', 'Link: `external` is ignored with `asChild` — a router link navigates inside the app.')
    }
  }
  const cls = cn('d3-lnk', variant !== 'standalone' && `d3-lnk--${variant}`, className)
  if (asChild) {
    return <Slot ref={ref as React.Ref<HTMLElement>} className={cls} {...rest}>{children}</Slot>
  }
  return (
    <a
      ref={ref}
      href={href}
      className={cls}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : null)}
      {...rest}
    >
      {children}
      {external ? (
        <>
          {/* Always a visible cue. Screen readers already heard "opens in a new
              tab"; without a default glyph, sighted readers got nothing. */}
          <span className="d3-lnk__ext" aria-hidden="true">{externalIcon ?? <ExternalGlyph />}</span>
          <span
            style={{
              position: 'absolute', width: 1, height: 1, padding: 0, margin: -1,
              overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0,
            }}
          >
            {' '}(opens in a new tab)
          </span>
        </>
      ) : null}
    </a>
  )
})
