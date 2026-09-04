import { forwardRef } from 'react'
import { cn } from '../../lib/cn'
import { Spinner } from '../Spinner/Spinner'
import './IconButton.css'

export type IconButtonVariant = 'ghost' | 'secondary'
export type IconButtonSize = 'sm' | 'md' | 'lg'

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'children'> {
  /** The icon. Rendered `aria-hidden` — `label` carries the name. */
  icon: React.ReactNode
  /**
   * The accessible name. **Required — there is no way to render this component
   * without one.** It is also the string a Tooltip shows, so the visible and
   * programmatic labels cannot drift.
   */
  label: string
  variant?: IconButtonVariant
  size?: IconButtonSize
  /**
   * A toggle that happens to be icon-only — "follow the log", "pin this".
   * Sets `aria-pressed`, so the state is announced rather than left to a colour
   * change nobody hears. Same contract and same held-down tone as `Button`.
   */
  pressed?: boolean
  loading?: boolean
}

/**
 * An action reduced to its glyph, for table rows and dense toolbars.
 *
 * **There is deliberately no `danger` variant.** Phase 3f forbids icon-only for
 * destructive actions, and the way to make a rule hold is to remove the
 * affordance rather than document it. A destructive action uses a Button with a
 * word in it.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, variant = 'ghost', size = 'md', loading = false, pressed, type = 'button',
    className, onClick, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      aria-pressed={pressed}
      title={undefined}
      className={cn('d3-ibtn', `d3-ibtn--${variant}`, `d3-ibtn--${size}`, className)}
      aria-busy={loading || undefined}
      onClick={loading ? (e) => e.preventDefault() : onClick}
      {...rest}
    >
      {loading ? <Spinner size="sm" /> : <span aria-hidden="true" style={{ display: 'flex' }}>{icon}</span>}
    </button>
  )
})
