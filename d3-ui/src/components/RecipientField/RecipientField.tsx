import { forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react'
import { cn } from '../../lib/cn'
import { devOneOf, devWarn, useMergedRef, useNameCheck } from '../../lib/dev'
import { CloseGlyph } from '../../lib/glyphs'
import { useFormField } from '../FormField/FormFieldContext'
import {
  formatRecipient, isOpenToken, isValidAddress, parseRecipients, recipientInitials,
  type Recipient,
} from './parse'
import './RecipientField.css'

export type { Recipient } from './parse'

/** A suggestion from the caller's loader: a recipient, plus an optional note ("Contact", "Recent"). */
export interface RecipientSuggestion extends Recipient {
  detail?: string
}

/**
 * Returns suggestions for what has been typed. Called after a short pause in
 * typing, never for an empty query. The signal aborts when the query moves on
 * or the field unmounts, so a slow answer to an old query is never shown.
 */
export type RecipientLoader = (
  query: string,
  options: { signal: AbortSignal },
) => Promise<RecipientSuggestion[]> | RecipientSuggestion[]

export type RecipientFieldVariant = 'field' | 'row'
const VARIANTS = ['field', 'row'] as const

export interface RecipientFieldProps {
  /** The recipients. Controlled when given, with `onValueChange`. */
  value?: Recipient[]
  /** Uncontrolled starting value. */
  defaultValue?: Recipient[]
  onValueChange?: (next: Recipient[]) => void
  /** Supplies suggestions for the typed text. Without it the field still takes typed and pasted addresses. */
  loadSuggestions?: RecipientLoader
  /**
   * `field` (default) is a boxed control for a form, named by a surrounding
   * FormField or by `label`/`aria-label`.
   *
   * `row` is the borderless header row of a composer: the `label` is drawn in
   * the row, visibly, and a hairline divider closes it (D-073). `label` is
   * required for `row`.
   */
  variant?: RecipientFieldVariant
  /** The field's name. Visible in `row`; the accessible name in `field` when there is no FormField. */
  label?: string
  /** Actions at the row's end — the composer's "Cc  Bcc". `row` only. */
  trailing?: React.ReactNode
  placeholder?: string
  disabled?: boolean
  /** Overrides the FormField's error state. Invalid chips set it too. */
  invalid?: boolean
  /** Decides which chips are drawn in the danger tone. Defaults to `isValidAddress`. */
  validate?: (address: string) => boolean
  /** Pause after typing before the loader is called. Default 120ms. */
  suggestDelay?: number
  id?: string
  className?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  autoFocus?: boolean
  /** Fires on the text input; the field has already committed any typed text by then. */
  onBlur?: React.FocusEventHandler<HTMLInputElement>
}

const keyOf = (r: Recipient) => r.address.trim().toLowerCase()
const display = (r: Recipient) => r.name?.trim() || r.address

/**
 * Splits `text` around the match of `q`, for bolding it. A match at the start
 * of a word wins — typing "d" should mark the D of Demers, not the d in Linda —
 * then the first match anywhere.
 */
function matchAt(text: string, q: string): number {
  if (!q) return -1
  const t = text.toLowerCase()
  const n = q.toLowerCase()
  for (let i = t.indexOf(n); i >= 0; i = t.indexOf(n, i + 1)) {
    if (i === 0 || !/[\p{L}\p{N}]/u.test(t[i - 1]!)) return i
  }
  return t.indexOf(n)
}

function highlight(text: string, q: string): React.ReactNode {
  const at = matchAt(text, q)
  if (at < 0) return text
  return (
    <>
      {text.slice(0, at)}
      <b className="d3-rcp__match">{text.slice(at, at + q.length)}</b>
      {text.slice(at + q.length)}
    </>
  )
}

/**
 * An address field that turns what is typed into recipient chips, with
 * suggestions from a loader the caller supplies.
 *
 * It is the WAI-ARIA APG **editable combobox with list autocomplete** —
 * written here rather than taken from Radix, which has no combobox (D-073).
 * Focus never leaves the text input: the active suggestion is announced
 * through `aria-activedescendant`, and a chip is selected with the arrow keys
 * or Backspace rather than focused, so the field is one tab stop. The chips'
 * remove buttons are for the pointer and are skipped by Tab.
 *
 * Keyboard: type to search · ↓/↑ move through suggestions · Enter or Tab adds
 * the highlighted one, or the typed text when none is · `,` `;` also add ·
 * Esc closes · Backspace on an empty field selects the last chip, and again
 * removes it · ← on an empty field selects chips, → moves back to the text.
 */
export const RecipientField = forwardRef<HTMLInputElement, RecipientFieldProps>(function RecipientField(
  {
    value: valueProp, defaultValue, onValueChange, loadSuggestions, variant = 'field', label, trailing,
    placeholder, disabled = false, invalid, validate = isValidAddress, suggestDelay = 120, id, className,
    'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, autoFocus, onBlur,
  },
  ref,
) {
  if (process.env.NODE_ENV !== 'production') {
    devOneOf('RecipientField', 'variant', variant, VARIANTS)
    if (variant === 'row' && !label) {
      devWarn('RecipientField.label', 'RecipientField: `variant="row"` needs `label` — a borderless row is ' +
        'identified by its visible label, and without one it is an unmarked line of text (D-073).')
    }
    if (valueProp !== undefined && !onValueChange) {
      devWarn('RecipientField.onValueChange', 'RecipientField: `value` without `onValueChange` can never change. ' +
        'Pass `onValueChange`, or use `defaultValue`.')
    }
  }
  const field = useFormField()
  const base = useId()
  const inputId = id ?? field?.id ?? `${base}-input`
  const labelId = `${base}-label`
  const listId = `${base}-list`
  const hintId = `${base}-hint`
  const optionId = (i: number) => `${base}-opt-${i}`

  const [inner, setInner] = useState<Recipient[]>(defaultValue ?? [])
  const value = (valueProp ?? inner) ?? []
  const valueRef = useRef(value)
  valueRef.current = value
  const setValue = useCallback((next: Recipient[]) => {
    if (valueProp === undefined) setInner(next)
    onValueChange?.(next)
  }, [valueProp, onValueChange])

  const [text, setText] = useState('')
  const [suggestions, setSuggestions] = useState<RecipientSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [selected, setSelected] = useState<number | null>(null)
  const [status, setStatus] = useState('')
  const [focused, setFocused] = useState(false)

  const local = useNameCheck<HTMLInputElement>('RecipientField')
  const setRef = useMergedRef(ref, local)

  // Chips present on first render arrive with the page, not with an action,
  // so only chips added afterwards scale in (D-024: entrance motion belongs to
  // things that arrive).
  const initialKeys = useRef<Set<string> | null>(null)
  if (initialKeys.current === null) initialKeys.current = new Set(value.map(keyOf))

  const loaderRef = useRef(loadSuggestions)
  loaderRef.current = loadSuggestions

  // Suggestions: debounced, aborted when the query moves on, filtered of anyone already added.
  const query = text.trim()
  useEffect(() => {
    if (!query || !loaderRef.current || disabled) {
      setSuggestions([]); setOpen(false); setActive(-1)
      return
    }
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      try {
        const got = await loaderRef.current!(query, { signal: ctrl.signal })
        if (ctrl.signal.aborted) return
        const have = new Set(valueRef.current.map(keyOf))
        const list = (Array.isArray(got) ? got : []).filter((s) => s && s.address && !have.has(keyOf(s)))
        setSuggestions(list)
        setActive(list.length ? 0 : -1)
        setOpen(list.length > 0)
        setStatus(list.length
          ? `${list.length} suggestion${list.length === 1 ? '' : 's'}. Up and down arrows to choose.`
          : '')
      } catch {
        if (!ctrl.signal.aborted) { setSuggestions([]); setOpen(false); setActive(-1) }
      }
    }, suggestDelay)
    return () => { clearTimeout(t); ctrl.abort() }
  }, [query, suggestDelay, disabled])

  const close = () => { setOpen(false); setActive(-1) }

  const add = (incoming: Recipient[]) => {
    const have = new Set(value.map(keyOf))
    const fresh: Recipient[] = []
    for (const r of incoming) {
      const k = keyOf(r)
      if (!k || have.has(k)) continue
      have.add(k)
      fresh.push(r.name ? { name: r.name, address: r.address.trim() } : { address: r.address.trim() })
    }
    setText('')
    setSuggestions([])
    close()
    setSelected(null)
    if (!fresh.length) return
    setValue([...value, ...fresh])
    setStatus(fresh.length === 1 ? `Added ${display(fresh[0]!)}.` : `Added ${fresh.length} recipients.`)
  }

  const removeAt = (i: number) => {
    const r = value[i]
    if (!r) return
    // Re-added later, it is an arrival again and should scale in.
    initialKeys.current?.delete(keyOf(r))
    setValue(value.filter((_, j) => j !== i))
    setSelected(null)
    setStatus(`Removed ${display(r)}.`)
  }

  const select = (i: number | null) => {
    setSelected(i)
    if (i !== null && value[i]) {
      setStatus(`${display(value[i]!)} selected. Backspace removes it.`)
    }
  }

  const commitText = () => {
    const parsed = parseRecipients(text)
    if (parsed.length) add(parsed)
  }

  const chooseSuggestion = (i: number) => {
    const s = suggestions[i]
    if (s) add([{ name: s.name, address: s.address }])
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    const atStart = input.selectionStart === 0 && input.selectionEnd === 0

    if (selected !== null) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); select(Math.max(0, selected - 1)); return }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (selected >= value.length - 1) { setSelected(null); setStatus('') } else select(selected + 1)
        return
      }
      if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); removeAt(selected); return }
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setSelected(null); setStatus(''); return }
      if (e.key === 'Home') { e.preventDefault(); select(0); return }
      if (e.key === 'End') { e.preventDefault(); setSelected(null); setStatus(''); return }
      setSelected(null)
    }

    switch (e.key) {
      case 'ArrowDown':
        if (open) { e.preventDefault(); setActive((a) => (a + 1) % suggestions.length) }
        else if (suggestions.length) { e.preventDefault(); setOpen(true); setActive(0) }
        return
      case 'ArrowUp':
        if (open) { e.preventDefault(); setActive((a) => (a <= 0 ? suggestions.length - 1 : a - 1)) }
        return
      case 'Enter':
        if (e.nativeEvent.isComposing) return
        if (open && active >= 0) { e.preventDefault(); chooseSuggestion(active) }
        else if (text.trim()) { e.preventDefault(); commitText() }
        return
      case 'Tab':
        if (e.shiftKey) return
        if (open && active >= 0) { e.preventDefault(); chooseSuggestion(active) }
        else if (text.trim()) { e.preventDefault(); commitText() }
        return
      case 'Escape':
        if (open) { e.preventDefault(); e.stopPropagation(); close() }
        return
      case 'Backspace':
        if (!text && value.length) { e.preventDefault(); select(value.length - 1) }
        return
      case 'ArrowLeft':
        if (atStart && value.length) { e.preventDefault(); select(value.length - 1) }
        return
    }
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setSelected(null)
    // A separator typed outside a quoted name or an <address> commits what came before it.
    // Read from the value, not the key, so mobile keyboards and IMEs behave the same.
    const last = v.slice(-1)
    if ((last === ',' || last === ';') && !isOpenToken(v.slice(0, -1))) {
      const before = v.slice(0, -1)
      if (before.trim()) add(parseRecipients(before))
      else setText('')
      return
    }
    setText(v)
  }

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text')
    if (!pasted) return
    const input = e.currentTarget
    const start = input.selectionStart ?? text.length
    const end = input.selectionEnd ?? text.length
    const full = text.slice(0, start) + pasted + text.slice(end)
    // A list, or something that is already an address, becomes chips at once.
    // Anything else — a surname pasted to search for — is left as text.
    if (/[,;\n\r]/.test(pasted) || pasted.includes('@')) {
      e.preventDefault()
      add(parseRecipients(full))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false)
    if (text.trim()) commitText()
    close()
    setSelected(null)
    onBlur?.(e)
  }

  const focusInput = () => local.current?.focus()

  const isInvalid = invalid ?? (field?.invalid || value.some((r) => !validate(r.address)))
  const describedBy = [field?.describedBy, hintId].filter(Boolean).join(' ')
  const activeId = open && active >= 0 ? optionId(active) : undefined
  const listName = label ? `${label} recipients` : 'Recipients'
  const isRow = variant === 'row'

  return (
    <div
      className={cn('d3-rcp', `d3-rcp--${isRow ? 'row' : 'field'}`, isInvalid && 'd3-rcp--invalid',
        disabled && 'd3-rcp--disabled', focused && 'd3-rcp--focused', className)}
      // Clicking the frame's empty space puts the caret in the text; it is not a control.
      onMouseDown={(e) => {
        if (disabled) return
        const t = e.target as HTMLElement
        if (t === e.currentTarget || t.classList.contains('d3-rcp__value') || t.classList.contains('d3-rcp__chips')) {
          e.preventDefault(); focusInput()
        }
      }}
    >
      {isRow && label ? (
        <label className="d3-rcp__label" id={labelId} htmlFor={inputId}>{label}</label>
      ) : null}
      <div className="d3-rcp__value">
        {value.length ? (
          <ul className="d3-rcp__chips" aria-label={listName}>
            {value.map((r, i) => {
              const ok = validate(r.address)
              const k = keyOf(r)
              return (
                <li
                  key={`${k}-${i}`}
                  className={cn('d3-rcp__chip', !ok && 'd3-rcp__chip--invalid',
                    selected === i && 'd3-rcp__chip--selected',
                    !initialKeys.current!.has(k) && 'd3-rcp__chip--enter')}
                  title={formatRecipient(r)}
                  onMouseDown={(e) => {
                    if (disabled || (e.target as HTMLElement).closest('.d3-rcp__remove')) return
                    e.preventDefault(); focusInput(); select(i)
                  }}
                >
                  <span className="d3-rcp__initials" aria-hidden="true">{ok ? recipientInitials(r) : '!'}</span>
                  <span className="d3-rcp__name">{display(r)}</span>
                  <span className="d3-rcp__vh">
                    {r.name ? ` ${r.address}` : ''}{ok ? '' : ', not a valid address'}
                  </span>
                  {disabled ? null : (
                    <button
                      type="button"
                      className="d3-rcp__remove"
                      tabIndex={-1}
                      aria-label={`Remove ${display(r)}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { removeAt(i); focusInput() }}
                    >
                      <CloseGlyph size={12} />
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        ) : null}
        <input
          ref={setRef}
          id={inputId}
          className="d3-rcp__input"
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy}
          aria-label={ariaLabel ?? (!isRow && !field ? label : undefined)}
          aria-labelledby={ariaLabelledBy}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="enter"
          value={text}
          placeholder={value.length ? undefined : placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
        />
        <div className="d3-rcp__pop" hidden={!open}>
          <ul className="d3-rcp__list" id={listId} role="listbox" aria-label={`Suggestions for ${label ?? 'recipients'}`}>
            {suggestions.map((s, i) => (
              <li
                key={`${keyOf(s)}-${i}`}
                id={optionId(i)}
                role="option"
                aria-selected={i === active}
                className={cn('d3-rcp__opt', i === active && 'd3-rcp__opt--active')}
                onMouseDown={(e) => e.preventDefault()}
                onMouseMove={() => { if (i !== active) setActive(i) }}
                onClick={() => chooseSuggestion(i)}
              >
                <span className="d3-rcp__opt-initials" aria-hidden="true">{recipientInitials(s)}</span>
                <span className="d3-rcp__opt-text">
                  <span className="d3-rcp__opt-name">{highlight(display(s), query)}</span>
                  {s.name ? <span className="d3-rcp__opt-addr">{highlight(s.address, query)}</span> : null}
                </span>
                {s.detail ? <span className="d3-rcp__opt-detail">{s.detail}</span> : null}
              </li>
            ))}
          </ul>
          <div className="d3-rcp__keys" aria-hidden="true">↑↓ choose · Enter or Tab adds · Esc closes</div>
        </div>
      </div>
      {isRow && trailing ? <div className="d3-rcp__trailing">{trailing}</div> : null}
      <span id={hintId} className="d3-rcp__vh">
        Enter, Tab or a comma adds an address. Backspace selects and removes the last one.
      </span>
      <span className="d3-rcp__vh" role="status" aria-live="polite">{status}</span>
    </div>
  )
})
