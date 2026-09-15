import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CodeInput } from './CodeInput'
import { FormField } from '../FormField/FormField'

const boxes = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('.d3-code__slot')).map((s) => s.textContent ?? '')

describe('CodeInput — one control, drawn as boxes', () => {
  it('is a single labelled field, and the boxes are hidden from assistive technology', () => {
    const { container } = render(
      <FormField label="Code from your authenticator"><CodeInput /></FormField>,
    )
    expect(screen.getAllByRole('textbox')).toHaveLength(1)
    expect(screen.getByLabelText('Code from your authenticator')).toHaveAttribute('autocomplete', 'one-time-code')
    expect(container.querySelector('.d3-code__slots')).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelectorAll('.d3-code__slot')).toHaveLength(6)
  })

  it('raises the number pad for digits and keeps only digits', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { container } = render(<CodeInput aria-label="Code" onValueChange={onValueChange} />)
    const input = screen.getByLabelText('Code')
    expect(input).toHaveAttribute('inputmode', 'numeric')
    await user.type(input, '4a8 2')
    expect(input).toHaveValue('482')
    expect(boxes(container).slice(0, 4)).toEqual(['4', '8', '2', ''])
  })

  it('a pasted code fills every box and completes at once', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<CodeInput aria-label="Code" onComplete={onComplete} />)
    await user.click(screen.getByLabelText('Code'))
    await user.paste('482 913')
    expect(screen.getByLabelText('Code')).toHaveValue('482913')
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith('482913')
  })

  it('alphanumeric mode takes a dashed, lower-case recovery code as written', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <CodeInput aria-label="Reset code" mode="alphanumeric" length={12} groups={[4, 4, 4]} />,
    )
    await user.click(screen.getByLabelText('Reset code'))
    await user.paste('abcd-efgh-jklm')
    expect(screen.getByLabelText('Reset code')).toHaveValue('ABCDEFGHJKLM')
    // Two drawn separators, never part of the value.
    expect(container.querySelectorAll('.d3-code__sep')).toHaveLength(2)
  })

  it('never takes more than its length', async () => {
    const user = userEvent.setup()
    render(<CodeInput aria-label="Code" length={4} />)
    await user.click(screen.getByLabelText('Code'))
    await user.paste('123456789')
    expect(screen.getByLabelText('Code')).toHaveValue('1234')
  })

  it('typing onto a filled box replaces it instead of pushing the rest along', async () => {
    const user = userEvent.setup()
    render(<CodeInput aria-label="Code" defaultValue="123456" />)
    const input = screen.getByLabelText('Code') as HTMLInputElement
    await user.click(input)
    // Moved the way a person moves it: arrow keys release any caret the
    // component was holding, and the browser moves the real one.
    await user.keyboard('{End}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}')
    await user.keyboard('9')
    expect(input).toHaveValue('129456')
    // And the next character goes into the next box, not the same one again.
    await user.keyboard('8')
    expect(input).toHaveValue('129856')
  })

  it('fires onComplete again after a rejected code is cleared and retyped', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    function Harness() {
      const [v, setV] = useState('')
      return (
        <>
          <CodeInput aria-label="Code" length={4} value={v} onValueChange={setV} onComplete={onComplete} />
          <button onClick={() => setV('')}>clear</button>
        </>
      )
    }
    render(<Harness />)
    await user.click(screen.getByLabelText('Code'))
    await user.keyboard('1111')
    await user.click(screen.getByText('clear'))
    await user.click(screen.getByLabelText('Code'))
    await user.keyboard('2222')
    expect(onComplete).toHaveBeenCalledTimes(2)
    expect(onComplete).toHaveBeenLastCalledWith('2222')
  })

  it('fires onComplete for a pasted code after the app cleared a rejected one', async () => {
    // Retyping re-arms completion one keystroke at a time; a paste goes from
    // empty to full in one change, so only clearing from outside can re-arm it.
    const user = userEvent.setup()
    const onComplete = vi.fn()
    function Harness() {
      const [v, setV] = useState('')
      return (
        <>
          <CodeInput aria-label="Code" length={4} value={v} onValueChange={setV} onComplete={onComplete} />
          <button onClick={() => setV('')}>clear</button>
        </>
      )
    }
    render(<Harness />)
    await user.click(screen.getByLabelText('Code'))
    await user.paste('1111')
    await user.click(screen.getByText('clear'))
    await user.click(screen.getByLabelText('Code'))
    await user.paste('2222')
    expect(onComplete).toHaveBeenCalledTimes(2)
    expect(onComplete).toHaveBeenLastCalledWith('2222')
  })

  it('a rejection is invalid to assistive technology, not only a shake', () => {
    const { container } = render(<CodeInput aria-label="Code" status="error" />)
    expect(screen.getByLabelText('Code')).toHaveAttribute('aria-invalid', 'true')
    expect(container.firstChild).toHaveClass('d3-code--reject')
  })

  it('takes its error wiring from FormField', () => {
    render(
      <FormField label="Code" error="That code was not accepted."><CodeInput /></FormField>,
    )
    const input = screen.getByLabelText('Code')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input.getAttribute('aria-describedby')).toBeTruthy()
    expect(document.getElementById(input.getAttribute('aria-describedby')!.split(' ')[0]!))
      .toHaveTextContent('That code was not accepted.')
  })

  it('masked draws dots and never the characters', () => {
    const { container } = render(<CodeInput aria-label="PIN" masked defaultValue="2718" length={4} />)
    expect(boxes(container)).toEqual(['•', '•', '•', '•'])
    expect(container.textContent).not.toContain('2718')
    expect(screen.getByLabelText('PIN')).toHaveAttribute('type', 'password')
  })

  it('says its length to a screen reader, since the boxes cannot', () => {
    render(<FormField label="Code" help="From your authenticator."><CodeInput /></FormField>)
    render(<CodeInput aria-label="Reset code" mode="alphanumeric" length={12} />)
    const described = (label: string) => screen.getByLabelText(label).getAttribute('aria-describedby')!
      .split(' ').map((id) => document.getElementById(id)?.textContent).join(' | ')
    expect(described('Code')).toContain('From your authenticator.')
    expect(described('Code')).toContain('6 digits')
    expect(described('Reset code')).toContain('12 characters, letters and numbers')
  })

  it('a masked PIN does not offer itself as a one-time code, and an unmasked code is not hidden from password managers', () => {
    render(<CodeInput aria-label="PIN" masked length={4} />)
    render(<CodeInput aria-label="Code" />)
    expect(screen.getByLabelText('PIN')).toHaveAttribute('autocomplete', 'off')
    expect(screen.getByLabelText('Code')).toHaveAttribute('autocomplete', 'one-time-code')
    expect(screen.getByLabelText('Code')).not.toHaveAttribute('data-1p-ignore')
  })

  it('draws a caret only in the box that has focus', async () => {
    const user = userEvent.setup()
    const { container } = render(<CodeInput aria-label="Code" defaultValue="12" />)
    expect(container.querySelector('.d3-code__caret')).toBeNull()
    await user.click(screen.getByLabelText('Code'))
    const active = container.querySelector('.d3-code__slot--active')
    expect(active).not.toBeNull()
    expect(Array.from(container.querySelectorAll('.d3-code__slot')).indexOf(active!)).toBe(2)
    expect(active!.querySelector('.d3-code__caret')).not.toBeNull()
  })
})
