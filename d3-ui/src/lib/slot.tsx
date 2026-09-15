import { Children, cloneElement, forwardRef, isValidElement, version } from 'react'
import { cn } from './cn'

/**
 * Renders the single child element instead of an element of its own, with the
 * component's props merged in — `asChild`, without a dependency for it.
 *
 * It exists for one reason that affects every single-page app: the library's
 * Link rendered a plain `<a href>`, which reloads the whole page under a client
 * router. Bindery has no external links at all, so Link had nowhere to be used.
 * With `asChild`, the router's own link keeps its navigation and takes the
 * system's styling.
 *
 * Merging is deliberately narrow: classNames join, the child's own props win,
 * and refs are composed so both sides still receive the node.
 *
 * `forwardRef`, because React 18 strips `ref` from a plain function component's
 * props — the ref a caller put on `<Link asChild>` was silently dropped there.
 * And the child's own ref is read where each major keeps it: `element.ref` on 18,
 * `props.ref` on 19, where reading `element.ref` logs a deprecation warning.
 */
const REACT_19 = Number(version.split('.')[0]) >= 19

export const Slot = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement> & { children: React.ReactNode }>(
  function Slot({ children, className, ...props }, ref) {
    const child = Children.only(children)
    if (!isValidElement<Record<string, unknown>>(child)) return null
    const childRef = (REACT_19
      ? (child.props as { ref?: React.Ref<HTMLElement> }).ref
      : (child as unknown as { ref?: React.Ref<HTMLElement> }).ref)
    const composed = (node: HTMLElement | null) => {
      for (const r of [ref, childRef]) {
        if (typeof r === 'function') r(node)
        else if (r) (r as React.MutableRefObject<HTMLElement | null>).current = node
      }
    }
    return cloneElement(child, {
      ...props,
      ...child.props,
      className: cn(className, child.props.className as string | undefined),
      ref: composed,
    })
  },
)
