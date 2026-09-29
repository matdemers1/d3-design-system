import type { Meta, StoryObj } from '@storybook/react'
import { CalendarClock, Clock, Send } from 'lucide-react'
import { SplitButton } from './SplitButton'
import { MenuItem, MenuSeparator } from '../Menu/Menu'

const icon = (I: typeof Send) => <I size={16} strokeWidth={1.8} />

const items = (
  <>
    <MenuItem icon={icon(Clock)}>Send later</MenuItem>
    <MenuItem icon={icon(CalendarClock)}>Schedule…</MenuItem>
    <MenuSeparator />
    <MenuItem>Save as draft</MenuItem>
  </>
)

const meta = {
  title: 'Actions/SplitButton',
  component: SplitButton,
  tags: ['autodocs'],
  args: { label: 'Send', menuLabel: 'More send options', children: items },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  parameters: { docs: { description: { component:
    'A primary action with a menu of alternatives — Send, and Send later.\n\n' +
    'Two Buttons in one pill with a 1px divider. The main half runs the action; the chevron opens a ' +
    '`Menu` and does nothing else, so a mis-click on the chevron can never send. Height, radius and ' +
    'variants are Button\'s. **`menuLabel` is required** — the chevron has no text, so the caller ' +
    'names what it holds ("More send options").\n\n' +
    'The alternatives are `MenuItem`s passed as `children`, so keyboard, focus return and motion ' +
    'are Menu\'s. Only `primary` and `secondary` exist: a split ghost or danger button has no divider ' +
    'that reads on its fill.' } } },
} satisfies Meta<typeof SplitButton>
export default meta
type Story = StoryObj<typeof meta>

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>{children}</div>
)

export const Primary: Story = { args: { variant: 'primary', icon: icon(Send) } }
export const Secondary: Story = { args: { variant: 'secondary' } }

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Row>
      <SplitButton {...args} size="sm" />
      <SplitButton {...args} size="md" />
      <SplitButton {...args} size="lg" />
    </Row>
  ),
}

export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Row>
      <SplitButton {...args} disabled />
      <SplitButton {...args} variant="secondary" disabled />
    </Row>
  ),
}

export const Loading: Story = {
  args: { loading: true },
  parameters: { docs: { description: { story:
    'While the main action is in flight it is blocked but stays focusable and the label does not ' +
    'change — Button\'s `loading`. The chevron stays available.' } } },
}
