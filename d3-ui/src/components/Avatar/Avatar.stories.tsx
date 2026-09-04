import type { Meta, StoryObj } from '@storybook/react'
import { User } from 'lucide-react'
import { Avatar } from './Avatar'

const meta = {
  title: 'Primitives/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  args: { name: 'Dana Whitfield', size: 'md' },
  argTypes: { size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] } },
  parameters: { docs: { description: { component:
    'Identifies a person.\n\n' +
    '**A single neutral treatment in v1 — no per-user colour.** Hashing an id into a hue would ' +
    'generate around twenty unmeasured colour pairs in a system whose premise is that every pair ' +
    'is measured. Doing it properly needs a validated tint ramp, which is real Phase 3a work.\n\n' +
    'This is a genuine loss, not a clean call: App B has twelve avatars in a message list and ' +
    'colour is how you scan those. Deferred to v2, with a ramp or not at all (D-030).' } } },
} satisfies Meta<typeof Avatar>
export default meta
type Story = StoryObj<typeof meta>

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>{children}</div>
)

export const Initials: Story = {}
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Row>
      <Avatar name="Dana Whitfield" size="xs" />
      <Avatar name="Dana Whitfield" size="sm" />
      <Avatar name="Dana Whitfield" size="md" />
      <Avatar name="Dana Whitfield" size="lg" />
    </Row>
  ),
}
export const Fallbacks: Story = {
  parameters: { controls: { disable: true }, docs: { description: { story:
    'A broken image falls back to initials; an unusable name falls back to an icon. The fallback ' +
    'is never a broken image and never empty. The middle one points at a URL that does not exist.' } } },
  render: () => (
    <Row>
      <Avatar name="Priya Raman" />
      <Avatar name="Priya Raman" src="/does-not-exist.png" />
      <Avatar name="" fallbackIcon={<User size={16} strokeWidth={1.8} />} />
    </Row>
  ),
}
export const InAMessageRow: Story = {
  name: 'Decorative, in a row',
  parameters: { controls: { disable: true }, docs: { description: { story:
    'When the name is already beside it the avatar is `aria-hidden`, or the name is announced ' +
    'twice. That is the default, because it is the common case.' } } },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
      <Avatar name="Priya Raman" size="sm" />
      <span>Priya Raman</span>
      <span style={{ color: 'var(--color-text-faint)', fontSize: 12 }}>reported 18 items</span>
    </div>
  ),
}
export const Standalone: Story = {
  args: { decorative: false },
  parameters: { docs: { description: { story:
    'Standing alone it carries the person’s name as its accessible name — never `alt="Avatar"`.' } } },
}
