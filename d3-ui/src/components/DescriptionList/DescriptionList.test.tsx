import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DescriptionItem, DescriptionList } from './DescriptionList'
import { Badge } from '../Badge/Badge'
import { __resetDevWarnings } from '../../lib/dev'

afterEach(() => { vi.restoreAllMocks(); __resetDevWarnings() })

describe('DescriptionList', () => {
  it('is a real dl of terms and definitions', () => {
    const { container } = render(
      <DescriptionList>
        <DescriptionItem term="Username">@matt</DescriptionItem>
        <DescriptionItem term="Kind"><Badge>admin</Badge></DescriptionItem>
      </DescriptionList>,
    )
    const dl = container.querySelector('dl')!
    expect(dl).toHaveClass('d3-desc')
    expect(screen.getAllByRole('term').map((t) => t.textContent)).toEqual(['Username', 'Kind'])
    expect(screen.getAllByRole('definition').map((d) => d.textContent)).toEqual(['@matt', 'admin'])
    // Each pair is grouped in a div — the only wrapper a dl allows.
    expect([...dl.children].every((c) => c.tagName === 'DIV')).toBe(true)
  })

  it('gives a numeric value tabular figures', () => {
    render(<DescriptionList><DescriptionItem term="People" numeric>1,204</DescriptionItem></DescriptionList>)
    expect(screen.getByRole('definition')).toHaveClass('d3-desc__value--numeric')
  })

  it('leaves a text value proportional', () => {
    render(<DescriptionList><DescriptionItem term="Name">Matt</DescriptionItem></DescriptionList>)
    expect(screen.getByRole('definition')).not.toHaveClass('d3-desc__value--numeric')
  })

  it('warns in development when an item has no term', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<DescriptionList><DescriptionItem term="">x</DescriptionItem></DescriptionList>)
    expect(warn.mock.calls.some((c) => String(c[0]).includes('DescriptionItem: `term` is required'))).toBe(true)
  })
})
