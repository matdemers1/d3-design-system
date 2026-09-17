import type { Meta, StoryObj } from '@storybook/react'
import { Cluster } from './Cluster'
import { Badge } from '../Badge/Badge'
import { Button } from '../Button/Button'
import { Link } from '../Link/Link'

const meta = {
  title: 'Layout/Cluster',
  component: Cluster,
  tags: ['autodocs'],
  argTypes: {
    gap: { control: 'select', options: ['2', '4', '6', '8', '12', '16', '20', '24', '32', '40', '48', '64'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end', 'baseline', 'stretch'] },
    justify: { control: 'inline-radio', options: ['start', 'center', 'end', 'between'] },
  },
  args: { gap: '8' },
  parameters: { docs: { description: { component:
    'Children in a row that **always wraps** — badges beside a timestamp, a set of buttons. ' +
    '`gap` is a step on the spacing scale, by name.' } } },
  decorators: [(S) => <div style={{ width: 360 }}><S /></div>],
} satisfies Meta<typeof Cluster>
export default meta
type Story = StoryObj<typeof meta>

export const Badges: Story = {
  render: (args) => (
    <Cluster {...args}>
      <Badge tone="attention">admin</Badge>
      <Badge tone="danger">suspended</Badge>
      <span style={{ color: 'var(--color-fg-muted)', fontSize: 'var(--text-13)' }}>last signed in 3 Sept</span>
    </Cluster>
  ),
}

export const Buttons: Story = {
  render: (args) => (
    <Cluster {...args}>
      <Button size="sm">Make an admin</Button>
      <Button size="sm">Let them back in</Button>
      <Button size="sm" variant="danger-ghost">Reset</Button>
    </Cluster>
  ),
}

/** Too many for the width: the row wraps rather than overflowing. */
export const Wrapping: Story = {
  decorators: [(S) => <div style={{ width: 220 }}><S /></div>],
  render: Buttons.render,
}

export const Between: Story = {
  name: 'justify="between"',
  args: { justify: 'between', align: 'baseline' },
  render: (args) => (
    <Cluster {...args}>
      <strong>Lately</strong>
      <Link href="#audit">All of it</Link>
    </Cluster>
  ),
}
