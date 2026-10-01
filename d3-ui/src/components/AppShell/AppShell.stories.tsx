import type { Meta, StoryObj } from '@storybook/react'
import {
  Activity, AppWindow, BookOpen, ClipboardCheck, FolderTree, Import, LogOut, Search, Settings,
  ShieldCheck, Sparkles, Tags, UserCircle,
} from 'lucide-react'
import { AppShell } from './AppShell'
import { useAppShell } from './AppShellContext'
import { SideNav, SideNavGroup, SideNavItem } from '../SideNav/SideNav'
import { AccountMenu } from '../AccountMenu/AccountMenu'
import { MenuItem, MenuSeparator } from '../Menu/Menu'
import { ThemeProvider } from '../Theme/ThemeProvider'
import { ThemeSwitch } from '../Theme/ThemeSwitch'
import { PageHeader } from '../PageHeader/PageHeader'
import { Button } from '../Button/Button'
import { useState } from 'react'
import { Page as PageLayout } from '../Page/Page'
import { Section } from '../Section/Section'
import { SettingsRow } from '../SettingsRow/SettingsRow'
import { Badge, CountBadge } from '../Badge/Badge'
import { StatusDot } from '../StatusDot/StatusDot'
import { SegmentedControl } from '../SegmentedControl/SegmentedControl'
import { Switch } from '../Switch/Switch'
import { Tabs, TabPanel } from '../Tabs/Tabs'
import { DataList, DataListRow } from '../DataList/DataList'
import { EmptyState } from '../EmptyState/EmptyState'
import { FormField } from '../FormField/FormField'
import { Input } from '../Input/Input'
import { Select } from '../Select/Select'

const i = (I: typeof Search) => <I size={16} strokeWidth={1.8} />

const meta = {
  title: 'Frame/AppShell',
  component: AppShell,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component:
      'The application frame (D-021, D-065).\n\n' +
      '- **`lg` (1024px) and wider:** a 240px sidebar, collapsible to a 64px rail. The choice is ' +
      'remembered in `localStorage` under `storageKey`.\n' +
      '- **Narrower:** a top bar with a menu button and the brand; the sidebar is an off-canvas ' +
      'drawer over a scrim. Focus is trapped in it; Escape, the scrim and activating any link close it.\n\n' +
      'Slots: `brand`, `nav` (a `SideNav`), `footer` (an `AccountMenu`), and `children`, which are ' +
      'the page inside the one `<main>`. A "Skip to content" link is first in the tab order. The ' +
      'shell never touches the URL: routing is the app\'s.\n\n' +
      'The sidebar is a resting surface — a tone step, no border, no shadow. The drawer floats, so it ' +
      'is `surface-raised` with a boundary and a scrim (D-023). **Resize the canvas below 1024px to ' +
      'see the drawer.**' } },
  },
  decorators: [(S) => <div style={{ width: '100%' }}><S /></div>],
} satisfies Meta<typeof AppShell>
export default meta
type Story = StoryObj<typeof meta>

/** A wordmark that becomes a mark on the rail — the one thing the brand slot must handle. */
function Brand() {
  const { collapsed } = useAppShell()
  return (
    <a href="#home" aria-label="Bindery home"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-8)', color: 'var(--color-fg)', textDecoration: 'none' }}>
      <AppWindow size={20} strokeWidth={1.6} aria-hidden />
      {collapsed ? null : <span>Bindery</span>}
    </a>
  )
}

function Nav() {
  return (
    <SideNav>
      <SideNavGroup title="Find">
        <SideNavItem href="#ask" icon={i(Sparkles)} label="Ask" current />
        <SideNavItem href="#search" icon={i(Search)} label="Search" />
        <SideNavItem href="#files" icon={i(FolderTree)} label="Files" />
      </SideNavGroup>
      <SideNavGroup title="Tend">
        <SideNavItem href="#review" icon={i(ClipboardCheck)} label="Review" count={3} />
        <SideNavItem href="#organise" icon={i(Tags)} label="Organise" />
        <SideNavItem href="#import" icon={i(Import)} label="Import" />
      </SideNavGroup>
      <SideNavGroup title="Keep">
        <SideNavItem href="#trust" icon={i(ShieldCheck)} label="Trust" />
        <SideNavItem href="#pipeline" icon={i(Activity)} label="Pipeline" />
      </SideNavGroup>
    </SideNav>
  )
}

