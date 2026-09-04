import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cn } from '../../lib/cn'
import { countLabel } from '../../lib/countLabel'
import './SegmentedControl.css'

export interface SegmentedItem {
  value: string
  label: string
  /** Decorative. The label carries the name. */
  icon?: React.ReactNode
  /** Becomes part of the accessible name: "Failed, 3 items", not "Failed 3". */
  count?: number
  countLabel?: string
  disabled?: boolean
}

export interface SegmentedControlProps {
  items: SegmentedItem[]
  value: string
  onValueChange: (value: string) => void
  size?: 'sm' | 'md'
  /**
   * `automatic` (the default, and the WAI-ARIA radio-group behaviour) checks
   * each option as the arrow keys reach it — correct when choosing only changes
   * what an already-loaded region shows.
   *
   * `manual` moves focus and waits for Enter or Space. **Required when choosing
   * fires a request:** Bindery's Archive grouping calls `api.tree(groupBy)` on
   * every change, so arrowing from Kind to Year under automatic activation
   * would fire two requests nobody asked for. The APG allows this for a radio
   * group whose selection causes a significant change of context.
   */
  activationMode?: 'automatic' | 'manual'
  /** Required. A group of choices with no name is a group nobody can place. */
  'aria-label': string
  className?: string
}

/**
 * One choice from a small set, changing what a region renders.
 *
 * **This is a radiogroup, not tabs.** `Tabs` is Radix-backed, owns `tabpanel`s
 * and exists to switch between them. A filter that changes what one region
 * shows has no panel to own, and a `tablist` with no tabpanel is a lie told to
 * a screen reader. So: `role="radiogroup"`, `aria-checked`, one tab stop for
 * the whole group, and arrow keys that move the selection — the contract a
 * screen reader needs to say "one of these, currently the second of three".
 *
 * Segments are content-width, so the thumb cannot be arithmetic — it is
 * measured, the same way `Tabs` measures its pill, and written as custom
 * properties so the travel is a plain CSS transition that inherits
 * `prefers-reduced-motion` from the global rule.
 */
export function SegmentedControl({
  items, value, onValueChange, size = 'md', activationMode = 'automatic',
  className, ...rest
}: SegmentedControlProps) {
  const group = useRef<HTMLDivElement>(null)
  const refs = useRef(new Map<string, HTMLButtonElement>())
  const [first, setFirst] = useState(true)
  // Under manual activation focus and selection come apart, so the roving tab
  // stop needs its own state. Under automatic they are the same thing, and this
  // stays null.
  const [focused, setFocused] = useState<string | null>(null)
  const tabStop = (activationMode === 'manual' ? focused : null) ?? value

  const place = useCallback(() => {
    const g = group.current
    const el = refs.current.get(value)
    if (!g || !el) return
    // Measured from rects, not `offsetLeft`. `offsetLeft` is reported from the
    // *padding* edge here, so subtracting the border width over-corrects by
    // exactly that much and leaves the thumb a pixel to the left of the segment
    // it is meant to sit under — visible, and invisible to a unit test, because
    // jsdom reports every rect as zero. Rects give the border-box distance;
    // `clientLeft` converts to the padding box the thumb is positioned in, and
    // `scrollLeft` puts it back into content coordinates when the group scrolls.
    const gr = g.getBoundingClientRect()
    const er = el.getBoundingClientRect()
    g.style.setProperty('--d3-seg-x', `${er.left - gr.left - g.clientLeft + g.scrollLeft}px`)
    g.style.setProperty('--d3-seg-w', `${er.width}px`)
  }, [value])

  // Before paint, so the thumb is never seen in the wrong place.
  useLayoutEffect(() => { place() })

  useEffect(() => {
    // The first placement must not slide in from the left edge.
    const id = requestAnimationFrame(() => setFirst(false))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    const g = group.current
    if (!g || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(place)
    ro.observe(g)
    return () => ro.disconnect()
  }, [place])

  const enabled = items.filter((i) => !i.disabled)

  // Arrow keys wrap and skip disabled options — the WAI-ARIA radio group
  // pattern. Whether they also *check* the option they reach is the activation
  // mode.
  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === ' ' || event.key === 'Enter') {
      if (activationMode !== 'manual' || !focused || focused === value) return
      event.preventDefault()
      onValueChange(focused)
      return
    }
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End']
    if (!keys.includes(event.key) || enabled.length === 0) return
    event.preventDefault()
    const at = enabled.findIndex((i) => i.value === tabStop)
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1
    const next =
      event.key === 'Home' ? enabled[0]
      : event.key === 'End' ? enabled[enabled.length - 1]
      : enabled[(at + step + enabled.length) % enabled.length]
    if (!next || next.value === tabStop) return
    if (activationMode === 'manual') setFocused(next.value)
    else onValueChange(next.value)
    refs.current.get(next.value)?.focus()
  }

  return (
    <div
      ref={group}
      role="radiogroup"
      onKeyDown={onKeyDown}
      className={cn('d3-seg', `d3-seg--${size}`, className)}
      {...rest}
    >
      <span className="d3-seg__thumb" data-init={first ? 'true' : undefined} aria-hidden="true" />
      {items.map((item) => {
        const checked = item.value === value
        return (
          <button
            key={item.value}
            ref={(el) => {
              if (el) refs.current.set(item.value, el)
              else refs.current.delete(item.value)
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={item.count !== undefined
              ? (item.countLabel ?? countLabel(item.label, item.count))
              : undefined}
            disabled={item.disabled}
            // One tab stop for the group: Tab lands on the chosen option, and
            // the arrow keys do the rest.
            tabIndex={item.value === tabStop ? 0 : -1}
            onFocus={() => { if (activationMode === 'manual') setFocused(item.value) }}
            // Leaving the group returns the tab stop to the chosen option, so
            // coming back lands on what is selected rather than wherever the
            // arrows were left.
            onBlur={(e) => {
              if (activationMode !== 'manual') return
              if (!group.current?.contains(e.relatedTarget as Node)) setFocused(null)
            }}
            onClick={() => { if (!checked) onValueChange(item.value) }}
            className="d3-seg__item"
          >
            {item.icon ? <span className="d3-seg__icon" aria-hidden="true">{item.icon}</span> : null}
            {item.label}
            {item.count !== undefined ? (
              <span className="d3-seg__count" aria-hidden="true">{item.count.toLocaleString()}</span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
