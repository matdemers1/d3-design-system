import type { Meta, StoryObj } from '@storybook/react'
import { Button, IconButton, Badge, Alert, Spinner, Skeleton, Card, EmptyState } from '../index'
import { Trash2, Pencil } from 'lucide-react'

const meta = {
  title: 'Guides/Using the system',
  parameters: {
    layout: 'padded',
    docs: { description: { component:
      'The choices that keep going wrong, shown side by side. Every pair below is a real ' +
      'thing found in the audit or during migration — none of them are invented for the ' +
      'sake of an example.' } },
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/* ── presentation ─────────────────────────────────────────────────────── */
const wrap: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 820 }
const cell = (ok: boolean): React.CSSProperties => ({
  border: `1px solid ${ok ? 'var(--color-success)' : 'var(--color-danger)'}`,
  borderRadius: 'var(--radius-lg)', padding: 'var(--space-16)', background: 'var(--color-surface)',
})
const tag = (ok: boolean): React.CSSProperties => ({
  fontSize: 'var(--text-11)', fontWeight: 'var(--weight-semibold)', letterSpacing: '.06em',
  textTransform: 'uppercase', color: ok ? 'var(--color-success)' : 'var(--color-danger)',
  marginBottom: 'var(--space-12)', display: 'block',
})
const why: React.CSSProperties = {
  fontSize: 'var(--text-12)', lineHeight: 1.6, color: 'var(--color-text-muted)',
  marginTop: 'var(--space-12)', maxWidth: 820,
}

function Pair({ good, bad, note }: { good: React.ReactNode; bad: React.ReactNode; note: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 'var(--space-40)' }}>
      <div style={wrap}>
        <div style={cell(true)}><span style={tag(true)}>Do</span>{good}</div>
        <div style={cell(false)}><span style={tag(false)}>Don’t</span>{bad}</div>
      </div>
      <p style={why}>{note}</p>
    </div>
  )
}

export const OnePrimaryPerView: Story = {
  render: () => (
    <Pair
      good={<div style={{ display: 'flex', gap: 8 }}>
        <Button variant="primary">Save changes</Button><Button>Cancel</Button>
      </div>}
      bad={<div style={{ display: 'flex', gap: 8 }}>
        <Button variant="primary">Save</Button><Button variant="primary">Export</Button>
      </div>}
      note={<><strong>One primary per view.</strong> Primary means “the action this view exists for”.
      Two of them means neither is, and the eye has nowhere to land. Everything else is{' '}
      <code>secondary</code> or <code>ghost</code>.</>}
    />
  ),
}

export const DangerIsNeverIconOnly: Story = {
  render: () => (
    <Pair
      good={<Button variant="danger-ghost" icon={<Trash2 size={14} />}>Delete document</Button>}
      bad={<IconButton label="Delete document" icon={<Trash2 size={14} />} />}
      note={<><strong>A destructive action always carries its noun.</strong> <code>IconButton</code>{' '}
      has no <code>danger</code> variant at all — the affordance is removed rather than the rule
      documented, because a documented rule is one somebody breaks at 6pm. An icon-only control is
      for reversible, repeated actions: edit <Pencil size={11} style={{ verticalAlign: -1 }} />,
      copy, expand.</>}
    />
  ),
}

export const SkeletonOverSpinner: Story = {
  render: () => (
    <Pair
      good={<div style={{ display: 'grid', gap: 8 }}>
        <Skeleton variant="text" style={{ width: '70%' }} />
        <Skeleton variant="text" style={{ width: '45%' }} />
        <Skeleton variant="text" style={{ width: '60%' }} />
      </div>}
      bad={<div style={{ display: 'grid', placeItems: 'center', minHeight: 62 }}>
        <Spinner label="Loading" />
      </div>}
      note={<><strong>If the shape is knowable, draw the shape.</strong> A spinner over a blank
      region hides the shape, the count and the wait — three things the reader could have had for
      free. Keep the spinner for an action in flight, where the shape is a button that is already
      on screen.</>}
    />
  ),
}

export const AlertsAreNotStatusPills: Story = {
  render: () => (
    <Pair
      good={<Alert tone="danger" dynamic title="That did not work.">
        The vault is locked. Unlock it to search inside.
      </Alert>}
      bad={<div style={{ display: 'flex', gap: 6 }}>
        <Badge tone="danger">Error</Badge>
        <span style={{ fontSize: 'var(--text-12)', color: 'var(--color-text-muted)' }}>
          The vault is locked.
        </span>
      </div>}
      note={<><strong>A message is an <code>Alert</code>; a state is a <code>Badge</code>.</strong> A
      badge labels a thing that is in a state — a document that failed, an account that is locked. It
      is not a way to colour a sentence. And a badge tone is not free: there are three, because seven
      statuses is already past what colour can carry.</>}
    />
  ),
}

export const EmptyIsNotOneState: Story = {
  render: () => (
    <Pair
      good={<EmptyState kind="no-results" heading="No documents match “dd214”.">
        Try a correspondent, or a year.
      </EmptyState>}
      bad={<EmptyState kind="empty" heading="Nothing here" />}
      note={<><strong>Empty, no-results, error and no-access are four different messages.</strong>
      “Nothing here” after a search that found nothing is wrong, and it is wrong in the way that
      makes somebody think the archive lost their document. <code>kind</code> is required for this
      reason.</>}
    />
  ),
}

export const InteractiveCardsHoldNoControls: Story = {
  render: () => (
    <Pair
      good={<Card interactive onClick={() => {}}>
        <strong style={{ fontSize: 'var(--text-13)' }}>Fenwick Garage — Invoice</strong>
        <p style={{ margin: '4px 0 0', fontSize: 'var(--text-12)', color: 'var(--color-text-muted)' }}>
          14 March 2024 · 2 pages
        </p>
      </Card>}
      bad={<Card>
        <strong style={{ fontSize: 'var(--text-13)' }}>Fenwick Garage — Invoice</strong>
        <div style={{ marginTop: 8 }}><Button size="sm">Open</Button></div>
      </Card>}
      note={<><strong>A card is either the control or it contains them — never both.</strong> A
      button inside a clickable card gives two targets in one place and no way to tell which one
      fired. <code>Card</code> warns in development when it finds a nested control.</>}
    />
  ),
}
