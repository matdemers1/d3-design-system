import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardTitle } from './Card'
import { Button } from '../Button/Button'

afterEach(() => vi.restoreAllMocks())

describe('Card — the nested-interactive rule', () => {
  it('is a plain div by default, not a clickable region', () => {
    const { container } = render(<Card><CardTitle>A</CardTitle></Card>)
    expect(container.firstElementChild?.tagName).toBe('DIV')
  })

  it('is a real anchor when it navigates', () => {
    render(<Card interactive href="/inbox/1"><CardTitle>A</CardTitle></Card>)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/inbox/1')
  })

  it('is a real button when it acts — never a div with onClick', () => {
    render(<Card interactive><CardTitle>A</CardTitle></Card>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('warns in development when an interactive card contains a control', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <Card interactive href="#">
        <CardTitle>Export fails silently</CardTitle>
        <Button>Merge</Button>
      </Card>,
    )
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('control inside a control'))
  })

  it('does not warn for a plain card that contains controls', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Card><CardTitle>A</CardTitle><Button>Merge</Button></Card>)
    expect(warn).not.toHaveBeenCalled()
  })
})
