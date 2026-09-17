import type { Meta, StoryObj } from '@storybook/react'
import { Section } from './Section'
import { Button } from '../Button/Button'
import { Badge } from '../Badge/Badge'
import { Alert } from '../Alert/Alert'
import { FormField } from '../FormField/FormField'
import { Input } from '../Input/Input'
import { EmptyState } from '../EmptyState/EmptyState'
import { DescriptionItem, DescriptionList } from '../DescriptionList/DescriptionList'
import { FormActions } from '../FormActions/FormActions'
import { Stack } from '../Stack/Stack'

const meta = {
  title: 'Layout/Section',
  component: Section,
  tags: ['autodocs'],
  argTypes: {
    surface: { control: 'inline-radio', options: ['card', 'plain'] },
    headingLevel: { control: 'inline-radio', options: [2, 3] },
  },
  args: { title: 'Mail', surface: 'card' },
  parameters: { layout: 'fullscreen', docs: { description: { component:
    'A titled region of a page: a real `<section>` named by its real heading (`h2` by default), ' +
    'so it is in the outline a screen-reader user navigates by.\n\n' +
    '**It replaces a Card with a hand-rolled `h2` inside it**, and makes the surface a stated ' +
    'choice: `card` puts the region on Card’s surface and padding; `plain` is a heading on the ' +
    'page’s own ground, for a region that holds its own cards or a page that is one region.\n\n' +
    'The title is 20px/600 (D-019), from runtime tokens — it does not depend on Tailwind. ' +
    'Actions trail the title and wrap underneath it when the row is too narrow. The body is a ' +
    'column on the 16px step.' } } },
  decorators: [(S) => <div style={{ width: '100%', maxWidth: 640, margin: '0 auto' }}><S /></div>],
} satisfies Meta<typeof Section>
export default meta
type Story = StoryObj<typeof meta>

export const Card: Story = {
  args: { description: 'How this system sends mail — invites, resets and alerts all go this way.' },
  render: (args) => (
    <Section {...args}>
      <FormField label="From address"><Input type="email" defaultValue="auth@d3cloud.io" /></FormField>
      <FormActions>
        <Button>Send a test</Button>
        <Button variant="primary">Save mail settings</Button>
      </FormActions>
    </Section>
  ),
}

export const Plain: Story = {
  args: { surface: 'plain', title: 'Danger', description: 'Each of these asks you to confirm first.' },
  render: (args) => (
    <Section {...args}>
      <Stack gap="8" align="start">
        <Button variant="danger-ghost">Disable this app</Button>
        <Button variant="danger-ghost">Delete this app</Button>
      </Stack>
    </Section>
  ),
}

export const WithActions: Story = {
  name: 'With actions',
  args: { title: 'Roles', actions: <><Button size="sm">Export</Button><Button size="sm" variant="primary">Add a role</Button></> },
  render: (args) => (
    <Section {...args}>
      <DescriptionList>
        <DescriptionItem term="editor">Can change documents</DescriptionItem>
        <DescriptionItem term="viewer">Can read documents</DescriptionItem>
      </DescriptionList>
    </Section>
  ),
}

/**
 * A tile-sized Section whose description is longer than the row: the badge
 * stays beside the title rather than dropping under the description.
 */
export const LongDescription: Story = {
  name: 'Long description — actions stay beside the title',
  args: {
    title: 'Backups',
    description: 'The nightly backup last finished 3 days ago, on 13 September at 02:00. Open the backup log to see why.',
    actions: <Badge tone="attention">Overdue</Badge>,
  },
  decorators: [(S) => <div style={{ width: 420 }}><S /></div>],
}

/** Too narrow for both: the actions wrap under the title, never over it. */
export const Narrow: Story = {
  name: 'Narrow — actions wrap under the title',
  args: WithActions.args,
  decorators: [(S) => <div style={{ width: 320 }}><S /></div>],
  render: WithActions.render,
}

export const TitleOnly: Story = {
  name: 'Title only, no body',
  args: { title: 'Nothing to configure', description: 'This app declares no roles. People either have access or they do not.' },
}

/** Save feedback belongs inside the Section it concerns, at the top of its body. */
export const WithFeedback: Story = {
  name: 'With save feedback',
  render: (args) => (
    <Section {...args}>
      <Alert tone="success" dynamic title="Saved">Mail goes through the Worker relay from now on.</Alert>
      <FormField label="From address"><Input type="email" defaultValue="auth@d3cloud.io" /></FormField>
      <FormActions><Button variant="primary">Save mail settings</Button></FormActions>
    </Section>
  ),
}

export const Empty: Story = {
  args: { title: 'Who can sign in' },
  render: (args) => (
    <Section {...args}>
      <EmptyState kind="empty" size="inline" heading="Nobody yet">
        Nobody can sign in to this app until they are given access to it.
      </EmptyState>
    </Section>
  ),
}

/** A section inside a section takes `headingLevel={3}` and the 16px step. */
export const Nested: Story = {
  args: { title: 'Security', surface: 'plain' },
  render: (args) => (
    <Section {...args}>
      <Section title="Passkeys" headingLevel={3} description="Two registered.">
        <FormActions align="start"><Button>Add a passkey</Button></FormActions>
      </Section>
      <Section title="Authenticator app" headingLevel={3} description="Not set up." />
    </Section>
  ),
}
