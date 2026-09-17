import type { Meta, StoryObj } from '@storybook/react'
import { Stack } from './Stack'
import { Card, CardBody } from '../Card/Card'
import { FormField } from '../FormField/FormField'
import { Input } from '../Input/Input'

const STEPS = ['2', '4', '6', '8', '12', '16', '20', '24', '32', '40', '48', '64'] as const

const meta = {
  title: 'Layout/Stack',
  component: Stack,
  tags: ['autodocs'],
  argTypes: {
    gap: { control: 'select', options: STEPS },
    align: { control: 'inline-radio', options: ['stretch', 'start', 'center', 'end'] },
  },
  args: { gap: '16' },
  parameters: { docs: { description: { component:
    'Children in a column, spaced by one step of the spacing scale.\n\n' +
    '**`gap` takes a step name, never a length** — `gap="16"` is `var(--space-16)`, and ' +
    '`gap="15"` is a type error. There is no arbitrary-value escape: a gap the scale does not ' +
    'have is a change to the scale (D-068).' } } },
  decorators: [(S) => <div style={{ width: 320 }}><S /></div>],
} satisfies Meta<typeof Stack>
export default meta
type Story = StoryObj<typeof meta>

const Box = ({ children }: { children: React.ReactNode }) => (
  <Card padding="sm"><CardBody>{children}</CardBody></Card>
)

export const Default: Story = {
  render: (args) => (
    <Stack {...args}>
      <Box>One</Box><Box>Two</Box><Box>Three</Box>
    </Stack>
  ),
}

export const Gaps: Story = {
  parameters: { controls: { disable: true } },
  decorators: [(S) => <div style={{ width: 560 }}><S /></div>],
  render: () => (
    <Stack gap="24">
      {(['4', '8', '16', '24'] as const).map((gap) => (
        <Stack key={gap} gap={gap}>
          <Box>gap=&quot;{gap}&quot;</Box><Box>{gap}px between</Box>
        </Stack>
      ))}
    </Stack>
  ),
}

export const AlignStart: Story = {
  name: 'align="start" — children keep their width',
  args: { align: 'start' },
  render: Default.render,
}

/** A form's fields, on the 16px step, as a real `form` element. */
export const AsForm: Story = {
  name: 'As a form',
  parameters: { controls: { disable: true } },
  render: () => (
    <Stack as="form" gap="16" aria-label="Profile" onSubmit={(e) => e.preventDefault()}>
      <FormField label="Display name"><Input defaultValue="Alex Rivera" /></FormField>
      <FormField label="Email"><Input type="email" defaultValue="matt@example.com" /></FormField>
    </Stack>
  ),
}

/** A list keeps its semantics and loses its bullets. */
export const AsList: Story = {
  name: 'As a list',
  parameters: { controls: { disable: true } },
  render: () => (
    <Stack as="ul" gap="8">
      <li><Box>Database</Box></li>
      <li><Box>Signing keys</Box></li>
      <li><Box>Mail</Box></li>
    </Stack>
  ),
}
