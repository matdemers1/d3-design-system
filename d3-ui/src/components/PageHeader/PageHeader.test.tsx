import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { PageHeader } from './PageHeader'
import { Button } from '../Button/Button'

describe('PageHeader — the contract', () => {
  it('the title is the page h1', () => {
    render(<PageHeader title="Inbox" focusOnMount={false} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Inbox' })).toBeInTheDocument()
  })

  it('takes focus on mount, so a route change is announced', async () => {
    // None of the four apps does this today — every client-side navigation is
    // currently silent to assistive technology.
    render(<PageHeader title="Inbox" />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveFocus()
    })
  })

  it('can opt out of taking focus', () => {
    render(<PageHeader title="Inbox" focusOnMount={false} />)
    expect(screen.getByRole('heading', { level: 1 })).not.toHaveFocus()
  })

  it('is programmatically focusable without entering the tab order', () => {
    render(<PageHeader title="Inbox" focusOnMount={false} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveAttribute('tabindex', '-1')
  })

  it('puts the count in the accessible name, not as a bare number', () => {
    render(<PageHeader title="Inbox" count={48} focusOnMount={false} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Inbox, 48 items' })).toBeInTheDocument()
  })

  it('groups thousands in the count', () => {
    render(<PageHeader title="Archive" count={1204} focusOnMount={false} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Archive, 1,204 items' })).toBeInTheDocument()
  })

  it('names the destination of the back link', () => {
    render(
      <PageHeader title="Export fails silently" focusOnMount={false}
        backTo={{ href: '/inbox', label: 'Inbox' }} />,
    )
    const back = screen.getByRole('link', { name: 'Inbox' })
    expect(back).toHaveAttribute('href', '/inbox')
    // "Back" alone tells a screen-reader user nothing about where they will land.
    expect(screen.queryByRole('link', { name: 'Back' })).not.toBeInTheDocument()
  })

  it('renders actions alongside the title', () => {
    render(
      <PageHeader title="Inbox" focusOnMount={false}
        actions={<Button variant="primary">New item</Button>} />,
    )
    expect(screen.getByRole('button', { name: 'New item' })).toBeInTheDocument()
  })
})
