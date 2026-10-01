import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ChevronRight } from 'lucide-react'
import { SettingsRow } from './SettingsRow'
import { Section } from '../Section/Section'
import { Button } from '../Button/Button'
import { Badge } from '../Badge/Badge'
import { Checkbox } from '../Checkbox/Checkbox'
import { Select } from '../Select/Select'

const meta = {
  title: 'Layout/SettingsRow',
  component: SettingsRow,
  tags: ['autodocs'],
  args: { title: 'Show message previews', description: 'A line of the message under each subject', control: null },
  parameters: { layout: 'fullscreen', docs: { description: { component:
    'One setting: the title and a line of description on the left, the control or value on the ' +
    'right. Rows one after another in a `Section` (or a Card) are divided by 1px `border` ' +
    'hairlines and never boxed. The hairlines run the width of the card’s content box, so they ' +
    'line up with the text.\n\n' +
    '**Naming the control.** `control` is a node, or a function that receives generated ids: ' +
    '`control={(ids) => <Select id={ids.id} aria-describedby={ids.describedBy} … />}` with `htmlFor` ' +
    'makes the title the control’s real `<label>`; `aria-labelledby={ids.labelledBy}` names a ' +
    'control that takes no `id`. A Button named by its own text ("Change…") is a plain node. A ' +
    'control left with no name is reported in development.\n\n' +
    'Side by side from `md`. Below it a control of 160px or less (a Switch, a short ' +
    'SegmentedControl, a Badge) stays beside the text, and a wider one drops under it; `stack` ' +
    'always drops it (D-087). (The breakpoint follows ' +
    'the viewport — view the narrow story at a phone width.) The Switch will replace the ' +
    'Checkbox in the toggle rows when it lands.' } } },
  decorators: [(S) => <div style={{ width: '100%', maxWidth: 640, margin: '0 auto' }}><S /></div>],
} satisfies Meta<typeof SettingsRow>
export default meta
type Story = StoryObj<typeof meta>

function Rows() {
  const [previews, setPreviews] = useState<boolean | 'indeterminate'>(true)
  return (
    <Section title="Reading" description="How mail looks while you read it.">
      <SettingsRow
        title="Show message previews"
        description="A line of the message under each subject"
        htmlFor
        control={(ids) => (
          <Checkbox id={ids.id} aria-label="Show message previews" aria-describedby={ids.describedBy}
            checked={previews} onCheckedChange={setPreviews} />
        )}
      />
      <SettingsRow
        title="Password"
        description="Last changed 3 months ago"
        control={<Button aria-label="Change password">Change…</Button>}
      />
      <SettingsRow
        title="Language"
        control={<Button variant="ghost" aria-label="Language, English (UK)">English (UK) <ChevronRight size={16} aria-hidden="true" /></Button>}
      />
      <SettingsRow
        title="Two-step sign-in"
        description="An authenticator app or a passkey asks for a second proof"
        control={<Badge tone="attention">Not set up</Badge>}
      />
    </Section>
  )
}

/** A toggle, a secondary action, a value with a chevron and a status, in one card. */
export const InASection: Story = { name: 'In a Section', render: () => <Rows /> }

/** Every kind of control on the right. */
export const Controls: Story = {
  render: () => (
    <Section title="Sending">
      <SettingsRow
        title="Send from"
        description="The address recipients see"
        htmlFor
        control={(ids) => (
          <Select id={ids.id} aria-describedby={ids.describedBy} defaultValue="a"
            options={[{ value: 'a', label: 'alex@d3cloud.io' }, { value: 'b', label: 'team@d3cloud.io' }]} />
        )}
      />
      <SettingsRow
        title="Undo send"
        description="Hold a message for a few seconds after you press send"
        htmlFor
        control={(ids) => <Checkbox id={ids.id} aria-label="Undo send" aria-describedby={ids.describedBy} defaultChecked />}
      />
      <SettingsRow title="Storage used" control="4.2 GB of 15 GB" />
    </Section>
  ),
}

/** No description: the title stands alone and the row is a line shorter. */
export const WithoutDescription: Story = {
  name: 'Without a description',
  render: () => (
    <Section title="Account">
      <SettingsRow title="Username" control="@alex" />
      <SettingsRow title="Plan" control={<Badge>Free</Badge>} />
    </Section>
  ),
}

/** Below md the control sits under the text, left-aligned. */
export const Narrow: Story = {
  name: 'Below md — stacked',
  decorators: [(S) => <div style={{ width: 340 }}><S /></div>],
  render: () => <Rows />,
}
