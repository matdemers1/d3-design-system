import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  Alert, Button, FormActions, FormField, Input, Page, PageHeader, PasswordInput, Section, Select, Stack,
} from '../index'
import { ConsoleFrame } from './console'

const meta = {
  title: 'Patterns/Settings page',
  parameters: {
    layout: 'fullscreen',
    canvas: 'app',
    docs: {
      story: { inline: false, iframeHeight: 1200 },
      description: { component: `
Configuration that is set once and revisited rarely. **\`Page width="narrow"\` → \`PageHeader\` →
one \`Section\` per concern, each its own form with its own \`FormActions\`.**

#### Structure
- **Do** give each concern — *Mail*, *Alerts*, *Lifetimes* — its own Section, its own \`<form>\`, and its own save button that names it: *Save mail settings*.
- **Do** keep the page \`narrow\` (672px). A settings field stretched across 1280px is a field whose label is a long way from its value.
- **Don't** have one *Save* at the bottom of the page. It saves things the person did not mean to touch, and when it fails nobody knows which field was the problem.
- **Don't** put a setting that belongs to the browser — the theme — on this page. It is the account menu's (see *App frame*).

#### Actions
- **Do** end each Section with \`FormActions\`: secondary actions first, **the save last** (rightmost from \`sm\`, on top on a phone).
- **Do** treat each Section's save as that form's primary. A card is one form and one decision; the primary is the button that finishes *that* form.
- **Don't** give a Section two primaries. *Send a test message* is secondary, even though it is the one people should press next.

#### Feedback
- **Do** put the result **at the top of the Section it concerns**, as an \`Alert\` with \`dynamic\`: *Saved* in \`success\`, the server's own words in \`danger\`.
- **Do** put a field's problem on the field (\`FormField error\`), and say in the Alert only what the fields cannot.
- **Don't** show save feedback at the top of the page, or as a toast somewhere else. People look where they pressed.

#### Help text
- **Do** use \`FormField help\` for what the value does or what format it takes — it stays visible while an error shows, because it is usually the fix.
- **Don't** repeat the label in the help, or explain the obvious ("Enter your email address").
` },
    },
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const DRIVERS = [
  { value: 'worker', label: 'Cloudflare Worker relay' },
  { value: 'smtp', label: 'SMTP server' },
  { value: 'log', label: 'Log only — nothing is sent' },
]

function Mail({ saved }: { saved: boolean }) {
  const [driver, setDriver] = useState('worker')
  return (
    <Section title="Mail" description="Invites, account resets and alerts all go out this way.">
      {saved ? (
        <Alert tone="success" dynamic title="Mail settings saved">
          Send a test message to be sure they work.
        </Alert>
      ) : null}
      <Stack as="form" gap="16" aria-label="Mail">
        <FormField label="Driver" help="The Worker relay in production; SMTP if you run a mail server; log while developing.">
          <Select options={DRIVERS} value={driver} onValueChange={setDriver} />
        </FormField>
        <FormField label="From address" width="lg">
          <Input type="email" defaultValue="auth@d3cloud.io" />
        </FormField>
        <FormField label="Relay URL">
          <Input type="url" defaultValue="https://mail-relay.d3cloud.workers.dev/send" />
        </FormField>
        <FormField label="Relay secret" help="One is stored. Leave this blank to keep it — it is never shown again.">
          <PasswordInput autoComplete="new-password" />
        </FormField>
        <FormActions>
          <Button>Send a test message</Button>
          <Button variant="primary" type="submit">Save mail settings</Button>
        </FormActions>
      </Stack>
    </Section>
  )
}

function Alerts() {
  return (
    <Section title="Alerts" description="Who hears about it when something this system needs is down.">
      <Stack as="form" gap="16" aria-label="Alerts">
        <FormField label="Who to warn" help="Email addresses, separated by commas.">
          <Input defaultValue="alex@d3cloud.example, ops@d3cloud.io" />
        </FormField>
        <FormActions>
          <Button variant="primary" type="submit">Save recipients</Button>
        </FormActions>
      </Stack>
    </Section>
  )
}

function Lifetimes({ failed }: { failed: boolean }) {
  return (
    <Section title="Lifetimes" description="How long this system trusts a browser before it asks again.">
      {failed ? (
        <Alert tone="danger" dynamic title="Lifetimes were not saved">
          Changing these needs you to confirm it is you. Nothing else on this page was affected.
        </Alert>
      ) : null}
      <Stack as="form" gap="16" aria-label="Lifetimes">
        <FormField label="Trust a browser for" width="xs" help="How long “don’t ask again on this browser” lasts. 1 to 365."
          error={failed ? 'Enter a number of days from 1 to 365.' : undefined}>
          <Input type="number" inputMode="numeric" defaultValue={failed ? '400' : '30'} trailing="days" />
        </FormField>
        <FormField label="Sign someone out after" width="xs" help="With no activity. Whatever happens, a sign-in ends 90 days after they last proved who they are.">
          <Input type="number" inputMode="numeric" defaultValue="14" trailing="days" />
        </FormField>
        <FormActions>
          <Button variant="primary" type="submit">Save lifetimes</Button>
        </FormActions>
      </Stack>
    </Section>
  )
}

function Settings({ saved = false, failed = false }: { saved?: boolean; failed?: boolean }) {
  return (
    <ConsoleFrame current="none">
      <Page width="narrow">
        <PageHeader title="Settings" focusOnMount={false}
          description="How mail is sent, who is warned, and how long a browser is trusted." />
        <Mail saved={saved} />
        <Alerts />
        <Lifetimes failed={failed} />
      </Page>
    </ConsoleFrame>
  )
}

/** Just after saving the mail settings: the Alert is at the top of the Mail section, where the button was pressed. */
export const Saved: Story = { render: () => <Settings saved /> }

/** A save that failed: the reason at the top of that Section, the field's problem on the field. */
export const SaveFailed: Story = {
  name: 'Save failed',
  render: () => <Settings failed />,
}
