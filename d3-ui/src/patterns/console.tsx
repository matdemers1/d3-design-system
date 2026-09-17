/*
 * The running example for the Patterns stories: an identity provider's admin
 * console. Shared so that every pattern sits in the same frame, with the same
 * people and apps, the way a real app's pages do.
 *
 * Built only from package exports. If something here needs a style of its own,
 * that is a gap in the library, not a reason for a local class.
 */
import {
  AppWindow, Download, Home, KeyRound, LogOut, MonitorSmartphone, ScrollText, Settings,
  ShieldHalf, UserCircle, Users, UsersRound,
} from 'lucide-react'
import {
  AccountMenu, AppShell, AppShellBrand, MenuItem, MenuSeparator, SideNav, SideNavGroup, SideNavItem,
  ThemeSwitch,
} from '../index'

type Icon = typeof Home
/** Lucide at the 16px nav size, stroke per D-025. */
export const icon = (I: Icon, size: 14 | 16 | 20 = 16) => (
  <I size={size} strokeWidth={size === 20 ? 1.6 : 1.8} aria-hidden />
)

export type Destination = 'home' | 'people' | 'groups' | 'apps' | 'keys' | 'sessions' | 'audit' | 'none'

/**
 * Seven destinations, so they are grouped (group past seven, D-065). Settings,
 * export and your own profile are set up once and then forgotten, so they live
 * in the account menu rather than making a daily list longer.
 */
export function ConsoleNav({ current }: { current: Destination }) {
  return (
    <SideNav>
      <SideNavItem href="#home" icon={icon(Home)} label="Home" current={current === 'home'} />
      <SideNavGroup title="Directory">
        <SideNavItem href="#people" icon={icon(Users)} label="People" current={current === 'people'}
          count={2} countLabel="People, 2 invites waiting" />
        <SideNavItem href="#groups" icon={icon(UsersRound)} label="Groups" current={current === 'groups'} />
        <SideNavItem href="#apps" icon={icon(AppWindow)} label="Apps" current={current === 'apps'} />
      </SideNavGroup>
      <SideNavGroup title="Trust">
        <SideNavItem href="#keys" icon={icon(KeyRound)} label="Keys" current={current === 'keys'} />
        <SideNavItem href="#sessions" icon={icon(MonitorSmartphone)} label="Sessions" current={current === 'sessions'} />
        <SideNavItem href="#audit" icon={icon(ScrollText)} label="Audit" current={current === 'audit'} />
      </SideNavGroup>
    </SideNav>
  )
}

export function ConsoleAccount() {
  return (
    <AccountMenu name="Matt Demers" detail="Owner · matt@d3cloud.io">
      <MenuItem asChild icon={icon(UserCircle)}><a href="#profile">Your profile</a></MenuItem>
      <MenuItem asChild icon={icon(Settings)}><a href="#settings">Settings</a></MenuItem>
      <MenuItem asChild icon={icon(Download)}><a href="#transfer">Export and import</a></MenuItem>
      <MenuSeparator />
      <ThemeSwitch />
      <MenuSeparator />
      <MenuItem asChild tone="danger" icon={icon(LogOut)}><a href="#sign-out">Sign out</a></MenuItem>
    </AccountMenu>
  )
}

/** The frame every console page renders in. */
export function ConsoleFrame({ current, children }: { current: Destination; children: React.ReactNode }) {
  return (
    <AppShell
      storageKey="d3.patterns.sidebar"
      brand={<AppShellBrand href="#home" name="D3 Auth" mark={icon(ShieldHalf, 20)} />}
      nav={<ConsoleNav current={current} />}
      footer={<ConsoleAccount />}
    >
      {children}
    </AppShell>
  )
}

export interface Person {
  id: string
  name: string
  username: string
  email: string
  kind: 'owner' | 'admin' | 'guest'
  status: 'active' | 'suspended'
  lastSignIn: string
  factors: string
}

export const PEOPLE: Person[] = [
  { id: 'p-matt', name: 'Matt Demers', username: 'matt', email: 'matt@d3cloud.io', kind: 'owner', status: 'active', lastSignIn: 'Today, 09:41', factors: 'Passkey, authenticator app' },
  { id: 'p-sarah', name: 'Sarah Byrne', username: 'sbyrne', email: 'sarah@sarahbyrnelicsw.com', kind: 'admin', status: 'active', lastSignIn: 'Today, 08:12', factors: 'Passkey' },
  { id: 'p-priya', name: 'Priya Raman', username: 'priya', email: 'priya.raman@northfield-studio.co', kind: 'guest', status: 'active', lastSignIn: 'Yesterday, 17:55', factors: 'Authenticator app' },
  { id: 'p-jonah', name: 'Jonah Whitaker', username: 'jonah', email: 'jonah@whitaker.family', kind: 'guest', status: 'active', lastSignIn: '12 Sept, 21:03', factors: 'Password only' },
  { id: 'p-elena', name: 'Elena Vasquez', username: 'elena.v', email: 'elena@vasquez-design.com', kind: 'guest', status: 'suspended', lastSignIn: '28 Aug, 11:20', factors: 'Passkey' },
  { id: 'p-tom', name: 'Tom Okafor', username: 'tokafor', email: 'tom.okafor@example.org', kind: 'guest', status: 'active', lastSignIn: 'Never signed in', factors: 'Not set up yet' },
]

export interface App {
  id: string
  name: string
  clientId: string
  type: string
  people: number
  disabled?: boolean
}

export const APPS: App[] = [
  { id: 'bindery', name: 'Bindery', clientId: 'bindery', type: 'Web app with a client secret', people: 4 },
  { id: 'murmur', name: 'Murmur', clientId: 'murmur', type: 'Web app with a client secret', people: 3 },
  { id: 'burrow', name: 'Burrow', clientId: 'burrow-ios', type: 'Native app, PKCE', people: 1 },
  { id: 'someday', name: 'Someday Vault admin', clientId: 'someday-admin', type: 'Web app with a client secret', people: 2, disabled: true },
]

export interface AuditEvent { id: string; event: string; actor: string; target: string; at: string }

export const EVENTS: AuditEvent[] = [
  { id: 'e1', event: 'grant.given', actor: 'Matt Demers', target: 'Priya Raman → Bindery', at: '09:41' },
  { id: 'e2', event: 'session.revoked', actor: 'Sarah Byrne', target: 'Jonah Whitaker · iPhone', at: '09:12' },
  { id: 'e3', event: 'key.rotated', actor: 'System', target: 'Signing key 2026-09', at: '08:00' },
  { id: 'e4', event: 'person.suspended', actor: 'Matt Demers', target: 'Elena Vasquez', at: 'Yesterday' },
  { id: 'e5', event: 'app.registered', actor: 'Matt Demers', target: 'Someday Vault admin', at: 'Yesterday' },
]
