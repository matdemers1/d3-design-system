import { forwardRef } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Activity, ClipboardCheck, FolderTree, Import, Search, ShieldCheck, Sparkles, Tags } from 'lucide-react'
import { SideNav, SideNavGroup, SideNavItem } from './SideNav'
import { AppShellContext } from '../AppShell/AppShellContext'

const i = (I: typeof Search) => <I size={16} strokeWidth={1.8} />

const meta = {
  title: 'Frame/SideNav',
  component: SideNav,
  tags: ['autodocs'],
  parameters: { docs: { description: { component:
    'The app\'s primary navigation, for the `nav` slot of `AppShell`: a `<nav>` landmark, a list, ' +
    'and groups that are named for assistive technology by their visible titles.\n\n' +
    '- `current` sets `aria-current="page"` — the accent tint, semibold, and announced.\n' +
    '- `count` is work waiting there. It joins the link\'s name ("Review, 3 items") and renders ' +
    'as a `CountBadge`; on a collapsed rail it is a dot.\n' +
    '- `asChild` takes a router\'s own link element, so client-side navigation keeps working.\n' +
    '- On a collapsed rail an item is its icon, the label is its tooltip, and the name is unchanged.\n\n' +
    '**Group past seven items.** Things set up once and then forgotten — account, people, settings — ' +
    'go in the `AccountMenu`, not here.' } } },
  decorators: [(S) => <div style={{ width: 216 }}><S /></div>],
} satisfies Meta<typeof SideNav>
export default meta
type Story = StoryObj<typeof meta>

function Grouped() {
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
        <SideNavItem href="#trust" icon={i(ShieldCheck)} label="Trust" count={1}
          countLabel="Trust, 1 check needs attention" />
        <SideNavItem href="#pipeline" icon={i(Activity)} label="Pipeline" />
      </SideNavGroup>
    </SideNav>
  )
}

export const Groups: Story = { render: () => <Grouped /> }

/** Four destinations need no groups. */
export const Flat: Story = {
  render: () => (
    <SideNav>
      <SideNavItem href="#home" icon={i(Sparkles)} label="Home" current />
      <SideNavItem href="#people" icon={i(Search)} label="People" count={12} />
      <SideNavItem href="#apps" icon={i(FolderTree)} label="Applications" />
      <SideNavItem href="#audit" icon={i(Activity)} label="Audit log" />
    </SideNav>
  ),
}

/** The rail: icons only, the label in a tooltip on hover and focus, the name intact. */
export const Collapsed: Story = {
  decorators: [(S) => (
    <AppShellContext.Provider value={{ collapsed: true, drawer: false }}>
      <div style={{ width: 40 }}><S /></div>
    </AppShellContext.Provider>
  )],
  render: () => <Grouped />,
}

// Stands in for react-router's Link: an anchor that would navigate client-side.
const RouterLink = forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }>(
  function RouterLink({ to, ...rest }, ref) {
    return <a ref={ref} href={to} {...rest} />
  },
)

/** A router's link through `asChild`. Pass the element empty; the item fills it. */
export const WithARouterLink: Story = {
  render: () => (
    <SideNav>
      <SideNavItem asChild icon={i(Sparkles)} label="Ask" current><RouterLink to="#ask" /></SideNavItem>
      <SideNavItem asChild icon={i(Search)} label="Search"><RouterLink to="#search" /></SideNavItem>
    </SideNav>
  ),
}
