import { forwardRef } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SideNav, SideNavGroup, SideNavItem } from './SideNav'
import { AppShellContext } from '../AppShell/AppShellContext'

describe('SideNav — a named landmark with named groups', () => {
  it('is one nav landmark, named Main unless told otherwise', () => {
    const { rerender } = render(<SideNav><SideNavItem href="#a" label="Ask" /></SideNav>)
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    rerender(<SideNav aria-label="Settings sections"><SideNavItem href="#a" label="Ask" /></SideNav>)
    expect(screen.getByRole('navigation', { name: 'Settings sections' })).toBeInTheDocument()
  })

  it('names each group by its visible title', () => {
    render(
      <SideNav>
        <SideNavGroup title="Find"><SideNavItem href="#a" label="Ask" /></SideNavGroup>
        <SideNavGroup title="Keep"><SideNavItem href="#t" label="Trust" /></SideNavGroup>
      </SideNav>,
    )
    const find = screen.getByRole('group', { name: 'Find' })
    expect(find).toContainElement(screen.getByRole('link', { name: 'Ask' }))
    expect(screen.getByRole('group', { name: 'Keep' })).toBeInTheDocument()
  })

  it('a hidden title still names the group', () => {
    render(<SideNav><SideNavGroup title="Admin" hideTitle><SideNavItem href="#p" label="People" /></SideNavGroup></SideNav>)
    expect(screen.getByRole('group', { name: 'Admin' })).toBeInTheDocument()
    expect(screen.getByText('Admin')).toHaveClass('d3-snav__vh')
  })
})

describe('SideNavItem', () => {
  it('marks the current page, and only that one', () => {
    render(
      <SideNav>
        <SideNavItem href="#a" label="Ask" current />
        <SideNavItem href="#s" label="Search" />
      </SideNav>,
    )
    expect(screen.getByRole('link', { name: 'Ask' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Search' })).not.toHaveAttribute('aria-current')
  })

  it('puts the count in the name, with its unit', () => {
    render(
      <SideNav>
        <SideNavItem href="#r" label="Review" count={3} />
        <SideNavItem href="#t" label="Trust" count={1} countLabel="Trust, 1 check needs attention" />
      </SideNav>,
    )
    expect(screen.getByRole('link', { name: 'Review, 3 items' })).toHaveTextContent('3')
    expect(screen.getByRole('link', { name: 'Trust, 1 check needs attention' })).toBeInTheDocument()
  })

  it('shows no badge for zero — nothing is waiting', () => {
    const { container } = render(<SideNav><SideNavItem href="#r" label="Review" count={0} /></SideNav>)
    expect(container.querySelector('.d3-bdg')).toBeNull()
  })

  it('renders a router link through asChild, filled with the item', () => {
    const RouterLink = forwardRef<HTMLAnchorElement, { to: string; className?: string }>(
      ({ to, ...rest }, ref) => <a ref={ref} href={to} data-router="yes" {...rest} />,
    )
    render(<SideNav><SideNavItem asChild label="Search" current><RouterLink to="/search" /></SideNavItem></SideNav>)
    const link = screen.getByRole('link', { name: 'Search' })
    expect(link).toHaveAttribute('data-router', 'yes')
    expect(link).toHaveAttribute('href', '/search')
    expect(link).toHaveAttribute('aria-current', 'page')
    expect(link).toHaveClass('d3-snav__item')
  })

  it("merges a NavLink-style className function instead of replacing it", () => {
    const NavLike = ({ className, ...rest }: { className?: (s: { isActive: boolean }) => string }) =>
      <a href="/x" className={className?.({ isActive: true })} {...rest} />
    render(
      <SideNav>
        <SideNavItem asChild label="X">
          <NavLike className={({ isActive }) => (isActive ? 'active' : '')} />
        </SideNavItem>
      </SideNav>,
    )
    const link = screen.getByRole('link', { name: 'X' })
    expect(link).toHaveClass('d3-snav__item')
    expect(link).toHaveClass('active')
  })

  it('on a collapsed rail, keeps the name while hiding the label visually', () => {
    render(
      <AppShellContext.Provider value={{ collapsed: true, drawer: false }}>
        <SideNav>
          <SideNavGroup title="Tend"><SideNavItem href="#r" label="Review" count={4} /></SideNavGroup>
        </SideNav>
      </AppShellContext.Provider>,
    )
    expect(screen.getByRole('link', { name: 'Review, 4 items' })).toBeInTheDocument()
    expect(screen.getByText('Review')).toHaveClass('d3-snav__vh')
    expect(screen.getByRole('group', { name: 'Tend' })).toBeInTheDocument()
  })
})
