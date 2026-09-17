import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormActions } from './FormActions'
import { Button } from '../Button/Button'
import { __resetDevWarnings } from '../../lib/dev'

afterEach(() => { vi.restoreAllMocks(); __resetDevWarnings() })

const warned = (spy: ReturnType<typeof vi.spyOn>, fragment: string) =>
  spy.mock.calls.some((c: unknown[]) => String(c[0]).includes(fragment))

describe('FormActions — the order', () => {
  it('keeps the buttons in the order written: primary last', () => {
    render(<FormActions><Button>Cancel</Button><Button variant="primary">Save</Button></FormActions>)
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['Cancel', 'Save'])
  })

  it('puts the leading action first in the DOM when the actions are end-aligned', () => {
    const { container } = render(
      <FormActions leading={<Button variant="danger-ghost">Delete</Button>}>
        <Button>Cancel</Button><Button variant="primary">Save</Button>
      </FormActions>,
    )
    expect(container.firstElementChild).toHaveClass('d3-fa--end')
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['Delete', 'Cancel', 'Save'])
  })

  it('puts the leading action last in the DOM when the actions are start-aligned', () => {
    const { container } = render(
      <FormActions align="start" leading={<Button variant="danger-ghost">Delete</Button>}>
        <Button>Cancel</Button><Button variant="primary">Save</Button>
      </FormActions>,
    )
    expect(container.firstElementChild).toHaveClass('d3-fa--start')
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['Cancel', 'Save', 'Delete'])
  })

  it('tabs through the buttons in DOM order', async () => {
    const user = userEvent.setup()
    render(
      <FormActions leading={<Button variant="danger-ghost">Delete</Button>}>
        <Button>Cancel</Button><Button variant="primary">Save</Button>
      </FormActions>,
    )
    const seen: string[] = []
    for (let i = 0; i < 3; i++) { await user.tab(); seen.push(document.activeElement?.textContent ?? '') }
    expect(seen).toEqual(['Delete', 'Cancel', 'Save'])
  })

  it('renders no leading group when there is no leading action', () => {
    const { container } = render(<FormActions><Button variant="primary">Save</Button></FormActions>)
    expect(container.querySelector('.d3-fa__leading')).toBeNull()
  })
})

describe('FormActions — one primary, last', () => {
  it('warns about a second primary', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<FormActions><Button variant="primary">Save</Button><Button variant="primary">Publish</Button></FormActions>)
    expect(warned(warn, 'more than one primary')).toBe(true)
  })

  it('warns about a primary that is not last', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<FormActions><Button variant="primary">Save</Button><Button>Cancel</Button></FormActions>)
    expect(warned(warn, 'put the primary action last')).toBe(true)
  })

  it('does not warn for the documented shape', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<FormActions><Button>Cancel</Button><Button variant="primary">Save</Button></FormActions>)
    expect(warn).not.toHaveBeenCalled()
  })
})
