import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FormField } from '../FormField/FormField'
import { RecipientField, type RecipientSuggestion } from './RecipientField'
import type { Recipient } from './parse'

const CONTACTS: RecipientSuggestion[] = [
  { name: 'Linda Demers', address: 'linda.demers@gmail.com', detail: 'Contact' },
  { name: 'Dana Okafor', address: 'dana.okafor.builds@gmail.com', detail: 'Contact' },
  { name: 'Priya Shah', address: 'priya.shah@gmail.com', detail: 'Contact' },
  { name: 'Jonah Reyes', address: 'jonah.reyes@fastmail.com', detail: 'Contact' },
  { name: 'Elena Park', address: 'elena.park@fastmail.com', detail: 'Recent' },
  { name: 'Sam Whitaker', address: 'sam.whitaker@gmail.com', detail: 'Recent' },
]

/** A stand-in for the app's contacts endpoint: a short delay, then a match on name or address. */
const loadContacts = async (query: string, { signal }: { signal: AbortSignal }) => {
  await new Promise((r) => setTimeout(r, 60))
  if (signal.aborted) return []
  const q = query.toLowerCase()
  return CONTACTS.filter((c) =>
    c.name!.toLowerCase().split(/\s+/).some((w) => w.startsWith(q)) || c.address.startsWith(q))
}

const TWO: Recipient[] = [
  { name: 'Priya Shah', address: 'priya.shah@gmail.com' },
  { name: 'Jonah Reyes', address: 'jonah.reyes@fastmail.com' },
]

function Controlled(props: Partial<React.ComponentProps<typeof RecipientField>> & { initial?: Recipient[] }) {
  const { initial = [], ...rest } = props
  const [value, setValue] = useState<Recipient[]>(initial)
  return <RecipientField value={value} onValueChange={setValue} loadSuggestions={loadContacts} {...rest} />
}

/** Text links, as the composer draws "Cc  Bcc" — real buttons, each its own tab stop. */
function RowLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'none', border: 0, padding: 'var(--space-2) var(--space-4)', margin: 0,
        font: 'inherit', fontSize: 'var(--text-13)', color: 'var(--color-fg-muted)', cursor: 'pointer',
        borderRadius: 'var(--radius-xs)',
      }}
    >
      {children}
    </button>
  )
}

function Composer() {
  const [to, setTo] = useState<Recipient[]>(TWO)
  const [cc, setCc] = useState<Recipient[]>([])
  const [showCc, setShowCc] = useState(false)
  const [showBcc, setShowBcc] = useState(false)
  const [bcc, setBcc] = useState<Recipient[]>([])
  return (
    <div style={{ width: 640, padding: 'var(--space-8) var(--space-24)', background: 'var(--color-surface-raised)',
      borderRadius: 'var(--radius-lg)' }}>
      <RecipientField
        variant="row"
        label="To"
        value={to}
        onValueChange={setTo}
        loadSuggestions={loadContacts}
        trailing={showCc && showBcc ? null : (
          <>
            {showCc ? null : <RowLink onClick={() => setShowCc(true)}>Cc</RowLink>}
            {showBcc ? null : <RowLink onClick={() => setShowBcc(true)}>Bcc</RowLink>}
          </>
        )}
      />
      {showCc ? <RecipientField variant="row" label="Cc" value={cc} onValueChange={setCc} loadSuggestions={loadContacts} autoFocus /> : null}
      {showBcc ? <RecipientField variant="row" label="Bcc" value={bcc} onValueChange={setBcc} loadSuggestions={loadContacts} autoFocus /> : null}
    </div>
  )
}

const meta = {
  title: 'Forms/RecipientField',
  component: RecipientField,
  tags: ['autodocs'],
  parameters: { docs: { description: { component:
    'Email recipients as chips, with suggestions from a loader the app supplies.\n\n' +
    '**An editable combobox with list autocomplete, per the WAI-ARIA APG** — hand-written, because ' +
    'Radix has no combobox (D-074). Focus never leaves the text: the highlighted suggestion is ' +
    '`aria-activedescendant`, and chips are selected with the arrow keys or Backspace, so the whole ' +
    'field is one tab stop.\n\n' +
    '**Keys:** ↓/↑ move through suggestions · Enter or Tab adds · `,` or `;` adds what was typed · ' +
    'Esc closes · Backspace on an empty field selects the last chip, and again removes it · ← selects ' +
    'chips, → returns to the text. **Paste** a list — commas, semicolons or newlines, `Name <addr>` ' +
    'or bare addresses — and it becomes chips at once.\n\n' +
    '`variant="row"` is the composer\'s borderless header row: a visible label and a hairline, ' +
    'never neither (D-074).' } } },
} satisfies Meta<typeof RecipientField>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div style={{ width: 420 }}>
      <FormField label="Share with" help="Type a name or paste a list of addresses.">
        <Controlled placeholder="name@example.com" />
      </FormField>
    </div>
  ),
}

export const WithRecipients: Story = {
  name: 'With recipients',
  render: () => (
    <div style={{ width: 420 }}>
      <FormField label="Share with">
        <Controlled initial={[...TWO, { name: 'Elena Park', address: 'elena.park@fastmail.com' }]} />
      </FormField>
    </div>
  ),
}

export const InvalidAddress: Story = {
  name: 'An address that will not deliver',
  parameters: { docs: { description: { story:
    'A chip that does not look like an address is drawn in the danger tone with a "!" where the ' +
    'initials were, and its accessible name says "not a valid address" — never colour alone. ' +
    'It is still a chip: the field never refuses input, and the server checks every address again.' } } },
  render: () => (
    <div style={{ width: 420 }}>
      <FormField label="Share with">
        <Controlled initial={[TWO[0]!, { address: 'jonah.reyes@fastmail' }]} />
      </FormField>
    </div>
  ),
}

export const ComposerRows: Story = {
  name: 'Composer rows',
  parameters: { docs: { description: { story:
    'The composer header (PST-ADR-011): To as a borderless row with its label in the row and a ' +
    'hairline beneath; "Cc Bcc" reveal their own rows. The label is what identifies the field, so ' +
    'it is always visible — never a placeholder (D-074).' } } },
  render: () => <Composer />,
}

export const Disabled: Story = {
  render: () => (
    <div style={{ width: 420 }}>
      <FormField label="Share with">
        <RecipientField disabled defaultValue={TWO} />
      </FormField>
    </div>
  ),
}
