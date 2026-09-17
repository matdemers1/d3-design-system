import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Grid } from './Grid'
import { __resetDevWarnings } from '../../lib/dev'

afterEach(() => { vi.restoreAllMocks(); __resetDevWarnings() })

describe('Grid', () => {
  it('lays out tiles with the small minimum by default', () => {
    const { container } = render(<Grid><div>a</div></Grid>)
    expect(container.firstElementChild).toHaveClass('d3-grid', 'd3-grid--sm')
  })

  it.each(['sm', 'md', 'lg'] as const)('takes the %s minimum tile width', (min) => {
    const { container } = render(<Grid minItemWidth={min} />)
    expect(container.firstElementChild).toHaveClass(`d3-grid--${min}`)
  })

  it('is a list when the tiles are a list', () => {
    render(<Grid as="ul"><li>Database</li><li>Mail</li></Grid>)
    expect(screen.getByRole('list')).toHaveClass('d3-grid')
  })

  it('warns and falls back for a minimum it does not have', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { container } = render(<Grid minItemWidth={'16rem' as never} />)
    expect(container.firstElementChild).toHaveClass('d3-grid--sm')
    expect(warn.mock.calls.some((c) => String(c[0]).includes('Grid: `minItemWidth="16rem"`'))).toBe(true)
  })
})
