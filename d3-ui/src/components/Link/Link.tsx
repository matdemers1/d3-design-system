import { forwardRef } from 'react'
import { cn } from '../../lib/cn'
import { ExternalGlyph } from '../../lib/glyphs'
import { devWarn } from '../../lib/dev'
import './Link.css'

export type LinkVariant = 'standalone' | 'inline' | 'muted'

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Required. An element without `href` is not a link — if it acts, use a Button. */
  href: string
  variant?: LinkVariant
  /**
   * Opens in a new tab: adds `rel="noopener"`, a trailing external icon, and
   * "(opens in a new tab)" to the accessible name.
   */
  external?: boolean
  /** The external-link glyph. Passed in so the library does not force an icon set here. */
  externalIcon?: React.ReactNode
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, variant = 'standalone', external = false, externalIcon, className, children, ...rest },
  ref,
) {
  if (process.env.NODE_ENV !== 'production') {
    if (!href) {
      devWarn('Link.href', 'Link: `href` is required. A link that goes nowhere is a button — use <Button variant="ghost">.')
    }
  }
  return (
    <a
      ref={ref}
      href={href}
      className={cn('d3-lnk', variant !== 'standalone' && `d3-lnk--${variant}`, className)}
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
