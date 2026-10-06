import type { Meta, StoryObj } from '@storybook/react'
import { Activity, AppWindow, Bell, Home, Settings, User } from 'lucide-react'
import { TabBar } from './TabBar'

const i = (I: typeof Home) => <I size={22} strokeWidth={1.7} />

// A phone-sized frame: the bar is a phone pattern, so the stories are judged at 390px.
const PHONE = { phone: { name: 'Phone 390', styles: { width: '390px', height: '844px' }, type: 'mobile' as const } }

const meta = {
  title: 'Frame/TabBar',
  component: TabBar,
  subcomponents: { 'TabBar.Item': TabBar.Item as never },
  tags: ['autodocs'],
  args: { 'aria-label': 'Primary' },
  parameters: {
    // `canvas: 'app'` renders the story in the full-viewport app canvas (no padding, no
    // centring) so the bar spans the 390px frame; the default centred swatch would
    // shrink-wrap it to its content.
    canvas: 'app',
    layout: 'fullscreen',
    viewport: { viewports: PHONE, defaultViewport: 'phone' },
    docs: { description: { component:
      'A phone bottom tab bar of three to five destinations — the app\'s primary navigation under a thumb.\n\n' +
      '- **Items** are `TabBar.Item`s: always an `<a>` with an `href`, an icon over a visible label, equal ' +
      'shares of the width, never under 44 x 44px. `current` sets `aria-current="page"` and adds an accent ' +
      'bar, so the state is not colour alone.\n' +
      '- **Count:** `count` draws a badge off the icon\'s top-right corner (`99+` past 99) and folds the ' +
      'number into the link\'s name once — "Activity, 3 new" — or use `countLabel`.\n' +
      '- **Semantics:** a labelled `<nav>` of links, where ActionBar is a `role="group"` of actions. ' +
      'Destinations are navigation, so this is a landmark; it is not a `tablist`.\n' +
      '- **Below `lg` (1024px) only**, unless `forceVisible`. It sits on `surface` with a top hairline, ' +
      'and pads the bottom by `max(8px, env(safe-area-inset-bottom))` — the page needs ' +
      '`viewport-fit=cover` for the inset to be non-zero.\n' +
      '- **Position is yours.** Put it last in a `100dvh` flex column, or `position: sticky; bottom: 0`.' } },
  },
} satisfies Meta<typeof TabBar>
export default meta
type Story = StoryObj<typeof meta>

/** Pins the bar to the bottom of a phone-height page, the way an app would: exactly
 *  100dvh (not a minimum), content scrolls, the bar is last and always in view. */
const Page = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--color-bg)', color: 'var(--color-fg)' }}>
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 'var(--space-16)', fontSize: 'var(--text-14)' }}>Apps content</div>
    {children}
  </div>
)

export const ThreeDestinations: Story = {
  render: (args) => (
    <Page>
      <TabBar {...args}>
        <TabBar.Item href="#apps" icon={i(AppWindow)} label="Apps" current />
        <TabBar.Item href="#activity" icon={i(Activity)} label="Activity" count={3} />
        <TabBar.Item href="#settings" icon={i(Settings)} label="Settings" />
      </TabBar>
    </Page>
  ),
}

export const FiveDestinations: Story = {
  render: (args) => (
    <Page>
      <TabBar {...args}>
        <TabBar.Item href="#home" icon={i(Home)} label="Home" />
        <TabBar.Item href="#apps" icon={i(AppWindow)} label="Apps" current />
        <TabBar.Item href="#activity" icon={i(Activity)} label="Activity" count={8} />
        <TabBar.Item href="#alerts" icon={i(Bell)} label="Alerts" />
        <TabBar.Item href="#account" icon={i(User)} label="Account" />
      </TabBar>
    </Page>
  ),
}

export const LargeCount: Story = {
  parameters: { docs: { description: { story: 'Counts past 99 render as `99+`; the link\'s name keeps the real number.' } } },
  render: (args) => (
    <Page>
      <TabBar {...args}>
        <TabBar.Item href="#apps" icon={i(AppWindow)} label="Apps" />
        <TabBar.Item href="#activity" icon={i(Activity)} label="Activity" count={120} current />
        <TabBar.Item href="#settings" icon={i(Settings)} label="Settings" />
      </TabBar>
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
      <TabBar {...args} forceVisible>
        <TabBar.Item href="#apps" icon={i(AppWindow)} label="Apps" current />
        <TabBar.Item href="#activity" icon={i(Activity)} label="Activity" count={3} />
        <TabBar.Item href="#settings" icon={i(Settings)} label="Settings" />
      </TabBar>
    </Page>
  ),
}
