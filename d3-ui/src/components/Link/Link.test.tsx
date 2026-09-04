import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Link } from './Link'

describe('Link — the contract', () => {
  it('is a real anchor with an href', () => {
    render(<Link href="/inbox">Open the inbox</Link>)
    const a = screen.getByRole('link', { name: /open the inbox/i })
    expect(a.tagName).toBe('A')
    expect(a).toHaveAttribute('href', '/inbox')
  })

  it('adds rel="noopener noreferrer" when opening a new tab', () => {
    render(<Link href="https://example.com" external>Trust report</Link>)
    const a = screen.getByRole('link')
    expect(a).toHaveAttribute('target', '_blank')
    expect(a.getAttribute('rel')).toContain('noopener')
  })

  it('says "opens in a new tab" in the accessible name', () => {
    render(<Link href="https://example.com" external>Trust report</Link>)
    // Visible and programmatic, not one or the other.
    expect(screen.getByRole('link')).toHaveAccessibleName(/opens in a new tab/i)
  })

  it('does not announce the external glyph', () => {
    render(<Link href="https://x.com" external externalIcon={<svg data-testid="ext" />}>Docs</Link>)
    expect(screen.getByTestId('ext').parentElement).toHaveAttribute('aria-hidden', 'true')
  })
})
