import { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { cn } from '../../lib/cn'
import { devWarn } from '../../lib/dev'
import { SearchGlyph } from '../../lib/glyphs'
import { Kbd } from '../Kbd/Kbd'
import { Skeleton } from '../Skeleton/Skeleton'
import { Spinner } from '../Spinner/Spinner'
import './CommandPalette.css'

/** One result: a message, a place to go, an action to run. */
export interface CommandPaletteItem {
  /** Stable within its group. */
  id: string
  /** The option's name. Occurrences of the query in it are marked. */
  label: string
  /** Secondary text at the row's end — "Priya Shah · 10:24 AM". Part of the option's accessible name. */
  description?: React.ReactNode
  /**
   * An avatar or an icon before the label. Decoration: it is hidden from
   * assistive technology, so the label must name the option on its own.
   */
  leading?: React.ReactNode
  /** The item's own key, drawn as key caps: `'E'`, or `['⌘', 'E']` for a chord. The app binds it. */
  shortcut?: string | string[]
  /** Shown, skipped by the arrow keys, and not selectable. */
  disabled?: boolean
  /**
   * Runs on Enter or click. The palette then closes (`onOpenChange(false)`) —
   * unless this returns `false`, for an item that opens a second step in place.
   */
  onSelect: () => void | boolean
}

/** A labelled run of results — "Messages", "Go to", "Actions". An empty group is not drawn. */
export interface CommandPaletteGroup {
  id: string
  label: string
  items: CommandPaletteItem[]
}

export interface CommandPaletteProps {
  /** Controlled. The app opens it — from its own ⌘K binding; the library listens for no keys (D-078). */
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The text in the input. Controlled with `onQueryChange`; uncontrolled when omitted. */
  query?: string
  onQueryChange?: (query: string) => void
  /**
   * The results, already filtered by the app for `query` — the palette does
   * not search, it only marks the match and moves through what it is given.
   */
  groups: CommandPaletteGroup[]
  /** The dialog's and the input's accessible name — "Search mail and commands". Not drawn. */
  label: string
  placeholder?: string
  /** Filter chips under the input, as `CommandPaletteChip`s. Drawn in a group named "Filters". */
  filters?: React.ReactNode
  /**
   * The strip of key hints at the bottom. Omitted, it shows ↑↓ navigate, ↵ select,
   * esc close; build your own with `CommandPaletteHint`; `null` removes it.
   */
  footer?: React.ReactNode
  /** Results are on the way. With none yet, placeholder rows stand in; with stale ones, a spinner shows. */
  loading?: boolean
  /** What to say when there are no results. Defaults to “No results for “query””. */
  emptyMessage?: React.ReactNode
  className?: string
}

interface Flat {
  item: CommandPaletteItem
  key: string
  group: number
}

const keyOf = (g: CommandPaletteGroup, i: CommandPaletteItem) => `${g.id}\u0000${i.id}`

/** Every case-insensitive occurrence of `q` in `text`, left to right, not overlapping. */
export function markMatches(text: string, q: string): React.ReactNode {
  const needle = q.trim().toLowerCase()
  if (!needle) return text
  const hay = text.toLowerCase()
  const out: React.ReactNode[] = []
  let from = 0
  for (let at = hay.indexOf(needle); at >= 0; at = hay.indexOf(needle, from)) {
    if (at > from) out.push(text.slice(from, at))
    out.push(<mark key={at} className="d3-cmd__mark">{text.slice(at, at + needle.length)}</mark>)
    from = at + needle.length
  }
  if (!out.length) return text
  if (from < text.length) out.push(text.slice(from))
  return out
}

/**
 * A ⌘K palette: one input over grouped results — search, navigation and
 * actions in one place.
 *
 * Built on Radix Dialog, composed the way `Modal` composes it (scrim, focus
 * trap, Escape, scroll lock, focus return) but with its own panel: 640px, near
 * the top third, the input and footer fixed and the results scrolling (D-078).
 *
 * The input is the WAI-ARIA APG **combobox** driving a **listbox** through
 * `aria-activedescendant`, the same model as `RecipientField` (D-074): focus
 * never leaves the input. ↓/↑ move through every group and wrap · Home/End jump
 * to the first and last result · Enter runs the active one and closes · Esc
 * closes. Group headings label their groups and are not options.
 *
 * The library adds no global key listener. The app binds ⌘K / Ctrl+K itself and
 * sets `open` — the story shows how.
 */
export function CommandPalette({
  open, onOpenChange, query: queryProp, onQueryChange, groups, label, placeholder = 'Search or jump to…',
  filters, footer, loading = false, emptyMessage, className,
}: CommandPaletteProps) {
  if (process.env.NODE_ENV !== 'production') {
    if (!label) {
      devWarn('CommandPalette.label', 'CommandPalette: `label` is required. It names the dialog and its ' +
        'input, so without it a screen reader announces an unnamed dialog and an unnamed combobox.')
    }
    if (queryProp !== undefined && !onQueryChange) {
      devWarn('CommandPalette.onQueryChange', 'CommandPalette: `query` without `onQueryChange` can never ' +
        'change — typing does nothing. Pass `onQueryChange`, or omit `query`.')
    }
  }
  const base = useId()
  const listId = `${base}-list`
  const optionId = (i: number) => `${base}-opt-${i}`
  const groupLabelId = (i: number) => `${base}-grp-${i}`

  const [innerQuery, setInnerQuery] = useState('')
  const query = queryProp ?? innerQuery
  const setQuery = (q: string) => {
    if (queryProp === undefined) setInnerQuery(q)
    onQueryChange?.(q)
  }

  // A JavaScript caller may omit `groups` or an item list: nothing to show, not a crash.
  const shown = useMemo(() => (groups ?? []).filter((g) => g && g.items?.length > 0), [groups])
  const flat = useMemo<Flat[]>(
    () => shown.flatMap((g, gi) => g.items.map((item) => ({ item, key: keyOf(g, item), group: gi }))),
    [shown],
  )
  const enabled = useMemo(() => flat.flatMap((f, i) => (f.item.disabled ? [] : [i])), [flat])

  // The active option is remembered by key, so a result that survives a
  // refresh stays active; anything else falls back to the first result.
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const found = activeKey === null ? -1 : flat.findIndex((f) => f.key === activeKey && !f.item.disabled)
  const active = found >= 0 ? found : (enabled[0] ?? -1)

  // A new query, or a fresh open, starts again at the top.
  useEffect(() => { setActiveKey(null) }, [query, open])

  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const returnTo = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (active < 0) return
    listRef.current?.querySelector(`[id="${optionId(active)}"]`)?.scrollIntoView?.({ block: 'nearest' })
    // optionId is derived from `base`, which never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  const activate = (i: number | undefined) => {
    if (i === undefined || i < 0) return
    setActiveKey(flat[i]!.key)
  }

  const move = (step: 1 | -1) => {
    if (!enabled.length) return
    const at = enabled.indexOf(active)
    const next = at < 0
      ? (step === 1 ? 0 : enabled.length - 1)
      : (at + step + enabled.length) % enabled.length
    activate(enabled[next])
  }

  const choose = (i: number) => {
    const f = flat[i]
    if (!f || f.item.disabled) return
    if (f.item.onSelect() !== false) onOpenChange(false)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); move(1); return
      case 'ArrowUp': e.preventDefault(); move(-1); return
      case 'Home':
        if (enabled.length) { e.preventDefault(); activate(enabled[0]) }
        return
      case 'End':
        if (enabled.length) { e.preventDefault(); activate(enabled[enabled.length - 1]) }
        return
      case 'Enter':
        if (e.nativeEvent.isComposing) return
        if (active >= 0) { e.preventDefault(); choose(active) }
        return
    }
  }

  const hasResults = flat.length > 0
  const empty = emptyMessage ?? (query.trim() ? <>No results for “{query.trim()}”</> : 'No results')
  const status = loading
    ? 'Searching.'
    : hasResults
      ? `${flat.length} result${flat.length === 1 ? '' : 's'}.`
      : typeof emptyMessage === 'string' ? emptyMessage : query.trim() ? `No results for ${query.trim()}.` : 'No results.'

  let n = -1
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="d3-cmd__scrim" />
        <Dialog.Content
          aria-modal="true"
          // The input's own name and the live result count say what this is;
          // a separate description would repeat them.
          aria-describedby={undefined}
          className={cn('d3-cmd', className)}
          // Focus goes to the input, not to the first tab stop — which is the
          // input today, but a filter chip must never win it.
          onOpenAutoFocus={(e) => {
            // Still the element that had focus before the palette opened.
            const was = document.activeElement
            returnTo.current = was instanceof HTMLElement && was !== document.body ? was : null
            e.preventDefault()
            inputRef.current?.focus()
          }}
          // Radix returns focus only to a Dialog.Trigger, and a palette opened
          // by the app's ⌘K has none — so focus goes back to wherever it was.
          onCloseAutoFocus={(e) => {
            const to = returnTo.current
            returnTo.current = null
            if (to?.isConnected) { e.preventDefault(); to.focus() }
          }}
        >
          <Dialog.Title className="d3-cmd__vh">{label}</Dialog.Title>
          <div className="d3-cmd__q">
            <span className="d3-cmd__glyph"><SearchGlyph size={18} /></span>
            <input
              ref={inputRef}
              className="d3-cmd__input"
              type="text"
              role="combobox"
              aria-label={label}
              aria-expanded={hasResults}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={active >= 0 ? optionId(active) : undefined}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
            />
            {loading && hasResults ? <Spinner size="sm" className="d3-cmd__busy" /> : null}
            <Kbd className="d3-cmd__esc">esc</Kbd>
          </div>
          {filters ? (
            <div className="d3-cmd__filters" role="group" aria-label="Filters">{filters}</div>
          ) : null}
          <div className="d3-cmd__results" aria-busy={loading || undefined}>
            {hasResults ? (
              <div className="d3-cmd__list" id={listId} ref={listRef} role="listbox" aria-label="Results">
                {shown.map((g, gi) => (
                  <div key={g.id} className="d3-cmd__group" role="group" aria-labelledby={groupLabelId(gi)}>
                    <div className="d3-cmd__group-label" id={groupLabelId(gi)} role="presentation">{g.label}</div>
                    {g.items.map((item) => {
                      n += 1
                      const i = n
                      const keys = item.shortcut === undefined ? [] : Array.isArray(item.shortcut) ? item.shortcut : [item.shortcut]
                      return (
                        <div
                          key={item.id}
                          id={optionId(i)}
                          role="option"
                          aria-selected={i === active}
                          aria-disabled={item.disabled || undefined}
                          className={cn('d3-cmd__opt', i === active && 'd3-cmd__opt--active',
                            item.disabled && 'd3-cmd__opt--disabled')}
                          // The input keeps focus; a click on an option must not take it.
                          onMouseDown={(e) => e.preventDefault()}
                          onMouseMove={() => { if (i !== active && !item.disabled) activate(i) }}
                          onClick={() => choose(i)}
                        >
                          {item.leading ? <span className="d3-cmd__leading" aria-hidden="true">{item.leading}</span> : null}
                          <span className="d3-cmd__label">{markMatches(item.label, query)}</span>
                          {item.description ? <span className="d3-cmd__desc">{item.description}</span> : null}
                          {keys.length ? (
                            <span className="d3-cmd__keys">{keys.map((k, ki) => <Kbd key={ki}>{k}</Kbd>)}</span>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            ) : (
              // No listbox without options: an empty listbox is an ARIA error.
              // The id stays, so the combobox's aria-controls still resolves.
              <div className="d3-cmd__none" id={listId}>
                {loading ? (
                  <div className="d3-cmd__skeletons">
                    {[0, 1, 2].map((k) => (
                      <div key={k} className="d3-cmd__skeleton">
                        <Skeleton variant="block" width={28} height={28} />
                        <Skeleton variant="text" width={['62%', '48%', '55%'][k]} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="d3-cmd__empty">{empty}</p>
                )}
              </div>
            )}
          </div>
          {footer === undefined ? (
            <div className="d3-cmd__foot">
              <CommandPaletteHint keys={['↑', '↓']}>navigate</CommandPaletteHint>
              <CommandPaletteHint keys={['↵']}>select</CommandPaletteHint>
              <CommandPaletteHint keys={['esc']}>close</CommandPaletteHint>
            </div>
          ) : footer === null || footer === false ? null : (
            <div className="d3-cmd__foot">{footer}</div>
          )}
          <span className="d3-cmd__vh" role="status" aria-live="polite">{status}</span>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export interface CommandPaletteChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** A toggle filter ("Has attachment") is pressed or not. Omit for a chip that opens a menu ("In: All mail"). */
  pressed?: boolean
}

/** A filter chip for the palette's `filters` slot: a real button, a pill fill, `aria-pressed` when it toggles. */
export const CommandPaletteChip = forwardRef<HTMLButtonElement, CommandPaletteChipProps>(
  function CommandPaletteChip({ pressed, className, type = 'button', ...rest }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={pressed}
        className={cn('d3-cmd__chip', pressed && 'd3-cmd__chip--on', className)}
        {...rest}
      />
    )
  },
)

/**
 * One footer hint: key caps, then what they do —
 * `<CommandPaletteHint keys={['⌘', '↵']}>open in new tab</CommandPaletteHint>`.
 * Hidden from assistive technology, like every key hint (Kbd): it repeats what
 * the keys already do, and "open in new tab" read without its keys says nothing.
 */
export function CommandPaletteHint({ keys, children }: { keys: string[]; children: React.ReactNode }) {
  return (
    <span className="d3-cmd__hint" aria-hidden="true">
      {(keys ?? []).map((k, i) => <Kbd key={i}>{k}</Kbd>)}
      <span>{children}</span>
    </span>
  )
}
