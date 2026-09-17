import type { Meta, StoryObj } from '@storybook/react'
import { ShieldHalf } from 'lucide-react'
import {
  Alert, AuthLayout, Button, Card, Checkbox, CodeInput, FormActions, FormField, Input, Link, PasswordInput, Stack,
} from '../index'

const meta = {
  title: 'Patterns/Auth page',
  parameters: {
    layout: 'fullscreen',
    canvas: 'app',
    docs: {
      story: { inline: false, iframeHeight: 760 },
      description: { component: `
A single task with no app around it: sign in, a second factor, accepting an invite, first-run
setup. **\`AuthLayout\` → one \`Card\` → one form → one primary.**

#### Rules
- **Do** use \`AuthLayout\`, never \`AppShell\`: there is nobody signed in to navigate for. It owns the page's \`<main>\` and its one \`<h1>\`, and moves focus to the heading so each step is announced.
- **Do** write the title as the task and the product — *Sign in to D3 Auth* — and use \`description\` for who or what this step is for.
- **Do** keep **one form in one Card with one primary**, labelled for what it does: *Sign in*, *Verify*, never *Submit* or *Continue*.
- **Do** end the form with \`FormActions layout="stack"\`: the primary full width, where a thumb and an eye both land, and the alternative route — *Use a passkey*, *Use a recovery code* — in \`leading\` as a \`ghost\` button beneath it. It is a way through the same step, not a second task (D-071).
- **Do** put the failure **inside the Card, above the fields**, as an \`Alert\`. Say what to do, and never which of username or password was wrong.
- **Do** put help that is not an action — who to ask — in the \`footer\`.
- **Don't** add navigation, a marketing panel, or a second Card. Anything else on the page is something between a person and their account.
- **Don't** split a code into six inputs. \`CodeInput\` is one input drawn as boxes, so paste and one-time-code autofill work.
` },
    },
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const mark = <ShieldHalf size={32} strokeWidth={1.5} aria-hidden />
const footer = <>Trouble signing in? Ask the person who invited you, or <Link href="#help" variant="inline">read how recovery works</Link>.</>

function SignIn({ failed = false }: { failed?: boolean }) {
  return (
    <AuthLayout brand={mark} title="Sign in to D3 Auth" description="One account for Bindery, Murmur and Burrow." footer={footer}>
      <Card>
        <Stack as="form" gap="16" aria-label="Sign in">
          {failed ? (
            <Alert tone="danger" dynamic title="That did not match an account">
              Check the username and password and try again. After five tries, sign-in pauses for a minute.
            </Alert>
          ) : null}
          <FormField label="Username or email">
            <Input autoComplete="username" defaultValue={failed ? 'matt' : undefined} />
          </FormField>
          <FormField label="Password">
            <PasswordInput autoComplete="current-password" />
          </FormField>
          <Checkbox label="Trust this browser for 30 days" />
          <FormActions layout="stack" leading={<Button variant="ghost">Use a passkey</Button>}>
            <Button variant="primary" type="submit">Sign in</Button>
          </FormActions>
        </Stack>
      </Card>
    </AuthLayout>
  )
}

export const SignInStep: Story = { name: 'Sign in', render: () => <SignIn /> }

/** A failed attempt: the message is inside the Card, above the fields it is about. */
export const SignInFailed: Story = { name: 'Sign in failed', render: () => <SignIn failed /> }

/** The second step. One CodeInput, one primary, and the way round it as the leading action. */
export const CodeStep: Story = {
  name: 'Code step',
  render: () => (
    <AuthLayout brand={mark} title="Enter your code"
      description="From the authenticator app on your phone, for alex@d3cloud.example."
      footer={<Link href="#sign-in" variant="muted">Not you? Sign in as someone else</Link>}>
      <Card>
        <Stack as="form" gap="16" aria-label="Verify">
          <FormField label="Six-digit code" help="It changes every 30 seconds.">
            <CodeInput autoComplete="one-time-code" />
          </FormField>
          <FormActions layout="stack" leading={<Button variant="ghost">Use a recovery code</Button>}>
            <Button variant="primary" type="submit">Verify</Button>
          </FormActions>
        </Stack>
      </Card>
    </AuthLayout>
  ),
}
