import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Select } from './Select'

const OPTIONS = [
  { value: 'web', label: 'Web app', description: 'A server that can keep a secret' },
  { value: 'native', label: 'Native app', description: 'No secret' },
]

describe('Select', () => {
  it('shows only the chosen label in the trigger, not its description', () => {
    render(<Select aria-label="Kind" options={OPTIONS} defaultValue="web" />)
    const trigger = screen.getByRole('combobox', { name: 'Kind' })
    expect(trigger).toHaveTextContent('Web app')
    expect(trigger).not.toHaveTextContent('A server that can keep a secret')
  })
})

describe('Select — appearance', () => {
  const options = [{ value: 'plain', label: 'Plain text' }]
  it('outlined by default; filled swaps the size class for the filled frame', () => {
    const { rerender } = render(<Select aria-label="Format" options={options} />)
    expect(screen.getByRole('combobox', { name: 'Format' })).toHaveClass('d3-inp--md')
    rerender(<Select aria-label="Format" options={options} appearance="filled" />)
    const trigger = screen.getByRole('combobox', { name: 'Format' })
    expect(trigger).toHaveClass('d3-inp--filled', 'd3-sel')
    expect(trigger).not.toHaveClass('d3-inp--md')
  })
})

describe('Select — the chevron (D-087)', () => {
  it('draws its own chevron glyph rather than a font character, in both appearances', () => {
    const opts = [{ value: 'a', label: 'A' }]
    const { rerender } = render(<Select aria-label="Format" options={opts} value="a" />)
    const affix = () => screen.getByRole('combobox', { name: 'Format' }).querySelector('.d3-inp__affix')!
    expect(affix().querySelector('svg')).not.toBeNull()
    expect(affix().textContent).not.toContain('▾')
    rerender(<Select aria-label="Format" appearance="filled" options={opts} value="a" />)
    expect(affix().querySelector('svg')).not.toBeNull()
  })

  it('still takes a chevronIcon', () => {
    render(<Select aria-label="Format" options={[{ value: 'a', label: 'A' }]} value="a" chevronIcon={<i data-testid="mine" />} />)
    expect(screen.getByTestId('mine')).toBeInTheDocument()
  })
})
