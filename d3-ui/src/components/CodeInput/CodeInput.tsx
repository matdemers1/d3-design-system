import { forwardRef, useCallback, useLayoutEffect, useRef, useState } from 'react'
import { cn } from '../../lib/cn'
import { devOneOf, devWarn, useMergedRef, useNameCheck } from '../../lib/dev'
import { useFormField } from '../FormField/FormFieldContext'
import './CodeInput.css'

export type CodeInputMode = 'numeric' | 'alphanumeric'
export type CodeInputSize = 'md' | 'lg'
export type CodeInputStatus = 'idle' | 'error' | 'success'

export interface CodeInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'defaultValue' | 'onChange' | 'size' | 'type' | 'maxLength' | 'inputMode' | 'pattern'
  > {
  /** How many characters the code has. Default 6. */
  length?: number
  value?: string
  defaultValue?: string
  /** Called with the cleaned value — no spaces, no dashes, upper-cased in alphanumeric mode. */
  onValueChange?: (value: string) => void
  /** Called once each time the last box is filled. Paste a whole code and it fires immediately. */
  onComplete?: (value: string) => void
  /** `numeric` accepts digits only and raises the number pad; `alphanumeric` accepts A–Z and 0–9. */
  mode?: CodeInputMode
  /**
   * Visual grouping, e.g. `[3, 3]` or `[4, 4, 4]`. Must add up to `length`.
   * Separators are decorative: the value never contains them, and a pasted
   * `ABCD-EFGH-JKLM` is accepted as `ABCDEFGHJKLM`.
   */
  groups?: readonly number[]
  /** Box height on the control ramp: 34 or 40. Default `lg`. */
  size?: CodeInputSize
  /**
   * `error` shakes the row, `success` sends a wave across it. **Neither is the
   * only signal**: say what happened in text too — FormField's `error` for a
   * rejection. Under reduced motion the shake becomes a tinted fill instead.
   */
  status?: CodeInputStatus
  /** Show a dot instead of each character — for a PIN typed in company. */
  masked?: boolean
  /** Overrides the FormField's error state. */
  invalid?: boolean
}

const MODES = ['numeric', 'alphanumeric'] as const
const STATUSES = ['idle', 'error', 'success'] as const
const SIZES = ['md', 'lg'] as const

function clean(raw: string, mode: CodeInputMode, length: number): string {
  const kept = mode === 'numeric' ? raw.replace(/\D/g, '') : raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
  return kept.slice(0, length)
}

/**
 * A one-time code, PIN or recovery code, entered one character per box.
 *
 * **One real input, drawn as boxes.** A row of separate inputs is what most
 * code fields do, and it is worse on every axis that matters: a screen reader
 * announces six unlabelled "edit text" fields, paste has to be reassembled by
 * hand, and the phone's "from Messages" suggestion only fills the box that had
 * focus. Here a single transparent input sits over the boxes and owns the
 * value, the caret, paste and `autocomplete="one-time-code"`. The boxes are
 * `aria-hidden` — they are the drawing, not the control.
 *
 * Motion is what makes it feel alive, and none of it carries meaning alone:
 * each character pops in as it lands, the active box shows a caret, a rejected
 * code shakes and an accepted one sends a wave across the row.
 */
