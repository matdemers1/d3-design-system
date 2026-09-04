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
export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  { options, value, defaultValue, onValueChange, placeholder = 'Select…', size = 'md',
    disabled, invalid, className, chevronIcon, checkIcon, ...rest }, ref,
) {
  const field = useFormField()
  const isInvalid = invalid ?? field?.invalid ?? false
  return (
    <RadixSelect.Root
      value={value} defaultValue={defaultValue} onValueChange={onValueChange} disabled={disabled}
    >
      <RadixSelect.Trigger
        ref={ref}
        id={field?.id}
        aria-invalid={isInvalid || undefined}
        aria-describedby={field?.describedBy}
        className={cn('d3-inp', `d3-inp--${size}`, 'd3-sel',
          isInvalid && 'd3-inp--invalid', disabled && 'd3-inp--disabled', className)}
        {...rest}
      >
        <RadixSelect.Value className="d3-sel__value" placeholder={placeholder} />
        <RadixSelect.Icon className="d3-inp__affix">{chevronIcon ?? '▾'}</RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content className="d3-sel__content" position="popper" sideOffset={6}>
          <RadixSelect.Viewport>
            {options.map((o) => (
              <RadixSelect.Item
                key={o.value} value={o.value} disabled={o.disabled} className="d3-sel__item"
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
