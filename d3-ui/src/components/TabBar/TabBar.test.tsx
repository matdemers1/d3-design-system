import { createRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TabBar, TabBarItem } from './TabBar'
import { expectNoAxeViolations } from '../../test/axe'

const icon = <svg data-testid="ic" />

const Three = ({ count, current = 'Apps' }: { count?: number; current?: string }) => (
  <TabBar aria-label="Primary">
    <TabBar.Item href="/apps" icon={icon} label="Apps" current={current === 'Apps'} />
    <TabBar.Item href="/activity" icon={icon} label="Activity" count={count} current={current === 'Activity'} />
    <TabBar.Item href="/settings" icon={icon} label="Settings" current={current === 'Settings'} />
  </TabBar>
)

describe('TabBar', () => {
  it('is a nav landmark named by aria-label, and TabBar.Item is TabBarItem', () => {
    render(<Three />)
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
    expect(TabBar.Item).toBe(TabBarItem)
  })

  it('forwards its ref to the nav', () => {
    const ref = createRef<HTMLElement>()
    render(<TabBar ref={ref} aria-label="Primary" />)
    expect(ref.current).toBe(screen.getByRole('navigation'))
  })

  it('forwards an item ref to the anchor', () => {
    const ref = createRef<HTMLAnchorElement>()
    render(<TabBar aria-label="Primary"><TabBar.Item ref={ref} href="/a" icon={icon} label="A" /></TabBar>)
    expect(ref.current).toBe(screen.getByRole('link', { name: 'A' }))
  })

  it('applies the forced-visible class only when asked', () => {
    const { rerender } = render(<TabBar aria-label="Primary" />)
    expect(screen.getByRole('navigation')).not.toHaveClass('d3-tbar--force')
    rerender(<TabBar aria-label="Primary" forceVisible />)
    expect(screen.getByRole('navigation')).toHaveClass('d3-tbar--force')
  })

  it('renders each item as a link named by its label, with the icon hidden', () => {
    render(<Three />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(3)
    expect(screen.getByRole('link', { name: 'Apps' })).toHaveAttribute('href', '/apps')
    expect(screen.getAllByTestId('ic')[0]!.parentElement).toHaveAttribute('aria-hidden', 'true')
  })

  it('marks exactly the current item aria-current="page", and leaves the others bare', () => {
    render(<Three current="Activity" />)
    const links = screen.getAllByRole('link')
    expect(links.filter((l) => l.getAttribute('aria-current') === 'page')).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Activity' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Apps' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('link', { name: 'Settings' })).not.toHaveAttribute('aria-current')
  })

  it('draws a count as a badge and folds it into the link name once', () => {
    render(<Three count={3} />)
    const link = screen.getByRole('link', { name: 'Activity, 3 new' })
    const badge = link.querySelector('.d3-bdg')!
    expect(badge).toHaveTextContent('3')
    expect(badge).toHaveAttribute('aria-hidden', 'true')
    // Not inside the icon's box: a sibling, so the two can never overlap.
    expect(badge.closest('.d3-tbar__icon')).toBeNull()
  })

  it('caps a large count at 99+ and keeps the real number in the name', () => {
    render(<Three count={120} />)
    expect(screen.getByRole('link', { name: 'Activity, 120 new' }).querySelector('.d3-bdg')).toHaveTextContent('99+')
  })

  it('uses countLabel as the spoken name when given', () => {
    render(
      <TabBar aria-label="Primary">
        <TabBar.Item href="/activity" icon={icon} label="Activity" count={2} countLabel="Activity, 2 failed deploys" />
      </TabBar>,
    )
    expect(screen.getByRole('link', { name: 'Activity, 2 failed deploys' })).toBeInTheDocument()
  })

  it('draws no badge for 0 or undefined', () => {
    const { container, rerender } = render(<Three count={0} />)
    expect(container.querySelector('.d3-bdg')).toBeNull()
    expect(screen.getByRole('link', { name: 'Activity' })).not.toHaveAttribute('aria-label')
    rerender(<Three />)
    expect(container.querySelector('.d3-bdg')).toBeNull()
  })

  describe('development warnings', () => {
    afterEach(() => vi.restoreAllMocks())

    it('warns when there are fewer than three or more than five destinations', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      render(
        <TabBar aria-label="Primary">
          {['A', 'B', 'C', 'D', 'E', 'F'].map((l) => <TabBar.Item key={l} href={`/${l}`} icon={icon} label={l} />)}
        </TabBar>,
      )
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('three to five'))
    })
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <TabBar aria-label="Primary" forceVisible>
        <TabBar.Item href="/apps" icon={icon} label="Apps" current />
        <TabBar.Item href="/activity" icon={icon} label="Activity" count={3} />
        <TabBar.Item href="/settings" icon={icon} label="Settings" />
      </TabBar>,
    )
    await expectNoAxeViolations(container)
  })
})
