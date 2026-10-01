import type { Meta, StoryObj } from '@storybook/react'
import { Search, X } from 'lucide-react'
import { Input } from './Input'
import { Button } from '../Button/Button'
import { Select } from '../Select/Select'
import { Textarea } from '../Textarea/Textarea'
import { FormField } from '../FormField/FormField'

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

/**
 * A native date field. In Chromium it has an internal calendar-picker tab stop,
 * where the input itself no longer matches `:focus-visible` — the frame keeps
 * its ring there through `:focus-within`.
 */
export const DateField: Story = {
  name: 'Date',
  args: { type: 'date', defaultValue: '2026-09-17', 'aria-label': 'Since' },
  decorators: [(S) => <div style={{ width: 200 }}><S /></div>],
}

/**
 * `appearance="filled"` (D-073) — opt-in; the outlined field above is unchanged. 36px and 14px
 * text, filled with `bg` one step below the `surface` it sits on, the same 3:1 `border-field`
 * edge (3.04:1 light since 1.5's retune (D-085), 4.29:1 dark against the fill), and at focus a single 2px outline laid over
 * that edge — no accent border, no offset ring. Textarea and Select take the same prop.
 */
export const AppearanceFilled: Story = {
  name: 'Appearance: filled',
  parameters: { controls: { disable: true } },
  decorators: [(S) => (
    <div style={{ width: 380, boxSizing: 'border-box', padding: 'var(--space-16)', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
      <S />
    </div>
  )],
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <FormField label="To"><Input appearance="filled" defaultValue="dana.okafor.builds@gmail.com" /></FormField>
      <FormField label="Subject"><Input appearance="filled" placeholder="What it is about" /></FormField>
      <FormField label="Reply-to" error="That is not an email address"><Input appearance="filled" defaultValue="dana@" /></FormField>
      <FormField label="From"><Input appearance="filled" disabled defaultValue="matt@d3cloud.io" /></FormField>
      <FormField label="Format">
        <Select appearance="filled" defaultValue="plain" options={[{ value: 'plain', label: 'Plain text' }, { value: 'html', label: 'Rich text' }]} />
      </FormField>
      <FormField label="Message"><Textarea appearance="filled" rows={4} defaultValue="Updated numbers attached." /></FormField>
    </div>
  ),
}
