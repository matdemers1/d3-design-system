import type { Meta, StoryObj } from '@storybook/react'
import { Switch } from './Switch'

const meta = {
  title: 'Forms/Switch',
  component: Switch,
  tags: ['autodocs'],
  args: { children: 'Desktop notifications' },
  parameters: { docs: { description: { component:
    'An on/off **setting that takes effect the moment it is flipped** — a real ' +
    '`<button role="switch">` with `aria-checked`.\n\n' +
    '**Switch or Checkbox?** Use a Switch for a setting that applies immediately ' +
    '(notifications on, dark mode). Use a Checkbox for a choice that is submitted ' +
    'later with a form, or one of several selected together. A Switch never has an ' +
    'indeterminate state.\n\n' +
    'Space and Enter both toggle. The state is carried by the knob’s position as ' +
    'well as the track colour, and the knob does not slide under reduced motion. ' +
    'The label is part of the click target; where a settings row already names the ' +
    'setting, omit it and pass `aria-labelledby`.' } } },
} satisfies Meta<typeof Switch>
export default meta
type Story = StoryObj<typeof meta>

const Col = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
)

export const Off: Story = { args: { checked: false } }
export const On: Story = { args: { checked: true } }
export const Disabled: Story = { args: { checked: false, disabled: true } }
export const DisabledOn: Story = { args: { checked: true, disabled: true } }
export const Uncontrolled: Story = {
  args: { defaultChecked: true },
  parameters: { docs: { description: { story: 'Without `checked` the switch holds its own state, starting from `defaultChecked`.' } } },
}
export const LabelledByRow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, width: 320 }}>
      <span id="sw-row-label">Send read receipts</span>
      <Switch aria-labelledby="sw-row-label" defaultChecked />
    </div>
  ),
}
export const AllStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Col>
      <Switch checked={false}>Off</Switch>
      <Switch checked>On</Switch>
      <Switch checked={false} disabled>Disabled</Switch>
      <Switch checked disabled>Disabled, on</Switch>
    </Col>
  ),
}
