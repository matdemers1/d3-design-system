import type { Meta, StoryObj } from '@storybook/react'
import { ChevronDown, Check } from 'lucide-react'
import { Select } from './Select'

const REASONS = [
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'wont_fix', label: 'Won’t fix' },
  { value: 'not_a_bug', label: 'Not a bug' },
  { value: 'out_of_scope', label: 'Out of scope' },
  { value: 'spam', label: 'Spam' },
]
const SORTS = [
  { value: 'newest', label: 'Newest', description: 'Most recently submitted first' },
  { value: 'ai', label: 'AI priority', description: 'Scored by the batch analysis' },
  { value: 'votes', label: 'Top voted', description: 'Most votes from the public portal' },
]

const meta = {
  title: 'Forms/Select',
  component: Select,
  tags: ['autodocs'],
  args: {
    options: REASONS,
    'aria-label': 'Reason',
    chevronIcon: <ChevronDown size={14} strokeWidth={1.9} />,
    checkIcon: <Check size={13} strokeWidth={2.2} />,
  },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  parameters: { docs: { description: { component:
    'Choose one of a known set. Replaces App C’s **three** dropdown families ' +
    '(`status-dropdown`, `inline-dropdown`, `enhance-menu`), MUI Select, and 20 native selects.\n\n' +
    'Built on Radix Select — roving focus, typeahead, `aria-activedescendant` and collision-aware ' +
    'positioning are not things to hand-roll. Focus returns to the trigger on close, always.\n\n' +
    '**Not for:** two or three options (a segmented control shows them), more than ~15 (a ' +
    'filtering combobox), an action on choose (a DropdownMenu — Select holds a value, a menu ' +
    'performs an action), or multiple selection (checkboxes).' } } },
  decorators: [(S) => <div style={{ width: 240 }}><S /></div>],
} satisfies Meta<typeof Select>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { defaultValue: 'duplicate' } }
export const Placeholder: Story = { args: { placeholder: 'Select a reason' } }
export const WithDescriptions: Story = {
  args: { options: SORTS, defaultValue: 'ai', 'aria-label': 'Sort by' },
}
export const Invalid: Story = { args: { invalid: true, placeholder: 'Select a reason' } }
export const Disabled: Story = { args: { disabled: true, defaultValue: 'duplicate' } }
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Select {...args} size="sm" defaultValue="duplicate" />
      <Select {...args} size="md" defaultValue="duplicate" />
      <Select {...args} size="lg" defaultValue="duplicate" />
    </div>
  ),
}
