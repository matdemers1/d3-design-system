import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button — the contract', () => {
  it('activates with Enter and with Space', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save changes</Button>)
    screen.getByRole('button').focus()
    await user.keyboard('{Enter}')
    await user.keyboard(' ')
    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it('defaults to type="button" so it cannot submit a form by accident', () => {
    render(<Button>Save changes</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('while loading: marks aria-busy, blocks activation, and stays focusable', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button loading onClick={onClick}>Save changes</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-busy', 'true')
    await user.click(btn)
    expect(onClick).not.toHaveBeenCalled()
    // Focus must not be lost mid-action — a disabled button would drop it.
    btn.focus()
    expect(btn).toHaveFocus()
    expect(btn).not.toBeDisabled()
  })

  it('keeps its label unchanged while loading, so it does not resize', () => {
    const { rerender } = render(<Button>Save changes</Button>)
    const before = screen.getByRole('button').textContent
    rerender(<Button loading>Save changes</Button>)
    expect(screen.getByRole('button').textContent).toBe(before)
  })

  it('hides decorative icons from assistive technology', () => {
    render(<Button icon={<svg data-testid="ic" />}>New item</Button>)
    expect(screen.getByTestId('ic').parentElement).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('button')).toHaveAccessibleName('New item')
  })

  it('ships no margin — spacing belongs to the parent', () => {
    render(<Button>Save changes</Button>)
    expect(getComputedStyle(screen.getByRole('button')).margin).toBe('0px')
  })
})

describe('pressed — a toggle is a button that stays down', () => {
  it('reports its state, and says nothing when it is not a toggle', () => {
    const { rerender } = render(<Button pressed={false}>Live</Button>)
    expect(screen.getByRole('button', { name: 'Live' })).toHaveAttribute('aria-pressed', 'false')
    rerender(<Button pressed>Live</Button>)
    expect(screen.getByRole('button', { name: 'Live' })).toHaveAttribute('aria-pressed', 'true')
    // A plain action must not claim a state it does not have: `aria-pressed`
    // present and false turns every button in the app into a toggle that is off.
    rerender(<Button>Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' })).not.toHaveAttribute('aria-pressed')
  })
})
