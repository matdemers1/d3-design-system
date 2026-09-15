import { forwardRef, useCallback, useId, useLayoutEffect, useRef, useState } from 'react'
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
  /**
   * Show a dot instead of each character — for a PIN typed in company. A masked
   * field defaults to `autocomplete="off"`: a PIN is not a one-time code, and a
   * password-typed field saying otherwise invites a "save password?" prompt.
   */
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
    masked = false, invalid, className, disabled, id, autoComplete,
    onFocus, onBlur, onKeyDown, onSelect, onPointerDown, onClick, style, ...rest
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
  const slotsRef = useRef<HTMLDivElement | null>(null)
  // A caret the component placed itself — after a tap on a box, or a character
  // replaced in place — held against the browser's own opinion. iOS Safari
  // follows both with a selection event carrying the position *it* would have
  // chosen, from text metrics that no longer match the boxes; trusting that
  // event put the next character back into the box just filled. Held until the
  // value changes some other way, or the person moves the caret themselves.
  const held = useRef<{ at: number; value: string } | null>(null)
  const fallbackId = useId()
  const inputId = id ?? field?.id ?? fallbackId
  // The boxes are aria-hidden, so the length they show has to be said another
  // way, or a screen reader user learns it only by being told they are short.
  const lengthId = `${inputId}-length`
  const lengthText = mode === 'numeric'
    ? `${length} ${length === 1 ? 'digit' : 'digits'}`
    : `${length} characters, letters and numbers`

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
    held.current = null
    const el = event.target
    const next = clean(el.value, mode, length)
    // Characters removed by cleaning shift the caret left by as many.
    const typedBefore = clean(el.value.slice(0, el.selectionStart ?? el.value.length), mode, length)
    commit(next, Math.min(typedBefore.length, next.length))
  }

  // A click lands on the invisible input, whose own caret positions come from
  // its text metrics — and no letter-spacing tracks flexible boxes with a
  // maximum width. So the box under the pointer decides where the caret goes,
  // measured from the drawing, which is right at any width.
  function handlePointerDown(event: React.PointerEvent<HTMLInputElement>) {
    onPointerDown?.(event)
    if (event.defaultPrevented || disabled || event.button !== 0) return
    const slots = slotsRef.current?.querySelectorAll<HTMLElement>('.d3-code__slot')
    if (!slots || slots.length === 0) return
    let index = slots.length - 1
    for (let i = 0; i < slots.length; i++) {
      if (event.clientX < slots[i]!.getBoundingClientRect().right) { index = i; break }
    }
    event.preventDefault()
    const el = event.currentTarget
    el.focus({ preventScroll: true })
    const at = Math.min(index, value.length)
    el.setSelectionRange(at, at)
    setCaret(at)
    held.current = { at, value }
  }

  // And after the tap itself: iOS Safari places its own caret once the tap ends
  // and fires no selection event for it, so the held position is applied again
  // then, and once more a frame later, after Safari's own pass. Both checked in
  // the iOS Simulator: without this pass, a tap on a filled box typed into the
  // next empty one; without the held position, the caret would not advance past
  // a replaced character.
  function handleClick(event: React.MouseEvent<HTMLInputElement>) {
    onClick?.(event)
    const el = event.currentTarget
    const apply = () => {
      const pin = held.current
      if (!pin || pin.value !== el.value || document.activeElement !== el) return
      if (el.selectionStart !== pin.at || el.selectionEnd !== pin.at) el.setSelectionRange(pin.at, pin.at)
      setCaret(pin.at)
    }
    apply()
    requestAnimationFrame(apply)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event)
    if (event.defaultPrevented || disabled) return
    const el = event.currentTarget
    // Where the caret really is, if the component put it there and nothing has
    // changed since. iOS Safari resets the input's own selection after a
    // replaced character without any event, so reading `selectionStart` here
    // put every following digit back into the same box.
    const pin = held.current && held.current.value === el.value ? held.current : null
    held.current = null
    const at = pin ? pin.at : (el.selectionStart ?? value.length)
    const collapsed = pin ? true : el.selectionStart === el.selectionEnd
    if (pin && (el.selectionStart !== at || el.selectionEnd !== at)) el.setSelectionRange(at, at)
    // Typing onto a filled box replaces it and moves on, which is what the
    // boxes promise. A plain input would insert and push the rest right.
    // Android virtual keyboards report `key` as "Unidentified", so there this
    // falls back to the input's own insert — the change handler still cleans
    // and clips it, so the worst case is a shift, never a wrong length.
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey &&
        collapsed && at < value.length) {
      const ch = clean(event.key, mode, 1)
      event.preventDefault()
      if (!ch) return
      const next = value.slice(0, at) + ch + value.slice(at + 1)
      commit(next, at + 1)
      held.current = { at: at + 1, value: next }
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
    const pin = held.current
    if (pin) {
      // Not released here. A selection event can arrive before React has
      // written the replaced character back into the input, so a value that
      // does not match yet is a render in flight, not a person moving on.
      if (pin.value === el.value && (el.selectionStart !== pin.at || el.selectionEnd !== pin.at)) {
        el.setSelectionRange(pin.at, pin.at)
      }
      setCaret(pin.at)
      return
    }
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
      <div className="d3-code__slots" aria-hidden="true" ref={slotsRef}>
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
        id={inputId}
        className="d3-code__control"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        onSelect={(e) => { syncCaret(e); onSelect?.(e) }}
        onFocus={(e) => { setFocused(true); syncCaret(e); onFocus?.(e) }}
        onBlur={(e) => { setFocused(false); onBlur?.(e) }}
        disabled={disabled}
        type={masked ? 'password' : 'text'}
        inputMode={mode === 'numeric' ? 'numeric' : 'text'}
        pattern={mode === 'numeric' ? '[0-9]*' : undefined}
        // A PIN is not a one-time code, and on a password-typed field
        // `one-time-code` invites "save this password?" for it.
        autoComplete={autoComplete ?? (masked ? 'off' : 'one-time-code')}
        autoCapitalize={mode === 'alphanumeric' ? 'characters' : 'off'}
        autoCorrect="off"
        spellCheck={false}
        aria-invalid={isInvalid || undefined}
        aria-describedby={[field?.describedBy, lengthId].filter(Boolean).join(' ')}
        {...rest}
      />
      <span id={lengthId} className="d3-code__length">{lengthText}</span>
    </div>
  )
})
