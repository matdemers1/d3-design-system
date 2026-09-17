import type { Meta, StoryObj } from '@storybook/react'
import { Textarea } from './Textarea'

const meta = {
  title: 'Forms/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  args: { placeholder: 'Add a note' },
  parameters: { docs: { description: { component:
    'Multi-line text. Minimum three rows — a one-row textarea should be an Input.\n\n' +
    '**Resizes vertically only.** `both` lets a user drag past the container and break the layout; ' +
    '`none` removes a genuinely useful control.' } } },
  decorators: [(S) => <div style={{ width: 340 }}><S /></div>],
} satisfies Meta<typeof Textarea>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Filled: Story = { args: { defaultValue:
  'Merged with FB-2836 after the customer confirmed both reports describe the same export failure.' } }
export const Invalid: Story = { args: { invalid: true, defaultValue: 'Too short' } }
export const Disabled: Story = { args: { disabled: true, defaultValue: 'Locked while the job runs' } }

/** `mono` for content whose characters are the point — a client manifest, a JSON claim map. */
export const Mono: Story = {
  args: {
    mono: true,
    rows: 6,
    'aria-label': 'App manifest',
    defaultValue: '{\n  "client_id": "bindery-web",\n  "redirect_uris": ["https://bindery.d3cloud.io/callback"],\n  "roles": ["owner", "viewer"]\n}',
  },
}
