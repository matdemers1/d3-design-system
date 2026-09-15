import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PasswordInput } from './PasswordInput'
import { FormField } from '../FormField/FormField'

describe('PasswordInput — the contract', () => {
  it('the toggle changes what the field shows and what the button is called', async () => {
    const user = userEvent.setup()
    render(<FormField label="Password"><PasswordInput defaultValue="hunter2hunter2" /></FormField>)
    const input = screen.getByLabelText('Password')
    expect(input).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'Show password' }))
    expect(input).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute('aria-controls', input.id)

    await user.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(input).toHaveAttribute('type', 'password')
  })

  it('keeps focus in the field when the toggle is clicked', async () => {
    const user = userEvent.setup()
    render(<PasswordInput aria-label="Password" />)
    const input = screen.getByLabelText('Password')
    await user.click(input)
    await user.click(screen.getByRole('button', { name: 'Show password' }))
    expect(input).toHaveFocus()
  })

  it('says the strength in words, tied to the field', () => {
    render(<PasswordInput aria-label="New password" strength={{ score: 3, label: 'Good' }} />)
    const input = screen.getByLabelText('New password')
    const label = screen.getByText('Good')
    expect(input.getAttribute('aria-describedby')).toContain(label.id)
    expect(document.querySelectorAll('.d3-pw__bar--on')).toHaveLength(3)
  })

  it('warns about Caps Lock only while it is on', async () => {
    const user = userEvent.setup()
    render(<PasswordInput aria-label="Password" />)
    const input = screen.getByLabelText('Password')
    await user.click(input)
    await user.keyboard('{CapsLock}a')
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Caps Lock is on')
    await user.keyboard('{CapsLock}a')
    expect(screen.queryByText('Caps Lock is on')).toBeNull()
    // The same node, emptied — never unmounted, so the next announcement lands.
    expect(screen.getByRole('status')).toBe(status)
  })

  it('is invalid through FormField, like Input', () => {
    render(<FormField label="Password" error="Too common."><PasswordInput /></FormField>)
    expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true')
  })

  it('sits on the same box as Input', () => {
    const { container } = render(<PasswordInput aria-label="Password" size="lg" />)
    expect(container.querySelector('.d3-inp.d3-inp--lg')).not.toBeNull()
  })
})
