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
