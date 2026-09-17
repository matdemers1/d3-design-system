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
