import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Ellipsis, Pencil, Eye, Plus, X, Trash2, RefreshCw } from 'lucide-react'
import { IconButton } from './IconButton'
import { Button } from '../Button/Button'

const meta = {
  title: 'Primitives/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  args: { icon: <Ellipsis size={16} strokeWidth={1.8} />, label: 'More actions' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['ghost', 'secondary'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  parameters: { docs: { description: { component:
    'An action reduced to its glyph, for table rows and dense toolbars.\n\n' +
    '`label` is **required** — there is no way to render this component without an accessible ' +
    'name.\n\n' +
    '**There is deliberately no `danger` variant.** Phase 3f forbids icon-only for destructive ' +
    'actions, and the way to make a rule hold is to remove the affordance rather than document ' +
    'it.' } } },
} satisfies Meta<typeof IconButton>
export default meta
type Story = StoryObj<typeof meta>

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>{children}</div>
)

export const Ghost: Story = {}
export const Secondary: Story = { args: { variant: 'secondary', icon: <Plus size={16} strokeWidth={1.8} />, label: 'Add item' } }

export const Sizes: Story = {
  parameters: { controls: { disable: true }, docs: { description: { story:
    'Icons scale with the button: 14 / 16 / 20px at sm / md / lg, each with its own stroke ' +
    'weight so the rendered line stays in a 1.17–1.50px band (3f).' } } },
  render: () => (
    <Row>
      <IconButton size="sm" icon={<Pencil size={14} strokeWidth={2.0} />} label="Edit" />
      <IconButton size="md" icon={<Pencil size={16} strokeWidth={1.8} />} label="Edit" />
      <IconButton size="lg" icon={<Pencil size={20} strokeWidth={1.6} />} label="Edit" />
    </Row>
  ),
}

export const AllStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Row>
      <IconButton icon={<Eye size={16} strokeWidth={1.8} />} label="Preview" />
      <IconButton icon={<Eye size={16} strokeWidth={1.8} />} label="Preview" autoFocus />
      <IconButton icon={<Eye size={16} strokeWidth={1.8} />} label="Preview" loading />
      <IconButton icon={<Eye size={16} strokeWidth={1.8} />} label="Preview" disabled />
    </Row>
  ),
}

export const NotForDestructiveActions: Story = {
  name: 'Not for destructive actions',
  parameters: { controls: { disable: true }, docs: { description: { story:
    'The left pair is what the API allows. The right is what it refuses to make possible — a ' +
    'destructive action carries a word, as a Button.' } } },
  render: () => (
    <Row>
      <IconButton icon={<Pencil size={16} strokeWidth={1.8} />} label="Edit item" />
      <IconButton icon={<X size={16} strokeWidth={1.8} />} label="Close" />
      <span style={{ width: 20 }} />
      <Button variant="danger-ghost" icon={<Trash2 size={16} strokeWidth={1.8} />}>Dismiss</Button>
    </Row>
  ),
}

/** A toggle that happens to be icon-only. `pressed` announces the state; the
 *  label still carries the name, and changes with it. */
export const Toggle: Story = {
  render: function Render() {
    const [on, setOn] = useState(true)
    return (
      <IconButton
        variant="secondary"
        pressed={on}
        label={on ? 'Following new entries' : 'Paused — follow new entries'}
        icon={<RefreshCw size={14} />}
        onClick={() => setOn((v) => !v)}
      />
    )
  },
}

