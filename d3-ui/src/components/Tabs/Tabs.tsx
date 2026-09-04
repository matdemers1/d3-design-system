import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as RadixTabs from '@radix-ui/react-tabs'
import { cn } from '../../lib/cn'
import { countLabel } from '../../lib/countLabel'
import './Tabs.css'

export interface TabItem {
  value: string
  label: string
  /** Decorative. The label carries the name — same contract as SegmentedControl. */
  icon?: React.ReactNode
  /** Becomes part of the accessible name: "Inbox, 48 items", not "Inbox 48". */
  count?: number
  countLabel?: string
  disabled?: boolean
}

export interface TabsProps {
  items: TabItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children?: React.ReactNode
  /**
   * `automatic` (the WAI-ARIA default) switches the panel as the arrow keys
   * move — correct when panels are already in memory.
   *
   * `manual` moves focus and waits for Enter or Space. **Required when switching
   * a tab fires a network request:** App A's six view tabs each refetch, so
   * arrowing from Inbox to All under automatic activation would fire five
   * requests nobody asked for and announce five loading states.
   */
  activationMode?: 'automatic' | 'manual'
  className?: string
  'aria-label'?: string
}

export function Tabs({
  items, value, defaultValue, onValueChange, children,
  activationMode = 'automatic', className, ...rest
}: TabsProps) {
  const list = useRef<HTMLDivElement>(null)
  const glide = useRef<HTMLSpanElement>(null)
  const [first, setFirst] = useState(true)

  // Positions the travelling pill under whichever tab is active. Written as
  // custom properties so the movement itself is a CSS transition — which means
  // it inherits prefers-reduced-motion from the global rule for free.
  const place = useCallback(() => {
    const l = list.current
    const g = glide.current
    if (!l || !g) return
    const active = l.querySelector<HTMLElement>('[data-state="active"]')
    if (!active) return
    // Measured from rects rather than `offsetLeft` — see SegmentedControl for
    // why. The list has no border today, so `clientLeft` is 0 and the old
    // arithmetic happened to agree; it would stop agreeing the day the list
    // gained one, and silently, by a pixel.
    const lr = l.getBoundingClientRect()
    const ar = active.getBoundingClientRect()
    g.style.setProperty('--d3-glide-x', `${ar.left - lr.left - l.clientLeft + l.scrollLeft}px`)
    g.style.setProperty('--d3-glide-w', `${ar.width}px`)
  }, [])

  // Before paint, so the pill is never seen in the wrong place.
  useLayoutEffect(() => { place() })

  useEffect(() => {
    // The first placement must not animate from the left edge.
    const id = requestAnimationFrame(() => setFirst(false))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    const l = list.current
    if (!l || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(place)
    ro.observe(l)
    return () => ro.disconnect()
  }, [place])

  return (
    <RadixTabs.Root
      value={value}
      defaultValue={defaultValue ?? items[0]?.value}
      onValueChange={(v) => { onValueChange?.(v); requestAnimationFrame(place) }}
      activationMode={activationMode}
      className={cn(className)}
    >
      <RadixTabs.List ref={list} className="d3-tabs__list" {...rest}>
        <span
          ref={glide}
          className="d3-tabs__glide"
          data-init={first ? 'true' : undefined}
          aria-hidden="true"
        />
        {items.map((t) => (
          <RadixTabs.Trigger
            key={t.value}
            value={t.value}
            disabled={t.disabled}
            className="d3-tabs__tab"
            aria-label={t.count !== undefined ? (t.countLabel ?? countLabel(t.label, t.count)) : undefined}
          >
            {t.icon ? <span className="d3-tabs__icon" aria-hidden="true">{t.icon}</span> : null}
            {t.label}
            {t.count !== undefined ? (
              <span className="d3-tabs__count" aria-hidden="true">{t.count.toLocaleString()}</span>
            ) : null}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {children}
    </RadixTabs.Root>
  )
}

export const TabPanel = ({ className, ...rest }: React.ComponentProps<typeof RadixTabs.Content>) => (
  <RadixTabs.Content className={cn('d3-tabs__panel', className)} {...rest} />
)
