import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Page } from './Page'
import { __resetDevWarnings } from '../../lib/dev'

afterEach(() => { vi.restoreAllMocks(); __resetDevWarnings() })

describe('Page — the container', () => {
  it('is a div by default, because the app shell owns <main>', () => {
    const { container } = render(<Page>Content</Page>)
    expect(container.firstElementChild?.tagName).toBe('DIV')
    expect(screen.queryByRole('main')).toBeNull()
  })

  it('is the main landmark when asked, for a page with no shell', () => {
    render(<Page as="main">Content</Page>)
    expect(screen.getByRole('main')).toHaveClass('d3-page')
  })

  it.each(['wide', 'narrow', 'form', 'prose'] as const)('takes the %s container width', (width) => {
    const { container } = render(<Page width={width}>Content</Page>)
    expect(container.firstElementChild).toHaveClass(`d3-page--${width}`)
  })

  it('sits on the start edge unless asked to centre', () => {
    const { container, rerender } = render(<Page width="narrow">Content</Page>)
    expect(container.firstElementChild).not.toHaveClass('d3-page--center')
    rerender(<Page width="narrow" align="center">Content</Page>)
    expect(container.firstElementChild).toHaveClass('d3-page--center')
  })

  it('defaults to wide', () => {
    const { container } = render(<Page>Content</Page>)
    expect(container.firstElementChild).toHaveClass('d3-page--wide')
  })

  it('falls back to wide and warns for a width that is not a container', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { container } = render(<Page width={'full' as never}>Content</Page>)
    expect(container.firstElementChild).toHaveClass('d3-page--wide')
    expect(warn.mock.calls.some((c) => String(c[0]).includes('Page: `width="full"`'))).toBe(true)
  })

  it('passes attributes through and keeps its own class beside the app\'s', () => {
    const { container } = render(<Page className="x" aria-busy="true">Content</Page>)
    expect(container.firstElementChild).toHaveClass('d3-page', 'x')
    expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true')
  })
})
