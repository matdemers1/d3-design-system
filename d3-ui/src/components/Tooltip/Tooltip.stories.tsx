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
  decorators: [(S) => <TooltipProvider><S /></TooltipProvider>],
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
    children: <Badge tone="danger">Gave up</Badge>,
  },
  parameters: { docs: { description: { story:
    'Half of Bindery’s 42 `title=` attributes are icon-button labels and half are status ' +
    'explanations like this one. Both need a real tooltip; the first also needs an `aria-label`.' } } },
}
