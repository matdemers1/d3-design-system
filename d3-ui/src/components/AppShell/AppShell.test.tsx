import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppShell } from './AppShell'
import { SideNav, SideNavItem } from '../SideNav/SideNav'
import { mockMatchMedia, WIDE } from '../../test/media'

let media: ReturnType<typeof mockMatchMedia>
beforeEach(() => { localStorage.clear() })
afterEach(() => media?.restore())

const Nav = () => (
  <SideNav>
    <SideNavItem href="#ask" label="Ask" icon={<span>A</span>} current />
    <SideNavItem href="#search" label="Search" icon={<span>S</span>} />
  </SideNav>
)

function Shell(props: Partial<React.ComponentProps<typeof AppShell>>) {
  return (
    <AppShell brand={<a href="#home">Home</a>} nav={<Nav />} footer={<button>Account</button>} {...props}>
      <h1>Page</h1>
    </AppShell>
  )
}

describe('AppShell — landmarks and the skip link', () => {
  beforeEach(() => { media = mockMatchMedia({ [WIDE]: true }) })

  it('has exactly one main, with the id the skip link targets', () => {
    render(<Shell mainId="page" />)
    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(screen.getByRole('main')).toHaveAttribute('id', 'page')
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#page')
  })

  it('puts the skip link first in the tab order, and it moves focus to main', async () => {
    render(<Shell />)
    await userEvent.tab()
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(screen.getByRole('main')).toHaveFocus()
  })

  it('the navigation landmark comes from SideNav, named', () => {
    render(<Shell />)
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
  })
})

describe('AppShell — at lg and wider', () => {
  beforeEach(() => { media = mockMatchMedia({ [WIDE]: true }) })

  it('shows the sidebar inline, with no drawer button', () => {
    render(<Shell />)
    expect(screen.queryByRole('button', { name: 'Open navigation' })).toBeNull()
    expect(screen.getByRole('link', { name: 'Ask' })).toBeVisible()
  })

  it('collapses to a rail, remembers it, and reads it back', async () => {
    const { unmount } = render(<Shell storageKey="app.rail" />)
    await userEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }))
    expect(localStorage.getItem('app.rail')).toBe('1')
    // The label is hidden visually, never from the accessibility tree.
    expect(screen.getByRole('link', { name: 'Ask' })).toBeInTheDocument()
    unmount()
    render(<Shell storageKey="app.rail" />)
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument()
  })

  it('starts collapsed from defaultCollapsed only when nothing is stored', () => {
    localStorage.setItem('d3.sidebar.collapsed', '0')
    render(<Shell defaultCollapsed />)
    expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toBeInTheDocument()
  })
})

describe('AppShell — below lg, a drawer', () => {
  beforeEach(() => { media = mockMatchMedia({ [WIDE]: false }) })

  const open = async () => {
    render(<Shell />)
    await userEvent.click(screen.getByRole('button', { name: 'Open navigation' }))
    return screen.findByRole('dialog', { name: 'Navigation' })
  }

  it('has no navigation in the page until the drawer opens', async () => {
    render(<Shell />)
    expect(screen.queryByRole('navigation')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Open navigation' }))
    const drawer = await screen.findByRole('dialog', { name: 'Navigation' })
    expect(within(drawer).getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
  })

  it('moves focus into the drawer and makes the page behind inert', async () => {
    const drawer = await open()
    await waitFor(() => expect(drawer.contains(document.activeElement)).toBe(true))
    expect(screen.getByRole('main', { hidden: true }).closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('closes on Escape and returns focus to the menu button', async () => {
    await open()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(screen.getByRole('button', { name: 'Open navigation' })).toHaveFocus())
  })

  it('closes when a link inside it is activated', async () => {
    const drawer = await open()
    await userEvent.click(within(drawer).getByRole('link', { name: 'Search' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('stays open for a control that is not a link', async () => {
    const drawer = await open()
    await userEvent.click(within(drawer).getByRole('button', { name: 'Account' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes itself when the window grows past lg', async () => {
    await open()
    act(() => media.set(WIDE, true))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toBeInTheDocument()
  })

  it('ignores a stored rail — a drawer is never collapsed', async () => {
    localStorage.setItem('d3.sidebar.collapsed', '1')
    const drawer = await open()
    expect(within(drawer).getByText('Ask')).not.toHaveClass('d3-snav__vh')
  })
})
