import { forwardRef, useEffect, useRef } from 'react'
import { cn } from '../../lib/cn'
import { devOneOf } from '../../lib/dev'
import './Card.css'

export type CardPadding = 'sm' | 'md' | 'lg'
export type CardElement = 'div' | 'section' | 'article' | 'li'
export type CardTitleElement = 'p' | 'h2' | 'h3' | 'h4'
const ELEMENTS = ['div', 'section', 'article', 'li'] as const
const TITLE_ELEMENTS = ['p', 'h2', 'h3', 'h4'] as const

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
  /**
   * The element a non-interactive card renders. A card that is a titled region
   * of the page is a `section` (with a heading `CardTitle`); a card in a list is
   * an `li`. Ignored when `interactive` — that card is an `a` or a `button`.
   */
  as?: CardElement
}

const INTERACTIVE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'

export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { padding = 'md', selected, interactive, href, as = 'div', className, children, ...rest }, ref,
) {
  if (process.env.NODE_ENV !== 'production') devOneOf('Card', 'as', as, ELEMENTS)
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
  const Element = (ELEMENTS as readonly string[]).includes(as) ? as : 'div'
  return <Element ref={setRefs as React.Ref<never>} className={cls} {...rest}>{children}</Element>
})

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * `p` by default, because most cards sit inside a page that already has its
   * headings. Use a heading level when the card is a region the page's outline
   * should list — the level follows the page, not the card's size.
   */
  as?: CardTitleElement
}

export const CardTitle = ({ as = 'p', className, children, ...rest }: CardTitleProps) => {
  if (process.env.NODE_ENV !== 'production') devOneOf('CardTitle', 'as', as, TITLE_ELEMENTS)
  const Element = (TITLE_ELEMENTS as readonly string[]).includes(as) ? as : 'p'
  return <Element className={cn('d3-crd__title', className)} {...rest}>{children}</Element>
}
// A div, not a p: a body is often more than one sentence, and a <p> cannot
// hold a list or another paragraph (the same fix as Alert, D-050).
export const CardBody = ({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('d3-crd__body', className)} {...rest}>{children}</div>
)
export const CardFooter = ({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('d3-crd__footer', className)} {...rest}>{children}</div>
)
