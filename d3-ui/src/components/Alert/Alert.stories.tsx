import type { Meta, StoryObj } from '@storybook/react'
import { CircleAlert, TriangleAlert, CircleCheck, Info } from 'lucide-react'
import { Alert } from './Alert'
import { Button } from '../Button/Button'

const ICONS = {
  danger: <CircleAlert size={17} strokeWidth={1.9} />,
  warning: <TriangleAlert size={17} strokeWidth={1.9} />,
  success: <CircleCheck size={17} strokeWidth={1.9} />,
  info: <Info size={17} strokeWidth={1.9} />,
}

const meta = {
  title: 'Layers/Alert',
  component: Alert,
  tags: ['autodocs'],
  args: { tone: 'info', children: 'You have viewer access. Ask an owner to grant edit rights.',
    title: 'This library is read-only', icon: ICONS.info },
  argTypes: { tone: { control: 'inline-radio', options: ['info', 'success', 'warning', 'danger'] } },
  parameters: { docs: { description: { component:
    'Inline messaging that stays on the page. Not a Toast — a Toast is transient and ' +
    'self-dismissing, and it is v2.\n\n' +
    '**Alert is where `success`, `warning` and `info` are allowed to be colours.** D-016 took hue ' +
    'from *status* because seven statuses exceed what colour can carry; messaging is the opposite ' +
    'case.\n\n' +
    '**The role is conditional and commonly got wrong.** A static alert present at page load needs ' +
    '**no role** — `role="alert"` makes a screen reader interrupt itself to announce something ' +
    'already there. Pass `dynamic` only when it appears in response to an action.' } } },
  decorators: [(S) => <div style={{ width: 460 }}><S /></div>],
} satisfies Meta<typeof Alert>
export default meta
type Story = StoryObj<typeof meta>

export const Info_: Story = { name: 'Info' }
export const Success: Story = {
  args: { tone: 'success', icon: ICONS.success, title: '3 items dismissed',
    children: 'They stay searchable and can be restored from the audit log.' },
}
export const Warning: Story = {
  args: { tone: 'warning', icon: ICONS.warning, title: 'Two runs failed in a row',
    children: 'Offsite replication has not completed since 2 Sept. The next attempt is at 03:00.',
    actions: <Button size="sm">View ledger</Button> },
}
export const Danger: Story = {
  args: { tone: 'danger', icon: ICONS.danger, title: 'Your session has expired',
    children: 'You were signed out after 30 days of inactivity.',
    actions: <Button size="sm">Sign in again</Button> },
  parameters: { docs: { description: { story:
    'What happened, why, and the way out — against App A’s current `<AlertTitle>Error</AlertTitle>` ' +
    'plus “An unexpected error occurred”, both of which are on the 3g banned list.' } } },
}
export const AllTones: Story = {
  parameters: { controls: { disable: true } },
  decorators: [(S) => <div style={{ width: 460 }}><S /></div>],
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Alert tone="danger" icon={ICONS.danger} title="Your session has expired">
        You were signed out after 30 days of inactivity.
      </Alert>
      <Alert tone="warning" icon={ICONS.warning} title="Two runs failed in a row">
        Offsite replication has not completed since 2 Sept.
      </Alert>
      <Alert tone="success" icon={ICONS.success} title="3 items dismissed">
        They stay searchable and can be restored from the audit log.
      </Alert>
      <Alert tone="info" icon={ICONS.info}>
        This library is read-only. Ask an owner to grant edit rights.
      </Alert>
    </div>
  ),
}

/**
 * A banner. Under a panel header, at the top of a log — the alert is part of the
 * surface rather than a card on it, so it spans the full width and takes a
 * boundary at the edge it meets instead of a radius.
 */
export const Flush: Story = {
  render: () => (
    <div style={{ width: 460, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <div style={{ padding: 'var(--space-12) var(--space-16)', fontSize: 'var(--text-13)', fontWeight: 'var(--weight-semibold)' }}>
        Activity
      </div>
      <Alert tone="warning" flush>
        412 entries are still being written — what you are reading is slightly behind.
      </Alert>
      <div style={{ padding: 'var(--space-16)', fontSize: 'var(--text-12)', color: 'var(--color-text-muted)' }}>
        normalize · page · segment · embed
      </div>
    </div>
  ),
}
