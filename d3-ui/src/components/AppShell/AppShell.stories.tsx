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
