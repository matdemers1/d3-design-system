import { forwardRef } from 'react'
import { cn } from '../../lib/cn'
import { useMergedRef, useNameCheck } from '../../lib/dev'
import { useFormField } from '../FormField/FormFieldContext'
import './Input.css'

export type InputSize = 'sm' | 'md' | 'lg'

/**
 * `outlined` (default) — the field as it has always been: a `surface` fill
 * inside a 3:1 `border-field` edge, on the size ramp it shares with Button.
 *
 * `filled` — the calmer field (D-073). 36px, 14px text, filled with `bg` —
 * one tonal step below the `surface` it usually sits on — with the same 3:1
 * edge, and a single 2px focus outline over that edge instead of an accent
 * border plus an offset ring. One size: `size` applies to `outlined` only.
 * Measured: the edge is 3.92:1 against the fill in light and 4.29:1 in dark.
 */
export type FieldAppearance = 'outlined' | 'filled'

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  size?: InputSize
  /** `filled` is the calmer 36px field; see `FieldAppearance`. Default `outlined`. */
  appearance?: FieldAppearance
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
  { size = 'md', appearance = 'outlined', leading, trailing, invalid, className, disabled, readOnly, id, ...rest }, ref,
) {
  const field = useFormField()
  const isInvalid = invalid ?? field?.invalid ?? false
  // Development only: warns if nothing ever gave the control a name.
  const local = useNameCheck<HTMLInputElement>('Input')
  const setRef = useMergedRef(ref, local)
  return (
    <div
      className={cn('d3-inp', appearance === 'filled' ? 'd3-inp--filled' : `d3-inp--${size}`, isInvalid && 'd3-inp--invalid',
        disabled && 'd3-inp--disabled', readOnly && 'd3-inp--readonly', className)}
    >
      {leading ? <span className="d3-inp__affix" aria-hidden="true">{leading}</span> : null}
      <input
        ref={setRef}
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
