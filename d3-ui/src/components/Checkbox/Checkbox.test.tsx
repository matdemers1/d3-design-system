import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from './Checkbox'

describe('Checkbox — the contract', () => {
  it('exposes indeterminate as a real ARIA state, not a CSS class', () => {
    render(<Checkbox label="Select all" checked="indeterminate" />)
    // App A's inbox header needs this (InboxPage.jsx:246). A select-all showing
    // unchecked while three rows are selected lies about the table.
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed')
  })

  it('toggles with Space, not Enter', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Checkbox label="Notify me" checked={false} onCheckedChange={onChange} />)
    screen.getByRole('checkbox').focus()
    await user.keyboard('{Enter}')
    expect(onChange).not.toHaveBeenCalled()   // Enter submits a form, it does not toggle
    await user.keyboard(' ')
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('makes the label part of the click target', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Checkbox label="Notify me when this changes" checked={false} onCheckedChange={onChange} />)
    await user.click(screen.getByText('Notify me when this changes'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Checkbox label="Notify me" checked={false} disabled onCheckedChange={onChange} />)
    await user.click(screen.getByRole('checkbox'))
    expect(onChange).not.toHaveBeenCalled()
  })
})
