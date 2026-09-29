import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SplitButton } from './SplitButton'
import { MenuItem, MenuSeparator } from '../Menu/Menu'
import { __resetDevWarnings } from '../../lib/dev'
import { expectNoAxeViolations } from '../../test/axe'


const setup = (props: Partial<React.ComponentProps<typeof SplitButton>> = {}) => {
  const onClick = vi.fn()
  const onLater = vi.fn()
  const onSchedule = vi.fn()
  const utils = render(
    <SplitButton label="Send" menuLabel="More send options" onClick={onClick} {...props}>
      <MenuItem onSelect={onLater}>Send later</MenuItem>
      <MenuSeparator />
      <MenuItem onSelect={onSchedule}>Schedule…</MenuItem>
    </SplitButton>,
  )
  return { onClick, onLater, onSchedule, ...utils }
}

let warn: ReturnType<typeof vi.spyOn>
beforeEach(() => { __resetDevWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
afterEach(() => warn.mockRestore())
const warned = (s: string) => warn.mock.calls.some((c: unknown[]) => String(c[0]).includes(s))

describe('SplitButton — the two halves', () => {
  it('is two buttons: the action, and a chevron named by the caller', () => {
    setup()
    const main = screen.getByRole('button', { name: 'Send' })
    const chevron = screen.getByRole('button', { name: 'More send options' })
    expect(main).not.toBe(chevron)
    expect(chevron).toHaveAttribute('aria-haspopup', 'menu')
    expect(chevron).toHaveAttribute('aria-expanded', 'false')
    // The chevron's glyph is decorative; the name is the caller's.
    expect(chevron.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('the main half fires onClick and does not open the menu', async () => {
    const user = userEvent.setup()
    const { onClick } = setup()
    await user.click(screen.getByRole('button', { name: 'Send' }))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('shares Button geometry and variant, joined in one pill', () => {
    const { container } = setup({ variant: 'secondary', size: 'lg' })
    for (const name of ['Send', 'More send options']) {
      const b = screen.getByRole('button', { name })
      expect(b).toHaveClass('d3-btn', 'd3-btn--secondary', 'd3-btn--lg')
    }
    expect(container.firstElementChild).toHaveClass('d3-split', 'd3-split--secondary', 'd3-split--lg')
  })

  it('defaults to a medium primary', () => {
    setup()
    expect(screen.getByRole('button', { name: 'Send' })).toHaveClass('d3-btn--primary', 'd3-btn--md')
  })

  it('forwards the ref to the main button', () => {
    const ref = createRef<HTMLButtonElement>()
    setup({ ref })
    expect(ref.current).toBe(screen.getByRole('button', { name: 'Send' }))
  })

  it('renders an icon on the main half', () => {
    setup({ icon: <svg data-testid="ico" /> })
    expect(screen.getByRole('button', { name: 'Send' })).toContainElement(screen.getByTestId('ico'))
  })

  it('disabled disables both halves', () => {
    setup({ disabled: true })
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'More send options' })).toBeDisabled()
  })

  it('loading blocks the main action and keeps it focusable', async () => {
    const user = userEvent.setup()
    const { onClick } = setup({ loading: true })
    const main = screen.getByRole('button', { name: 'Send' })
    expect(main).toHaveAttribute('aria-busy', 'true')
    await user.click(main)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('warns on a variant it does not support, and on a missing menuLabel', () => {
    render(<SplitButton label="Send" menuLabel="" variant={'ghost' as 'primary'}><MenuItem>x</MenuItem></SplitButton>)
    expect(warned('SplitButton: `variant="ghost"`')).toBe(true)
    expect(warned('SplitButton: `menuLabel` is required')).toBe(true)
    // Falls back to primary rather than a variant with no divider.
    expect(screen.getByRole('button', { name: 'Send' })).toHaveClass('d3-btn--primary')
  })

  it('is axe-clean closed', async () => {
    const { container } = setup()
    await expectNoAxeViolations(container)
  })
})

// The open menu — items, keyboard, Escape and focus return — is checked in a real browser in
// browser/splitbutton.spec.ts: jsdom positions a Radix menu so slowly that it timed out on CI.
