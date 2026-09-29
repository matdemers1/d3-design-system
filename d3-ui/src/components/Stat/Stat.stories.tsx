import type { Meta, StoryObj } from '@storybook/react'
import { Stat, StatGroup } from './Stat'
import { StatusDot } from '../StatusDot/StatusDot'

const meta = {
  title: 'Data/Stat',
  component: Stat,
  tags: ['autodocs'],
  args: { label: 'Inbound queue', value: '0', unit: 'waiting' },
  parameters: { docs: { description: { component:
    'A number-forward tile: a label, the value at 24px with tabular figures, an optional unit, ' +
    'a status and a footnote.\n\n' +
    'The status is a `StatusDot` shown **under the value**, so a screen reader reads label, value, ' +
    'unit, status in that order, and a long label cannot squeeze it out.\n\n' +
    '`StatGroup` lays tiles in one row, equal widths, split by 1px hairlines; two columns below `md`.' } } },
} satisfies Meta<typeof Stat>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithUnitAndFootnote: Story = {
  args: { label: 'Certificates', value: '89', unit: 'days', footnote: 'Renews automatically' },
}

export const WithStatus: Story = {
  args: {
    label: 'Mail flow', value: 'Delivering', unit: undefined,
    status: <StatusDot>Healthy</StatusDot>, footnote: 'Last delivery 4 min ago',
  },
}

export const Group: Story = {
  name: 'StatGroup',
  parameters: { layout: 'fullscreen', controls: { disable: true }, docs: { description: { story:
    'Four tiles in a row. Resize below 768px and they wrap to two columns.' } } },
  render: () => (
    <div style={{
      margin: 'var(--space-16)',
      background: 'var(--color-surface-raised)',
      border: 'var(--border-width) solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
    }}>
      <StatGroup role="group" aria-label="Summary">
        <Stat label="Mail flow" value="Delivering" status={<StatusDot>Healthy</StatusDot>}
          footnote="Last delivery 4 min ago" />
        <Stat label="Inbound queue" value="0" unit="waiting" status={<StatusDot>Healthy</StatusDot>} />
        <Stat label="Certificates" value="89" unit="days"
          status={<StatusDot tone="attention">Renew soon</StatusDot>} />
        <Stat label="Backups" value="11:00 PM" status={<StatusDot tone="idle">Nightly</StatusDot>}
          footnote="Last run succeeded" />
      </StatGroup>
    </div>
  ),
}
