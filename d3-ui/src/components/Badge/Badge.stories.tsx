import type { Meta, StoryObj } from '@storybook/react'
import { Badge, CountBadge } from './Badge'

const meta = {
  title: 'Primitives/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: { children: 'In review' },
  argTypes: {
    tone: { control: 'inline-radio', options: ['neutral', 'attention', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
  parameters: { docs: { description: { component:
    'A compact status. **Takes a `tone`, not a colour** — `neutral | attention | danger`, with no ' +
    '`success` and no `info`.\n\n' +
    'A status earns a hue only if seeing it should change what you do next; everything in ' +
    'progress, parked or terminal is neutral. App A ships seven statuses, already past what ' +
    'colour can distinguish, and App C proved the failure mode by growing five badge ' +
    'families (D-016).\n\nNever interactive — a clickable badge is a Button.' } } },
} satisfies Meta<typeof Badge>
export default meta
type Story = StoryObj<typeof meta>

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>{children}</div>
)

export const Neutral: Story = {}
export const Attention: Story = { args: { tone: 'attention', children: 'New' } }
export const DangerTone: Story = { name: 'Danger', args: { tone: 'danger', children: 'Blocked' } }

export const SevenStatuses: Story = {
  name: 'App A’s seven statuses',
  parameters: { controls: { disable: true }, docs: { description: { story:
    'The whole of App A’s status set, mapped to tones. `New` and `Response received` carry the ' +
    'accent because they mean *it is back on you*; everything else is neutral. One hue in a ' +
    'forty-row table instead of five.' } } },
  render: () => (
    <Row>
      <Badge tone="attention">New</Badge>
      <Badge tone="attention">Response received</Badge>
      <Badge>In review</Badge>
      <Badge>Awaiting response</Badge>
      <Badge>Backlog</Badge>
      <Badge>Snoozed</Badge>
      <Badge>Dismissed</Badge>
      <Badge tone="danger">Blocked</Badge>
    </Row>
  ),
}

export const Counts: Story = {
  parameters: { controls: { disable: true }, docs: { description: { story:
    'Tabular figures, grouped above 999, and the accessible name says what is counted — ' +
    '“48 unread items”, not a bare “48”.' } } },
  render: () => (
    <Row>
      <CountBadge count={48} label="48 unread items" />
      <CountBadge count={1204} label="1,204 votes" />
      <CountBadge count={12} label="12 items" quiet />
      <CountBadge count={340} max={99} label="340 unread items" />
    </Row>
  ),
}

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Row>
      <Badge size="sm" tone="attention">New</Badge>
      <Badge size="md" tone="attention">New</Badge>
    </Row>
  ),
}
