import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge, CountBadge } from './Badge'

describe('Badge — the contract', () => {
  it('is not interactive', () => {
    render(<Badge>In review</Badge>)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByText('In review')).not.toHaveAttribute('tabindex')
  })

  it('states the status in words, so colour is never the only signal', () => {
    render(<Badge tone="danger">Blocked</Badge>)
    expect(screen.getByText('Blocked')).toBeInTheDocument()
  })

  it('offers three tones and no colour prop', () => {
    const { rerender } = render(<Badge tone="neutral">A</Badge>)
    expect(screen.getByText('A').className).toContain('d3-bdg--neutral')
    rerender(<Badge tone="attention">A</Badge>)
    expect(screen.getByText('A').className).toContain('d3-bdg--attention')
    rerender(<Badge tone="danger">A</Badge>)
    expect(screen.getByText('A').className).toContain('d3-bdg--danger')
  })
})

describe('CountBadge — the contract', () => {
  it('names what is counted rather than reading a bare number', () => {
    render(<CountBadge count={48} label="48 unread items" />)
    expect(screen.getByLabelText('48 unread items')).toBeInTheDocument()
  })

  it('groups above 999', () => {
    render(<CountBadge count={1204} label="1,204 votes" />)
    expect(screen.getByText('1,204')).toBeInTheDocument()
  })

  it('caps at max', () => {
    render(<CountBadge count={340} max={99} label="340 unread" />)
    expect(screen.getByText('99+')).toBeInTheDocument()
  })
})
