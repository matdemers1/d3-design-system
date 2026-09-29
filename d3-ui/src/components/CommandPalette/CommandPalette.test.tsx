import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  CommandPalette, CommandPaletteChip, CommandPaletteHint, markMatches,
  type CommandPaletteGroup, type CommandPaletteProps,
} from './CommandPalette'
import { __resetDevWarnings } from '../../lib/dev'
import { expectNoAxeViolations } from '../../test/axe'
import '../../tokens/build/motion.css'

// Radix dialogs mount through Presence and a focus scope; on a loaded runner
// that outlasts findByRole's 1s default.
const OPEN = 20_000
const WAIT = { timeout: 15_000 }

const makeGroups = (spy: (id: string) => void | boolean = () => {}): CommandPaletteGroup[] => [
  {
    id: 'messages', label: 'Messages',
    items: [
      { id: 'm1', label: 'Re: Acadia over Columbus Day weekend?', description: 'Priya Shah · 10:24 AM', onSelect: () => spy('m1') },
      { id: 'm2', label: 'Blackwoods Campground, acadia NP — Acadia', onSelect: () => spy('m2') },
    ],
  },
  { id: 'empty', label: 'Nothing here', items: [] },
  {
    id: 'go', label: 'Go to',
    items: [
      { id: 'archive', label: 'Archive', shortcut: ['G', 'A'], leading: <svg data-testid="ico" />, onSelect: () => spy('archive') },
      { id: 'locked', label: 'Locked', disabled: true, onSelect: () => spy('locked') },
    ],
  },
  {
    id: 'actions', label: 'Actions',
    items: [{ id: 'snooze', label: 'Snooze…', shortcut: 'B', onSelect: () => spy('snooze') }],
  },
]

function Harness(props: Partial<CommandPaletteProps> & { onOpen?: (o: boolean) => void; onQuery?: (q: string) => void }) {
  const { onOpen, onQuery, ...rest } = props
  const [open, setOpen] = useState(true)
  const [query, setQuery] = useState('acadia')
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Open palette</button>
      <CommandPalette
        label="Search mail and commands"
        groups={makeGroups()}
        {...rest}
        open={open}
        onOpenChange={(o) => { setOpen(o); onOpen?.(o) }}
        query={query}
        onQueryChange={(q) => { setQuery(q); onQuery?.(q) }}
      />
    </>
  )
}

const input = () => screen.findByRole('combobox', { name: 'Search mail and commands' }, WAIT)
const activeLabel = (box: HTMLElement) => {
  const id = box.getAttribute('aria-activedescendant')
  return id ? document.getElementById(id)?.textContent : null
}

