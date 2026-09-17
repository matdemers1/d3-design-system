import type { Meta, StoryObj } from '@storybook/react'
import { BookOpen, LogOut, Settings, UserCircle } from 'lucide-react'
import { AccountMenu } from './AccountMenu'
import { MenuItem, MenuSeparator } from '../Menu/Menu'
import { ThemeProvider } from '../Theme/ThemeProvider'
import { ThemeSwitch } from '../Theme/ThemeSwitch'
import { AppShellContext } from '../AppShell/AppShellContext'

const i = (I: typeof Settings) => <I size={16} strokeWidth={1.8} />

const meta = {
  title: 'Frame/AccountMenu',
  component: AccountMenu,
  tags: ['autodocs'],
  args: { name: 'Dana Whitfield', detail: 'dana@example.com' },
  parameters: { docs: { description: { component:
    'Who is signed in, and the things set up once: account, settings, theme, sign-out. It sits in ' +
    'the `footer` slot of `AppShell` and opens upward.\n\n' +
    '**Sign-out is the app\'s item.** It is a navigation or a form post the library cannot know — a ' +
    'server session, an end-session redirect, a CSRF token — so the app passes a `MenuItem`, last, ' +
    'with `tone="danger"`. Use `asChild` with a real `<a>` or `<button type="submit" form>`.\n\n' +
    'A `ThemeSwitch` inside renders as a labelled group of menu radios (D-066).\n\n' +
    'On a collapsed rail the trigger is the avatar alone; the name moves to a tooltip and stays in ' +
    'the button\'s accessible name.' } } },
  decorators: [(S) => <div style={{ width: 216 }}><S /></div>],
} satisfies Meta<typeof AccountMenu>
export default meta
type Story = StoryObj<typeof meta>

function Items() {
  return (
    <>
      <MenuItem asChild icon={i(UserCircle)}><a href="#account">Your account</a></MenuItem>
      <MenuItem asChild icon={i(Settings)}><a href="#settings">Settings</a></MenuItem>
      <MenuItem asChild icon={i(BookOpen)}><a href="#guides">Guides</a></MenuItem>
      <MenuSeparator />
      <ThemeSwitch />
      <MenuSeparator />
      <MenuItem asChild tone="danger" icon={i(LogOut)}>
        <button type="submit" form="story-sign-out">Sign out</button>
      </MenuItem>
    </>
  )
}

export const Default: Story = {
  render: (args) => (
    <ThemeProvider storageKey="d3.story.theme">
      <form id="story-sign-out" method="post" action="#" hidden />
      <AccountMenu {...args}><Items /></AccountMenu>
    </ThemeProvider>
  ),
}

/** A name longer than the sidebar truncates; the full name is still the button's name. */
export const LongName: Story = {
  args: { name: 'Alexandria Montgomery-Featherstonehaugh', detail: 'Owner · alexandria.montgomery@example.org' },
  render: (args) => (
    <ThemeProvider storageKey="d3.story.theme">
      <AccountMenu {...args}><Items /></AccountMenu>
    </ThemeProvider>
  ),
}

export const Collapsed: Story = {
  decorators: [(S) => (
    <AppShellContext.Provider value={{ collapsed: true, drawer: false }}>
      <div style={{ width: 40 }}><S /></div>
    </AppShellContext.Provider>
  )],
  render: (args) => (
    <ThemeProvider storageKey="d3.story.theme">
      <AccountMenu {...args}><Items /></AccountMenu>
    </ThemeProvider>
  ),
}
