import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

describe('Input — the contract', () => {
  it('read-only is focusable and copyable; disabled is neither', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<Input readOnly defaultValue="FB-2841" aria-label="Reference" />)
    await user.tab()
    // Making a reference ID disabled means a keyboard user cannot copy it.
    expect(screen.getByLabelText('Reference')).toHaveFocus()

    rerender(<Input disabled defaultValue="FB-2841" aria-label="Reference" />)
    expect(screen.getByLabelText('Reference')).toBeDisabled()
  })

  it('marks itself invalid for assistive technology', () => {
    render(<Input invalid aria-label="Email" />)
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('hides decorative affixes', () => {
    render(<Input aria-label="Search" leading={<svg data-testid="lead" />} />)
    expect(screen.getByTestId('lead').parentElement).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('Input — appearance', () => {
  it('outlined is the default and renders exactly as before: a size class, no filled class', () => {
    render(<Input aria-label="Name" />)
    const frame = screen.getByLabelText('Name').parentElement!
    expect(frame.className).toBe('d3-inp d3-inp--md')
  })

  it('filled replaces the size class with its own single size', () => {
    render(<Input aria-label="To" appearance="filled" size="lg" />)
    const frame = screen.getByLabelText('To').parentElement!
    expect(frame).toHaveClass('d3-inp', 'd3-inp--filled')
    expect(frame).not.toHaveClass('d3-inp--lg')
  })

  it('filled keeps invalid, disabled and read-only', () => {
    render(<Input aria-label="To" appearance="filled" invalid disabled />)
    const frame = screen.getByLabelText('To').parentElement!
    expect(frame).toHaveClass('d3-inp--filled', 'd3-inp--invalid', 'd3-inp--disabled')
  })
})
