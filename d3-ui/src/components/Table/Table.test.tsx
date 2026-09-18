import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Table, type TableColumn, type TableSort } from './Table'
import { __resetDevWarnings } from '../../lib/dev'

interface Row {
  id: string
  name: string
  phase: number
  owner: string | null
}

const rows: Row[] = [
  { id: 'a', name: 'Bindery', phase: 8.5, owner: 'matt' },
  { id: 'b', name: 'atlas', phase: 12, owner: null },
  { id: 'c', name: 'Clearwhen', phase: 2, owner: 'matt' },
]

const columns: TableColumn<Row>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'phase', header: 'Phase', sortable: true, numeric: true },
  { key: 'owner', header: 'Owner' },
]

const bodyRows = () => within(screen.getByRole('table')).getAllByRole('row').slice(1)
const namesInOrder = () => bodyRows().map((row) => within(row).getAllByRole('cell')[0]?.textContent)

beforeEach(() => { __resetDevWarnings() })

describe('Table', () => {
  it('renders a real table with a caption, headings and cells', () => {
    render(<Table caption="Projects" columns={columns} rows={rows} rowKey={(r) => r.id} />)
    expect(screen.getByRole('table', { name: 'Projects' })).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader')).toHaveLength(3)
    expect(screen.getByText('Bindery')).toBeInTheDocument()
  })

  it('renders nothing for a null cell rather than the word null', () => {
    render(<Table caption="Projects" columns={columns} rows={rows} rowKey={(r) => r.id} />)
    expect(screen.queryByText('null')).not.toBeInTheDocument()
  })

  it('shows the empty slot when there are no rows', () => {
    render(
      <Table caption="Projects" columns={columns} rows={[]} rowKey={(r) => r.id} empty={<p>Nothing yet</p>} />,
    )
    expect(screen.getByText('Nothing yet')).toBeInTheDocument()
  })

  describe('sorting', () => {
    it('sorts ascending on the first click, and marks the column', async () => {
      const user = userEvent.setup()
      render(<Table caption="Projects" columns={columns} rows={rows} rowKey={(r) => r.id} />)

      await user.click(screen.getByRole('button', { name: /Name/ }))

      // Case-insensitive, so `atlas` sorts with the As rather than after the Zs.
      expect(namesInOrder()).toEqual(['atlas', 'Bindery', 'Clearwhen'])
      expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute(
        'aria-sort',
        'ascending',
      )
    })

    it('goes ascending, then descending, then back to the given order', async () => {
      const user = userEvent.setup()
      render(<Table caption="Projects" columns={columns} rows={rows} rowKey={(r) => r.id} />)
      const header = screen.getByRole('button', { name: /Name/ })

      await user.click(header)
      expect(namesInOrder()).toEqual(['atlas', 'Bindery', 'Clearwhen'])

      await user.click(header)
      expect(namesInOrder()).toEqual(['Clearwhen', 'Bindery', 'atlas'])

      // The third state is not decoration: it restores the caller's own order.
      await user.click(header)
      expect(namesInOrder()).toEqual(['Bindery', 'atlas', 'Clearwhen'])
      expect(screen.getByRole('columnheader', { name: /Name/ })).not.toHaveAttribute('aria-sort')
    })

    it('sorts numbers by value, not as text', async () => {
      const user = userEvent.setup()
      render(<Table caption="Projects" columns={columns} rows={rows} rowKey={(r) => r.id} />)

      await user.click(screen.getByRole('button', { name: /Phase/ }))
      // As text, 12 would sort before 2 and 8.5. The Phase 8.5 that exists in the
      // real corpus is exactly the case that catches it.
      expect(namesInOrder()).toEqual(['Clearwhen', 'Bindery', 'atlas'])
    })

    it('offers no control on a column that is not sortable', () => {
      render(<Table caption="Projects" columns={columns} rows={rows} rowKey={(r) => r.id} />)
      const owner = screen.getByRole('columnheader', { name: 'Owner' })
      expect(within(owner).queryByRole('button')).not.toBeInTheDocument()
    })

    it('uses a custom comparator when given one', async () => {
      const user = userEvent.setup()
      const byLength: TableColumn<Row>[] = [
        { key: 'name', header: 'Name', sortable: (a, b) => a.name.length - b.name.length },
      ]
      render(<Table caption="Projects" columns={byLength} rows={rows} rowKey={(r) => r.id} />)

      await user.click(screen.getByRole('button', { name: /Name/ }))
      expect(namesInOrder()).toEqual(['atlas', 'Bindery', 'Clearwhen'])
    })

    it('reports the sort instead of applying it when controlled', async () => {
      const user = userEvent.setup()
      const onSortChange = vi.fn()
      const sort: TableSort = { column: 'name', direction: 'asc' }
      render(
        <Table
          caption="Projects"
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          sort={sort}
          onSortChange={onSortChange}
        />,
      )

      await user.click(screen.getByRole('button', { name: /Name/ }))
      expect(onSortChange).toHaveBeenCalledWith({ column: 'name', direction: 'desc' })
      // The controlled prop did not change, so neither did the order.
      expect(namesInOrder()).toEqual(['atlas', 'Bindery', 'Clearwhen'])
    })

    it('leaves missing values at the end, whichever way it is sorted', async () => {
      const user = userEvent.setup()
      const withOwner: TableColumn<Row>[] = [
        { key: 'name', header: 'Name' },
        { key: 'owner', header: 'Owner', sortable: true },
      ]
      render(<Table caption="Projects" columns={withOwner} rows={rows} rowKey={(r) => r.id} />)

      await user.click(screen.getByRole('button', { name: /Owner/ }))
      expect(namesInOrder()?.at(-1)).toBe('atlas')
    })

    it('does not mutate the array it was given', async () => {
      const user = userEvent.setup()
      const original = [...rows]
      render(<Table caption="Projects" columns={columns} rows={rows} rowKey={(r) => r.id} />)
      await user.click(screen.getByRole('button', { name: /Name/ }))
      expect(rows).toEqual(original)
    })
  })

  describe('virtualization', () => {
    const many: Row[] = Array.from({ length: 439 }, (_, i) => ({
      id: `r${String(i)}`,
      name: `Row ${String(i)}`,
      phase: i,
      owner: null,
    }))

    it('renders only a window of rows, and still reports the true count', () => {
      render(
        <Table
          caption="Many"
          columns={columns}
          rows={many}
          rowKey={(r) => r.id}
          maxHeight="400px"
          virtualize
        />,
      )

      const rendered = bodyRows()
      // Far fewer than 439 — the point of the exercise — but not none.
      expect(rendered.length).toBeLessThan(80)
      expect(rendered.length).toBeGreaterThan(1)
      // A screen reader is told how many rows there really are, not how many are in the DOM.
      expect(screen.getByRole('table')).toHaveAttribute('aria-rowcount', '439')
    })

    it('leaves a table below the threshold alone', () => {
      render(
        <Table
          caption="Few"
          columns={columns}
          rows={many.slice(0, 20)}
          rowKey={(r) => r.id}
          maxHeight="400px"
          virtualize
        />,
      )
      // 20 rows plus the header: the DOM is cheaper than the arithmetic here.
      expect(bodyRows()).toHaveLength(20)
      expect(screen.getByRole('table')).not.toHaveAttribute('aria-rowcount')
    })

    it('keeps the scroll extent honest with spacer rows', () => {
      render(
        <Table
          caption="Many"
          columns={columns}
          rows={many}
          rowKey={(r) => r.id}
          maxHeight="400px"
          virtualize={{ rowHeight: 44 }}
        />,
      )
      const spacers = document.querySelectorAll('.d3-tbl__spacer > td')
      // Nothing is scrolled yet, so there is a spacer below and none above.
      expect(spacers).toHaveLength(1)
      const height = Number.parseInt((spacers[0] as HTMLElement).style.height, 10)
      expect(height).toBeGreaterThan(10_000)
    })

    it('sorts the whole set, not just the rows on screen', async () => {
      const user = userEvent.setup()
      render(
        <Table
          caption="Many"
          columns={columns}
          rows={many}
          rowKey={(r) => r.id}
          maxHeight="400px"
          virtualize
        />,
      )
      await user.click(screen.getByRole('button', { name: /Phase/ }))
      await user.click(screen.getByRole('button', { name: /Phase/ }))
      // Descending across all 439, so the first visible row is the last row of the set.
      expect(namesInOrder()?.[0]).toBe('Row 438')
    })
  })

  describe('development warnings', () => {
    it('warns about a table with no accessible name', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
      render(<Table columns={columns} rows={rows} rowKey={(r) => r.id} />)
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('caption'))
      warn.mockRestore()
    })

    it('warns when virtualization is asked for without a height to measure', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
      render(<Table caption="Projects" columns={columns} rows={rows} rowKey={(r) => r.id} virtualize />)
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('maxHeight'))
      warn.mockRestore()
    })
  })
})