export const CodeInput = forwardRef<HTMLInputElement, CodeInputProps>(function CodeInput(
  {
    length: lengthProp = 6, value: valueProp, defaultValue, onValueChange, onComplete,
    mode: modeProp = 'numeric', groups, size: sizeProp = 'lg', status: statusProp = 'idle',
    masked = false, invalid, className, disabled, id, autoComplete = 'one-time-code',
    onFocus, onBlur, onKeyDown, onSelect, style, ...rest
  },
  ref,
) {
  if (process.env.NODE_ENV !== 'production') {
    devOneOf('CodeInput', 'mode', modeProp, MODES)
    devOneOf('CodeInput', 'status', statusProp, STATUSES)
    devOneOf('CodeInput', 'size', sizeProp, SIZES)
    if (!(Number.isInteger(lengthProp) && lengthProp > 0 && lengthProp <= 32)) {
      devWarn('CodeInput.length', `CodeInput: \`length={${String(lengthProp)}}\` is not a whole number from 1 to 32. It renders 6 boxes instead.`)
    }
    if (groups && groups.reduce((a, b) => a + b, 0) !== lengthProp) {
      devWarn('CodeInput.groups', `CodeInput: \`groups\` adds up to ${groups.reduce((a, b) => a + b, 0)}, not \`length\` (${String(lengthProp)}). The grouping is ignored.`)
    }
  }
  const length = Number.isInteger(lengthProp) && lengthProp > 0 && lengthProp <= 32 ? lengthProp : 6
  const mode: CodeInputMode = (MODES as readonly string[]).includes(modeProp) ? modeProp : 'numeric'
  const size: CodeInputSize = (SIZES as readonly string[]).includes(sizeProp) ? sizeProp : 'lg'
  const status: CodeInputStatus = (STATUSES as readonly string[]).includes(statusProp) ? statusProp : 'idle'

  const field = useFormField()
  const isInvalid = invalid ?? (field?.invalid || status === 'error')

  const controlled = valueProp !== undefined
  const [inner, setInner] = useState(() => clean(defaultValue ?? '', mode, length))
  const value = clean(controlled ? String(valueProp ?? '') : inner, mode, length)

  const [focused, setFocused] = useState(false)
  const [caretState, setCaret] = useState(value.length)
  // A value cleared from outside (the usual reaction to a rejected code) puts
  // the caret back within it, without a render spent correcting state.
  const caret = Math.min(caretState, value.length)

  const local = useNameCheck<HTMLInputElement>('CodeInput')
  const setRef = useMergedRef(ref, local)

  // Completion fires on the transition to full, not on every render while full.
  const wasComplete = useRef(value.length === length)

  const commit = useCallback((next: string, nextCaret: number) => {
    if (!controlled) setInner(next)
    setCaret(nextCaret)
    if (next !== value) onValueChange?.(next)
    const complete = next.length === length
    if (complete && !wasComplete.current) onComplete?.(next)
    wasComplete.current = complete
  }, [controlled, length, onComplete, onValueChange, value])

  // Keep the real caret where the drawing says it is. Without this a re-render
  // after a replaced character leaves the browser's caret at the end.
  useLayoutEffect(() => {
    const el = local.current
    if (!el || document.activeElement !== el) return
    if (el.selectionStart !== caret || el.selectionEnd !== caret) el.setSelectionRange(caret, caret)
  }, [caret, value, local])

  // Re-arm completion once the code is no longer full, so clearing a rejected
  // code and typing it again fires `onComplete` again.
  useLayoutEffect(() => {
    if (value.length < length) wasComplete.current = false
  }, [value, length])

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const el = event.target
    const next = clean(el.value, mode, length)
    // Characters removed by cleaning shift the caret left by as many.
    const typedBefore = clean(el.value.slice(0, el.selectionStart ?? el.value.length), mode, length)
    commit(next, Math.min(typedBefore.length, next.length))
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event)
    if (event.defaultPrevented || disabled) return
    const el = event.currentTarget
    const at = el.selectionStart ?? value.length
    const collapsed = el.selectionStart === el.selectionEnd
    // Typing onto a filled box replaces it and moves on, which is what the
    // boxes promise. A plain input would insert and push the rest right.
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey &&
        collapsed && at < value.length) {
      const ch = clean(event.key, mode, 1)
      event.preventDefault()
      if (!ch) return
      commit(value.slice(0, at) + ch + value.slice(at + 1), at + 1)
      return
    }
    if (event.key === 'Backspace' && collapsed && at > 0 && at < value.length) {
      // Deleting a middle box blanks it by shifting the tail left, as an input
      // would — but the caret lands on the box that was cleared.
      event.preventDefault()
      commit(value.slice(0, at - 1) + value.slice(at), at - 1)
    }
  }

  function syncCaret(event: React.SyntheticEvent<HTMLInputElement>) {
    const el = event.currentTarget
    if (el.selectionStart !== null) setCaret(el.selectionStart)
  }

  const active = focused ? Math.min(caret, length - 1) : -1
  const full = value.length === length

  const breaks = new Set<number>()
  if (groups && groups.reduce((a, b) => a + b, 0) === length) {
    let at = 0
    for (const g of groups.slice(0, -1)) { at += g; breaks.add(at) }
  }

  return (
    <div
      className={cn('d3-code', `d3-code--${size}`,
        // Recovery and reset codes run to twelve boxes. Tighter gaps and a
        // smaller radius keep them boxes rather than capsules on a phone.
        length > 8 && 'd3-code--dense',
        isInvalid && 'd3-code--invalid',
        status === 'error' && 'd3-code--reject',
        status === 'success' && 'd3-code--accept',
        disabled && 'd3-code--disabled', className)}
      style={style}
    >
      <div className="d3-code__slots" aria-hidden="true">
        {Array.from({ length }, (_, i) => {
          const ch = value[i]
          return [
            // A separator is its own item in the row, never inside a box's cell:
            // inside, it took width from the box after it.
            breaks.has(i) ? <span key={`sep-${i}`} className="d3-code__sep" /> : null,
            <span
              key={i}
              className={cn('d3-code__slot',
                ch !== undefined && 'd3-code__slot--filled',
                i === active && 'd3-code__slot--active')}
              style={{ '--d3-code-i': i } as React.CSSProperties}
            >
              {ch !== undefined ? (
                // Keyed on the character so a new one remounts and pops in.
                <span key={`${i}:${ch}`} className="d3-code__char">{masked ? '•' : ch}</span>
              ) : null}
              {i === active && !(full && caret >= length) && ch === undefined
                ? <span className="d3-code__caret" /> : null}
            </span>,
          ]
        })}
      </div>
      <input
        ref={setRef}
        id={id ?? field?.id}
        className="d3-code__control"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onSelect={(e) => { syncCaret(e); onSelect?.(e) }}
        onFocus={(e) => { setFocused(true); syncCaret(e); onFocus?.(e) }}
        onBlur={(e) => { setFocused(false); onBlur?.(e) }}
        disabled={disabled}
        type={masked ? 'password' : 'text'}
        inputMode={mode === 'numeric' ? 'numeric' : 'text'}
        pattern={mode === 'numeric' ? '[0-9]*' : undefined}
        autoComplete={autoComplete}
        autoCapitalize={mode === 'alphanumeric' ? 'characters' : 'off'}
        autoCorrect="off"
        spellCheck={false}
        aria-invalid={isInvalid || undefined}
        aria-describedby={field?.describedBy}
        data-1p-ignore={masked ? undefined : true}
        {...rest}
      />
    </div>
  )
})