function Account() {
  return (
    <AccountMenu name="Dana Whitfield" detail="dana@example.com">
      <MenuItem asChild icon={i(UserCircle)}><a href="#account">Your account</a></MenuItem>
      <MenuItem asChild icon={i(Settings)}><a href="#settings">Settings</a></MenuItem>
      <MenuItem asChild icon={i(BookOpen)}><a href="#guides">Guides</a></MenuItem>
      <MenuSeparator />
      <ThemeSwitch />
      <MenuSeparator />
      <MenuItem asChild tone="danger" icon={i(LogOut)}>
        <button type="submit" form="story-sign-out">Sign out</button>
      </MenuItem>
    </AccountMenu>
  )
}

function Page() {
  return (
    <div style={{ padding: 'var(--page-pad)', maxWidth: 'var(--container-wide)' }}>
      <PageHeader title="Ask" focusOnMount={false} actions={<Button variant="primary">New question</Button>} />
      <p style={{ color: 'var(--color-fg-muted)', maxWidth: 'var(--measure-body)', lineHeight: 'var(--leading-14)' }}>
        Answers, with the page they came from. The page is the one <code>main</code> landmark; the skip
        link above the sidebar lands here.
      </p>
    </div>
  )
}

export const Default: Story = {
  render: () => (
    <ThemeProvider storageKey="d3.story.theme">
      <form id="story-sign-out" method="post" action="#" hidden />
      <AppShell storageKey="d3.story.sidebar" brand={<Brand />} nav={<Nav />} footer={<Account />}>
        <Page />
      </AppShell>
    </ThemeProvider>
  ),
}

/** Starts as a rail when nothing is stored. The user's own choice wins after that. */
export const CollapsedByDefault: Story = {
  render: () => (
    <ThemeProvider storageKey="d3.story.theme">
      <form id="story-sign-out" method="post" action="#" hidden />
      <AppShell storageKey="d3.story.sidebar.rail" defaultCollapsed brand={<Brand />} nav={<Nav />} footer={<Account />}>
        <Page />
      </AppShell>
    </ThemeProvider>
  ),
}

/**
 * `navTone="recessed"` (D-073): the sidebar sinks to `bg` and `<main>` comes forward onto
 * `surface` — for an app whose content is one working surface, like a mail list beside a
 * reading pane. Hover lifts a nav item to `surface` and the current item to `surface-raised`,
 * because on `bg` the default hover and accent tint are invisible in light. `<main>` is a sheet
 * inset from the page on `radius-lg` with `--shadow-sheet` — the one resting surface that carries
 * a shadow (D-075).
 */
export const Recessed: Story = {
  render: () => (
    <ThemeProvider storageKey="d3.story.theme">
      <form id="story-sign-out" method="post" action="#" hidden />
      <AppShell storageKey="d3.story.sidebar.recessed" navTone="recessed" brand={<Brand />} nav={<Nav />}
        footer={<Account />}>
        <Page />
      </AppShell>
    </ThemeProvider>
  ),
}

const CLIENTS = [
  { value: 'iphone', label: 'iPhone' },
  { value: 'mac', label: 'Mac' },
  { value: 'thunderbird', label: 'Thunderbird' },
  { value: 'other', label: 'Other' },
]

