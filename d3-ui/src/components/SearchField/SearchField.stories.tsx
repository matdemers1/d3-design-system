import type { Meta, StoryObj } from '@storybook/react'
import { SearchField } from './SearchField'

const meta = {
  title: 'Forms/SearchField',
  component: SearchField,
  tags: ['autodocs'],
  args: { 'aria-label': 'Search mail', placeholder: 'Search mail', shortcut: '/' },
  parameters: { docs: { description: { component:
    'The filled Input for searching (D-073): 36px, 14px text, a `bg` fill one step below the ' +
    '`surface` it sits on, the same 3:1 edge as every field, and **one** 2px focus outline.\n\n' +
    '`shortcut` draws a key hint and sets `aria-keyshortcuts`; **the app binds the key**. The hint ' +
    'hides once there is text. Name it with `aria-label` in a header, or a `FormField` in a form.' } } },
  // Shown where it lives: on the surface a recessed shell gives its content.
  decorators: [(S) => (
    <div style={{ width: 380, boxSizing: 'border-box', padding: 'var(--space-16)', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
      <S />
    </div>
  )],
} satisfies Meta<typeof SearchField>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithQuery: Story = { args: { defaultValue: 'acadia' } }
export const NoShortcut: Story = { args: { shortcut: undefined } }
