import { useId } from 'react'
import { cn } from '../../lib/cn'
import { Label } from '../Label/Label'
import { FormFieldContext } from './FormFieldContext'
import './FormField.css'

export interface FormFieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  label: string
  /** The control. It receives its id and ARIA wiring through context. */
  children: React.ReactNode
  /** Persistent guidance. Stays visible while an error shows — it is usually the fix. */
  help?: React.ReactNode
  /** What is wrong and what to do. Presence of this sets `aria-invalid` on the control. */
  error?: React.ReactNode
  /**
   * Optional is marked; required is the default. Never an asterisk — a symbol
   * with no accessible meaning unless a legend explains it, and legends get
   * separated from their forms.
   */
  optional?: boolean
  /** Rendered beside the error text. Decorative. */
  errorIcon?: React.ReactNode
  /**
   * `field` (default) labels a single control via `htmlFor`.
   *
   * `group` is for controls that label themselves — a Checkbox, a set of
   * checkboxes, a radio group. It renders `role="group"` with
   * `aria-labelledby` instead, because pointing a second `<label>` at a
   * self-labelling control concatenates both into its accessible name.
   */
  as?: 'field' | 'group'
}

/**
 * Binds a label, a control, help text and an error into one accessible unit.
 *
 * It generates `id`, `{id}-help` and `{id}-error`, sets `htmlFor`,
 * `aria-describedby` and `aria-invalid`, and makes the error a polite live
 * region. **There is no way to render a FormField label without association** —
 * which is the entire point: App B ships 18 labels with zero `htmlFor`, and
 * three of four apps use `aria-invalid` and `aria-describedby` zero times.
 */
export function FormField({
  label, children, help, error, optional = false, errorIcon, as = 'field', className, ...rest
}: FormFieldProps) {
  const base = useId()
  const id = `${base}-control`
  const labelId = `${base}-label`
  const helpId = help ? `${base}-help` : undefined
  const errorId = error ? `${base}-error` : undefined
  const describedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined
  const isGroup = as === 'group'

  return (
    <FormFieldContext.Provider
      value={{ id, describedBy, invalid: Boolean(error), required: !optional }}
    >
      <div
        className={cn('d3-ff', className)}
        {...(isGroup ? { role: 'group', 'aria-labelledby': labelId } : null)}
        {...rest}
      >
        <Label
          id={isGroup ? labelId : undefined}
          {...(isGroup ? { as: 'span' as const } : { htmlFor: id })}
          optional={optional}
        >
          {label}
        </Label>
        {children}
        {error ? (
          // Polite, so an error appearing after submit is spoken rather than
          // silently drawn — and never assertive, which would cut across the
          // user mid-keystroke.
          <p className="d3-ff__error" id={errorId} role="status">
            {errorIcon ? <span aria-hidden="true" style={{ display: 'flex', marginTop: 1 }}>{errorIcon}</span> : null}
            <span>{error}</span>
          </p>
        ) : null}
        {help ? <p className="d3-ff__help" id={helpId}>{help}</p> : null}
      </div>
    </FormFieldContext.Provider>
  )
}
