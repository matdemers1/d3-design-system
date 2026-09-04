import type { Meta, StoryObj } from '@storybook/react'
import { Skeleton } from './Skeleton'

const meta = {
  title: 'Primitives/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  args: { variant: 'text', width: 240 },
  argTypes: { variant: { control: 'inline-radio', options: ['text', 'block', 'circle'] } },
  parameters: { docs: { description: { component:
    'A placeholder shaped like the content that is coming — the system’s preferred loading state.\n\n' +
    'Always `aria-hidden`: it is scaffolding, not content. The **container** carries `aria-busy` ' +
    'while loading and announces the outcome politely when it resolves, or the transition from ' +
    'loading to loaded is silent.\n\n' +
    'One slow shimmer and nothing more; under `prefers-reduced-motion` it stops entirely.' } } },
} satisfies Meta<typeof Skeleton>
export default meta
type Story = StoryObj<typeof meta>

export const Text: Story = {}
export const Lines: Story = {
  args: { lines: 4, width: undefined },
  parameters: { docs: { description: { story:
    'Widths vary so it reads like real text rather than a stack of identical bars.' } } },
  render: (args) => <div style={{ width: 320 }}><Skeleton {...args} /></div>,
}
export const Block: Story = { args: { variant: 'block', width: 220, height: 72 } }
export const Circle: Story = { args: { variant: 'circle', width: 32, height: 32 } }

export const TableRows: Story = {
  name: 'A table skeleton',
  parameters: { controls: { disable: true }, docs: { description: { story:
    'Three rows because three rows are coming, at the same 48px row height as the real table. ' +
    'This is what makes a spinner unnecessary.' } } },
  render: () => (
    <div style={{ width: 460 }} aria-busy="true">
      {[46, 38, 52].map((w, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, height: 48 }}>
          <Skeleton variant="circle" width={17} height={17} />
          <Skeleton variant="text" width={`${w}%`} />
          <Skeleton variant="text" width={44} style={{ marginLeft: 'auto' }} />
          <Skeleton variant="block" width={64} height={20} style={{ borderRadius: 999 }} />
        </div>
      ))}
    </div>
  ),
}
