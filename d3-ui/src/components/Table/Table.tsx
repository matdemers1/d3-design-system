import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '../../lib/cn'
import { devWarn, useMergedRef } from '../../lib/dev'
import './Table.css'

export type SortDirection = 'asc' | 'desc'

export interface TableSort {
  /** The `key` of the column being sorted by. */
  column: string
  direction: SortDirection
}

export interface TableColumn<Row> {
  /** Stable identity for the column. Used by `sort` and as the React key. */
  key: string
  /** The column heading. Keep it short: it is read before every cell in it. */
  header: React.ReactNode
  /** The cell. Without one, the row's value at `key` is rendered if it is a primitive. */
  cell?: (row: Row, index: number) => React.ReactNode
  /**
   * `true` sorts on the row's value at `key`; a comparator sorts on whatever you
   * say. Sorting is off by default, because a column that cannot be usefully
   * ordered should not offer a control that does nothing.
   */
  sortable?: boolean | ((a: Row, b: Row) => number)
  /** `end` for the last column of actions, or a right-aligned count. */
  align?: 'start' | 'end'
  /** Any track size: `12rem`, `minmax(0, 1fr)`, `auto`. */
  width?: string
  /**
   * Tabular figures, right-aligned. A column of numbers that do not line up at
   * the decimal is a column nobody can compare down (D-019's cousin).
   */
  numeric?: boolean
}

export interface TableVirtualization {
  /**
   * Row height in pixels. **Every row must be this tall**: a virtualized table
   * computes its scroll extent from the count, so a row that grows breaks the
   * arithmetic. Defaults to the `--row-height` token's 44.
   */
  rowHeight?: number
  /** Rows rendered beyond each edge, so a fast scroll does not show a gap. */
  overscan?: number
  /** Below this many rows nothing is virtualized: the DOM is cheaper than the maths. */
  threshold?: number
}

export interface TableProps<Row> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  columns: ReadonlyArray<TableColumn<Row>>
  rows: ReadonlyArray<Row>
  /** A stable identity per row. Index is a last resort: it breaks sorting. */
  rowKey: (row: Row, index: number) => string
  /**
   * What the table is. Rendered as a `<caption>` — visible by default, because a
   * table whose subject is only in the heading above it loses that subject the
   * moment someone navigates to the table itself.
   */
  caption?: React.ReactNode
  /** Hide the caption visually. It is still announced. */
  captionHidden?: boolean
  /** Controlled sort. Pass `onSortChange` with it. */
  sort?: TableSort | null
  /** Uncontrolled starting sort. */
  defaultSort?: TableSort | null
  onSortChange?: (sort: TableSort | null) => void
  /** The header stays put while the body scrolls. Needs `maxHeight` to do anything. */
  stickyHeader?: boolean
  /** Any CSS length. Gives the table a scroll container, which sticky and virtual both need. */
  maxHeight?: string
  /**
   * Render only the visible rows. `true` takes the defaults; an object tunes them.
   * Off by default: it costs a fixed row height, and most tables never need it.
   */
  virtualize?: boolean | TableVirtualization
  /** Rendered instead of the body when there are no rows — usually an `EmptyState`. */
  empty?: React.ReactNode
  /** `compact` for dense records; `comfortable` is the default. */
  density?: 'comfortable' | 'compact'
}

const DEFAULTS = { rowHeight: 44, overscan: 6, threshold: 100 } as const

/** Sorts strings by locale, numbers and dates by value, and leaves nulls last. */
function defaultCompare(a: unknown, b: unknown): number {
  if (a === b) return 0
  // Nulls last in both directions: "missing" is not a value that belongs at one end.
  if (a === null || a === undefined) return 1
  if (b === null || b === undefined) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b)
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}

function valueAt<Row>(row: Row, key: string): unknown {
  return (row as Record<string, unknown>)[key]
}

function renderCell<Row>(column: TableColumn<Row>, row: Row, index: number): React.ReactNode {
  if (column.cell) return column.cell(row, index)
  const value = valueAt(row, column.key)
  if (value === null || value === undefined) return null
  if (typeof value === 'object') {
    if (process.env.NODE_ENV !== 'production') {
      devWarn(
        `Table.cell.${column.key}`,
        `Table: column "${column.key}" has no \`cell\` and the row's value is an object. ` +
          'Give the column a `cell` that says how to render it.',
      )
    }
    return null
  }
  return String(value)
}

/**
 * A table of records: rows of cells under column headings, sortable, with a
 * header that stays put and — past a threshold — only the visible rows in the
 * DOM.
 *
 * **A table, unlike `DataList`** (D-067). `DataList` is for like things with a
 * name and some meta; a table promises column headers, ordering and cells that
 * line up, and this is the component that keeps that promise. Reach for it when
 * the columns are the point: comparing values down one, or ordering by it.
 */
