import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { DataList, DataListRow } from './DataList'
import { Button } from '../Button/Button'
import { Link } from '../Link/Link'
import { EmptyState } from '../EmptyState/EmptyState'
import { __resetDevWarnings } from '../../lib/dev'

afterEach(() => { vi.restoreAllMocks(); __resetDevWarnings() })

const warned = (spy: ReturnType<typeof vi.spyOn>, fragment: string) =>
  spy.mock.calls.some((c: unknown[]) => String(c[0]).includes(fragment))

describe('DataList — rows, not a table (D-067)', () => {
  it('is a named list of list items, with no table semantics', () => {
    render(
      <DataList aria-label="People">
        <DataListRow title="Matt Demers" />
        <DataListRow title="Sarah Byrne" />
      </DataList>,
    )
    const list = screen.getByRole('list', { name: 'People' })
    expect(list.tagName).toBe('UL')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.queryByRole('table')).toBeNull()
    expect(screen.queryByRole('row')).toBeNull()
  })

  it('renders each slot in its place', () => {
    const { container } = render(
      <DataList>
        <DataListRow leading={<span>avatar</span>} title="Matt Demers" description="matt@example.com"
          meta={<span>16 Sept</span>} actions={<Button size="sm">Suspend</Button>} />
      </DataList>,
    )
    expect(container.querySelector('.d3-dlrow__leading')?.textContent).toBe('avatar')
    expect(container.querySelector('.d3-dlrow__title')?.textContent).toBe('Matt Demers')
    expect(container.querySelector('.d3-dlrow__desc')?.textContent).toBe('matt@example.com')
    expect(container.querySelector('.d3-dlrow__meta')?.textContent).toBe('16 Sept')
    expect(screen.getByRole('button', { name: 'Suspend' }).parentElement).toHaveClass('d3-dlrow__actions')
  })

  it('truncates title and description by default, and wraps when told', () => {
    const { container } = render(
      <DataList>
        <DataListRow title="A" />
        <DataListRow title="B" truncate={false} />
      </DataList>,
    )
    const rows = container.querySelectorAll('.d3-dlrow')
    expect(rows[0]).toHaveClass('d3-dlrow--truncate')
    expect(rows[1]).not.toHaveClass('d3-dlrow--truncate')
  })

  it('renders the empty state instead of an empty list', () => {
    render(
      <DataList aria-label="Invites" empty={<EmptyState kind="empty" heading="No invites waiting" />}>
        {[]}
      </DataList>,
    )
    expect(screen.queryByRole('list')).toBeNull()
    expect(screen.getByRole('heading', { name: 'No invites waiting' })).toBeInTheDocument()
  })

  it('renders the rows, not the empty state, when there are rows', () => {
    render(
      <DataList aria-label="Invites" empty={<EmptyState kind="empty" heading="No invites waiting" />}>
        <DataListRow title="them@example.com" />
      </DataList>,
    )
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'No invites waiting' })).toBeNull()
  })
})

describe('DataListRow — a link or actions, never both', () => {
  it('with href, the whole row is one link', () => {
    render(<DataList><DataListRow href="/apps/bindery" title="Bindery" description="web app" /></DataList>)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/apps/bindery')
    expect(link).toHaveClass('d3-dlrow')
    expect(link.textContent).toContain('Bindery')
  })

  it('without href, the row is inert and the title can be the link', () => {
    render(
      <DataList>
        <DataListRow title={<Link href="/people/1">Matt Demers</Link>} actions={<Button size="sm">Suspend</Button>} />
      </DataList>,
    )
    expect(screen.getByRole('link', { name: 'Matt Demers' })).toHaveAttribute('href', '/people/1')
    expect(screen.getByRole('button', { name: 'Suspend' })).toBeInTheDocument()
    expect(screen.getByRole('listitem').querySelector('a.d3-dlrow')).toBeNull()
  })

  it('does not render actions inside a linked row, and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const props = { href: '/apps/bindery', title: 'Bindery', actions: <Button>Disable</Button> } as never
    render(<DataList><DataListRow {...(props as object as { href: string; title: string })} /></DataList>)
    expect(screen.queryByRole('button')).toBeNull()
    expect(warned(warn, 'its `actions` are not rendered')).toBe(true)
  })

  it('warns when a linked row holds a control of its own', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<DataList><DataListRow href="/x" title="Bindery" meta={<button type="button">Pin</button>} /></DataList>)
    await waitFor(() => expect(warned(warn, 'contains its own interactive element')).toBe(true))
  })

  it('does not warn for a row with actions and a linked title', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<DataList><DataListRow title={<Link href="/x">A</Link>} actions={<Button>Go</Button>} /></DataList>)
    await new Promise((r) => setTimeout(r, 0))
    expect(warn).not.toHaveBeenCalled()
  })

  it('warns when a row has no title', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<DataList><DataListRow title="" /></DataList>)
    expect(warned(warn, 'DataListRow: `title` is required')).toBe(true)
  })
})
