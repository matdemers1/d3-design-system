import { Children, cloneElement, forwardRef, isValidElement } from 'react'
import { cn } from '../../lib/cn'
import { devWarn } from '../../lib/dev'
import { useAppShell } from './AppShellContext'

interface AppShellBrandBase {
  /** The product's name. Shown beside the mark, and always the link's name. */
  name: string
  /** The product mark — an icon or logo, decorative. On a collapsed rail it is all that shows. */
  mark?: React.ReactNode
  className?: string
}

/**
 * Either `href`, or `asChild` with one empty router link inside, which the
 * brand fills with the mark and the name.
 */
export type AppShellBrandProps = AppShellBrandBase & (
  | { href: string; asChild?: false; children?: never }
  | { asChild: true; href?: never; children: React.ReactElement }
)

/**
 * The home link at the top of the sidebar: a mark and the product's name.
 *
 * On a collapsed rail the name is hidden visually and stays the link's
 * accessible name, so the rail shows the mark alone. Every app needs exactly
 * this, and without it each one wrote the same inline flex row with its own gap
 * and its own colour.
 */
export const AppShellBrand = forwardRef<HTMLAnchorElement, AppShellBrandProps>(function AppShellBrand(
  props, ref,
) {
  const { name, mark, className } = props
  const { collapsed } = useAppShell()
  if (process.env.NODE_ENV !== 'production') {
    if (!name) devWarn('AppShellBrand.name', 'AppShellBrand: `name` is required — it is the home link\'s name.')
  }
  const cls = cn('d3-shell-brand', collapsed && 'd3-shell-brand--collapsed', className)
  const content = (
    <>
      {mark ? <span className="d3-shell-brand__mark" aria-hidden="true">{mark}</span> : null}
      <span className={cn('d3-shell-brand__name', collapsed && 'd3-shell__vh')}>{name}</span>
    </>
  )
  if (props.asChild) {
    const child = Children.toArray(props.children).find(isValidElement) as
      React.ReactElement<{ className?: string }> | undefined
    if (!child) return null
    return cloneElement(child, { className: cn(cls, child.props.className), ref } as Record<string, unknown>, content)
  }
  return <a ref={ref} href={props.href} className={cls}>{content}</a>
})
