import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FilterBar } from './FilterBar'
import { FormField } from '../FormField/FormField'
import { Input } from '../Input/Input'
import { Button } from '../Button/Button'

describe('FilterBar', () => {
  it('is a named group when it has a name', () => {
    render(
      <FilterBar aria-label="Filter the audit trail">
        <FormField label="Since"><Input type="date" /></FormField>
      </FilterBar>,
    )
    expect(screen.getByRole('group', { name: 'Filter the audit trail' })).toHaveClass('d3-fb')
  })

  it('is not a group without a name — an unnamed group says nothing', () => {
    const { container } = render(<FilterBar><FormField label="Since"><Input type="date" /></FormField></FilterBar>)
    expect(container.firstElementChild).not.toHaveAttribute('role')
  })

  it('keeps every control labelled by its visible label', () => {
    render(
      <FilterBar aria-label="Filter">
        <FormField label="Search"><Input type="search" /></FormField>
        <FormField label="Since"><Input type="date" /></FormField>
      </FilterBar>,
    )
    expect(screen.getByLabelText('Search')).toBeInTheDocument()
    expect(screen.getByLabelText('Since')).toBeInTheDocument()
  })

  it('puts the trailing slot after the controls', () => {
    const { container } = render(
      <FilterBar trailing={<><span>248 events</span><Button>Export</Button></>}>
        <FormField label="Since"><Input type="date" /></FormField>
      </FilterBar>,
    )
    const [controls, trailing] = [...container.firstElementChild!.children]
    expect(controls).toHaveClass('d3-fb__controls')
    expect(trailing).toHaveClass('d3-fb__trailing')
    expect(trailing?.textContent).toContain('248 events')
  })

  it('renders no trailing slot when there is none', () => {
    const { container } = render(<FilterBar><span>x</span></FilterBar>)
    expect(container.querySelector('.d3-fb__trailing')).toBeNull()
  })
})
