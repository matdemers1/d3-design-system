import type { Meta, StoryObj } from '@storybook/react'
import { Check } from 'lucide-react'
import { Checkbox } from './Checkbox'

const meta = {
  title: 'Forms/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  args: { label: 'Notify me when this changes', checkIcon: <Check size={11} strokeWidth={3} /> },
  parameters: { docs: { description: { component:
    'A binary choice, and the only v1 control with a third state.\n\n' +
    '**`indeterminate` is required, not optional.** App A’s inbox header checkbox already needs ' +
    'it (`InboxPage.jsx:246`) — a select-all showing unchecked while three rows are selected ' +
    'actively lies about the state of the table. Radix renders it as a real ARIA state ' +
    '(`aria-checked="mixed"`), not a CSS class.\n\n' +
    'The label is part of the click target — the whole row, not the 17px box.' } } },
} satisfies Meta<typeof Checkbox>
export default meta
type Story = StoryObj<typeof meta>

const Col = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
)

export const Unchecked: Story = { args: { checked: false } }
export const Checked: Story = { args: { checked: true } }
export const Indeterminate: Story = { args: { checked: 'indeterminate', label: 'Select all' } }
export const Invalid: Story = {
  args: { invalid: true, checked: false, label: 'I have written the passphrase down' },
  parameters: { docs: { description: { story:
    'Bindery’s passphrase gate is exactly this case — a checkbox whose failure has consequences.' } } },
}
export const AllStates: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Col>
      <Checkbox {...args} checked={false} label="Unchecked" />
      <Checkbox {...args} checked label="Checked" />
      <Checkbox {...args} checked="indeterminate" label="Indeterminate" />
      <Checkbox {...args} checked={false} disabled label="Disabled" />
      <Checkbox {...args} checked disabled label="Disabled, checked" />
      <Checkbox {...args} checked={false} invalid label="Invalid" />
    </Col>
  ),
}
