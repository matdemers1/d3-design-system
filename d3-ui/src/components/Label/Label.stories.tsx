import type { Meta, StoryObj } from '@storybook/react'
import { Label } from './Label'

const meta = {
  title: 'Forms/Label',
  component: Label,
  tags: ['autodocs'],
  args: { children: 'Reason', htmlFor: 'demo' },
  parameters: { docs: { description: { component:
    'Names a control. Rarely used directly — FormField renders it, which is what guarantees the ' +
    '`htmlFor`/`id` association exists.\n\n' +
    '**Optional is marked; required is the default.** Never an asterisk.' } } },
} satisfies Meta<typeof Label>
export default meta
type Story = StoryObj<typeof meta>

export const Required: Story = {}
export const Optional: Story = { args: { optional: true, children: 'Note for the audit log' } }
