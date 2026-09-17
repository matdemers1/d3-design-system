import type { Meta, StoryObj } from '@storybook/react'
import { KeyRound } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { Card } from '../Card/Card'
import { FormField } from '../FormField/FormField'
import { Input } from '../Input/Input'
import { PasswordInput } from '../PasswordInput/PasswordInput'
import { Button } from '../Button/Button'
import { Alert } from '../Alert/Alert'
import { Link } from '../Link/Link'
import { Stack } from '../Stack/Stack'
import { FormActions } from '../FormActions/FormActions'

const meta = {
  title: 'Layout/AuthLayout',
  component: AuthLayout,
  tags: ['autodocs'],
  args: { title: 'Sign in to Bindery', focusOnMount: false },
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component:
      'The frame for a single-task page with no app shell — sign-in, accepting an invite, ' +
      'first-run setup. Form width (480px), centred, a comfortable distance from the top, and it ' +
      'works at 390px.\n\n' +
      'The title goes through **PageHeader**, so the page has its one `<h1>` and a new step is ' +
      'announced by focus. It renders `<main>` by default, because a sign-in page has no shell ' +
      'to own one.\n\n' +
      'One Card, one form, one primary action. The footnote is for the way out: who to ask.\n\n' +
      '(`focusOnMount` is off in these stories so the docs page does not steal focus.)' } },
  },
} satisfies Meta<typeof AuthLayout>
export default meta
type Story = StoryObj<typeof meta>

const Mark = () => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-8)',
    fontWeight: 'var(--weight-semibold)', color: 'var(--color-fg)' }}>
    <KeyRound size={20} strokeWidth={1.8} aria-hidden /> D3 Auth
  </span>
)

const SignInForm = () => (
  <Card padding="lg">
    <Stack as="form" gap="16" aria-label="Sign in" onSubmit={(e) => e.preventDefault()}>
      <FormField label="Username or email"><Input autoComplete="username" /></FormField>
      <FormField label="Password"><PasswordInput autoComplete="current-password" /></FormField>
      <FormActions><Button type="submit" variant="primary">Sign in</Button></FormActions>
    </Stack>
  </Card>
)

export const SignIn: Story = {
  args: {
    brand: <Mark />,
    description: 'You are signing in with your D3 Auth account.',
    footer: <p>Trouble signing in? Ask Matt.</p>,
  },
  render: (args) => <AuthLayout {...args}><SignInForm /></AuthLayout>,
}

export const WithError: Story = {
  name: 'With an error',
  args: SignIn.args,
  render: (args) => (
    <AuthLayout {...args}>
      <Alert tone="danger" dynamic title="That did not work">The username or password is wrong.</Alert>
      <SignInForm />
    </AuthLayout>
  ),
}

export const SecondStep: Story = {
  name: 'Second step — two choices',
  args: {
    brand: <Mark />,
    title: 'Confirm it is you',
    description: 'Signing in as matt@example.com.',
    footer: <p><Link href="#recovery" variant="muted">Use a recovery code instead</Link></p>,
  },
  render: (args) => (
    <AuthLayout {...args}>
      <Card padding="lg">
        <Stack gap="16">
          <FormField label="Code from your authenticator app"><Input inputMode="numeric" autoComplete="one-time-code" /></FormField>
          <FormActions leading={<Button variant="ghost">Use a passkey</Button>}>
            <Button variant="primary">Continue</Button>
          </FormActions>
        </Stack>
      </Card>
    </AuthLayout>
  ),
}

export const NoBrand: Story = {
  name: 'No brand, no footer',
  args: { title: 'You are signed out', description: 'You can close this tab.' },
}

/** At a phone's width the page padding holds and nothing overflows. */
export const Phone: Story = {
  args: SignIn.args,
  decorators: [(S) => <div style={{ width: 390 }}><S /></div>],
  render: SignIn.render,
}
