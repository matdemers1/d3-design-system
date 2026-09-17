import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FilterBar } from './FilterBar'
import { FormField } from '../FormField/FormField'
import { Select } from '../Select/Select'
import { Input } from '../Input/Input'
import { Button } from '../Button/Button'
import { SegmentedControl } from '../SegmentedControl/SegmentedControl'

const meta = {
  title: 'Forms/FilterBar',
  component: FilterBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component:
      'The controls that narrow a list, in a row above it. From `md` the controls share one ' +
      'wrapping row, bottom-aligned so their labels line up, and `trailing` — a result count, an ' +
      'export — sits at the far edge. Below `md` everything stacks full width.\n\n' +
      '**Labels stay visible.** Wrap each Select or Input in a `FormField`; a SegmentedControl ' +
      'carries its own `aria-label`. A placeholder is not a label.\n\n' +
      'Give the bar an `aria-label` ("Filter the audit trail") and it becomes a named group.' } },
  },
  decorators: [(S) => <div style={{ padding: 'var(--space-24)', width: '100%', maxWidth: 1000 }}><S /></div>],
} satisfies Meta<typeof FilterBar>
export default meta
type Story = StoryObj<typeof meta>

// A native date input is left out on purpose: Chromium's calendar-picker stop
// inside it draws no focus ring (see CHANGELOG, known issues).
const SINCE = [
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: 'all', label: 'All time' },
]

const EVENTS = [
  { value: 'all', label: 'Everything' },
  { value: 'grant.', label: 'grant. (all)' },
  { value: 'session.revoked', label: 'session.revoked' },
]

function AuditFilters({ withTrailing = true }: { withTrailing?: boolean }) {
  const [event, setEvent] = useState('all')
  return (
    <FilterBar aria-label="Filter the audit trail"
      trailing={withTrailing ? <><span>248 events</span><Button size="md">Export what is showing</Button></> : undefined}>
      <FormField label="Event"><Select value={event} onValueChange={setEvent} options={EVENTS} /></FormField>
      <FormField label="Since"><Select defaultValue="7d" options={SINCE} /></FormField>
    </FilterBar>
  )
}

export const Audit: Story = { render: () => <AuditFilters /> }

export const WithoutTrailing: Story = { name: 'Without trailing', render: () => <AuditFilters withTrailing={false} /> }

function WithSegments() {
  const [status, setStatus] = useState('all')
  return (
    <FilterBar aria-label="Filter people" trailing={<span>12 people</span>}>
      <FormField label="Search"><Input type="search" /></FormField>
      <SegmentedControl aria-label="Status" value={status} onValueChange={setStatus}
        items={[{ value: 'all', label: 'All' }, { value: 'active', label: 'Active' }, { value: 'suspended', label: 'Suspended', count: 1 }]} />
    </FilterBar>
  )
}

export const WithASegmentedControl: Story = { name: 'With a segmented control', render: () => <WithSegments /> }

/** Many controls: the row wraps, and the trailing slot keeps to the far edge. */
export const Wrapping: Story = {
  decorators: [(S) => <div style={{ padding: 'var(--space-24)', width: 760 }}><S /></div>],
  render: () => (
    <FilterBar aria-label="Filter documents" trailing={<span>1,204 documents</span>}>
      <FormField label="Search"><Input type="search" /></FormField>
      <FormField label="Kind"><Select defaultValue="all" options={[{ value: 'all', label: 'Every kind' }]} /></FormField>
      <FormField label="Correspondent"><Select defaultValue="all" options={[{ value: 'all', label: 'Anyone' }]} /></FormField>
      <FormField label="Since"><Select defaultValue="7d" options={SINCE} /></FormField>
    </FilterBar>
  ),
}
