import { Children, forwardRef, isValidElement } from 'react'
import { cn } from '../../lib/cn'
import { devOneOf, devWarn } from '../../lib/dev'
import './FormActions.css'

export type FormActionsAlign = 'end' | 'start'
export type FormActionsLayout = 'row' | 'stack'

export interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The buttons, **primary last**: `<Button>Cancel</Button><Button variant="primary">Save</Button>`.
   * At most one primary.
   */
  children?: React.ReactNode
  /** Which edge the actions sit on from `sm`. Defaults to `end`. */
  align?: FormActionsAlign
  /**
   * One action on the opposite edge — usually destructive ("Delete app") or an
   * escape ("Use a recovery code instead"). Below `sm` it goes to the bottom.
   */
  leading?: React.ReactNode
  /**
   * `row` (default): a row from `sm`, stacked below it. `stack`: the phone layout
   * at every width — full-width buttons, the primary on top, the leading action
   * at the bottom. For single-task pages such as sign-in, where the one primary
   * is the whole point of the screen.
   */
  layout?: FormActionsLayout
}

/**
 * The row of buttons that ends a form or a Section.
 *
 * From `sm`: a row on the aligned edge, the primary last and nearest that edge.
 * Below `sm`: full-width buttons stacked with the primary on top — the DOM
 * order mirrored, so the keyboard still walks the buttons in one direction and
 * the source reads the same at every width.
 */
export const FormActions = forwardRef<HTMLDivElement, FormActionsProps>(function FormActions(
  { align = 'end', layout = 'row', leading, className, children, ...rest }, ref,
) {
  if (process.env.NODE_ENV !== 'production') {
    devOneOf('FormActions', 'align', align, ['end', 'start'])
    devOneOf('FormActions', 'layout', layout, ['row', 'stack'])
    const buttons = Children.toArray(children).filter(isValidElement)
    const primaries = buttons
      .map((b, i) => ((b.props as { variant?: string }).variant === 'primary' ? i : -1))
      .filter((i) => i >= 0)
    if (primaries.length > 1) {
      devWarn('FormActions.primaries', 'FormActions: more than one primary action. One per view — ' +
        'when two things are primary, neither is.')
    } else if (primaries.length === 1 && primaries[0] !== buttons.length - 1) {
      devWarn('FormActions.order', 'FormActions: put the primary action last. It then sits nearest the ' +
        'aligned edge from sm, and on top when the row stacks on a phone.')
    }
  }
  const start = align === 'start'
  const main = <div className="d3-fa__main">{children}</div>
  const lead = leading ? <div className="d3-fa__leading">{leading}</div> : null
  return (
    <div ref={ref} className={cn('d3-fa', start ? 'd3-fa--start' : 'd3-fa--end', layout === 'stack' && 'd3-fa--stack', className)} {...rest}>
      {/* DOM order follows the visual order from sm: leading on the left for
          end-aligned actions, on the right for start-aligned ones. */}
      {start ? <>{main}{lead}</> : <>{lead}{main}</>}
    </div>
  )
})
