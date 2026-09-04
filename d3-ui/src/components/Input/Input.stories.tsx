import type { Meta, StoryObj } from '@storybook/react'
import { Search, X } from 'lucide-react'
import { Input } from './Input'
import { Button } from '../Button/Button'
import { Select } from '../Select/Select'

const meta = {
  title: 'Forms/Input',
  component: Input,
  tags: ['autodocs'],
  args: { placeholder: 'Search feedback' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  parameters: { docs: { description: { component:
    'A single-line text field. **Shares its height scale with Button exactly** (28/34/40), because ' +
    'the two sit side by side in every filter bar in every app.\n\n' +
    'A placeholder is never a label, and is only ever a format example.' } } },
  decorators: [(S) => <div style={{ width: 300 }}><S /></div>],
} satisfies Meta<typeof Input>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Filled: Story = { args: { defaultValue: 'csv export' } }
export const WithAffixes: Story = {
  args: { leading: <Search size={14} strokeWidth={1.9} />, trailing: <X size={14} strokeWidth={1.9} />,
    defaultValue: 'csv export' },
}
export const Invalid: Story = { args: { invalid: true, defaultValue: 'not-an-email' } }
export const Disabled: Story = { args: { disabled: true, defaultValue: 'acme-corp' } }
export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: 'FB-2841' },
  parameters: { docs: { description: { story:
    '**Read-only and disabled are different, and the apps conflate them.** Read-only is focusable, ' +
    'selectable, copyable and submitted. Disabled is none of those — making a reference ID ' +
    'disabled means a keyboard user cannot copy it.' } } },
}
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  decorators: [(S) => <div style={{ width: 300 }}><S /></div>],
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Input size="sm" placeholder="sm — 28px" />
      <Input size="md" placeholder="md — 34px" />
      <Input size="lg" placeholder="lg — 40px" />
    </div>
  ),
}
export const InAFilterBar: Story = {
  name: 'Why the heights match',
  parameters: { controls: { disable: true } },
  decorators: [(S) => <div style={{ width: 460 }}><S /></div>],
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Input placeholder="Semantic search" leading={<Search size={14} strokeWidth={1.9} />} />
      <Select aria-label="Type" options={[{ value: 'all', label: 'Type: All' }]} defaultValue="all" />
      <Button variant="primary">New item</Button>
    </div>
  ),
}
