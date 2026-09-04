import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SegmentedControl } from './SegmentedControl'
import type { SegmentedItem } from './SegmentedControl'

const ITEMS: SegmentedItem[] = [
  { value: 'kind', label: 'Kind' },
  { value: 'correspondent', label: 'Correspondent' },
  { value: 'year', label: 'Year' },
]

function Harness({ items = ITEMS, onChange }: { items?: SegmentedItem[]; onChange?: (v: string) => void }) {
  const [value, setValue] = useState(items.find((i) => !i.disabled)!.value)
  return (
    <SegmentedControl
      items={items}
      value={value}
      onValueChange={(v) => { setValue(v); onChange?.(v) }}
      aria-label="Group by"
    />
  )
}

describe('SegmentedControl — a radiogroup, not tabs', () => {
  it('announces itself as one named group of radios', () => {
    render(<Harness />)
    const group = screen.getByRole('radiogroup', { name: 'Group by' })
    expect(group).toBeTruthy()
    // If this ever reports tabs, the semantics have drifted back to Tabs and
    // the promise of a panel has come with them.
    expect(screen.queryAllByRole('tab')).toHaveLength(0)
    expect(screen.getAllByRole('radio')).toHaveLength(3)
  })

  it('checks exactly one option', async () => {
    render(<Harness />)
    expect(screen.getByRole('radio', { name: 'Kind' })).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(screen.getByRole('radio', { name: 'Year' }))
    expect(screen.getByRole('radio', { name: 'Year' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'Kind' })).toHaveAttribute('aria-checked', 'false')
  })

  it('is one tab stop, and the arrows do the rest', async () => {
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)
    // Only the checked option is reachable by Tab. Three tab stops for three
    // options is the defect this pattern exists to prevent.
    expect(screen.getByRole('radio', { name: 'Kind' })).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('radio', { name: 'Year' })).toHaveAttribute('tabindex', '-1')

    await userEvent.tab()
    expect(screen.getByRole('radio', { name: 'Kind' })).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenLastCalledWith('correspondent')
    expect(screen.getByRole('radio', { name: 'Correspondent' })).toHaveFocus()
  })

  it('wraps at both ends and answers Home and End', async () => {
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)
    await userEvent.tab()
    await userEvent.keyboard('{ArrowLeft}')
    expect(onChange).toHaveBeenLastCalledWith('year')
    await userEvent.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenLastCalledWith('kind')
    await userEvent.keyboard('{End}')
    expect(onChange).toHaveBeenLastCalledWith('year')
    await userEvent.keyboard('{Home}')
    expect(onChange).toHaveBeenLastCalledWith('kind')
  })

  it('steps over a disabled option instead of stopping on it', async () => {
    const onChange = vi.fn()
    render(
      <Harness
        onChange={onChange}
        items={[
          { value: 'all', label: 'All' },
          { value: 'mine', label: 'Mine', disabled: true },
          { value: 'shared', label: 'Shared' },
        ]}
      />,
    )
    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenLastCalledWith('shared')
  })

  it('puts the count in the name, with its unit, and counts one thing correctly', () => {
    render(<Harness items={[
      { value: 'failed', label: 'Failed', count: 3 },
      { value: 'ok', label: 'Ingested', count: 1 },
    ]} />)
    // "Failed 3" is what a screen reader says when the number is a loose node;
    // the unit is the whole point — and "Ingested, 1 items" is the version of
    // that nobody sees while reading and everybody hears.
    expect(screen.getByRole('radio', { name: 'Failed, 3 items' })).toBeTruthy()
    expect(screen.getByRole('radio', { name: 'Ingested, 1 item' })).toBeTruthy()
  })

  it('does not fire onValueChange for the option already chosen', async () => {
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)
    await userEvent.click(screen.getByRole('radio', { name: 'Kind' }))
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('activationMode — the fork that stops arrow keys firing requests', () => {
  function Manual({ onChange }: { onChange: (v: string) => void }) {
    const [value, setValue] = useState('kind')
    return (
      <SegmentedControl
        items={ITEMS}
        value={value}
        onValueChange={(v) => { setValue(v); onChange(v) }}
        activationMode="manual"
        aria-label="Group by"
      />
    )
  }

  it('moves focus without choosing, then chooses on Enter', async () => {
    const onChange = vi.fn()
    render(<Manual onChange={onChange} />)
    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    // Two steps, and nothing has been chosen — this is the whole point. Under
    // automatic activation Bindery's Archive grouping would have fired two
    // calls to api.tree() on the way past.
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('radio', { name: 'Year' })).toHaveFocus()
    expect(screen.getByRole('radio', { name: 'Kind' })).toHaveAttribute('aria-checked', 'true')

    await userEvent.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledExactlyOnceWith('year')
  })

  it('also chooses on Space', async () => {
    const onChange = vi.fn()
    render(<Manual onChange={onChange} />)
    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight} ')
    expect(onChange).toHaveBeenCalledExactlyOnceWith('correspondent')
  })

  it('returns the tab stop to the chosen option after leaving the group', async () => {
    render(<><Manual onChange={() => {}} /><button>after</button></>)
    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('radio', { name: 'Correspondent' })).toHaveAttribute('tabindex', '0')
    await userEvent.click(screen.getByRole('button', { name: 'after' }))
    // Coming back should land on what is selected, not where the arrows stopped.
    expect(screen.getByRole('radio', { name: 'Kind' })).toHaveAttribute('tabindex', '0')
  })
})
