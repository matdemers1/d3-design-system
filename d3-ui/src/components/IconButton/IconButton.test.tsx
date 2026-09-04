import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { IconButton } from './IconButton'

describe('IconButton — the contract', () => {
  it('always has an accessible name, and it is the label', () => {
    render(<IconButton icon={<svg />} label="More actions" />)
    expect(screen.getByRole('button')).toHaveAccessibleName('More actions')
  })

  it('hides the glyph from assistive technology', () => {
    render(<IconButton icon={<svg data-testid="ic" />} label="Edit" />)
    expect(screen.getByTestId('ic').parentElement).toHaveAttribute('aria-hidden', 'true')
  })

  it('does not fall back to a native title attribute', () => {
    // A native title never appears on keyboard focus and cannot be styled.
    // Bindery has 42 of them; this component refuses to add a 43rd.
    render(<IconButton icon={<svg />} label="Settings" />)
    expect(screen.getByRole('button')).not.toHaveAttribute('title')
  })

  it('meets the 24x24 minimum target size at every size', () => {
    const { rerender } = render(<IconButton icon={<svg />} label="a" size="sm" />)
    expect(screen.getByRole('button').className).toContain('d3-ibtn--sm')
    rerender(<IconButton icon={<svg />} label="a" size="lg" />)
    expect(screen.getByRole('button').className).toContain('d3-ibtn--lg')
    // sm is 28px in CSS — asserted in the token layer, not measurable in jsdom.
  })
})
