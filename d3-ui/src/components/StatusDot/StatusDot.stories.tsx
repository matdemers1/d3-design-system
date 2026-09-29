import type { Meta, StoryObj } from '@storybook/react'
import { StatusDot } from './StatusDot'

const meta = {
  title: 'Primitives/StatusDot',
  component: StatusDot,
  tags: ['autodocs'],
  args: { children: 'Running' },
  argTypes: {
    tone: { control: 'inline-radio', options: ['neutral', 'attention', 'danger', 'idle'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
  parameters: { docs: { description: { component:
    'A status as a dot and a word. **Takes a `tone`, not a colour** — `neutral | attention | danger | idle`.\n\n' +
    'Neutral by default: a healthy or running state is a muted dot, not a green one. Hue is spent ' +
    'only where seeing it should change what you do next (D-016). `idle` is a dimmer neutral for ' +
    'something parked or switched off.\n\n' +
    'The dot is decoration and hidden from assistive technology; **the text carries the meaning**, ' +
    'so a status is never colour alone. For a status that sits in a table cell or a heading, use Badge.' } } },
} satisfies Meta<typeof StatusDot>
export default meta
type Story = StoryObj<typeof meta>

const Col = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>{children}</div>
)

export const Neutral: Story = {}
export const Attention: Story = { args: { tone: 'attention', children: 'Certificate expires in 6 days' } }
export const Danger: Story = { args: { tone: 'danger', children: 'Delivery failing' } }
export const Idle: Story = { args: { tone: 'idle', children: 'Paused' } }

export const AllTones: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Col>
      <StatusDot>Running</StatusDot>
      <StatusDot tone="attention">Needs your review</StatusDot>
      <StatusDot tone="danger">Failed</StatusDot>
      <StatusDot tone="idle">Paused</StatusDot>
    </Col>
  ),
}

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Col>
      <StatusDot size="sm">Running (sm)</StatusDot>
      <StatusDot size="md">Running (md)</StatusDot>
    </Col>
  ),
}

export const ServicesList: Story = {
  name: 'A services list',
  parameters: { controls: { disable: true }, docs: { description: { story:
    'Five services, one hue. Everything healthy is the same quiet neutral, so the one that needs ' +
    'you is the only thing that moves the eye.' } } },
  render: () => (
    <Col>
      <StatusDot>SMTP — running</StatusDot>
      <StatusDot>IMAP — running</StatusDot>
      <StatusDot tone="attention">Certificates — renew within 14 days</StatusDot>
      <StatusDot tone="danger">Outbound relay — refusing connections</StatusDot>
      <StatusDot tone="idle">Calendar sync — off</StatusDot>
    </Col>
  ),
}
