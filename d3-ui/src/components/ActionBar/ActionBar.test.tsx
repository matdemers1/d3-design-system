import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActionBar, ActionBarItem } from './ActionBar'
import { expectNoAxeViolations } from '../../test/axe'

const icon = <svg data-testid="ic" />

describe('ActionBar', () => {
  it('is a labelled group, and ActionBar.Item is ActionBarItem', () => {
    render(<ActionBar aria-label="Conversation actions"><ActionBar.Item icon={icon} label="Archive" /></ActionBar>)
    expect(screen.getByRole('group', { name: 'Conversation actions' })).toBeInTheDocument()
    expect(ActionBar.Item).toBe(ActionBarItem)
  })

  it('forwards its ref to the container', () => {
    const ref = createRef<HTMLDivElement>()
    render(<ActionBar ref={ref} aria-label="Actions" />)
    expect(ref.current).toBe(screen.getByRole('group'))
  })

  it('applies the forced-visible class only when asked', () => {
    const { rerender } = render(<ActionBar aria-label="Actions" />)
    expect(screen.getByRole('group')).not.toHaveClass('d3-abar--force')
    rerender(<ActionBar aria-label="Actions" forceVisible />)
    expect(screen.getByRole('group')).toHaveClass('d3-abar--force')
  })

  it('names each button by its visible label and hides the icon', async () => {
    const onClick = vi.fn()
    render(
      <ActionBar aria-label="Actions">
        <ActionBar.Item icon={icon} label="Archive" onClick={onClick} />
        <ActionBar.Item icon={icon} label="Reply" tone="accent" />
      </ActionBar>,
    )
    const archive = screen.getByRole('button', { name: 'Archive' })
    expect(archive).toHaveAttribute('type', 'button')
    expect(screen.getAllByTestId('ic')[0]!.parentElement).toHaveAttribute('aria-hidden', 'true')
    await userEvent.click(archive)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Reply' })).toHaveClass('d3-abar__item--accent')
    expect(archive).not.toHaveClass('d3-abar__item--accent')
  })

  it('is operable from the keyboard, each item a tab stop', async () => {
    const onClick = vi.fn()
    render(
      <ActionBar aria-label="Actions">
        <ActionBar.Item icon={icon} label="One" />
        <ActionBar.Item icon={icon} label="Two" onClick={onClick} />
      </ActionBar>,
    )
    await userEvent.tab()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Two' })).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders a link when href is given', () => {
    render(<ActionBar aria-label="Actions"><ActionBar.Item icon={icon} label="Inbox" href="/inbox" /></ActionBar>)
    const link = screen.getByRole('link', { name: 'Inbox' })
    expect(link).toHaveAttribute('href', '/inbox')
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('a disabled button does not fire onClick', async () => {
    const onClick = vi.fn()
    render(<ActionBar aria-label="Actions"><ActionBar.Item icon={icon} label="Delete" disabled onClick={onClick} /></ActionBar>)
    const b = screen.getByRole('button', { name: 'Delete' })
    expect(b).toBeDisabled()
    await userEvent.click(b)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('a disabled link loses its href and is aria-disabled', () => {
    render(<ActionBar aria-label="Actions"><ActionBar.Item icon={icon} label="Inbox" href="/inbox" disabled /></ActionBar>)
    const link = screen.getByText('Inbox').closest('a')!
    expect(link).not.toHaveAttribute('href')
    expect(link).toHaveAttribute('aria-disabled', 'true')
  })

  it('has no axe violations, as buttons and as links', async () => {
    const { container } = render(
      <ActionBar aria-label="Conversation actions" forceVisible>
        <ActionBar.Item icon={icon} label="Archive" />
        <ActionBar.Item icon={icon} label="Delete" disabled />
        <ActionBar.Item icon={icon} label="Inbox" href="/inbox" />
        <ActionBar.Item icon={icon} label="Reply" tone="accent" />
      </ActionBar>,
    )
    await expectNoAxeViolations(container)
  })
})
