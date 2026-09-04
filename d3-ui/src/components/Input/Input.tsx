import { forwardRef } from 'react'
import { cn } from '../../lib/cn'
import { useFormField } from '../FormField/FormFieldContext'
import './Input.css'

export type InputSize = 'sm' | 'md' | 'lg'

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  size?: InputSize
  /** Leading affordance — a search glyph, a currency symbol. Decorative. */
  leading?: React.ReactNode
  /** Trailing affordance — a unit, a character count. Decorative. */
  trailing?: React.ReactNode
  /** Overrides the FormField's error state. Rarely needed. */
  invalid?: boolean
}

/**
 * A single-line text field. Shares its height scale with Button exactly, because
 * the two sit side by side in every filter bar in every app.
 *
 * A placeholder is never a label, and is only ever a format example — it
 * disappears on first keystroke and leaves a half-filled form unidentifiable.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = 'md', leading, trailing, invalid, className, disabled, readOnly, id, ...rest }, ref,
) {
  const field = useFormField()
  const isInvalid = invalid ?? field?.invalid ?? false
  return (
    <div
      className={cn('d3-inp', `d3-inp--${size}`, isInvalid && 'd3-inp--invalid',
        disabled && 'd3-inp--disabled', readOnly && 'd3-inp--readonly', className)}
    >
      {leading ? <span className="d3-inp__affix" aria-hidden="true">{leading}</span> : null}
      <input
        ref={ref}
        id={id ?? field?.id}
        className="d3-inp__control"
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={isInvalid || undefined}
        aria-describedby={field?.describedBy}
        {...rest}
      />
      {trailing ? <span className="d3-inp__affix" aria-hidden="true">{trailing}</span> : null}
    </div>
  )
})