function TableInner<Row>(props: TableProps<Row>, ref: React.Ref<HTMLDivElement>) {
  const {
    // Required by the types, defaulted at runtime: the library's contract is that no
    // component throws when rendered with nothing, and a crash is a worse teacher
    // than the development warning below.
    columns = [],
    rows = [],
    rowKey = (_row, index) => String(index),
    caption,
    captionHidden = false,
    sort: controlledSort,
    defaultSort = null,
    onSortChange,
    stickyHeader = true,
    maxHeight,
    virtualize = false,
    empty,
    density = 'comfortable',
    className,
    ...rest
  } = props
  const [uncontrolledSort, setUncontrolledSort] = useState<TableSort | null>(defaultSort)
  const isControlled = controlledSort !== undefined
  const sort = isControlled ? controlledSort : uncontrolledSort

  const scroller = useRef<HTMLDivElement | null>(null)
  const setRef = useMergedRef(ref, scroller)

  if (process.env.NODE_ENV !== 'production') {
    if (columns.length === 0) devWarn('Table.columns', 'Table: `columns` is empty.')
    if (!caption && !rest['aria-label'] && !rest['aria-labelledby']) {
      devWarn(
        'Table.caption',
        'Table: give a `caption` (or an aria-label) — a table with no name is an unlabelled grid ' +
          'to anyone who reaches it without the heading above it.',
      )
    }
    if (virtualize && !maxHeight) {
      devWarn(
        'Table.virtualize.maxHeight',
        'Table: `virtualize` needs a `maxHeight` — without a scroll container there is no ' +
          'viewport to compute visible rows against, so every row renders.',
      )
    }
    // Only when it was asked for. Sticky is on by default and harmless without a
    // height, so warning every unbounded table would be scolding nobody's mistake.
    if (stickyHeader && !maxHeight && 'stickyHeader' in props) {
      devWarn(
        'Table.sticky.maxHeight',
        'Table: `stickyHeader` needs a `maxHeight`, or the page scrolls rather than the table ' +
          'and there is nothing for the header to stick to.',
      )
    }
  }

  const sorted = useMemo(() => {
    if (!sort) return rows
    const column = columns.find((c) => c.key === sort.column)
    if (!column?.sortable) return rows
    const compare =
      typeof column.sortable === 'function'
        ? column.sortable
        : (a: Row, b: Row) => defaultCompare(valueAt(a, column.key), valueAt(b, column.key))
    // Copied before sorting: `rows` belongs to the caller.
    const next = [...rows].sort(compare)
    return sort.direction === 'desc' ? next.reverse() : next
  }, [rows, sort, columns])

  const toggleSort = useCallback(
    (column: TableColumn<Row>) => {
      if (!column.sortable) return
      // asc → desc → unsorted. The third state matters: it returns the rows to
      // the order the caller gave them, which is often itself meaningful.
      const next: TableSort | null =
        sort?.column !== column.key
          ? { column: column.key, direction: 'asc' }
          : sort.direction === 'asc'
            ? { column: column.key, direction: 'desc' }
            : null
      if (!isControlled) setUncontrolledSort(next)
      onSortChange?.(next)
    },
    [sort, isControlled, onSortChange],
  )

  const options: Required<TableVirtualization> = {
    ...DEFAULTS,
    ...(typeof virtualize === 'object' ? virtualize : {}),
  }
  const virtualEnabled = Boolean(virtualize) && Boolean(maxHeight) && sorted.length >= options.threshold

  const [viewport, setViewport] = useState({ scrollTop: 0, height: 0 })

  useEffect(() => {
    const node = scroller.current
    if (!node || !virtualEnabled) return

    const measure = () => {
      setViewport((current) =>
        current.scrollTop === node.scrollTop && current.height === node.clientHeight
          ? current
          : { scrollTop: node.scrollTop, height: node.clientHeight },
      )
    }
    measure()

    // The scroll handler runs on every frame of a drag, so it does no work beyond
    // reading two numbers; React bails out above when neither changed.
    node.addEventListener('scroll', measure, { passive: true })
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    observer?.observe(node)
    return () => {
      node.removeEventListener('scroll', measure)
      observer?.disconnect()
    }
  }, [virtualEnabled])

  const window_ = useMemo(() => {
    if (!virtualEnabled) return { start: 0, end: sorted.length, padTop: 0, padBottom: 0 }
    const visible = Math.ceil((viewport.height || options.rowHeight * 10) / options.rowHeight)
    const start = Math.max(0, Math.floor(viewport.scrollTop / options.rowHeight) - options.overscan)
    const end = Math.min(sorted.length, start + visible + options.overscan * 2)
    return {
      start,
      end,
      padTop: start * options.rowHeight,
      padBottom: (sorted.length - end) * options.rowHeight,
    }
  }, [virtualEnabled, viewport, sorted.length, options.rowHeight, options.overscan])

  const visibleRows = virtualEnabled ? sorted.slice(window_.start, window_.end) : sorted
  const isEmpty = sorted.length === 0 && empty !== undefined

  return (
    <div
      ref={setRef}
      className={cn(
        'd3-tbl-scroll',
        stickyHeader && 'd3-tbl-scroll--sticky',
        maxHeight && 'd3-tbl-scroll--bounded',
        className,
      )}
      style={maxHeight ? { maxHeight } : undefined}
      // A bounded table scrolls, and a region that scrolls has to be reachable by keyboard —
      // otherwise the only way to see the rows below the fold is a pointer (WCAG 2.1.1, axe's
      // `scrollable-region-focusable`). Only when bounded: an unbounded table does not scroll, and
      // a tab stop that does nothing is worse than none.
      tabIndex={maxHeight ? 0 : undefined}
      // Named by its own caption, so the stop announces which table it is rather than "group".
      role={maxHeight ? 'group' : undefined}
      aria-label={maxHeight && typeof caption === 'string' ? caption : undefined}
      {...rest}
    >
      <table
        className={cn('d3-tbl', density === 'compact' && 'd3-tbl--compact')}
        // The count is the whole set, not the rendered slice: a virtualized table
        // that reports what is in the DOM tells a screen reader the wrong size.
        aria-rowcount={virtualEnabled ? sorted.length : undefined}
      >
        {caption ? (
          <caption className={cn('d3-tbl__caption', captionHidden && 'd3-tbl__caption--hidden')}>{caption}</caption>
        ) : null}
        <colgroup>
          {columns.map((column) => (
            <col key={column.key} style={column.width ? { width: column.width } : undefined} />
          ))}
        </colgroup>
        <thead className="d3-tbl__head">
          <tr>
            {columns.map((column) => {
              const active = sort?.column === column.key
              const alignEnd = column.align === 'end' || (column.numeric && column.align !== 'start')
              return (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    'd3-tbl__th',
                    alignEnd && 'd3-tbl__cell--end',
                    column.numeric && 'd3-tbl__cell--num',
                  )}
                  // Announced on the column, not on the button inside it, which is
                  // where a screen reader looks for it.
                  aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      className={cn('d3-tbl__sort', active && 'd3-tbl__sort--active')}
                      onClick={() => { toggleSort(column) }}
                    >
                      <span className="d3-tbl__sort-label">{column.header}</span>
                      <span aria-hidden="true" className="d3-tbl__sort-icon">
                        {active ? (sort.direction === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {isEmpty ? (
            <tr>
              <td className="d3-tbl__empty" colSpan={columns.length}>
                {empty}
              </td>
            </tr>
          ) : (
            <>
              {window_.padTop > 0 ? (
                // A spacer row rather than a transform: it keeps the table a table,
                // so the browser's own column sizing and cell semantics still apply.
                <tr aria-hidden="true" className="d3-tbl__spacer">
                  <td colSpan={columns.length} style={{ height: window_.padTop }} />
                </tr>
              ) : null}
              {visibleRows.map((row, offset) => {
                const index = window_.start + offset
                return (
                  <tr
                    key={rowKey(row, index)}
                    className="d3-tbl__row"
                    style={virtualEnabled ? { height: options.rowHeight } : undefined}
                    aria-rowindex={virtualEnabled ? index + 2 : undefined}
                  >
                    {columns.map((column) => {
                      const alignEnd =
                        column.align === 'end' || (column.numeric && column.align !== 'start')
                      return (
                        <td
                          key={column.key}
                          className={cn(
                            'd3-tbl__td',
                            alignEnd && 'd3-tbl__cell--end',
                            column.numeric && 'd3-tbl__cell--num',
                          )}
                        >
                          {renderCell(column, row, index)}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
              {window_.padBottom > 0 ? (
                <tr aria-hidden="true" className="d3-tbl__spacer">
                  <td colSpan={columns.length} style={{ height: window_.padBottom }} />
                </tr>
              ) : null}
            </>
          )}
        </tbody>
      </table>
    </div>
  )
}

/** `forwardRef` loses the generic, so it is restored on the way out. */
export const Table = forwardRef(TableInner) as <Row>(
  props: TableProps<Row> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement
