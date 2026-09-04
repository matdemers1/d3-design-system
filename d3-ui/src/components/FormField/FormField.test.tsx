import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormField } from './FormField'
import { Input } from '../Input/Input'
import { Select } from '../Select/Select'
import { Checkbox } from '../Checkbox/Checkbox'

/**
 * These assert the wiring three of the four apps do not have today:
 * App B ships 18 labels with zero htmlFor, and App A, App B and App C use
 * aria-invalid and aria-describedby zero times between them.
 */
describe('FormField — the wiring contract', () => {
  it('associates the label with the control', async () => {
    render(<FormField label="Reason"><Input /></FormField>)
    // getByLabelText only resolves through a real association.
    const input = screen.getByLabelText('Reason')
    expect(input).toBeInTheDocument()
    expect(input.id).toBeTruthy()
  })

  it('focuses the control when the label is clicked', async () => {
    const user = userEvent.setup()
    render(<FormField label="Reason"><Input /></FormField>)
    await user.click(screen.getByText('Reason'))
    expect(screen.getByLabelText('Reason')).toHaveFocus()
  })

  it('points aria-describedby at the help text', () => {
    render(<FormField label="Passphrase" help="At least 12 characters."><Input /></FormField>)
    const input = screen.getByLabelText('Passphrase')
    const ids = (input.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean)
    expect(ids.length).toBe(1)
    expect(document.getElementById(ids[0]!)).toHaveTextContent('At least 12 characters.')
  })

  it('points aria-describedby at BOTH the error and the help, error first', () => {
    render(
      <FormField label="Reason" error="Select a reason before dismissing 3 items."
        help="Dismissed items stay searchable."><Input /></FormField>,
    )
    const input = screen.getByLabelText('Reason')
    const ids = (input.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean)
    expect(ids).toHaveLength(2)
    expect(document.getElementById(ids[0]!)).toHaveTextContent('Select a reason')
    expect(document.getElementById(ids[1]!)).toHaveTextContent('stay searchable')
  })

  it('sets aria-invalid only when there is an error', () => {
    const { rerender } = render(<FormField label="Reason"><Input /></FormField>)
    expect(screen.getByLabelText('Reason')).not.toHaveAttribute('aria-invalid')
    rerender(<FormField label="Reason" error="Required"><Input /></FormField>)
    expect(screen.getByLabelText('Reason')).toHaveAttribute('aria-invalid', 'true')
  })

  it('announces the error politely, never assertively', () => {
    render(<FormField label="Reason" error="Select a reason."><Input /></FormField>)
    const err = screen.getByText('Select a reason.').closest('[role]')
    // role="alert" would cut across the user mid-keystroke.
    expect(err).toHaveAttribute('role', 'status')
  })

  it('marks optional rather than required', () => {
    render(<FormField label="Note" optional><Input /></FormField>)
    expect(screen.getByText('optional')).toBeInTheDocument()
    expect(screen.queryByText('*')).not.toBeInTheDocument()
  })

  it('wires a Select the same way', () => {
    render(
      <FormField label="Reason" error="Pick one">
        <Select options={[{ value: 'a', label: 'A' }]} />
      </FormField>,
    )
    const trigger = screen.getByLabelText('Reason')
    expect(trigger).toHaveAttribute('aria-invalid', 'true')
    expect(trigger.getAttribute('aria-describedby')).toBeTruthy()
  })

  it('wires a Checkbox the same way', () => {
    render(
      <FormField label="Confirmation" as="group" error="You must confirm">
        <Checkbox label="I have written the passphrase down" />
      </FormField>,
    )
    const box = screen.getByRole('checkbox')
    expect(box).toHaveAttribute('aria-invalid', 'true')
    expect(box.getAttribute('aria-describedby')).toBeTruthy()
  })

  it('does not double-label a self-labelling control', () => {
    // A Checkbox labels itself. Pointing a second <label> at it concatenates
    // both into the accessible name — "Confirmation I have written the
    // passphrase down" — which is what this component used to do.
    render(
      <FormField label="Confirmation" as="group">
        <Checkbox label="I have written the passphrase down" />
      </FormField>,
    )
    expect(screen.getByRole('checkbox'))
      .toHaveAccessibleName('I have written the passphrase down')
  })

  it('exposes a group label for self-labelling controls', () => {
    render(
      <FormField label="Notifications" as="group">
        <Checkbox label="Email me" />
        <Checkbox label="Notify in app" />
      </FormField>,
    )
    expect(screen.getByRole('group', { name: 'Notifications' })).toBeInTheDocument()
  })

  it('still describes self-labelling controls from the group', () => {
    render(
      <FormField label="Confirmation" as="group" error="You must confirm">
        <Checkbox label="I have written the passphrase down" />
      </FormField>,
    )
    const box = screen.getByRole('checkbox')
    expect(box).toHaveAttribute('aria-invalid', 'true')
    expect(box.getAttribute('aria-describedby')).toBeTruthy()
  })

  it('stacks the label above the control rather than sharing its line', () => {
    // The Label is inline-flex and a Checkbox root is an inline span; as
    // siblings in a block container they shared a line and overlapped.
    const { container } = render(
      <FormField label="Confirmation" as="group">
        <Checkbox label="I have written the passphrase down" />
      </FormField>,
    )
    const field = container.firstElementChild as HTMLElement
    const styles = getComputedStyle(field)
    expect(styles.display).toBe('flex')
    expect(styles.flexDirection).toBe('column')
  })

  it('gives every field a unique id when several are on one page', () => {
    render(
      <>
        <FormField label="First"><Input /></FormField>
        <FormField label="Second"><Input /></FormField>
      </>,
    )
    const a = screen.getByLabelText('First')
    const b = screen.getByLabelText('Second')
    expect(a.id).not.toBe(b.id)
  })
})
