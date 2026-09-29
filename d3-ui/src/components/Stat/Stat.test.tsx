import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Stat, StatGroup } from './Stat'
import { StatusDot } from '../StatusDot/StatusDot'

describe('Stat — the contract', () => {
  it('reads label, then value, then unit', () => {
    const { container } = render(<Stat label="Certificates" value="89" unit="days" />)
    expect(container.textContent).toBe('Certificates89days')
    expect(screen.getByText('Certificates').className).toContain('d3-stat__label')
    expect(screen.getByText('89').className).toContain('d3-stat__number')
    expect(screen.getByText('days').className).toContain('d3-stat__unit')
  })

  it('renders no unit or footnote element when none is given', () => {
    const { container } = render(<Stat label="Queue" value="0" />)
    expect(container.querySelector('.d3-stat__unit')).toBeNull()
    expect(container.querySelector('.d3-stat__foot')).toBeNull()
  })

  it('reads the status after the value and before the footnote', () => {
    const { container } = render(
      <Stat label="Mail flow" value="Delivering" status={<StatusDot>Healthy</StatusDot>} footnote="4 min ago" />,
    )
    expect(container.textContent).toBe('Mail flowDeliveringHealthy4 min ago')
    expect(container.querySelector('.d3-sdot__dot')).toHaveAttribute('aria-hidden', 'true')
  })

  it('keeps 0 as a value', () => {
    render(<Stat label="Queue" value={0} />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('uses tabular figures on the value', async () => {
    const css = await import('./Stat.css?raw')
    expect(css.default).toMatch(/\.d3-stat__number\s*\{[^}]*font-variant-numeric:\s*tabular-nums/)
  })
})

describe('StatGroup', () => {
  it('holds its tiles as direct children, in order', () => {
    const { container } = render(
      <StatGroup role="group" aria-label="Summary">
        <Stat label="A" value="1" />
        <Stat label="B" value="2" />
      </StatGroup>,
    )
    expect(screen.getByRole('group', { name: 'Summary' })).toBeInTheDocument()
    const tiles = container.querySelectorAll('.d3-stat-group > .d3-stat')
    expect(tiles).toHaveLength(2)
  })
})
