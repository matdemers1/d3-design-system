import type { Meta, StoryObj } from '@storybook/react'
import { Archive, Folder, MoreHorizontal, Reply, Trash2, Inbox, Search, SquarePen, User } from 'lucide-react'
import { ActionBar } from './ActionBar'

const i = (I: typeof Archive) => <I size={22} strokeWidth={1.7} />

// A phone-sized frame: the bar is a phone pattern, so the stories are judged at 390px.
const PHONE = { phone: { name: 'Phone 390', styles: { width: '390px', height: '844px' }, type: 'mobile' as const } }

const meta = {
  title: 'Frame/ActionBar',
  component: ActionBar,
  subcomponents: { 'ActionBar.Item': ActionBar.Item as never },
  tags: ['autodocs'],
  args: { 'aria-label': 'Conversation actions' },
  parameters: {
    layout: 'fullscreen',
    viewport: { viewports: PHONE, defaultViewport: 'phone' },
    docs: { description: { component:
      'A phone bottom bar of labelled icon actions — the thumb-reach row under a conversation.\n\n' +
      '- **Items** are `ActionBar.Item`s: an icon over a visible label, equal shares of the width, ' +
      'never under 44 x 44px. A `button` by default, an `<a>` with `href`. `tone="accent"` marks the ' +
      'one action the screen is for.\n' +
      '- **Semantics:** a labelled `role="group"` of plain controls in tab order, not a `toolbar` ' +
      '(one tab stop and arrow-key roving suits a dense desktop row, not five thumb targets) and not a ' +
      '`<nav>` (the items are actions).\n' +
      '- **Below `lg` (1024px) only**, unless `forceVisible`. It sits on `surface` with a top hairline, ' +
      'and pads the bottom by `max(8px, env(safe-area-inset-bottom))` — the page needs ' +
      '`viewport-fit=cover` for the inset to be non-zero.\n' +
      '- **Position is yours.** It is a normal block. Put it last in a `100dvh` flex column, or ' +
      '`position: sticky; bottom: 0`. If you use `position: fixed`, reserve its height above.' } },
  },
} satisfies Meta<typeof ActionBar>
export default meta
type Story = StoryObj<typeof meta>

/** Pins the bar to the bottom of a phone-height page, the way an app would. */
const Page = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: 'var(--color-bg)', color: 'var(--color-fg)' }}>
    <div style={{ flex: 1, padding: 'var(--space-16)', fontSize: 'var(--text-14)' }}>Conversation content</div>
    {children}
  </div>
)

export const Conversation: Story = {
  render: (args) => (
    <Page>
      <ActionBar {...args}>
        <ActionBar.Item icon={i(Archive)} label="Archive" />
        <ActionBar.Item icon={i(Trash2)} label="Delete" />
        <ActionBar.Item icon={i(Folder)} label="Move" />
        <ActionBar.Item icon={i(Reply)} label="Reply" tone="accent" />
        <ActionBar.Item icon={i(MoreHorizontal)} label="More" />
      </ActionBar>
    </Page>
  ),
}

export const DisabledItem: Story = {
  render: (args) => (
    <Page>
      <ActionBar {...args}>
        <ActionBar.Item icon={i(Archive)} label="Archive" />
        <ActionBar.Item icon={i(Trash2)} label="Delete" disabled />
        <ActionBar.Item icon={i(Folder)} label="Move" />
        <ActionBar.Item icon={i(Reply)} label="Reply" tone="accent" />
      </ActionBar>
    </Page>
  ),
}

export const Links: Story = {
  args: { 'aria-label': 'Sections' },
  parameters: { docs: { description: { story: 'Items with an `href` render as links. A disabled link drops its `href` and is `aria-disabled`.' } } },
  render: (args) => (
    <Page>
      <ActionBar {...args}>
        <ActionBar.Item icon={i(Inbox)} label="Inbox" href="#inbox" />
        <ActionBar.Item icon={i(Search)} label="Search" href="#search" />
        <ActionBar.Item icon={i(SquarePen)} label="Compose" href="#compose" tone="accent" />
        <ActionBar.Item icon={i(User)} label="Account" href="#account" disabled />
      </ActionBar>
    </Page>
  ),
}

export const ForcedVisible: Story = {
  parameters: {
    viewport: { defaultViewport: 'responsive' },
    docs: { description: { story: '`forceVisible` shows the bar at every width — here, on a desktop canvas, where by default it would be hidden.' } },
  },
  render: (args) => (
    <Page>
      <ActionBar {...args} forceVisible>
        <ActionBar.Item icon={i(Archive)} label="Archive" />
        <ActionBar.Item icon={i(Trash2)} label="Delete" />
        <ActionBar.Item icon={i(Folder)} label="Move" />
        <ActionBar.Item icon={i(Reply)} label="Reply" tone="accent" />
        <ActionBar.Item icon={i(MoreHorizontal)} label="More" />
      </ActionBar>
    </Page>
  ),
}
