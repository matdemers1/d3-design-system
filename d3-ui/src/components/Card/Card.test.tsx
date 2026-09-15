import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardBody, CardTitle } from './Card'
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

describe('Card — the element it renders', () => {
  it('is a titled region when it is a section with a heading title', () => {
    render(
      <Card as="section" aria-labelledby="t">
        <CardTitle as="h2" id="t">Restore drill</CardTitle>
      </Card>,
    )
    expect(screen.getByRole('region', { name: 'Restore drill' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Restore drill' })).toHaveClass('d3-crd__title')
  })

  it('keeps its own class when the app adds one to a part', () => {
    const { container } = render(<Card><CardTitle className="x">A</CardTitle><CardBody className="y">B</CardBody></Card>)
    expect(container.querySelector('.d3-crd__title.x')).not.toBeNull()
    expect(container.querySelector('.d3-crd__body.y')).not.toBeNull()
  })

  it('ignores `as` when interactive, and falls back to a div for an unknown element', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Card interactive as="section">A</Card>)
    expect(screen.getByRole('button')).toBeInTheDocument()
    const { container } = render(<Card as={'span' as never}>B</Card>)
    expect(container.firstElementChild?.tagName).toBe('DIV')
    expect(warn.mock.calls.some((c) => String(c[0]).includes('Card: `as="span"`'))).toBe(true)
  })
})

