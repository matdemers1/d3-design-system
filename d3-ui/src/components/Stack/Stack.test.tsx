import { describe, it, expect, vi, afterEach } from 'vitest'
import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { Stack } from './Stack'
import { Cluster } from './Cluster'
import { __resetDevWarnings } from '../../lib/dev'

afterEach(() => { vi.restoreAllMocks(); __resetDevWarnings() })

describe('Stack', () => {
  it('spaces its children by a step of the scale, 16 by default', () => {
    const { container } = render(<Stack><span>a</span></Stack>)
    expect(container.firstElementChild).toHaveClass('d3-stack', 'd3-gap-16', 'd3-align-stretch')
  })

  it('maps a gap name to the class for that step and no other', () => {
    const { container } = render(<Stack gap="24" align="start" justify="between" />)
    const el = container.firstElementChild!
    expect(el).toHaveClass('d3-gap-24', 'd3-align-start', 'd3-justify-between')
    expect([...el.classList].filter((c) => c.startsWith('d3-gap-'))).toEqual(['d3-gap-24'])
  })

  it('warns, and uses the default step, for a gap that is not on the scale', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { container } = render(<Stack gap={'15' as never} />)
    expect(container.firstElementChild).toHaveClass('d3-gap-16')
    expect(warn.mock.calls.some((c) => String(c[0]).includes('Stack: `gap="15"`'))).toBe(true)
  })

  it('renders the element it is given, and a list keeps its semantics', () => {
    render(<Stack as="ul"><li>One</li><li>Two</li></Stack>)
    expect(screen.getByRole('list')).toHaveClass('d3-stack')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('falls back to a div for an element it does not support', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { container } = render(<Stack as={'table' as never} />)
    expect(container.firstElementChild?.tagName).toBe('DIV')
  })

  it('forwards its ref', () => {
    const ref = createRef<HTMLElement>()
    render(<Stack ref={ref} as="section" aria-label="x" />)
    expect(ref.current?.tagName).toBe('SECTION')
  })
})

describe('Cluster', () => {
  it('is a wrapping row, 8 apart and centred by default', () => {
    const { container } = render(<Cluster><span>a</span></Cluster>)
    expect(container.firstElementChild).toHaveClass('d3-cluster', 'd3-gap-8', 'd3-align-center')
  })

  it('takes a step name, alignment and justification', () => {
    const { container } = render(<Cluster gap="4" align="baseline" justify="end" />)
    expect(container.firstElementChild).toHaveClass('d3-gap-4', 'd3-align-baseline', 'd3-justify-end')
  })

  it('warns on an alignment it does not have', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Cluster align={'top' as never} />)
    expect(warn.mock.calls.some((c) => String(c[0]).includes('Cluster: `align="top"`'))).toBe(true)
  })
})
