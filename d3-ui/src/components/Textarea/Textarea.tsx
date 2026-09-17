import { forwardRef } from 'react'
import { cn } from '../../lib/cn'
import { useMergedRef, useNameCheck } from '../../lib/dev'
import { useFormField } from '../FormField/FormFieldContext'
import '../Input/Input.css'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
  /**
   * Sets the text in `--font-mono`, for content whose characters are the
   * point: JSON, a manifest, a key. Tabular figures and no ligatures come with
   * the face.
   */
  mono?: boolean
}

/** Multi-line text. A minimum of three rows — a one-row textarea should be an Input. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, mono = false, className, disabled, readOnly, id, rows = 3, ...rest }, ref,
) {
  const field = useFormField()
  const isInvalid = invalid ?? field?.invalid ?? false
  // Development only: warns if nothing ever gave the control a name.
  const local = useNameCheck<HTMLTextAreaElement>('Textarea')
  const setRef = useMergedRef(ref, local)
  return (
    <div
      className={cn('d3-inp', 'd3-inp--md', 'd3-inp--area', isInvalid && 'd3-inp--invalid',
        disabled && 'd3-inp--disabled', readOnly && 'd3-inp--readonly', mono && 'd3-inp--mono', className)}
    >
      <textarea
        ref={setRef}
        id={id ?? field?.id}
        rows={rows}
        className="d3-inp__control"
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={isInvalid || undefined}
        aria-describedby={field?.describedBy}
        {...rest}
      />
    </div>
  )
})
