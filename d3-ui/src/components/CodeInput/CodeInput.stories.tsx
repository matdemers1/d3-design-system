import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CodeInput, type CodeInputStatus } from './CodeInput'
import { FormField } from '../FormField/FormField'
import { Button } from '../Button/Button'

const meta = {
  title: 'Forms/CodeInput',
  component: CodeInput,
  tags: ['autodocs'],
  args: { 'aria-label': 'Verification code' },
  argTypes: {
    size: { control: 'inline-radio', options: ['md', 'lg'] },
    mode: { control: 'inline-radio', options: ['numeric', 'alphanumeric'] },
    status: { control: 'inline-radio', options: ['idle', 'error', 'success'] },
  },
  parameters: { docs: { description: { component:
    'A one-time code, PIN or recovery code, one character per box.\n\n' +
    '**One real input, drawn as boxes.** A single transparent input owns the value, the caret, ' +
    'paste and `autocomplete="one-time-code"`; the boxes are `aria-hidden`. A screen reader hears ' +
    'one labelled field, not six unlabelled ones, and the phone\'s "from Messages" suggestion ' +
    'fills the whole code.\n\n' +
    'Characters pop in, the active box shows a caret, a rejected code shakes and an accepted one ' +
    'sends a wave across the row. **None of the motion carries meaning alone** — pair `status` with ' +
    'text, and under reduced motion the shake becomes a tinted fill.' } } },
  decorators: [(S) => <div style={{ width: 340 }}><S /></div>],
} satisfies Meta<typeof CodeInput>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const InAFormField: Story = {
  name: 'In a FormField',
  args: { 'aria-label': undefined },
  render: (args) => (
    <FormField label="Code from your authenticator" help="Six digits. It changes every 30 seconds.">
      <CodeInput {...args} />
    </FormField>
  ),
}

export const PartlyFilled: Story = { args: { defaultValue: '482' } }

export const RecoveryCode: Story = {
  name: 'Alphanumeric, grouped',
  args: { 'aria-label': 'Reset code', mode: 'alphanumeric', length: 12, groups: [4, 4, 4], defaultValue: 'K7QDM2' },
  parameters: { docs: { description: { story:
    'Groups are drawn, never typed: pasting `ABCD-EFGH-JKLM` fills the boxes with `ABCDEFGHJKLM`, ' +
    'and lower case is raised as it is typed.' } } },
}

export const Masked: Story = {
  name: 'Masked PIN',
  args: { 'aria-label': 'Vault PIN', masked: true, defaultValue: '2718' },
}

export const Rejected: Story = {
  args: { 'aria-label': undefined, status: 'error', defaultValue: '123456' },
  render: (args) => (
    <FormField label="Code" error="That code was not accepted. Try the one showing now.">
      <CodeInput {...args} />
    </FormField>
  ),
}

export const Accepted: Story = { args: { status: 'success', defaultValue: '482913' } }

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <CodeInput size="md" aria-label="md — 34px" defaultValue="12" />
      <CodeInput size="lg" aria-label="lg — 40px" defaultValue="12" />
    </div>
  ),
}

export const Disabled: Story = { args: { disabled: true, defaultValue: '1234' } }

/** Type or paste anything. 424242 is accepted; everything else is rejected. */
export const TryIt: Story = {
  name: 'Try it',
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [value, setValue] = useState('')
    const [status, setStatus] = useState<CodeInputStatus>('idle')
    const check = (code: string) => setStatus(code === '424242' ? 'success' : 'error')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <FormField
          label="Enter 424242"
          help="Anything else is rejected, so you can see both."
          error={status === 'error' ? 'That code was not accepted.' : undefined}
        >
          <CodeInput
            value={value}
            status={status}
            onValueChange={(v) => { setValue(v); if (status !== 'idle') setStatus('idle') }}
            onComplete={check}
          />
        </FormField>
        {status === 'success' ? <p style={{ margin: 0 }}>Accepted.</p> : null}
        <div><Button onClick={() => { setValue(''); setStatus('idle') }}>Clear</Button></div>
      </div>
    )
  },
}
