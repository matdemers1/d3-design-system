import { forwardRef, useId } from 'react'
import * as RadixCheckbox from '@radix-ui/react-checkbox'
import { cn } from '../../lib/cn'
import { CheckGlyph } from '../../lib/glyphs'
import { devWarn } from '../../lib/dev'
import { useFormField } from '../FormField/FormFieldContext'
import './Checkbox.css'

export type CheckedState = boolean | 'indeterminate'

interface CheckboxBaseProps {
  /**
   * `'indeterminate'` is a first-class value, not a visual hack — App A's inbox
   * header already needs it (`InboxPage.jsx:246`). A select-all showing
   * unchecked while three rows are selected lies about the state of the table.
   */
  checked?: CheckedState
  onCheckedChange?: (checked: CheckedState) => void
  defaultChecked?: CheckedState
  disabled?: boolean
  required?: boolean
  /** Submitted with a native form. */
  name?: string
  value?: string
  id?: string
  className?: string
  invalid?: boolean
  /** The tick glyph. Passed in so the library does not force an icon set here. */
  checkIcon?: React.ReactNode
  'aria-describedby'?: string
  onFocus?: React.FocusEventHandler<HTMLButtonElement>
  onBlur?: React.FocusEventHandler<HTMLButtonElement>
}

/**
 * Its own props, not Radix's: Radix's `asChild` would replace the box and break
 * the label wiring, and a Radix major release must not be a breaking change here.
 *
 * Either a visible `label` — part of the click target — or, where the row
 * itself says what is being selected (a table's select column), no label and
 * an `aria-label`. One or the other is required.
 */
export type CheckboxProps = CheckboxBaseProps & (
  | { label: React.ReactNode; 'aria-label'?: string }
  | { label?: null; 'aria-label': string }
)

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  function Checkbox(
    { checked, onCheckedChange, label, invalid, checkIcon, className, disabled, id, ...rest }, ref,
  ) {
    if (process.env.NODE_ENV !== 'production') {
      if (!label && !(rest as Record<string, unknown>)['aria-label']) {
        devWarn('Checkbox.label', 'Checkbox: `label` is required. The checkbox labels itself, so without one it has no accessible name.')
      }
    }
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
          {/* Both glyphs render and CSS shows one, keyed on Radix's data-state.
              Choosing from the `checked` prop missed an uncontrolled
              `defaultChecked="indeterminate"`, which showed a tick. */}
          <RadixCheckbox.Indicator className="d3-cbx__indicator">
            <span className="d3-cbx__tick" aria-hidden="true">{checkIcon ?? <CheckGlyph />}</span>
            <span className="d3-cbx__dash" aria-hidden="true" />
          </RadixCheckbox.Indicator>
        </RadixCheckbox.Root>
        {label != null ? (
          <label htmlFor={controlId} style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
            {label}
          </label>
        ) : null}
      </span>
    )
  },
)
