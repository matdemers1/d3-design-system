import { forwardRef, useEffect, useRef } from 'react'
import { cn } from '../../lib/cn'
import './Card.css'

export type CardPadding = 'sm' | 'md' | 'lg'

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  padding?: CardPadding
  selected?: boolean
  /**
   * Makes the whole card a single control. Renders a real `<a>` when `href` is
   * given, otherwise a `<button>` — never a `div` with an onClick.
   *
   * **A card is either wholly clickable or it contains actions, never both.**
   * A control nested inside a control is unreachable in some screen-reader
   * modes, swallows clicks meant for the inner one, and takes the card's entire
   * text as its accessible name. If the card has internal actions, leave this
   * off and make the *title* the link.
   */
  interactive?: boolean
  href?: string
}

const INTERACTIVE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'

export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { padding = 'md', selected, interactive, href, className, children, ...rest }, ref,
) {
  const local = useRef<HTMLElement>(null)

  // Dev-only: the nested-interactive rule is the one most easily broken by
  // accident, so it warns rather than waiting to be found by a screen-reader user.
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' || !interactive) return
    const el = local.current
    if (el && el.querySelector(INTERACTIVE)) {
      console.warn(
        '[d3-ui] Card: an interactive Card contains its own interactive element. ' +
        'A control inside a control is unreachable in some screen-reader modes. ' +
        'Drop `interactive` and make the title the link instead.',
      )
    }
  }, [interactive, children])

  const cls = cn('d3-crd', `d3-crd--${padding}`, interactive && 'd3-crd--interactive',
    selected && 'd3-crd--selected', className)

  const setRefs = (node: HTMLElement | null) => {
    ;(local as React.MutableRefObject<HTMLElement | null>).current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node
  }

  if (interactive && href) {
    return <a ref={setRefs as React.Ref<HTMLAnchorElement>} href={href} className={cls} {...rest}>{children}</a>
  }
  if (interactive) {
    return (
      <button ref={setRefs as React.Ref<HTMLButtonElement>} type="button" className={cls} {...rest}>
        {children}
      </button>
    )
  }
  return <div ref={setRefs as React.Ref<HTMLDivElement>} className={cls} {...rest}>{children}</div>
})

export const CardTitle = ({ children, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className="d3-crd__title" {...rest}>{children}</p>
)
export const CardBody = ({ children, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className="d3-crd__body" {...rest}>{children}</p>
)
export const CardFooter = ({ children, ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="d3-crd__footer" {...rest}>{children}</div>
)
