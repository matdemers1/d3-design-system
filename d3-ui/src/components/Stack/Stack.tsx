import { forwardRef } from 'react'
import { cn } from '../../lib/cn'
import { devOneOf } from '../../lib/dev'
import './Stack.css'

/**
 * A step on the spacing scale (D-021), by name. Not a number of pixels and not
 * a CSS length: `gap="16"` is `var(--space-16)`, and `gap="15"` is a type error.
 */
export type SpaceStep = '2' | '4' | '6' | '8' | '12' | '16' | '20' | '24' | '32' | '40' | '48' | '64'
const SPACE_STEPS = ['2', '4', '6', '8', '12', '16', '20', '24', '32', '40', '48', '64'] as const

/** The elements a Stack or Cluster can render. */
export type LayoutElement = 'div' | 'section' | 'ul' | 'ol' | 'li' | 'form' | 'header' | 'footer' | 'nav'
const LAYOUT_ELEMENTS = ['div', 'section', 'ul', 'ol', 'li', 'form', 'header', 'footer', 'nav'] as const

export type StackAlign = 'stretch' | 'start' | 'center' | 'end'
export type StackJustify = 'start' | 'center' | 'end' | 'between'

export interface StackProps extends React.HTMLAttributes<HTMLElement> {
  /** A step on the spacing scale. Defaults to `16`. */
  gap?: SpaceStep
  /** Cross-axis alignment. Defaults to `stretch`, so children take the full width. */
  align?: StackAlign
  justify?: StackJustify
  /**
   * The element rendered. A Stack of list items is a `ul`, and keeps its list
   * semantics without the bullets.
   */
  as?: LayoutElement
}

/** Shared by Stack and Cluster: the class names for gap, align and justify. */
export function layoutClasses(component: string, gap: SpaceStep, align: string, justify: string | undefined) {
  if (process.env.NODE_ENV !== 'production') {
    devOneOf(component, 'gap', gap, SPACE_STEPS)
    devOneOf(component, 'justify', justify, ['start', 'center', 'end', 'between'])
  }
  // An unknown step falls back to the default rather than to no gap at all.
  const step = (SPACE_STEPS as readonly string[]).includes(gap) ? gap : component === 'Cluster' ? '8' : '16'
  return cn(`d3-gap-${step}`, `d3-align-${align}`, justify && `d3-justify-${justify}`)
}

export function layoutElement(component: string, as: string) {
  if (process.env.NODE_ENV !== 'production') devOneOf(component, 'as', as, LAYOUT_ELEMENTS)
  return ((LAYOUT_ELEMENTS as readonly string[]).includes(as) ? as : 'div') as 'div'
}

/**
 * Children in a column, spaced by one step of the scale.
 *
 * The replacement for `.stack { display: flex; flex-direction: column; gap: … }`,
 * which every app has written for itself, each with a different gap. There is
 * no arbitrary length: a gap the scale does not have is a scale change, not a
 * call-site one.
 */
export const Stack = forwardRef<HTMLElement, StackProps>(function Stack(
  { gap = '16', align = 'stretch', justify, as = 'div', className, children, ...rest }, ref,
) {
  if (process.env.NODE_ENV !== 'production') {
    devOneOf('Stack', 'align', align, ['stretch', 'start', 'center', 'end'])
  }
  const Element = layoutElement('Stack', as)
  return (
    <Element ref={ref as React.Ref<HTMLDivElement>}
      className={cn('d3-stack', layoutClasses('Stack', gap, align, justify), className)} {...rest}>
      {children}
    </Element>
  )
})
