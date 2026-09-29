import { forwardRef, useId, useState } from 'react'
import { cn } from '../../lib/cn'
import { devWarn } from '../../lib/dev'
import './Switch.css'

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'role' | 'type' | 'value' | 'children'> {
  /** Controlled. Pair with `onCheckedChange`. */
  checked?: boolean
  /** Uncontrolled starting value. */
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  /**
   * The visible label. It is part of the click target. Where a row already says
   * what the switch changes (a settings row), omit it and pass `aria-labelledby`
   * or `aria-label` instead — one of the three is required.
   */
  children?: React.ReactNode
  /** Applied to the wrapper, not the button. */
  className?: string
}

/**
 * An on/off setting that takes effect the moment it is flipped. A `<button
 * role="switch">`, not a checkbox: a native button already fires click on both
 * Space and Enter, and `aria-checked` is what a screen reader announces as
 * "on" / "off". The knob's position — not only the track's colour — carries
 * the state (WCAG 1.4.1).
 */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  function Switch(
    { checked, defaultChecked = false, onCheckedChange, disabled, children, className, id, onClick, ...rest }, ref,
  ) {
    if (process.env.NODE_ENV !== 'production') {
      if (children == null && !rest['aria-label'] && !rest['aria-labelledby']) {
        devWarn('Switch.name', 'Switch: give it children, `aria-label` or `aria-labelledby`. Without one it has no accessible name and a screen reader announces only "switch, off".')
      }
    }
    const generated = useId()
    const controlId = id ?? generated
    const [inner, setInner] = useState(defaultChecked)
    const isControlled = checked !== undefined
    const on = isControlled ? checked : inner

    return (
      <span className={cn('d3-sw', disabled && 'd3-sw--disabled', className)}>
        <button
          {...rest}
          ref={ref}
          id={controlId}
          type="button"
          role="switch"
          aria-checked={on}
          data-state={on ? 'checked' : 'unchecked'}
          disabled={disabled}
          className="d3-sw__track"
          onClick={(e) => {
            onClick?.(e)
            if (e.defaultPrevented) return
            if (!isControlled) setInner(!on)
            onCheckedChange?.(!on)
          }}
        >
          <span className="d3-sw__knob" aria-hidden="true" />
        </button>
        {children != null ? (
          <label htmlFor={controlId} className="d3-sw__label">{children}</label>
        ) : null}
      </span>
    )
  },
)
