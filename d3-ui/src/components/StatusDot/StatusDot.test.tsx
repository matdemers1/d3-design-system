import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusDot } from './StatusDot'
import { __resetDevWarnings } from '../../lib/dev'

describe('StatusDot — the contract', () => {
  it('hides the dot from assistive technology and keeps the text', () => {
    const { container } = render(<StatusDot>Running</StatusDot>)
    const dot = container.querySelector('.d3-sdot__dot')
    expect(dot).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('Running')).toBeInTheDocument()
  })

  it('is neutral by default (D-016)', () => {
    render(<StatusDot>Running</StatusDot>)
    expect(screen.getByText('Running').className).toContain('d3-sdot--neutral')
  })

  it.each(['neutral', 'attention', 'warning', 'danger', 'idle'] as const)('maps tone %s to a class', (tone) => {
    render(<StatusDot tone={tone}>{tone} text</StatusDot>)
    expect(screen.getByText(`${tone} text`).className).toContain(`d3-sdot--${tone}`)
  })

  it('is not interactive', () => {
    render(<StatusDot>Running</StatusDot>)
    expect(screen.getByText('Running')).not.toHaveAttribute('tabindex')
  })

  it('sizes sm and md', () => {
    render(<StatusDot size="sm">Small</StatusDot>)
    expect(screen.getByText('Small').className).toContain('d3-sdot--sm')
  })
})

describe('StatusDot — development warnings', () => {
  let warn: ReturnType<typeof vi.spyOn>
  beforeEach(() => { __resetDevWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
  afterEach(() => warn.mockRestore())

  it('warns on a tone outside the set', () => {
    // @ts-expect-error — a JS caller can pass anything
    render(<StatusDot tone="success">Up</StatusDot>)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('StatusDot: `tone="success"`'))
  })

  it('does not warn on a valid tone', () => {
    render(<StatusDot tone="idle">Off</StatusDot>)
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('StatusDot — warning (D-086)', () => {
  it('is a tone in the set, so it does not warn', () => {
    __resetDevWarnings()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<StatusDot tone="warning">Delayed</StatusDot>)
    expect(screen.getByText('Delayed').className).toContain('d3-sdot--warning')
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})
