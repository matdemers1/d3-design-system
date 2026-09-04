import type { Meta, StoryObj } from '@storybook/react'
import { Spinner } from './Spinner'

const meta = {
  title: 'Primitives/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  args: { label: 'Loading' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] } },
  parameters: { docs: { description: { component:
    'Indeterminate progress for an action in flight.\n\n' +
    '**It is a graph, not a wheel.** D3 draws force-directed graphs and the cloud is the link, ' +
    'so waiting is a small network still resolving with a signal relaying around its edges. The ' +
    'substrate leads: the triangle rotates and contracts as if a simulation had not settled, and ' +
    'the relay is the detail on top. The two run at 1200ms and 2400ms — exactly 2:1, so they ' +
    'never drift into a beat.\n\n' +
    '**Prefer `Skeleton`** for anything whose shape is knowable — a spinner over a blank region ' +
    'hides the shape, the count and the wait. Past roughly ten seconds neither is right: that ' +
    'wants progress, or a job the user can leave and come back to.' } } },
} satisfies Meta<typeof Spinner>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
      <Spinner size="sm" label="Loading" />
      <Spinner size="md" label="Loading" />
      <Spinner size="lg" label="Loading" />
      <Spinner size="xl" label="Loading" />
    </div>
  ),
}
export const Decorative: Story = {
  args: { label: undefined },
  parameters: { docs: { description: { story:
    'With no `label` the spinner is `aria-hidden`. Use this only when adjacent text already ' +
    'announces the wait — as inside a Button, where the label carries the name.' } } },
}

/** On an accent fill the accent itself would vanish, so the graph is drawn in
 *  the contrast colour instead. */
export const OnAccent: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10,
      background: 'var(--color-accent)', color: 'var(--color-accent-contrast)',
      borderRadius: 'var(--radius-md)', padding: '0 14px', height: 34,
      fontSize: 13, fontWeight: 600 }}>
      <Spinner size="sm" onAccent />
      Saving…
    </span>
  ),
}

