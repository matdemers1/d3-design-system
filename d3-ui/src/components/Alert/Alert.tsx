import { forwardRef } from 'react'
import { cn } from '../../lib/cn'
import './Alert.css'

export type AlertTone = 'info' | 'success' | 'warning' | 'danger'

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: AlertTone
  /** What happened — "Your session has expired", never "Error". Optional. */
  title?: React.ReactNode
  /**
   * Why, if we know. Rendered in a `div`, not a `p`: real alerts carry a list
   * of recovery codes, a block of copyable text, or a control, and a `p` host
   * makes that invalid markup the browser silently reflows.
   */
  children: React.ReactNode
  /** What to do about it — a real control, not a sentence pointing at one. */
  actions?: React.ReactNode
  icon?: React.ReactNode
  /**
   * `true` when the alert appears in response to something the user just did.
   *
   * This is the whole role contract, and it is commonly got wrong. A **static**
   * alert present at page load needs **no role** — `role="alert"` would make a
   * screen reader interrupt itself to announce something already there. A
   * **dynamic** error is assertive; dynamic success and info are polite.
   */
  dynamic?: boolean
  /**
   * A banner: the same alert, spanning its container rather than sitting in it
   * — under a panel header, at the top of a log. It keeps the raised ground,
   * because elevation is tone; it drops the radius and takes a boundary at the
   * edge it meets, because a strip that spans the panel is not detached.
   */
  flush?: boolean
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { tone = 'info', title, children, actions, icon, dynamic = false, flush = false,
    className, ...rest }, ref,
) {
  const role = dynamic ? (tone === 'danger' ? 'alert' : 'status') : undefined
  return (
    <div ref={ref} role={role} className={cn('d3-alrt', `d3-alrt--${tone}`, flush && 'd3-alrt--flush', className)} {...rest}>
      {icon ? <span className="d3-alrt__icon" aria-hidden="true">{icon}</span> : null}
      <div className="d3-alrt__body">
        {title ? <p className="d3-alrt__title">{title}</p> : null}
        <div className="d3-alrt__message">{children}</div>
        {actions ? <div className="d3-alrt__actions">{actions}</div> : null}
      </div>
    </div>
  )
})
