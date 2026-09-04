import { forwardRef } from 'react'
import { cn } from '../../lib/cn'
import { Spinner } from '../Spinner/Spinner'
import './Button.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * `primary` — the one action the view exists for. **One per view.**
   * `danger` — only ever the confirming button inside a destructive dialog.
   * `danger-ghost` — the trigger that opens such a dialog.
   */
  variant?: ButtonVariant
  size?: ButtonSize
  /** Decorative; replaced by a Spinner while `loading`. */
  icon?: React.ReactNode
  /** Disclosure or external-navigation affordance only — never a second action. */
  iconAfter?: React.ReactNode
  /**
   * Shows a Spinner in the icon slot and blocks activation, while keeping the
   * button focusable and its label unchanged, so nothing moves and focus is not
   * lost mid-action.
   */
  loading?: boolean
  /**
   * A toggle: a button that stays down. Sets `aria-pressed`, which is what
   * makes "Live" or "Editing" announce its state instead of reading as a plain
   * action a screen reader has no way to evaluate.
   *
   * Defined for `secondary` and `ghost` only. A pressed `primary` would be two
   * claims at once — "the one action this view exists for" and "a mode that is
   * currently on" — and the first is a rule the system enforces elsewhere.
   */
  pressed?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    icon,
    iconAfter,
    loading = false,
    pressed,
    type = 'button',
    disabled,
    className,
    children,
    onClick,
    ...rest
  },
  ref,
) {
  const onAccent = variant === 'primary' || variant === 'danger'
  return (
    <button
      ref={ref}
      type={type}
      className={cn('d3-btn', `d3-btn--${variant}`, `d3-btn--${size}`, className)}
      disabled={disabled}
      aria-pressed={pressed}
      aria-busy={loading || undefined}
      onClick={loading ? (e) => e.preventDefault() : onClick}
      {...rest}
    >
      {loading ? (
        <Spinner size="sm" onAccent={onAccent} />
      ) : icon ? (
        <span className="d3-btn__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
      {iconAfter && !loading ? (
        <span className="d3-btn__icon" aria-hidden="true">
          {iconAfter}
        </span>
      ) : null}
    </button>
  )
})
