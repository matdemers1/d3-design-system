import type { Meta, StoryObj } from '@storybook/react'
import { CircleAlert, Search } from 'lucide-react'
import { FormField } from './FormField'
import { Input } from '../Input/Input'
import { Textarea } from '../Textarea/Textarea'
import { Select } from '../Select/Select'
import { Checkbox } from '../Checkbox/Checkbox'

const meta = {
  title: 'Forms/FormField',
  component: FormField,
  tags: ['autodocs'],
  args: { label: 'Reason', children: <Input placeholder="Placeholder" /> },
  parameters: { docs: { description: { component:
    'Binds a label, a control, help text and an error into one accessible unit.\n\n' +
    'It generates `id`, `{id}-help` and `{id}-error`, sets `htmlFor`, `aria-describedby` and ' +
    '`aria-invalid`, and makes the error a polite live region. **There is no way to render a ' +
    'FormField label without association** — which is the point: App B ships 18 labels with ' +
    'zero `htmlFor`, and App A, App B and App C use `aria-invalid` and ' +
    '`aria-describedby` zero times between them.\n\n' +
    'Its usage count is the lowest in v1 and its value among the highest — the count measures ' +
    'how often the wiring is done today, which is the problem, not the demand.' } } },
} satisfies Meta<typeof FormField>
export default meta
type Story = StoryObj<typeof meta>

const REASONS = [
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'wont_fix', label: 'Won’t fix' },
  { value: 'not_a_bug', label: 'Not a bug' },
  { value: 'out_of_scope', label: 'Out of scope' },
  { value: 'spam', label: 'Spam' },
]

export const Resting: Story = {
  render: (args) => (
    <div style={{ width: 320 }}>
      <FormField {...args}><Select options={REASONS} defaultValue="duplicate" /></FormField>
    </div>
  ),
}

export const WithHelp: Story = {
  args: { label: 'Passphrase',
    help: 'At least 12 characters. This cannot be recovered — write it down before you continue.' },
  render: (args) => (
    <div style={{ width: 320 }}><FormField {...args}><Input type="password" defaultValue="hunter2hunter2" /></FormField></div>
  ),
}

export const WithError: Story = {
  args: { label: 'Reason',
    error: 'Select a reason before dismissing 3 items.',
    help: 'Dismissed items leave the inbox and stay searchable.',
    errorIcon: <CircleAlert size={13} strokeWidth={2} /> },
  parameters: { docs: { description: { story:
    'The error names what is missing **and what depends on it** — not "Required", which restates ' +
    'the asterisk and helps nobody. The help text stays visible, because it is usually the fix.' } } },
  render: (args) => (
    <div style={{ width: 320 }}><FormField {...args}><Select options={REASONS} placeholder="Select a reason" /></FormField></div>
  ),
}

export const Optional: Story = {
  args: { label: 'Note for the audit log', optional: true },
  parameters: { docs: { description: { story:
    '**Optional is marked; required is the default.** Never an asterisk — a symbol with no ' +
    'accessible meaning unless a legend explains it, and legends get separated from their forms.' } } },
  render: (args) => (
    <div style={{ width: 320 }}><FormField {...args}><Textarea placeholder="Anything worth recording later" /></FormField></div>
  ),
}

export const EveryControl: Story = {
  name: 'Every control, wired',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 340, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <FormField label="Search feedback">
        <Input placeholder="csv export" leading={<Search size={14} strokeWidth={1.9} />} />
      </FormField>
      <FormField label="Reason"><Select options={REASONS} defaultValue="duplicate" /></FormField>
      <FormField label="Note" optional><Textarea placeholder="Optional" /></FormField>
      <FormField label="Confirmation" as="group">
        <Checkbox label="I have written the passphrase down" defaultChecked />
      </FormField>
    </div>
  ),
}