function CardsPage() {
  const [client, setClient] = useState('iphone')
  const [theme, setTheme] = useState('system')
  const [previews, setPreviews] = useState(true)
  const [provider, setProvider] = useState('gmail')
  return (
    <PageLayout width="narrow" align="center">
      <PageHeader title="Account" focusOnMount={false}
        description="Who you are here, and how you sign in."
        actions={<><Button>Export</Button><Button variant="primary">Save</Button></>} />
      <Section title="Profile" description="What other people see.">
        <SettingsRow title="Email address" description="Where mail to you arrives"
          control={<Badge tone="neutral">Primary</Badge>} />
        <SettingsRow title="Theme" description="Follows your device unless you choose"
          control={(ids) => (
            <SegmentedControl aria-label="Theme" size="sm" value={theme} onValueChange={setTheme}
              aria-describedby={ids.describedBy}
              items={[{ value: 'system', label: 'System' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />
          )} />
        <SettingsRow title="Message previews" description="A line of each message under its subject"
          control={(ids) => (
            <Switch aria-labelledby={ids.labelledBy} aria-describedby={ids.describedBy}
              checked={previews} onCheckedChange={setPreviews} />
          )} />
        <SettingsRow title="Outbound mail" description="Retrying a deferred delivery"
          control={<StatusDot tone="warning">Delayed</StatusDot>} />
        <SettingsRow title="Two-factor" description="Asked at sign-in and before anything destructive"
          control={<Badge tone="danger">Off</Badge>} />
      </Section>
      <Section title="Set up a device" description="Mail, calendars and contacts with an app password of their own.">
        <Tabs aria-label="Device" items={CLIENTS} value={client} onValueChange={setClient}>
          {CLIENTS.map((c) => (
            <TabPanel key={c.value} value={c.value}>
              <span style={{ fontSize: 13, color: 'var(--color-fg-muted)' }}>
                One profile sets up {c.label}, with its own app password.
              </span>
            </TabPanel>
          ))}
        </Tabs>
      </Section>
      <Section title="Sessions" description="Where you are signed in now.">
        <DataList aria-label="Sessions">
          <DataListRow title="This browser" description="Chrome on macOS · signed in today"
            meta={<CountBadge quiet count={3} label="open tabs" />} />
          <DataListRow title="iPhone" description="Mail · signed in yesterday"
            actions={<Button size="sm" variant="ghost">Sign out</Button>} />
          <DataListRow title="Thunderbird" description="IMAP · signed in last week"
            actions={<Button size="sm" variant="ghost">Sign out</Button>} />
        </DataList>
      </Section>
      <Section title="Rules" description="Sort, flag or file new mail as it arrives.">
        <EmptyState kind="empty" size="row" heading="No rules yet" headingLevel={3}
          action={<Button size="sm">Add rule</Button>}>
          Your first rule runs on the next message.
        </EmptyState>
      </Section>
      <Section title="Import" description="Copy mail in from another account.">
        <FormField label="Server">
          <Input appearance="filled" defaultValue="imap.example.com" />
        </FormField>
        <FormField label="Provider">
          <Select appearance="filled" value={provider} onValueChange={setProvider}
            options={[{ value: 'gmail', label: 'Gmail' }, { value: 'icloud', label: 'iCloud' }, { value: 'other', label: 'Other' }]} />
        </FormField>
      </Section>
    </PageLayout>
  )
}

/**
 * Cards on the recessed sheet (D-085, DS-REQ-007). Inside `navTone="recessed"` a Card — so every
 * `Section` — is `--color-surface-card` with a 1px `--color-border` edge, because on the sheet's
 * own `surface` it was 1.00:1 and invisible. On a card the quiet chips and tracks (neutral and
 * danger Badge, quiet CountBadge, the Tabs track, the SegmentedControl track) sit on
 * `--color-fill-quiet`; a Section's title takes the 16px step; an EmptyState paints no surface of
 * its own; a DataList's hairlines run from content edge to content edge. Below `md` the sheet drops
 * to `bg`, the cards sit inset on it, and the page and card both pad 16px. Resize to 390px to see
 * the phone: only the primary header action stretches.
 */
export const RecessedWithCards: Story = {
  parameters: { canvas: 'app' },
  render: () => (
    <>
      <form id="story-sign-out" method="post" action="#" hidden />
      <AppShell storageKey="d3.story.sidebar.cards" navTone="recessed" brand={<Brand />} nav={<Nav />}
        footer={<Account />}>
        <CardsPage />
      </AppShell>
    </>
  ),
}
