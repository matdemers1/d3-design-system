import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Download, Plus, RefreshCw, ChevronDown } from 'lucide-react'
import { Button } from './Button'

const meta = {
  title: 'Primitives/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: 'Save changes' },
  argTypes: {
    variant: { control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger', 'danger-ghost'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  parameters: {
    docs: { description: { component:
      'The action affordance. Replaces 151 hand-written recipes in Bindery, 76 MUI Buttons in ' +
      'App A, seven `.btn` rules in App C and 38 recipes in App B — 345 instances, ' +
      '24% of all measured component usage.\n\n' +
      '**One `primary` per view.** Two primaries means neither is primary.' } },
  },
} satisfies Meta<typeof Button>
export default meta
type Story = StoryObj<typeof meta>

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>{children}</div>
)

// ---- variants
export const Primary: Story = { args: { variant: 'primary' } }
export const Secondary: Story = { args: { variant: 'secondary' } }
export const Ghost: Story = { args: { variant: 'ghost', children: 'Merge' } }
export const Danger: Story = {
  args: { variant: 'danger', children: 'Dismiss 3 items' },
  parameters: { docs: { description: { story:
    'A destructive button names the object **and the count** — the count is the last chance to ' +
    'notice the wrong rows are selected. Never "Confirm".' } } },
}
export const DangerGhost: Story = { args: { variant: 'danger-ghost', children: 'Dismiss' } }

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Row>
      <Button variant="primary">Save changes</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="ghost">Merge</Button>
      <Button variant="danger">Dismiss 3 items</Button>
      <Button variant="danger-ghost">Dismiss</Button>
    </Row>
  ),
}

// ---- sizes
export const Sizes: Story = {
  parameters: { controls: { disable: true }, docs: { description: { story:
    '`md` is the default. `sm` is 28px — clears the WCAG 2.2 target-size minimum (24×24) with ' +
    'room. There is no `xl`.' } } },
  render: () => (
    <Row>
      <Button variant="primary" size="sm">Save changes</Button>
      <Button variant="primary" size="md">Save changes</Button>
      <Button variant="primary" size="lg">Save changes</Button>
    </Row>
  ),
}

// ---- icons
export const WithIcon: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Row>
      <Button variant="primary" icon={<Plus size={16} strokeWidth={1.8} />}>New item</Button>
      <Button icon={<Download size={16} strokeWidth={1.8} />}>Export</Button>
      <Button variant="ghost" icon={<RefreshCw size={16} strokeWidth={1.8} />}>Refresh</Button>
      <Button iconAfter={<ChevronDown size={16} strokeWidth={1.8} />}>Sort by</Button>
    </Row>
  ),
}

// ---- states: the part that rots, so every one gets a story
export const Loading: Story = {
  args: { variant: 'primary', loading: true },
  parameters: { docs: { description: { story:
    'The label does not change and the width does not move — the Spinner takes the icon slot. ' +
    'The button keeps `aria-busy` and stays focusable, so focus is not lost mid-action.' } } },
}
export const Disabled: Story = {
  args: { variant: 'primary', disabled: true },
  parameters: { docs: { description: { story:
    '**A disabled button must never be the only explanation.** A disabled control is not ' +
    'focusable, so a keyboard or screen-reader user cannot discover why it is unavailable. ' +
    'Either say why beside it, or keep it enabled and explain on submit.' } } },
}
export const AllStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Row>
      <Button variant="primary">Default</Button>
      <Button variant="primary" className="d3-force-hover">Hover</Button>
      <Button variant="primary" autoFocus>Focus</Button>
      <Button variant="primary" loading>Loading</Button>
      <Button variant="primary" disabled>Disabled</Button>
    </Row>
  ),
}

/**
 * A toggle is a button that stays down. `pressed` sets `aria-pressed`, so the
 * state is announced rather than left to a colour change nobody hears — and
 * takes the same held-down tone as a chosen segment, so a lone toggle and a
 * SegmentedControl read as one idea at different counts.
 *
 * Defined for `secondary` and `ghost`. A pressed `primary` would claim to be
 * both the one action the view exists for and a mode that is currently on.
 */
export const Toggle: Story = {
  render: function Render() {
    const [on, setOn] = useState(false)
    return (
      <div style={{ display: 'flex', gap: 12 }}>
        <Button pressed={on} onClick={() => setOn((v) => !v)}>Editing</Button>
        <Button variant="ghost" pressed={!on} onClick={() => setOn((v) => !v)}>Preview</Button>
      </div>
    )
  },
}

