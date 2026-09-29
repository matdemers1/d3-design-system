import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Switch } from './Switch'
import { __resetDevWarnings } from '../../lib/dev'

describe('Switch — semantics', () => {
  it('is a real button with role=switch and aria-checked', () => {
    render(<Switch>Notifications</Switch>)
    const sw = screen.getByRole('switch', { name: 'Notifications' })
    expect(sw.tagName).toBe('BUTTON')
    expect(sw).toHaveAttribute('type', 'button')
    expect(sw).toHaveAttribute('aria-checked', 'false')
  })

  it('reflects checked and defaultChecked', () => {
    const { rerender } = render(<Switch checked>A</Switch>)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
    rerender(<Switch checked={false}>A</Switch>)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
  })

  it('names itself from aria-labelledby', () => {
    render(<><span id="row">Read receipts</span><Switch aria-labelledby="row" /></>)
    expect(screen.getByRole('switch', { name: 'Read receipts' })).toBeInTheDocument()
  })

  it('forwards ref and rest props to the button', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<Switch ref={ref} data-testid="x" aria-describedby="hint">A</Switch>)
    expect(ref.current).toBe(screen.getByRole('switch'))
    expect(screen.getByTestId('x')).toBe(ref.current)
    expect(ref.current).toHaveAttribute('aria-describedby', 'hint')
  })
})

describe('Switch — keyboard and pointer', () => {
  it.each([['Space', ' '], ['Enter', '{Enter}']])('toggles with %s', async (_n, key) => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Switch checked={false} onCheckedChange={onChange}>A</Switch>)
    screen.getByRole('switch').focus()
    await user.keyboard(key)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('is one tab stop', async () => {
    const user = userEvent.setup()
    render(<Switch>A</Switch>)
    await user.tab()
    expect(screen.getByRole('switch')).toHaveFocus()
  })

  it('makes the label part of the click target', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Switch checked={false} onCheckedChange={onChange}>Notify me</Switch>)
    await user.click(screen.getByText('Notify me'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Switch checked={false} disabled onCheckedChange={onChange}>A</Switch>)
    const sw = screen.getByRole('switch')
    expect(sw).toBeDisabled()
    await user.click(sw)
    await user.click(screen.getByText('A'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('calls the consumer onClick and honours preventDefault', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Switch defaultChecked={false} onClick={(e) => e.preventDefault()} onCheckedChange={onChange}>A</Switch>)
    await user.click(screen.getByRole('switch'))
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
  })
})

describe('Switch — controlled and uncontrolled', () => {
  it('uncontrolled: flips its own state, starting from defaultChecked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Switch defaultChecked onCheckedChange={onChange}>A</Switch>)
    const sw = screen.getByRole('switch')
    expect(sw).toHaveAttribute('aria-checked', 'true')
    await user.click(sw)
    expect(sw).toHaveAttribute('aria-checked', 'false')
    expect(onChange).toHaveBeenLastCalledWith(false)
    await user.click(sw)
    expect(sw).toHaveAttribute('aria-checked', 'true')
    expect(onChange).toHaveBeenLastCalledWith(true)
  })

  it('controlled: reports the request but only the parent changes the state', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { rerender } = render(<Switch checked={false} onCheckedChange={onChange}>A</Switch>)
    const sw = screen.getByRole('switch')
    await user.click(sw)
    expect(onChange).toHaveBeenCalledWith(true)
    expect(sw).toHaveAttribute('aria-checked', 'false')
    rerender(<Switch checked onCheckedChange={onChange}>A</Switch>)
    expect(sw).toHaveAttribute('aria-checked', 'true')
    await user.click(sw)
    expect(onChange).toHaveBeenLastCalledWith(false)
  })
})

describe('Switch — dev warning', () => {
  beforeEach(() => __resetDevWarnings())

  it('warns when nothing names it', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Switch />)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]![0]).toContain('Switch')
    warn.mockRestore()
  })

  it('stays quiet with children, aria-label or aria-labelledby', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<><Switch>A</Switch><Switch aria-label="B" /><Switch aria-labelledby="x" /></>)
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})
