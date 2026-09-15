import { forwardRef } from 'react'
import * as RadixSelect from '@radix-ui/react-select'
import { cn } from '../../lib/cn'
import { useFormField } from '../FormField/FormFieldContext'
import '../Input/Input.css'
import './Select.css'

export interface SelectOption {
  value: string
  label: string
  /** A second line under the label. Replaces App C's enhance-menu. */
  description?: string
  disabled?: boolean
}

export interface SelectProps {
  options: SelectOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  invalid?: boolean
  className?: string
  /** Accessible name when used outside a FormField — a toolbar or table cell. */
  'aria-label'?: string
  /**
   * For a `<label htmlFor>` outside a FormField. Inside one, the field supplies
   * the id and this is not needed.
   */
  id?: string
  /** Submitted with a native form, like the `<select>` this replaces. */
  name?: string
  required?: boolean
  chevronIcon?: React.ReactNode
  checkIcon?: React.ReactNode
}

/**
 * Choose one of a known set. Replaces App C's **three** dropdown
 * families, MUI Select, and 20 native selects.
 *
 * Not for: two or three options (a segmented control shows them), more than ~15
 * (a filtering combobox), an action on choose (a DropdownMenu — Select holds a
 * value, a menu performs an action), or multiple selection (checkboxes).
 */
const EMPTY = '__d3-select-empty__'

export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  { options = [], value, defaultValue, onValueChange, placeholder = 'Select…', size = 'md',
    disabled, invalid, className, chevronIcon, checkIcon, name, required, id, ...rest }, ref,
) {
  const field = useFormField()
  const isInvalid = invalid ?? field?.invalid ?? false

  // Radix reserves "" to mean "nothing selected, show the placeholder", and
  // throws if an option uses it. But "Everything", "None" and "Any" are ordinary
  // options, and the native <select> this replaces allowed them — Bindery's log
  // filter crashed on first render. So an empty-string option travels as a
  // private sentinel and is translated back at the boundary, in both directions.
  // Only when an option really is "": otherwise `value=""` must reach Radix as
  // "", which is how a controlled Select shows its placeholder.
  const hasEmpty = options.some((o) => o.value === '')
  const toRadix = (v: string | undefined) => (hasEmpty && v === '' ? EMPTY : v)
  const fromRadix = (v: string) => (v === EMPTY ? '' : v)

  return (
    <RadixSelect.Root
      value={toRadix(value)} defaultValue={toRadix(defaultValue)}
      onValueChange={onValueChange ? (v) => onValueChange(fromRadix(v)) : undefined}
      disabled={disabled} name={name} required={required}
    >
      <RadixSelect.Trigger
        ref={ref}
        id={id ?? field?.id}
        aria-invalid={isInvalid || undefined}
        aria-describedby={field?.describedBy}
        className={cn('d3-inp', `d3-inp--${size}`, 'd3-sel',
          isInvalid && 'd3-inp--invalid', disabled && 'd3-inp--disabled', className)}
        {...rest}
      >
        {/* Radix renders Value as a bare span and drops `className`, so the
            truncation and placeholder-colour rules for .d3-sel__value never
            applied: a long label widened the trigger, and "Select…" was drawn
            in full text colour, indistinguishable from a chosen value. */}
        <span className="d3-sel__value"><RadixSelect.Value placeholder={placeholder} /></span>
        <RadixSelect.Icon className="d3-inp__affix">{chevronIcon ?? '▾'}</RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content className="d3-sel__content" position="popper" sideOffset={6}>
          <RadixSelect.Viewport>
            {options.map((o) => (
              <RadixSelect.Item
                key={o.value} value={toRadix(o.value) as string} disabled={o.disabled} className="d3-sel__item"
              >
                <span className="d3-sel__tick" aria-hidden="true">{checkIcon ?? '✓'}</span>
                <RadixSelect.ItemText>
                  {o.label}
                  {o.description ? <span className="d3-sel__desc">{o.description}</span> : null}
                </RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
})
