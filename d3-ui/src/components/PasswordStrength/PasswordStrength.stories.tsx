import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { PasswordStrength, type PasswordStrengthScore } from './PasswordStrength'
import { PasswordInput } from '../PasswordInput/PasswordInput'
import { FormField } from '../FormField/FormField'

const meta = {
  title: 'Forms/PasswordStrength',
  component: PasswordStrength,
  tags: ['autodocs'],
  args: { score: 2, label: 'Fair' },
  argTypes: {
    score: { control: 'inline-radio', options: [0, 1, 2, 3, 4] },
    label: { control: 'text' },
  },
  parameters: { docs: { description: { component:
    'A four-segment strength meter with its verdict in words. **The library computes nothing** — ' +
    'the app judges the password (length, a breached list, the account\'s own email) and passes a ' +
    '`score` of 0–4 and the `label`.\n\n' +
    'Segments fill from the left, one per point: danger at 1, warning at 2, accent at 3 and 4. ' +
    'Not `success` — D-016 keeps green out of routine status. The segments are `aria-hidden`; the ' +
    'verdict is a polite, atomic live region, so colour is never the only signal.\n\n' +
    '**Wire it to the field.** Put it in `FormField`\'s `help` and the control is described by it ' +
    'automatically. Elsewhere, give it an `id` and list that id in the input\'s `aria-describedby`. ' +
    'Keep it mounted while the user types, so the text changes rather than arrives.' } } },
  decorators: [(S) => <div style={{ width: 320 }}><S /></div>],
} satisfies Meta<typeof PasswordStrength>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Empty: Story = { name: 'Score 0', args: { score: 0, label: 'Too short' } }
export const Weak: Story = { name: 'Score 1', args: { score: 1, label: 'Weak' } }
export const Fair: Story = { name: 'Score 2', args: { score: 2, label: 'Fair' } }
export const Good: Story = { name: 'Score 3', args: { score: 3, label: 'Good — 16 characters' } }
export const Strong: Story = { name: 'Score 4', args: { score: 4, label: 'Strong — 22 characters, not in known breaches' } }

/** A toy judgement for the story only. Apps bring their own. */
function judge(pw: string): { score: PasswordStrengthScore; label: string } {
  if (pw.length === 0) return { score: 0, label: 'Enter a password' }
  if (pw.length < 8) return { score: 1, label: 'Weak — too short' }
  if (pw.length < 12) return { score: 2, label: 'Fair — add a few more characters' }
  if (pw.length < 16) return { score: 3, label: `Good — ${pw.length} characters` }
  return { score: 4, label: `Strong — ${pw.length} characters` }
}

/** The idiomatic wiring: FormField describes the control by its help, and the meter is in it. */
export const InFormField: Story = {
  name: 'In a FormField',
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [pw, setPw] = useState('four unrelated')
    const { score, label } = judge(pw)
    return (
      <FormField label="Choose a password" help={<PasswordStrength score={score} label={label} />}>
        <PasswordInput autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
      </FormField>
    )
  },
}

/** Placed anywhere else: pass an `id`, and list it in the input's `aria-describedby`. */
export const WiredByID: Story = {
  name: 'Wired by id',
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [pw, setPw] = useState('')
    const { score, label } = judge(pw)
    return (
      <FormField label="New password">
        <PasswordInput
          autoComplete="new-password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          aria-describedby="story-pw-verdict"
        />
        <div style={{ marginTop: 8 }}>
          <PasswordStrength id="story-pw-verdict" score={score} label={label} />
        </div>
      </FormField>
    )
  },
}

export const AllScores: Story = {
  name: 'All scores',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {([['Too short', 0], ['Weak', 1], ['Fair', 2], ['Good', 3], ['Strong', 4]] as const).map(([label, score]) => (
        <PasswordStrength key={score} score={score} label={label} />
      ))}
    </div>
  ),
}
