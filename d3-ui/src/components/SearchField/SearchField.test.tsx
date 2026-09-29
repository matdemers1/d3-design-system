import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SearchField } from './SearchField'
import { expectNoAxeViolations } from '../../test/axe'

describe('SearchField', () => {
  it('is a search input on the filled field, with a leading glyph', () => {
    render(<SearchField aria-label="Search mail" />)
    const input = screen.getByRole('searchbox', { name: 'Search mail' })
    const frame = input.parentElement!
    expect(frame).toHaveClass('d3-inp', 'd3-inp--filled', 'd3-search')
    expect(frame).not.toHaveClass('d3-inp--md')
    expect(frame.querySelector('.d3-inp__affix svg')).not.toBeNull()
  })

  it('draws the shortcut as a hidden hint and announces it through aria-keyshortcuts', () => {
    render(<SearchField aria-label="Search mail" shortcut="/" />)
    const input = screen.getByRole('searchbox', { name: 'Search mail' })
    expect(input).toHaveAttribute('aria-keyshortcuts', '/')
    const kbd = input.parentElement!.querySelector('kbd')!
    expect(kbd).toHaveTextContent('/')
    expect(kbd.closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('keeps a given placeholder and forwards the ref', () => {
    let el: HTMLInputElement | null = null
    render(<SearchField aria-label="Search" placeholder="Search mail" ref={(n) => { el = n }} />)
    expect(el).toBeInstanceOf(HTMLInputElement)
    expect(el!.placeholder).toBe('Search mail')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<SearchField aria-label="Search mail" shortcut="/" />)
    await expectNoAxeViolations(container)
  })
})