let warn: ReturnType<typeof vi.spyOn>
beforeEach(() => { __resetDevWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
afterEach(() => warn.mockRestore())

describe('CommandPalette — structure', () => {
  it('is a modal dialog named by `label`, holding a combobox that controls a listbox', async () => {
    render(<Harness />)
    const dialog = await screen.findByRole('dialog', {}, WAIT)
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleName('Search mail and commands')
    const box = await input()
    expect(box).toHaveAttribute('aria-autocomplete', 'list')
    expect(box).toHaveAttribute('aria-expanded', 'true')
    const list = screen.getByRole('listbox', { name: 'Results' })
    expect(box).toHaveAttribute('aria-controls', list.id)
    await waitFor(() => expect(box).toHaveFocus(), WAIT)
  }, OPEN)

  it('groups are labelled groups, their headings are not options, and empty groups are not drawn', async () => {
    render(<Harness />)
    const list = await screen.findByRole('listbox', {}, WAIT)
    const groups = within(list).getAllByRole('group')
    expect(groups.map((g) => g.getAttribute('aria-labelledby') && document.getElementById(g.getAttribute('aria-labelledby')!)!.textContent))
      .toEqual(['Messages', 'Go to', 'Actions'])
    expect(within(list).getAllByRole('option')).toHaveLength(5)
    expect(within(list).queryByRole('option', { name: /Messages/ })).toBeNull()
    expect(screen.queryByText('Nothing here')).toBeNull()
  }, OPEN)

  it('draws description, leading (hidden from AT) and shortcut key caps', async () => {
    render(<Harness />)
    const archive = await screen.findByRole('option', { name: /Archive/ }, WAIT)
    expect(within(archive).getByTestId('ico').closest('[aria-hidden="true"]')).not.toBeNull()
    expect([...archive.querySelectorAll('kbd')].map((k) => k.textContent)).toEqual(['G', 'A'])
    const m1 = screen.getByRole('option', { name: /Columbus Day/ })
    expect(m1).toHaveTextContent('Priya Shah · 10:24 AM')
    const locked = screen.getByRole('option', { name: 'Locked' })
    expect(locked).toHaveAttribute('aria-disabled', 'true')
  }, OPEN)

  it('marks every case-insensitive occurrence of the query in the label', async () => {
    render(<Harness />)
    const m2 = await screen.findByRole('option', { name: /Blackwoods/ }, WAIT)
    expect([...m2.querySelectorAll('mark')].map((m) => m.textContent)).toEqual(['acadia', 'Acadia'])
    const m1 = screen.getByRole('option', { name: /Columbus/ })
    expect([...m1.querySelectorAll('mark')].map((m) => m.textContent)).toEqual(['Acadia'])
    // Not in the description, and not where the query is absent.
    expect(screen.getByRole('option', { name: /Archive/ }).querySelector('mark')).toBeNull()
  }, OPEN)

  it('has no axe violations open, with filters and a footer', async () => {
    render(<Harness filters={<CommandPaletteChip pressed>Has attachment</CommandPaletteChip>} />)
    const dialog = await screen.findByRole('dialog', {}, WAIT)
    await expectNoAxeViolations(dialog)
  }, OPEN)
})

describe('CommandPalette — keyboard', () => {
  it('the first result is active on open; ↓ and ↑ move across groups and wrap, skipping disabled', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const box = await input()
    await waitFor(() => expect(box).toHaveFocus(), WAIT)
    expect(activeLabel(box)).toMatch(/Columbus/)
    await user.keyboard('{ArrowDown}')
    expect(activeLabel(box)).toMatch(/Blackwoods/)
    await user.keyboard('{ArrowDown}')
    expect(activeLabel(box)).toMatch(/^Archive/) // across into "Go to"
    await user.keyboard('{ArrowDown}')
    expect(activeLabel(box)).toMatch(/^Snooze/) // "Locked" is skipped
    await user.keyboard('{ArrowDown}')
    expect(activeLabel(box)).toMatch(/Columbus/) // wraps to the top
    await user.keyboard('{ArrowUp}')
    expect(activeLabel(box)).toMatch(/^Snooze/) // and back round to the bottom
    const active = document.getElementById(box.getAttribute('aria-activedescendant')!)!
    expect(active).toHaveAttribute('aria-selected', 'true')
    expect(screen.getAllByRole('option').filter((o) => o.getAttribute('aria-selected') === 'true')).toHaveLength(1)
    expect(box).toHaveFocus()
  }, OPEN)

  it('Home and End jump to the first and last result', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const box = await input()
    await waitFor(() => expect(box).toHaveFocus(), WAIT)
    await user.keyboard('{End}')
    expect(activeLabel(box)).toMatch(/^Snooze/)
    await user.keyboard('{Home}')
    expect(activeLabel(box)).toMatch(/Columbus/)
  }, OPEN)

  it('Enter runs the active item and closes', async () => {
    const user = userEvent.setup()
    const spy = vi.fn()
    const onOpen = vi.fn()
    render(<Harness groups={makeGroups(spy)} onOpen={onOpen} />)
    const box = await input()
    await waitFor(() => expect(box).toHaveFocus(), WAIT)
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    expect(spy).toHaveBeenCalledWith('archive')
    expect(spy).toHaveBeenCalledTimes(1)
    expect(onOpen).toHaveBeenCalledWith(false)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), WAIT)
  }, OPEN)

  it('an item that returns false keeps the palette open', async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    render(<Harness groups={makeGroups(() => false)} onOpen={onOpen} />)
    const box = await input()
    await waitFor(() => expect(box).toHaveFocus(), WAIT)
    await user.keyboard('{Enter}')
    expect(onOpen).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  }, OPEN)

  it('Escape closes and returns focus to where it was', async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    render(<Harness onOpen={onOpen} />)
    const box = await input()
    await waitFor(() => expect(box).toHaveFocus(), WAIT)
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), WAIT)
    expect(onOpen).toHaveBeenCalledWith(false)
    // Reopened from a button, it hands focus back to that button.
    const opener = screen.getByRole('button', { name: 'Open palette' })
    await user.click(opener)
    const again = await input()
    await waitFor(() => expect(again).toHaveFocus(), WAIT)
    await user.keyboard('{Escape}')
    await waitFor(() => expect(opener).toHaveFocus(), WAIT)
  }, OPEN)

  it('typing calls onQueryChange, and a new query starts again at the first result', async () => {
    const user = userEvent.setup()
    const onQuery = vi.fn()
    render(<Harness onQuery={onQuery} />)
    const box = await input()
    await waitFor(() => expect(box).toHaveFocus(), WAIT)
    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(activeLabel(box)).toMatch(/^Archive/)
    await user.keyboard('s')
    expect(onQuery).toHaveBeenLastCalledWith('acadias')
    expect(box).toHaveValue('acadias')
    expect(activeLabel(box)).toMatch(/Columbus/)
  }, OPEN)

  it('the pointer sets the active option, and a click selects it without taking focus', async () => {
    const user = userEvent.setup()
    const spy = vi.fn()
    render(<Harness groups={makeGroups(spy)} />)
    const box = await input()
    await waitFor(() => expect(box).toHaveFocus(), WAIT)
    const snooze = screen.getByRole('option', { name: /Snooze/ })
    await user.hover(snooze)
    expect(activeLabel(box)).toMatch(/^Snooze/)
    await user.click(snooze)
    expect(spy).toHaveBeenCalledWith('snooze')
  }, OPEN)

  it('a disabled option does nothing when clicked', async () => {
    const user = userEvent.setup()
    const spy = vi.fn()
    render(<Harness groups={makeGroups(spy)} />)
    await input()
    await user.click(screen.getByRole('option', { name: 'Locked' }))
    expect(spy).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  }, OPEN)

  it('the library adds no global key listener: the app owns ⌘K', async () => {
    const docAdd = vi.spyOn(document, 'addEventListener')
    const winAdd = vi.spyOn(window, 'addEventListener')
    const onOpenChange = vi.fn()
    // Closed: mounted, but nothing listens for a shortcut.
    render(
      <CommandPalette open={false} onOpenChange={onOpenChange} label="Search" groups={makeGroups()} />,
    )
    const user = userEvent.setup()
    await user.keyboard('{Meta>}k{/Meta}{Control>}k{/Control}')
    expect(onOpenChange).not.toHaveBeenCalled()
    const keyListeners = [...docAdd.mock.calls, ...winAdd.mock.calls].filter(([t]) => t === 'keydown')
    expect(keyListeners).toEqual([])
    docAdd.mockRestore()
    winAdd.mockRestore()
  })
})

