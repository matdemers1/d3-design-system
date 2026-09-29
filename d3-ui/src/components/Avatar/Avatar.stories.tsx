import type { Meta, StoryObj } from '@storybook/react'
import { User } from 'lucide-react'
import { Avatar } from './Avatar'

const meta = {
  title: 'Primitives/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  args: { name: 'Dana Whitfield', size: 'md' },
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    tint: { control: 'inline-radio', options: ['none', 'auto', 1, 2, 3, 4, 5, 6] },
  },
  parameters: { docs: { description: { component:
    'Identifies a person.\n\n' +
    '**Neutral by default.** Opt in to colour with `tint`: `auto` picks one of six pastel tints from ' +
    'a stable hash of the name — the same name is the same tint on every render and in every app — ' +
    'and `1`–`6` pins one. Each fill/ink pair is a measured token (`--color-avatar-N` and ' +
    '`--color-avatar-N-fg`), 5.4:1 or better in light and 7.8:1 or better in dark.\n\n' +
    'Tints are identity, not status and not action: they never mean anything, and the single accent ' +
    'stays the only colour that does (D-008, D-081). Images are unaffected — a tint only shows ' +
    'behind initials.' } } },
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
const NAMES = [
  'Priya Shah', 'Jonah Reyes', 'Linda Demers', 'Sam Whitaker', 'Dana Okafor', 'Elena Park',
  'Ada Lovelace', 'Marcus Bell', 'Noor Haddad', 'Tom Ives', 'Yuki Tanaka', 'Owen Pratt',
]
const SIZES = ['xs', 'sm', 'md', 'lg'] as const
export const Tints: Story = {
  parameters: { controls: { disable: true }, docs: { description: { story:
    'All six tints at every size. The rows are the tints, 1 to 6, top to bottom.' } } },
  render: () => (
    <div style={{ display: 'grid', gap: 10 }}>
      {([1, 2, 3, 4, 5, 6] as const).map((n) => (
        <Row key={n}>
          {SIZES.map((size) => <Avatar key={size} name="Dana Whitfield" size={size} tint={n} />)}
        </Row>
      ))}
    </div>
  ),
}
export const AutoTint: Story = {
  name: 'Auto, from the name',
  parameters: { controls: { disable: true }, docs: { description: { story:
    'Twelve names, `tint="auto"`. Reorder or repeat them and each keeps its colour.' } } },
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      {NAMES.map((name) => (
        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
          <Avatar name={name} tint="auto" />
          <span>{name}</span>
        </div>
      ))}
    </div>
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
      <span style={{ color: 'var(--color-fg-faint)', fontSize: 12 }}>reported 18 items</span>
    </div>
  ),
}
export const Standalone: Story = {
  args: { decorative: false },
  parameters: { docs: { description: { story:
    'Standing alone it carries the person’s name as its accessible name — never `alt="Avatar"`.' } } },
}
