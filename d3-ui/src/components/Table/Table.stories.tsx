import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from '../Badge/Badge'
import { EmptyState } from '../EmptyState/EmptyState'
import { Link } from '../Link/Link'
import { Table, type TableColumn } from './Table'

interface Project {
  code: string
  name: string
  lifecycle: 'planned' | 'building' | 'deployed' | 'parked'
  phase: number
  criticals: number
}

const projects: Project[] = [
  { code: 'BND', name: 'Bindery', lifecycle: 'deployed', phase: 8.5, criticals: 0 },
  { code: 'AUTH', name: 'D3 Auth', lifecycle: 'deployed', phase: 6, criticals: 0 },
  { code: 'FRM', name: 'Foreman', lifecycle: 'building', phase: 0, criticals: 2 },
  { code: 'BUR', name: 'Burrow', lifecycle: 'planned', phase: 0, criticals: 0 },
  { code: 'CLW', name: 'Clearwhen', lifecycle: 'planned', phase: 0, criticals: 1 },
]

const columns: TableColumn<Project>[] = [
  {
    key: 'name',
    header: 'Project',
    sortable: true,
    cell: (row) => <Link href={`#${row.code}`}>{row.name}</Link>,
  },
  { key: 'code', header: 'Code', width: '6rem', cell: (row) => <code>{row.code}</code> },
  {
    key: 'lifecycle',
    header: 'Lifecycle',
    sortable: true,
    width: '9rem',
    cell: (row) => (
      <Badge tone={row.lifecycle === 'building' ? 'attention' : 'neutral'}>{row.lifecycle}</Badge>
    ),
  },
  { key: 'phase', header: 'Phase', sortable: true, numeric: true, width: '6rem' },
  {
    key: 'criticals',
    header: 'Criticals',
    sortable: true,
    numeric: true,
    width: '7rem',
    // A count of nothing is not news; only a count above zero earns a badge.
    cell: (row) => (row.criticals === 0 ? '—' : <Badge tone="danger">{row.criticals}</Badge>),
  },
]

const meta = {
  title: 'Data/Table',
  component: Table<Project>,
  tags: ['autodocs'],
  args: { columns, rows: projects, rowKey: (row: Project) => row.code },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A table of records: cells under column headings, sortable, with a header that stays ' +
          'put and — past a threshold — only the visible rows in the DOM.\n\n' +
          '**A table, unlike `DataList`** (D-067). `DataList` is for like things with a name and ' +
          'some meta; a table promises column headings, ordering, and cells that line up down a ' +
          'column. Reach for this one when the columns are the point — comparing values down ' +
          'one, or ordering by it — and for `DataList` when they are not.\n\n' +
          'Columns are data: `key` · `header` · `cell` · `sortable` · `numeric` · `width` · ' +
          '`align`. Sorting cycles ascending, descending, then back to the order you passed, ' +
          'because that third state is often meaningful on its own. `aria-sort` goes on the ' +
          'column, and a sorted virtual table sorts all of its rows, not the visible ones.\n\n' +
          '`stickyHeader` and `virtualize` both need a `maxHeight`: each needs a scroll ' +
          'container, and virtualization needs a viewport to measure against. Virtualized rows ' +
          'must all be the same height, which is why a cell truncates rather than wraps (D-019).' +
          '\n\nBelow `sm` the table keeps its shape and scrolls sideways rather than becoming a ' +
          'stack of cards: stacking destroys the alignment that was the reason to use a table.',
      },
    },
  },
  decorators: [
    (S) => (
      <div style={{ width: '100%', maxWidth: 860, margin: '0 auto' }}>
        <S />
      </div>
    ),
  ],
} satisfies Meta<typeof Table<Project>>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { caption: 'Projects in the ecosystem' },
}

export const SortedOnLoad: Story = {
  name: 'Sorted on load',
  args: {
    caption: 'Projects, most critical findings first',
    defaultSort: { column: 'criticals', direction: 'desc' },
  },
}

export const StickyHeader: Story = {
  name: 'Sticky header',
  args: {
    caption: 'Scroll the body; the headings stay',
    maxHeight: '240px',
    rows: [projects, projects, projects, projects].flat().map((row, i) => ({
      ...row,
      code: `${row.code}-${String(i)}`,
    })),
  },
}

export const Compact: Story = {
  args: { caption: 'Compact density', density: 'compact' },
}

export const Empty: Story = {
  args: {
    caption: 'Projects',
    rows: [],
    empty: (
      <EmptyState kind="no-results" size="inline" heading="No project matches that filter" />
    ),
  },
}

/** 439 rows — the size of the requirements register this was built for. */
export const Virtualized: Story = {
  args: {
    caption: '439 rows, with only the visible ones in the DOM',
    maxHeight: '420px',
    virtualize: true,
    rows: Array.from({ length: 439 }, (_, i) => ({
      code: `REQ-${String(i + 1).padStart(3, '0')}`,
      name: `Requirement ${String(i + 1)}`,
      lifecycle: (['planned', 'building', 'deployed', 'parked'] as const)[i % 4] ?? 'planned',
      phase: i % 17,
      criticals: i % 5,
    })),
  },
}
