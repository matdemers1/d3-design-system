import { forwardRef, useEffect, useId, useRef } from 'react'
import { cn } from '../../lib/cn'
import { devWarn, useMergedRef } from '../../lib/dev'
import './SettingsRow.css'

/** What a row generates so its control can be named and described by the row's own text. */
export interface SettingsRowIds {
  /** An id for the control: pair it with `htmlFor` so the title is its `<label>`. */
  id: string
  /** The title's id — `aria-labelledby={ids.titleId}` names a control by the title. */
  titleId: string
  /** The description's id, or `undefined` when the row has none. */
  descriptionId: string | undefined
  /** Same as `titleId`, for a spread: `aria-labelledby={ids.labelledBy}`. */
  labelledBy: string
  /** Same as `descriptionId`; `undefined` (so the attribute is omitted) with no description. */
  describedBy: string | undefined
}

export interface SettingsRowProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  /** Required. What the setting is: "Show message previews". */
  title: React.ReactNode
  /** One line under the title saying what it does. */
  description?: React.ReactNode
  /**
   * Required. The control or value on the right: a checkbox, a Button, a Select,
   * a Badge, a value with a chevron.
   *
   * A **function** receives the generated ids, and is how a control gets named
   * by the title and described by the description:
   * `control={(ids) => <Checkbox id={ids.id} aria-describedby={ids.describedBy} … />}`.
   * A plain node is rendered as it is — right for a control whose own text
   * names it (a "Change…" button) and for a value.
   */
  control: React.ReactNode | ((ids: SettingsRowIds) => React.ReactNode)
  /**
   * Makes the title a real `<label>` for the control with this id, so clicking
   * the title reaches the control and it is named by the title with no ARIA.
   * `true` means the control the row generated an id for (`ids.id`). Without it
   * the title is plain text, and the control is named through
   * `aria-labelledby={ids.labelledBy}` or by its own text.
   */
  htmlFor?: string | true
}

const INTERACTIVE =
  'input:not([type="hidden"]), select, textarea, button, [role="checkbox"], [role="switch"], ' +
  '[role="radio"], [role="combobox"], [role="slider"], [role="button"]'

/** Whether the real element has a name — checked in the DOM, since a label can arrive several ways. */
function unnamed(el: Element): boolean {
  if (el.closest('[aria-hidden="true"]')) return false
  if ((el as HTMLInputElement).labels && (el as HTMLInputElement).labels!.length > 0) return false
  if (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.getAttribute('title')) return false
  // A button is named by what it says; a checkbox or switch has no content to say.
  if (el.tagName === 'BUTTON' && el.getAttribute('role') !== 'combobox' && el.textContent?.trim()) return false
  if (el.getAttribute('role') === 'button' && el.textContent?.trim()) return false
  return true
}

/**
 * One setting in a list: the title and a line of description on the left, the
 * control or value on the right. Rows one after another inside a `Section` (or a
 * Card) are divided by hairlines and never boxed — the divider between, not the
 * border around.
 *
 * **Naming the control.** The row generates ids and hands them to a
 * render-prop `control`, rather than cloning the control element to add
 * `aria-labelledby`. Cloning only reaches a control that is the direct child and
 * that forwards ARIA props; wrap the control in a Tooltip or a helper and the
 * wiring is silently dropped, and the props of some controls (Checkbox) do not
 * type `aria-labelledby` at all. A function is typed, visible at the call site
 * and works for any control. After mount, a control with no accessible name is
 * reported in development.
 *
 * Side by side from `md` (768px); below it the control drops under the text,
 * left-aligned.
 */
export const SettingsRow = forwardRef<HTMLDivElement, SettingsRowProps>(function SettingsRow(
  { title, description, control, htmlFor, className, id, ...rest }, ref,
) {
  if (process.env.NODE_ENV !== 'production') {
    if (title === undefined || title === null || title === '') {
      devWarn('SettingsRow.title', 'SettingsRow: `title` is required — it says what the setting is, and it names the control.')
    }
    if (control === undefined || control === null || control === false) {
      devWarn('SettingsRow.control', 'SettingsRow: `control` is required. A row with nothing on the right is a paragraph; use Section\'s description or a DescriptionList for a fact.')
    }
  }
  const auto = useId()
  const base = id ?? auto
  const ids: SettingsRowIds = {
    id: `${base}-control`,
    titleId: `${base}-title`,
    descriptionId: description ? `${base}-desc` : undefined,
    labelledBy: `${base}-title`,
    describedBy: description ? `${base}-desc` : undefined,
  }
  const forId = htmlFor === true ? ids.id : htmlFor

  const controlRef = useRef<HTMLDivElement | null>(null)
  const rowRef = useMergedRef(ref, useRef<HTMLDivElement | null>(null))
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return
    // A frame later, so a label rendered after the control has had its turn.
    const raf = requestAnimationFrame(() => {
      const bad = [...(controlRef.current?.querySelectorAll(INTERACTIVE) ?? [])].filter(unnamed)
      if (bad.length > 0) {
        devWarn(`SettingsRow.name.${String(typeof title === 'string' ? title : base)}`,
          `SettingsRow "${typeof title === 'string' ? title : ''}": the control has no accessible name. ` +
          'Pass `control` as a function and use `aria-labelledby={ids.labelledBy}` (or `htmlFor` with `id={ids.id}`) ' +
          'so the title names it, or give it an `aria-label`.')
      }
    })
    return () => cancelAnimationFrame(raf)
  })

  const TitleTag = forId ? 'label' : 'div'
  return (
    <div ref={rowRef} id={id} className={cn('d3-setrow', className)} {...rest}>
      <div className="d3-setrow__text">
        <TitleTag
          id={ids.titleId}
          className="d3-setrow__title"
          {...(forId ? { htmlFor: forId } : null)}
        >
          {title}
        </TitleTag>
        {description ? <div id={ids.descriptionId} className="d3-setrow__desc">{description}</div> : null}
      </div>
      <div ref={controlRef} className="d3-setrow__control">
        {typeof control === 'function' ? control(ids) : control}
      </div>
    </div>
  )
})
