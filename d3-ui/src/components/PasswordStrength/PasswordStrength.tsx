import { useId } from 'react'
import { cn } from '../../lib/cn'
import { devOneOf, devWarn } from '../../lib/dev'
import type { PasswordStrength as PasswordInputStrength } from '../PasswordInput/PasswordInput'
import './PasswordStrength.css'

/** 0 (nothing to show) to 4 (strong). The number of segments filled. */
export type PasswordStrengthScore = 0 | 1 | 2 | 3 | 4

/**
 * `PasswordInput` has long exported a `PasswordStrength` *type* (its `strength`
 * prop: `{ score, label }`). This declaration, beside the component of the same
 * name, keeps that type importable from here rather than shadowing it.
 */
export type PasswordStrength = PasswordInputStrength

export interface PasswordStrengthProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'id'> {
  /**
   * How strong the password is, 0–4, **as the app judged it**. The library
   * computes nothing: the rules (length, a breached list, the account's own
   * email) belong to the app. Out-of-range values are clamped.
   */
  score: PasswordStrengthScore
  /**
   * The verdict, in words — "Weak", "Strong — 14 characters". It is the
   * accessible signal; the segments are only colour and length. Keep the
   * component mounted while the user types so this text is *changed*, not
   * inserted: a live region that arrives with its words is not reliably read.
   */
  label: React.ReactNode
  /**
   * Id of the verdict text. Put it in the input's `aria-describedby`. Generated
   * if absent, but then the caller cannot read it — pass your own to wire it.
   */
  id?: string
}

const SCORES = ['0', '1', '2', '3', '4'] as const

/**
 * A four-segment strength meter with its verdict written out underneath or
 * beside it. Non-interactive.
 *
 * **Wiring it to the field.** Colour must never be the only signal, and the
 * segments are `aria-hidden`; the verdict text is what a screen reader gets, so
 * it has to be attached to the input. Two ways:
 *
 * - Inside `FormField`'s `help` — `<FormField label="…" help={<PasswordStrength … />}>`.
 *   FormField already puts `aria-describedby` on the control, pointing at its
 *   help, so the verdict is read with no extra wiring.
 * - Anywhere else, pass an `id` and put it in the input's `aria-describedby`.
 *   Note that a `PasswordInput` given its own `aria-describedby` uses it *instead
 *   of* the FormField's help and error ids, so list those too.
 *
 * The verdict is a polite, atomic live region, so a change is spoken after the
 * user pauses rather than cutting across each keystroke.
 */
export function PasswordStrength({ score, label, id, className, ...rest }: PasswordStrengthProps) {
  if (process.env.NODE_ENV !== 'production') {
    devOneOf('PasswordStrength', 'score', score === undefined ? undefined : String(score), SCORES)
    if (label === undefined || label === null || label === '') {
      devWarn('PasswordStrength.label', 'PasswordStrength: `label` is empty. The segments are colour and length only — say the strength in words.')
    }
  }
  const generated = useId()
  const verdictId = id ?? generated
  const filled = Math.max(0, Math.min(4, Math.round(Number(score) || 0)))

  return (
    <div className={cn('d3-pws', `d3-pws--s${filled}`, className)} {...rest}>
      <span className="d3-pws__bars" aria-hidden="true">
        {[1, 2, 3, 4].map((n) => (
          <span key={n} className={cn('d3-pws__seg', n <= filled && 'd3-pws__seg--on')} />
        ))}
      </span>
      <span className="d3-pws__verdict" id={verdictId} role="status" aria-live="polite" aria-atomic="true">
        {label}
      </span>
    </div>
  )
}
