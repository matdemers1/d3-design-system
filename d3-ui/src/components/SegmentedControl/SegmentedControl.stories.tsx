import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { SegmentedControl } from './SegmentedControl'
import type { SegmentedItem } from './SegmentedControl'

const GROUPINGS: SegmentedItem[] = [
  { value: 'kind', label: 'Kind' },
  { value: 'correspondent', label: 'Correspondent' },
  { value: 'year', label: 'Year' },
]

function Demo({ items, size, label = 'Group by', activationMode }: {
  items: SegmentedItem[]; size?: 'sm' | 'md'; label?: string
  activationMode?: 'automatic' | 'manual'
}) {
  const [value, setValue] = useState(items.find((i) => !i.disabled)!.value)
  return (
    <SegmentedControl
      items={items}
      value={value}
      onValueChange={setValue}
      size={size}
      activationMode={activationMode}
      aria-label={label}
    />
  )
}

const meta = {
  title: 'Layers/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
  args: { items: GROUPINGS, value: 'kind', onValueChange: () => {}, 'aria-label': 'Group by' },
  parameters: { docs: { description: { component:
    'One choice from a small set, changing what a region renders.\n\n' +
    '**This is a radiogroup, not tabs.** `Tabs` is Radix-backed, owns `tabpanel`s and exists to ' +
    'switch between them. A filter that changes what one region shows has no panel to own, and a ' +
    '`tablist` with no tabpanel is a lie told to a screen reader. So: `role="radiogroup"`, ' +
    '`aria-checked`, **one tab stop for the whole group**, and arrow keys that move the selection.\n\n' +
    'Selection follows focus here, unlike `Tabs`’ `manual` mode — nothing is fetched by choosing, ' +
    'because these change what an already-loaded region shows. If a segment ever triggers a request, ' +
    'it is a `Tabs` in `manual` mode, not this.\n\n' +
    'Segments are content-width, so the thumb is **measured** rather than computed — the same ' +
    'technique `Tabs` uses for its pill, on the same 280ms spring token, so the two read as one idea.' } } },
} satisfies Meta<typeof SegmentedControl>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { render: () => <Demo items={GROUPINGS} /> }

/** Import filters by state and shows how many are in each. The number joins the
 *  accessible name — "Failed, 3 items", never "Failed 3". */
export const WithCounts: Story = {
  render: () => (
    <Demo
      label="Filter by state"
      items={[
        { value: 'failed', label: 'Failed', count: 3 },
        { value: 'ingested', label: 'Ingested', count: 412 },
        { value: 'duplicate', label: 'Duplicate', count: 27 },
        { value: 'skipped', label: 'Skipped', count: 0 },
      ]}
    />
  ),
}

/** Icons are decorative — the label carries the name. */
export const WithIcons: Story = {
  render: () => (
    <Demo
      label="Media kind"
      items={[
        { value: 'photos', label: 'Photos', icon: <Dot /> },
        { value: 'videos', label: 'Videos', icon: <Dot /> },
        { value: 'documents', label: 'Documents', icon: <Dot /> },
      ]}
    />
  ),
}

/** 28px to sit beside a `md` Button; 24px for a dense toolbar. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <Demo items={GROUPINGS} size="md" />
      <Demo items={GROUPINGS} size="sm" />
    </div>
  ),
}

/** A disabled option stays readable. It is still telling you the option exists. */
export const WithDisabled: Story = {
  render: () => (
    <Demo
      label="Scope"
      items={[
        { value: 'all', label: 'All' },
        { value: 'mine', label: 'Mine' },
        { value: 'shared', label: 'Shared', disabled: true },
      ]}
    />
  ),
}

/**
 * `manual` moves focus and waits for Enter or Space. Required when choosing
 * fires a request — Bindery's Archive grouping calls `api.tree(groupBy)` on
 * every change, so arrowing across it under automatic activation would fire two
 * requests nobody asked for. Tab in and arrow across: nothing is chosen until
 * you press Enter.
 */
export const ManualActivation: Story = {
  render: () => <Demo items={GROUPINGS} activationMode="manual" />,
}

function Dot() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="8" />
    </svg>
  )
}
