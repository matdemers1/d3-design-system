import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Section } from './Section'
import { Button } from '../Button/Button'
import { __resetDevWarnings } from '../../lib/dev'

afterEach(() => { vi.restoreAllMocks(); __resetDevWarnings() })

describe('Section — a titled region', () => {
  it('is a region named by its h2', () => {
    render(<Section title="Mail">Body</Section>)
    const region = screen.getByRole('region', { name: 'Mail' })
    expect(region.tagName).toBe('SECTION')
    expect(screen.getByRole('heading', { level: 2, name: 'Mail' })).toHaveClass('d3-sec__title')
  })

  it('takes an h3 for a section inside a section', () => {
    render(<Section title="Passkeys" headingLevel={3} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Passkeys' })).toHaveClass('d3-sec__title--h3')
  })

  it('is on a Card surface by default', () => {
    render(<Section title="Mail" />)
    expect(screen.getByRole('region')).toHaveClass('d3-crd', 'd3-sec')
  })

  it('has no surface when plain', () => {
    render(<Section title="Danger" surface="plain" />)
    const region = screen.getByRole('region')
    expect(region).toHaveClass('d3-sec')
    expect(region).not.toHaveClass('d3-crd')
    // No modifier class that no stylesheet reads.
    expect(region.className).not.toMatch(/d3-sec--/)
  })

  it('renders the description, the actions and the body', () => {
    render(
      <Section title="Roles" description="What people can do in this app." actions={<Button>Add a role</Button>}>
        <p>editor</p>
      </Section>,
    )
    expect(screen.getByText('What people can do in this app.')).toHaveClass('d3-sec__desc')
    expect(screen.getByRole('button', { name: 'Add a role' }).parentElement).toHaveClass('d3-sec__actions')
    expect(screen.getByText('editor').parentElement).toHaveClass('d3-sec__body')
  })

  it('names itself from an id the app gives it', () => {
    render(<Section id="mail" title="Mail" />)
    expect(screen.getByRole('region', { name: 'Mail' })).toHaveAttribute('aria-labelledby', 'mail-title')
  })

  it('gives two sections two different names', () => {
    render(<><Section title="Mail" /><Section title="Alerts" /></>)
    expect(screen.getAllByRole('region').map((r) => r.getAttribute('aria-labelledby'))).toHaveLength(2)
    expect(screen.getByRole('region', { name: 'Alerts' })).toBeInTheDocument()
  })

  it('warns in development when it has no title', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Section title="" />)
    expect(warn.mock.calls.some((c) => String(c[0]).includes('Section: `title` is required'))).toBe(true)
  })
})
