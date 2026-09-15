import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { PasswordInput, type PasswordStrength } from './PasswordInput'
import { FormField } from '../FormField/FormField'

const meta = {
  title: 'Forms/PasswordInput',
  component: PasswordInput,
  tags: ['autodocs'],
  args: { 'aria-label': 'Password', autoComplete: 'current-password' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  parameters: { docs: { description: { component:
    'A password field that can be read back before it is submitted. Input\'s geometry exactly, with ' +
    'a real toggle inside the boundary that keeps focus in the field.\n\n' +
    '**Strength is the app\'s judgement, passed in.** The library ships no estimator: the rules — ' +
    'length, a breached list, the account\'s own email — belong to the app. The meter always says ' +
    'the strength in words as well as bars.' } } },
  decorators: [(S) => <div style={{ width: 320 }}><S /></div>],
} satisfies Meta<typeof PasswordInput>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { defaultValue: 'correct horse battery staple' } }

export const SignIn: Story = {
  name: 'Sign in',
  args: { 'aria-label': undefined, autoComplete: 'current-password' },
  render: (args) => (
    <FormField label="Password"><PasswordInput {...args} /></FormField>
  ),
}

const STRENGTHS: PasswordStrength[] = [
  { score: 0, label: 'Too short' },
  { score: 1, label: 'Weak' },
  { score: 2, label: 'Fair' },
  { score: 3, label: 'Good' },
  { score: 4, label: 'Strong' },
]

/** A toy judgement for the story. Apps bring their own. */
function judge(pw: string): PasswordStrength {
  if (pw.length < 12) return STRENGTHS[0]!
  const words = pw.trim().split(/\s+/).length
  return STRENGTHS[Math.min(4, 1 + (pw.length >= 16 ? 1 : 0) + (words >= 3 ? 1 : 0) + (words >= 4 ? 1 : 0))]!
}

export const NewPassword: Story = {
  name: 'New password, with strength',
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [pw, setPw] = useState('four unrelated')
    return (
      <FormField label="Choose a password" help="At least 12 characters. Four unrelated words beats one clever word.">
        <PasswordInput autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} strength={judge(pw)} />
      </FormField>
    )
  },
}

export const StrengthLevels: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {STRENGTHS.map((s) => (
        <PasswordInput key={s.score} autoComplete="new-password" aria-label={`Password, ${s.label}`} defaultValue="xxxxxxxxxxxx" strength={s} />
      ))}
    </div>
  ),
}

export const Invalid: Story = {
  args: { 'aria-label': undefined, defaultValue: 'password123' },
  render: (args) => (
    <FormField label="New password" error="That one is on the list of the most common passwords.">
      <PasswordInput {...args} />
    </FormField>
  ),
}

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <PasswordInput autoComplete="current-password" size="sm" aria-label="sm — 28px" defaultValue="hunter2hunter2" />
      <PasswordInput autoComplete="current-password" size="md" aria-label="md — 34px" defaultValue="hunter2hunter2" />
      <PasswordInput autoComplete="current-password" size="lg" aria-label="lg — 40px" defaultValue="hunter2hunter2" />
    </div>
  ),
}

export const Disabled: Story = { args: { disabled: true, defaultValue: 'hunter2hunter2' } }
