import type { Meta, StoryObj } from '@storybook/react'
import { Settings } from 'lucide-react'
import { Tooltip, TooltipProvider } from './Tooltip'
import { IconButton } from '../IconButton/IconButton'
import { Badge } from '../Badge/Badge'

const meta = {
  title: 'Layers/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  args: { content: 'Settings', children: <IconButton icon={<Settings size={16} strokeWidth={1.8} />} label="Settings" /> },
  parameters: { docs: { description: { component:
    'A short label or clarification, on hover **and on keyboard focus**.\n\n' +
    'The focus case is the whole reason this exists: **Bindery has 42 bare `title=` attributes**, ' +
    'and a native title never appears on keyboard focus, cannot be styled, and does not exist on ' +
    'touch.\n\n' +
    'Text only — no links, no buttons; a tooltip cannot be hovered into. And **nothing essential ' +
    'may live only in a tooltip**: if it matters on a phone, it is help text.' } } },
} satisfies Meta<typeof Tooltip>
export default meta
type Story = StoryObj<typeof meta>

export const OnAnIconButton: Story = {}
export const OnAStatus: Story = {
  args: {
    content: 'Retried 3 times, then gave up. The source file was unreadable.',
    children: <Badge tone="danger" tabIndex={0}>Gave up</Badge>,
  },
  parameters: { docs: { description: { story:
    'Half of Bindery’s `title=` attributes are icon-button labels and half are status explanations ' +
    'like this one. **A badge cannot take focus, so it needs `tabIndex={0}`** — without it this ' +
    'tooltip only ever appears on hover, which is exactly the failure a tooltip on focus exists to fix. ' +
    'The component warns in development when a trigger cannot receive focus.' } } },
}

/**
 * No provider needed — each Tooltip supplies its own. Wrap the app once in
 * `TooltipProvider` to share delays: after the first tooltip opens, moving
 * across a toolbar shows the next one immediately instead of waiting again.
 */
export const SharedDelays: Story = {
  render: () => (
    <TooltipProvider delayDuration={400} skipDelayDuration={300}>
      <div style={{ display: 'flex', gap: 4 }}>
        <Tooltip content="Settings"><IconButton icon={<Settings size={16} strokeWidth={1.8} />} label="Settings" /></Tooltip>
        <Tooltip content="Also settings"><IconButton icon={<Settings size={16} strokeWidth={1.8} />} label="Also settings" /></Tooltip>
      </div>
    </TooltipProvider>
  ),
}
