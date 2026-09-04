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
