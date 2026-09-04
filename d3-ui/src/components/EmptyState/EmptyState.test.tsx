import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from './EmptyState'

describe('EmptyState — the contract', () => {
  it('renders the heading as a real heading, not a styled paragraph', () => {
    render(<EmptyState kind="empty" heading="Nothing here yet">Context.</EmptyState>)
    // It is often the only thing a screen-reader user hears about the region.
    expect(screen.getByRole('heading', { name: 'Nothing here yet' })).toBeInTheDocument()
  })

  it('respects the heading level of the region it sits in', () => {
    render(<EmptyState kind="empty" heading="Nothing here yet" headingLevel={2} />)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('the error kind is polite, not assertive', () => {
    render(<EmptyState kind="error" heading="Could not load the inbox" />)
    // Rendered as part of the region, not fired at the user mid-task.
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('the other kinds carry no live region at all', () => {
    const { container } = render(<EmptyState kind="no-results" heading="No matches" />)
    expect(container.firstElementChild).not.toHaveAttribute('role')
  })

  it('records the kind, so the four situations stay distinguishable', () => {
    const { container, rerender } = render(<EmptyState kind="empty" heading="a" />)
    expect(container.firstElementChild).toHaveAttribute('data-kind', 'empty')
    rerender(<EmptyState kind="no-results" heading="a" />)
    expect(container.firstElementChild).toHaveAttribute('data-kind', 'no-results')
  })

  it('hides the decorative icon', () => {
    render(<EmptyState kind="empty" heading="a" icon={<svg data-testid="ic" />} />)
    expect(screen.getByTestId('ic').parentElement).toHaveAttribute('aria-hidden', 'true')
  })
})
