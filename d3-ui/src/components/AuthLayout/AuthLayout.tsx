import { forwardRef } from 'react'
import { cn } from '../../lib/cn'
import { devOneOf } from '../../lib/dev'
import { PageHeader } from '../PageHeader/PageHeader'
import './AuthLayout.css'

export type AuthLayoutElement = 'main' | 'div'

export interface AuthLayoutProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Required. The page's one `<h1>` — "Sign in to Bindery", not "Sign in". */
  title: string
  /** One line under the title: who is signing in, or what this step is for. */
  description?: React.ReactNode
  /** The product mark, above the title. Decorative marks carry `aria-hidden`. */
  brand?: React.ReactNode
  /** Usually one Card holding one form with one primary action. */
  children?: React.ReactNode
  /** A footnote under the task: "Trouble signing in? Ask Matt." */
  footer?: React.ReactNode
  /**
   * Passed to PageHeader: the `<h1>` takes focus on mount so the step is
   * announced. Turn it off when a field on the page autofocuses instead.
   */
  focusOnMount?: boolean
  /**
   * `main` by default: a sign-in page has no app shell, so it owns the page's
   * one main landmark. Use `div` when it is rendered inside something that
   * already has one.
   */
  as?: AuthLayoutElement
}

/**
 * The frame for a single-task page with no shell: sign-in, invite acceptance,
 * first-run setup. Form width (480px), centred, a comfortable offset from the
 * top, and it works at 390px.
 *
 * The title goes through PageHeader, so the one `<h1>` and the focus that
 * announces a new step are handled once rather than per screen.
 */
export const AuthLayout = forwardRef<HTMLElement, AuthLayoutProps>(function AuthLayout(
  { title, description, brand, children, footer, focusOnMount = true, as = 'main', className, ...rest }, ref,
) {
  if (process.env.NODE_ENV !== 'production') devOneOf('AuthLayout', 'as', as, ['main', 'div'])
  const Element = as === 'div' ? 'div' : 'main'
  return (
    <Element ref={ref as React.Ref<HTMLDivElement>} className={cn('d3-auth', className)} {...rest}>
      {brand ? <div className="d3-auth__brand">{brand}</div> : null}
      <PageHeader title={title} description={description} focusOnMount={focusOnMount} />
      {children ? <div className="d3-auth__body">{children}</div> : null}
      {footer ? <div className="d3-auth__footer">{footer}</div> : null}
    </Element>
  )
})
