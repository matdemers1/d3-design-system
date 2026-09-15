import { forwardRef, useId, useState } from 'react'
import { cn } from '../../lib/cn'
import { devOneOf, devWarn, useMergedRef, useNameCheck } from '../../lib/dev'
import { useFormField } from '../FormField/FormFieldContext'
import '../Input/Input.css'
import './PasswordInput.css'

export type PasswordInputSize = 'sm' | 'md' | 'lg'

/**
 * How strong the password is, as the app judges it. The library ships no
 * estimator — that would be a runtime dependency, and the rules (length, a
 * breached-password list, the account's own email) belong to the app anyway.
 */
export interface PasswordStrength {
  /** 0 (unusable) to 4 (strong). Fills that many of the four bars. */
  score: 0 | 1 | 2 | 3 | 4
  /** Said in words beside the bars — "Too short", "Good". Colour is never the only signal. */
  label: string
}

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  size?: PasswordInputSize
  /** Overrides the FormField's error state. */
  invalid?: boolean
  /** Shows the strength meter. Pass it on new-password fields; leave it off for sign-in. */
  strength?: PasswordStrength | null
  /** Accessible name of the toggle while the password is hidden. */
  showLabel?: string
  /** Accessible name of the toggle while the password is shown. */
  hideLabel?: string
  /** Warn when Caps Lock is on while the field has focus. Default true. */
  capsLockHint?: boolean
}

const SIZES = ['sm', 'md', 'lg'] as const

/**
 * A password field that can be read back before it is submitted.
 *
 * The reveal button is a real button inside the field's boundary. It keeps
 * focus in the input when clicked, because moving it to the button means the
 * next keystroke goes nowhere. Its name says what it will do, "Show password"
 * or "Hide password", rather than using `aria-pressed`, which would say it
 * twice. The eye is crossed out by a line that draws itself in and out.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  {
    size: sizeProp = 'md', invalid, strength, showLabel = 'Show password', hideLabel = 'Hide password',
    capsLockHint = true, className, disabled, readOnly, id, onKeyDown, onKeyUp, onBlur, ...rest
  },
  ref,
) {
  if (process.env.NODE_ENV !== 'production') {
    devOneOf('PasswordInput', 'size', sizeProp, SIZES)
    if (strength && !(Number.isInteger(strength.score) && strength.score >= 0 && strength.score <= 4)) {
      devWarn('PasswordInput.strength.score', `PasswordInput: \`strength.score\` is ${String(strength.score)}; it must be 0–4. It is clamped.`)
    }
    if (rest.autoComplete === undefined) {
      devWarn('PasswordInput.autoComplete', 'PasswordInput: give it `autoComplete` — "current-password" to sign in, ' +
        '"new-password" to choose one. Password managers decide whether to fill or to generate from exactly this.')
    }
    if (strength && !strength.label) {
      devWarn('PasswordInput.strength.label', 'PasswordInput: `strength.label` is empty. The bars are colour and length only — say the strength in words too.')
    }
  }
  const size: PasswordInputSize = (SIZES as readonly string[]).includes(sizeProp) ? sizeProp : 'md'
  const field = useFormField()
  const isInvalid = invalid ?? field?.invalid ?? false
  const [revealed, setRevealed] = useState(false)
  const [capsOn, setCapsOn] = useState(false)
  const fallbackId = useId()
  const inputId = id ?? field?.id ?? fallbackId
  const capsId = `${inputId}-caps`
  const strengthId = `${inputId}-strength`

  const local = useNameCheck<HTMLInputElement>('PasswordInput')
  const setRef = useMergedRef(ref, local)

  const score = strength ? Math.max(0, Math.min(4, Math.round(Number(strength.score) || 0))) : 0
  const tone = score <= 1 ? 'weak' : score === 2 ? 'fair' : 'strong'

  const readCaps = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (capsLockHint && typeof event.getModifierState === 'function') {
      setCapsOn(event.getModifierState('CapsLock'))
    }
  }

  const describedBy = [field?.describedBy, strength ? strengthId : null, capsOn ? capsId : null]
    .filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('d3-pw', className)}>
      <div
        className={cn('d3-inp', `d3-inp--${size}`, 'd3-pw__box', isInvalid && 'd3-inp--invalid',
          disabled && 'd3-inp--disabled', readOnly && 'd3-inp--readonly')}
      >
        <input
          ref={setRef}
          id={inputId}
          className="d3-inp__control"
          type={revealed ? 'text' : 'password'}
          disabled={disabled}
          readOnly={readOnly}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy}
          onKeyDown={(e) => { readCaps(e); onKeyDown?.(e) }}
          onKeyUp={(e) => { readCaps(e); onKeyUp?.(e) }}
          onBlur={(e) => { setCapsOn(false); onBlur?.(e) }}
          {...rest}
        />
        <button
          type="button"
          className="d3-pw__toggle"
          aria-label={revealed ? hideLabel : showLabel}
          aria-controls={inputId}
          disabled={disabled}
          // Keep focus in the field: clicking the eye mid-password must not
          // send the next keystroke nowhere.
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setRevealed((r) => !r)}
        >
          <EyeGlyph crossed={revealed} />
        </button>
      </div>

      {strength ? (
        <div className={cn('d3-pw__strength', `d3-pw__strength--${tone}`)}>
          <span className="d3-pw__bars" aria-hidden="true">
            {[1, 2, 3, 4].map((n) => (
              <span key={n} className={cn('d3-pw__bar', n <= score && 'd3-pw__bar--on')}
                style={{ '--d3-pw-i': n } as React.CSSProperties} />
            ))}
          </span>
          <span className="d3-pw__label" id={strengthId} aria-live="polite">{strength.label}</span>
        </div>
      ) : null}

      {/* Always mounted, its text toggled: a live region that arrives together
          with its words is not reliably announced. */}
      <p className="d3-pw__caps" id={capsId} role="status">{capsOn ? 'Caps Lock is on' : ''}</p>
    </div>
  )
})

/** Crossed when the password is showing, because that is the state the next click removes. */
function EyeGlyph({ crossed }: { crossed: boolean }) {
  return (
    <svg className={cn('d3-pw__eye', crossed && 'd3-pw__eye--crossed')} width="16" height="16"
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path className="d3-pw__lid" d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7S2.5 12 2.5 12Z" />
      <circle className="d3-pw__pupil" cx="12" cy="12" r="3" />
      <path className="d3-pw__slash" d="M4 4 20 20" pathLength={1} />
    </svg>
  )
}
