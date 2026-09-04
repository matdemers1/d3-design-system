import { forwardRef, useId } from 'react'
import * as RadixCheckbox from '@radix-ui/react-checkbox'
import { cn } from '../../lib/cn'
import { useFormField } from '../FormField/FormFieldContext'
import './Checkbox.css'

export type CheckedState = boolean | 'indeterminate'

export interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<typeof RadixCheckbox.Root>, 'checked' | 'onCheckedChange'> {
  /**
   * `'indeterminate'` is a first-class value, not a visual hack — App A's inbox
   * header already needs it (`InboxPage.jsx:246`). A select-all showing
   * unchecked while three rows are selected lies about the state of the table.
   */
  checked?: CheckedState
  onCheckedChange?: (checked: CheckedState) => void
  /** The visible label. Part of the click target — the whole row is clickable. */
  label: React.ReactNode
  invalid?: boolean
  /** The tick glyph. Passed in so the library does not force an icon set here. */
  checkIcon?: React.ReactNode
}

export const Checkbox = forwardRef<React.ElementRef<typeof RadixCheckbox.Root>, CheckboxProps>(
  function Checkbox(
    { checked, onCheckedChange, label, invalid, checkIcon, className, disabled, id, ...rest }, ref,
  ) {
    const field = useFormField()
    const generated = useId()
    // Deliberately does NOT consume field.id. A Checkbox labels itself, so
    // taking the FormField's id would point two labels at one control and
    // produce "Confirmation I have written the passphrase down" as its name.
    // A FormField wrapping self-labelling controls uses `as="group"`.
    const controlId = id ?? generated
    const isInvalid = invalid ?? field?.invalid ?? false

    return (
      <span
        className={cn('d3-cbx', isInvalid && 'd3-cbx--invalid', disabled && 'd3-cbx--disabled', className)}
      >
        <RadixCheckbox.Root
          ref={ref}
          id={controlId}
          className="d3-cbx__box"
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          aria-invalid={isInvalid || undefined}
          aria-describedby={field?.describedBy}
          {...rest}
        >
          <RadixCheckbox.Indicator>
            {checked === 'indeterminate'
              ? <span className="d3-cbx__dash" />
              : (checkIcon ?? null)}
          </RadixCheckbox.Indicator>
        </RadixCheckbox.Root>
        <label htmlFor={controlId} style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
          {label}
        </label>
      </span>
    )
  },
)
