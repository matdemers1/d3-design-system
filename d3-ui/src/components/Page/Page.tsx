import { forwardRef } from 'react'
import { cn } from '../../lib/cn'
import { devOneOf } from '../../lib/dev'
import './Page.css'

/**
 * `wide` 1280px for data pages, lists and dashboards · `narrow` 672px for detail
 * and settings pages · `form` 480px for a single form · `prose` 65ch for reading.
 */
export type PageWidth = 'wide' | 'narrow' | 'form' | 'prose'
export type PageElement = 'div' | 'main'
const WIDTHS = ['wide', 'narrow', 'form', 'prose'] as const

export interface PageProps extends React.HTMLAttributes<HTMLElement> {
  /** The content width, from the container tokens. Defaults to `wide`. */
  width?: PageWidth
  /**
   * `div` by default, because the app shell owns the page's one `<main>`
   * landmark and a second one is an error. Use `main` only on a page rendered
   * without a shell.
   */
  as?: PageElement
}

/**
 * The content of one page: centred, capped at a container width, padded by
 * `--page-pad` (24px, 32px from `lg`), and its regions spaced 24px apart.
 *
 * Put everything a page renders inside it — including its loading skeleton,
 * its error Alert and its denied state — so those sit where the content will,
 * rather than full width against the edge of the window.
 */
export const Page = forwardRef<HTMLElement, PageProps>(function Page(
  { width = 'wide', as = 'div', className, children, ...rest }, ref,
) {
  if (process.env.NODE_ENV !== 'production') {
    devOneOf('Page', 'width', width, WIDTHS)
    devOneOf('Page', 'as', as, ['div', 'main'])
  }
  const Element = as === 'main' ? 'main' : 'div'
  const w = (WIDTHS as readonly string[]).includes(width) ? width : 'wide'
  return (
    <Element ref={ref as React.Ref<HTMLDivElement>} className={cn('d3-page', `d3-page--${w}`, className)} {...rest}>
      {children}
    </Element>
  )
})
