import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ArrowLeft } from 'lucide-react'
import {
  Alert, Button, Checkbox, FormActions, FormField, Input, Link, Page, PageHeader, Section, Select, Stack, Textarea,
} from '../index'
import { ConsoleFrame } from './console'

const meta = {
  title: 'Patterns/Forms',
  parameters: {
    layout: 'fullscreen',
    canvas: 'app',
    docs: {
      story: { inline: false, iframeHeight: 1250 },
      description: { component: `
A form that creates or changes one thing. **\`Page width="narrow"\` → \`PageHeader\` with \`back\` →
a \`<form>\` of \`Section\`s → one \`FormActions\` at the end.**

#### Fields
- **Do** wrap every control in a \`FormField\`: a visible label above it, \`help\` under it, \`error\` in place of nothing. The label is associated; there is no way to render one that is not.
- **Do** space fields **16px** apart (\`Stack gap="16"\`, or a Section body, which already is), and groups of fields 24px apart — the gap between Sections.
- **Do** mark the rare optional field \`optional\`, rather than starring every required one.
- **Don't** put two fields side by side unless they are one thing in two parts. One column is read top to bottom without a decision at every row.
- **Don't** use a placeholder as the label or as help. It disappears on the first keystroke.

#### Width
- **Do** keep the form narrow: \`Page width="narrow"\` (672px) for a page form, \`form\` (480px) for one short task. Fields take that width by default.
- **Do** size a field to its value when the value is short, with \`FormField width\`: \`xs\` for a number of days, \`sm\` for a code or an ID, \`lg\` for a name or an email. A field's width is a hint about what goes in it.
- **Do** use \`Input trailing\` for a unit ("days") rather than a label that carries it.
- **Don't** stretch a form across a wide page to fill it, or give every field a different width for variety: use the steps, and full width for anything long (URLs, lists).

#### Grouping
- **Do** group fields that answer one question into a \`Section\` titled with that question — *The app*, *Signing in*, *Who can use it* — with \`headingLevel\` right for where it sits.
- **Do** use \`FormField as="group"\` for a set of checkboxes, labelled by the question they answer.

#### Actions
- **Do** end the form with one \`FormActions\`: *Cancel* then the primary, which names the result — *Register app*, not *Submit*.
- **Don't** disable the submit button until the form is complete. Let it submit and say what is missing on the field — a disabled button cannot explain itself. (Typing a name to confirm a deletion is the one exception; see *Confirmation*.)
- **Do** put a form-level failure in an \`Alert\` at the top of the form, and move focus to it.

#### When to split a form
| Situation | Shape |
|---|---|
| One thing, created in one go | **One form**, Sections for its groups, one \`FormActions\` at the end — this page |
| Several things that save independently | **One form per Section**, each with its own \`FormActions\` (see *Settings page*) |
| A later part depends on an earlier answer, or a step proves something (a code) | **Steps**, one task per page (see *Auth page*) |
| One or two fields, part of a list page | A **Modal**, opened by the page's primary action |
` },
    },
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const KINDS = [
  { value: 'web', label: 'Web app with a client secret', description: 'A server that can keep a secret' },
  { value: 'spa', label: 'Single-page app, PKCE', description: 'Runs in the browser; no secret' },
  { value: 'native', label: 'Native app, PKCE', description: 'iOS, macOS or desktop; no secret' },
]

function RegisterApp({ failed = false }: { failed?: boolean }) {
  const [kind, setKind] = useState('web')
  return (
    <ConsoleFrame current="apps">
      <Page width="narrow">
        <PageHeader focusOnMount={false} title="Register an app"
          description="Anything that signs people in through D3 Auth is registered first."
          back={<Link variant="muted" href="#apps"><ArrowLeft size={14} strokeWidth={2} aria-hidden />Apps</Link>} />

        <Stack as="form" gap="24" aria-label="Register an app" noValidate>
          {failed ? (
            <Alert tone="danger" dynamic title="The app was not registered">
              Two fields need changing. Nothing was saved.
            </Alert>
          ) : null}

          <Section title="The app">
            <FormField label="Name" width="lg" help="Shown to people on the consent screen and in their account.">
              <Input defaultValue="Bambu Print Notifier" />
            </FormField>
            <FormField label="Client ID" width="sm" help="Lowercase letters, digits and dashes. It is part of every token and cannot be changed later."
              error={failed ? 'bindery is already used by another app. Pick a different ID.' : undefined}>
              <Input spellCheck={false} defaultValue={failed ? 'bindery' : 'bambu-notifier'} />
            </FormField>
            <FormField label="Kind">
              <Select options={KINDS} value={kind} onValueChange={setKind} />
            </FormField>
          </Section>

          <Section title="Signing in">
            <FormField label="Redirect URIs" help="One per line. Must be https, except for localhost."
              error={failed ? 'Line 2 is http. Use https, or localhost for development.' : undefined}>
              <Textarea rows={3} spellCheck={false}
                defaultValue={failed
                  ? 'https://print.d3cloud.io/auth/callback\nhttp://print.local/auth/callback'
                  : 'https://print.d3cloud.io/auth/callback\nhttp://localhost:5173/auth/callback'} />
            </FormField>
            <FormField label="After sign-out, return to" optional help="Where people land after signing out of this app.">
              <Input type="url" spellCheck={false} placeholder="https://print.d3cloud.io/" />
            </FormField>
            <FormField label="Session length" width="xs" help="How long a sign-in to this app lasts before it checks again.">
              <Input type="number" inputMode="numeric" defaultValue="8" trailing="hours" />
            </FormField>
          </Section>

          <Section title="Who can use it" description="Nobody can sign in until they have access.">
            <FormField as="group" label="Give access now to">
              <Checkbox label="Alex Rivera (you)" defaultChecked />
              <Checkbox label="The group Household" />
              <Checkbox label="Everyone, including guests invited later" />
            </FormField>
          </Section>

          <FormActions>
            <Button>Cancel</Button>
            <Button variant="primary" type="submit">Register app</Button>
          </FormActions>
        </Stack>
      </Page>
    </ConsoleFrame>
  )
}

export const Default: Story = { render: () => <RegisterApp /> }

/** Submitted with problems: a form-level Alert at the top of the form, and each problem on its field. */
export const WithErrors: Story = {
  name: 'With errors',
  render: () => <RegisterApp failed />,
}
