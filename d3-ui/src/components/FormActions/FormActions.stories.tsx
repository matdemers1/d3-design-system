import type { Meta, StoryObj } from '@storybook/react'
import { FormActions } from './FormActions'
import { Button } from '../Button/Button'
import { Card } from '../Card/Card'
import { FormField } from '../FormField/FormField'
import { Input } from '../Input/Input'
import { Stack } from '../Stack/Stack'

const meta = {
  title: 'Forms/FormActions',
  component: FormActions,
  tags: ['autodocs'],
  argTypes: { align: { control: 'inline-radio', options: ['end', 'start'] } },
  parameters: { layout: 'fullscreen', docs: { description: { component:
    'The row of buttons that ends a form or a Section — replacing full-width buttons stacked ' +
    'down every form.\n\n' +
    '**Write the buttons primary last.** From `sm` they form a row on the aligned edge (`end` by ' +
    'default), the primary nearest that edge. Below `sm` they stack full width with the primary ' +
    '**on top**.\n\n' +
    'The phone order is the DOM order mirrored, not reshuffled, so the source reads the same at ' +
    'every width and Tab walks the buttons in one direction. At most one primary; a second, or a ' +
    'primary that is not last, warns in development.\n\n' +
    '`leading` holds one action for the opposite edge — a destructive one, or an escape. On a ' +
    'phone it goes to the bottom, furthest from the primary.' } } },
  decorators: [(S) => <div style={{ width: '100%', maxWidth: 520, margin: '0 auto' }}><S /></div>],
} satisfies Meta<typeof FormActions>
export default meta
type Story = StoryObj<typeof meta>

export const PrimaryAndCancel: Story = {
  name: 'Primary and cancel',
  render: (args) => (
    <FormActions {...args}>
      <Button>Cancel</Button>
      <Button variant="primary">Save changes</Button>
    </FormActions>
  ),
}

export const PrimaryOnly: Story = {
  name: 'Primary only',
  render: (args) => (
    <FormActions {...args}>
      <Button variant="primary">Send invite</Button>
    </FormActions>
  ),
}

export const WithLeading: Story = {
  name: 'With a leading destructive action',
  render: (args) => (
    <FormActions {...args} leading={<Button variant="danger-ghost">Delete this app</Button>}>
      <Button>Cancel</Button>
      <Button variant="primary">Save manifest</Button>
    </FormActions>
  ),
}

export const AlignStart: Story = {
  name: 'align="start"',
  args: { align: 'start' },
  render: WithLeading.render,
}

/**
 * Below sm: full width, primary on top, the leading action at the bottom.
 * (The breakpoint follows the viewport — view this story at a phone width.)
 */
export const Phone: Story = {
  name: 'Below sm — stacked, primary on top',
  decorators: [(S) => <div style={{ width: 340 }}><S /></div>],
  render: WithLeading.render,
}

export const InAForm: Story = {
  name: 'Ending a form',
  render: () => (
    <Card padding="lg">
      <Stack as="form" gap="16" aria-label="Invite someone" onSubmit={(e) => e.preventDefault()}>
        <FormField label="Invite someone" help="They get an email with a link that works once.">
          <Input type="email" placeholder="them@example.com" />
        </FormField>
        <FormActions><Button type="submit" variant="primary">Send invite</Button></FormActions>
      </Stack>
    </Card>
  ),
}