describe('CommandPalette — empty and loading', () => {
  it('no results: a message, no listbox, the combobox collapsed, and the count announced', async () => {
    render(<Harness groups={[]} />)
    const box = await input()
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(screen.getByText('No results for “acadia”')).toBeInTheDocument()
    expect(box).toHaveAttribute('aria-expanded', 'false')
    expect(box).not.toHaveAttribute('aria-activedescendant')
    // aria-controls still resolves.
    expect(document.getElementById(box.getAttribute('aria-controls')!)).not.toBeNull()
    expect(screen.getByRole('status')).toHaveTextContent('No results for acadia.')
  }, OPEN)

  it('takes a custom empty message', async () => {
    render(<Harness groups={[]} emptyMessage="Nothing in All mail." />)
    await input()
    expect(screen.getByText('Nothing in All mail.', { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Nothing in All mail.')
  }, OPEN)

  it('loading with nothing yet: placeholder rows, aria-busy, "Searching" announced', async () => {
    render(<Harness groups={[]} loading />)
    const dialog = await screen.findByRole('dialog', {}, WAIT)
    expect(dialog.querySelector('[aria-busy="true"]')).not.toBeNull()
    expect(dialog.querySelectorAll('.d3-skl').length).toBeGreaterThan(0)
    expect(screen.queryByText(/No results/)).toBeNull()
    expect(screen.getByRole('status')).toHaveTextContent('Searching.')
    await expectNoAxeViolations(dialog)
  }, OPEN)

  it('loading over stale results keeps them and shows a spinner in the input row', async () => {
    render(<Harness loading />)
    const dialog = await screen.findByRole('dialog', {}, WAIT)
    expect(screen.getAllByRole('option').length).toBe(5)
    expect(dialog.querySelector('.d3-cmd__q .d3-spn')).not.toBeNull()
  }, OPEN)

  it('announces the result count', async () => {
    render(<Harness />)
    await input()
    expect(screen.getByRole('status')).toHaveTextContent('5 results.')
  }, OPEN)
})

describe('CommandPalette — footer, chips and contracts', () => {
  it('draws the default hints; `footer={null}` removes them; a custom footer replaces them', async () => {
    const { unmount } = render(<Harness />)
    const dialog = await screen.findByRole('dialog', {}, WAIT)
    expect(dialog.querySelector('.d3-cmd__foot')).toHaveTextContent(/navigate.*select.*close/)
    unmount()
    const second = render(<Harness footer={null} />)
    const d2 = await screen.findByRole('dialog', {}, WAIT)
    expect(d2.querySelector('.d3-cmd__foot')).toBeNull()
    second.unmount()
    render(<Harness footer={<CommandPaletteHint keys={['⌘', '↵']}>open in new tab</CommandPaletteHint>} />)
    const d3 = await screen.findByRole('dialog', {}, WAIT)
    expect(d3.querySelector('.d3-cmd__foot')).toHaveTextContent('⌘↵open in new tab')
    expect(d3.querySelector('.d3-cmd__hint')).toHaveAttribute('aria-hidden', 'true')
  }, OPEN)

  it('filters sit in a group named "Filters"; a toggle chip is aria-pressed', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Harness filters={<><CommandPaletteChip>From</CommandPaletteChip><CommandPaletteChip pressed onClick={onClick}>Has attachment</CommandPaletteChip></>} />)
    const group = await screen.findByRole('group', { name: 'Filters' }, WAIT)
    const chip = within(group).getByRole('button', { name: 'Has attachment' })
    expect(chip).toHaveAttribute('aria-pressed', 'true')
    expect(chip).toHaveAttribute('type', 'button')
    expect(within(group).getByRole('button', { name: 'From' })).not.toHaveAttribute('aria-pressed')
    await user.click(chip)
    expect(onClick).toHaveBeenCalled()
  }, OPEN)

  it('warns in development without a label, and without onQueryChange for a controlled query', () => {
    render(<CommandPalette open={false} onOpenChange={() => {}} label="" groups={[]} query="x" />)
    const said = warn.mock.calls.map((c: unknown[]) => String(c[0]))
    expect(said.some((s: string) => s.includes('`label` is required'))).toBe(true)
    expect(said.some((s: string) => s.includes('`query` without `onQueryChange`'))).toBe(true)
  })

  it('markMatches leaves text alone for an empty or absent query', () => {
    expect(markMatches('Archive', '')).toBe('Archive')
    expect(markMatches('Archive', '  ')).toBe('Archive')
    expect(markMatches('Archive', 'zzz')).toBe('Archive')
  })
})

/* The CSSOM, not getComputedStyle: jsdom computes no animation properties
   (see src/test/motion.test.tsx). */
function rules(): CSSRule[] {
  const out: CSSRule[] = []
  const walk = (list: CSSRuleList) => {
    for (const r of Array.from(list)) {
      out.push(r)
      if ('cssRules' in r && (r as CSSGroupingRule).cssRules) walk((r as CSSGroupingRule).cssRules)
    }
  }
  for (const sheet of Array.from(document.styleSheets)) {
    try { walk(sheet.cssRules) } catch { /* cross-origin */ }
  }
  return out
}
const style = (selector: string, inMedia?: string) => rules().find((r) =>
  r instanceof CSSStyleRule && r.selectorText.split(',').map((s) => s.trim()).includes(selector) &&
  (inMedia ? r.parentRule instanceof CSSMediaRule && r.parentRule.conditionText.includes(inMedia)
    : !(r.parentRule instanceof CSSMediaRule))) as CSSStyleRule | undefined

describe('CommandPalette — motion and the float layer', () => {
  it('enters on the modal tier and leaves on its exit token', () => {
    expect(style('.d3-cmd')?.style.getPropertyValue('animation')).toContain('var(--motion-modal-enter)')
    expect(style(".d3-cmd[data-state='closed']")?.style.getPropertyValue('animation') ??
      style('.d3-cmd[data-state="closed"]')?.style.getPropertyValue('animation')).toContain('var(--motion-modal-exit)')
  })

  it('does not move at all under reduced motion', () => {
    const r = style('.d3-cmd', 'prefers-reduced-motion')
    expect(r).toBeDefined()
    expect(r!.style.getPropertyValue('animation')).toBe('none')
    expect(style('.d3-cmd__scrim', 'prefers-reduced-motion')!.style.getPropertyValue('animation')).toBe('none')
  })

  it('is surface-raised with the float shadow, and the border-float edge under forced colours', () => {
    const panel = style('.d3-cmd')!.style
    expect(panel.getPropertyValue('background')).toBe('var(--color-surface-raised)')
    expect(panel.getPropertyValue('box-shadow')).toBe('var(--shadow-float)')
    const forced = style('.d3-cmd', 'forced-colors')!.style
    expect(forced.getPropertyValue('box-shadow')).toBe('none')
    expect(forced.getPropertyValue('border-color')).toBe('var(--color-border-float)')
  })
})
