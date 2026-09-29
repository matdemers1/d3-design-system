import { useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '../../tokens/build/motion.css'
import { FormField } from '../FormField/FormField'
import { RecipientField, type RecipientFieldProps, type RecipientSuggestion } from './RecipientField'
import type { Recipient } from './parse'
import { expectNoAxeViolations } from '../../test/axe'

const CONTACTS: RecipientSuggestion[] = [
  { name: 'Linda Demers', address: 'linda.demers@gmail.com', detail: 'Contact' },
  { name: 'Dana Okafor', address: 'dana.okafor.builds@gmail.com', detail: 'Contact' },
  { name: 'Priya Shah', address: 'priya.shah@gmail.com', detail: 'Contact' },
]
const loader = vi.fn(async (q: string) =>
  CONTACTS.filter((c) => c.name!.toLowerCase().includes(q.toLowerCase())))

let last: Recipient[] = []
function Harness(props: Partial<RecipientFieldProps> & { initial?: Recipient[] }) {
  const { initial = [], ...rest } = props
  const [value, setValue] = useState<Recipient[]>(initial)
  return (
    <FormField label="To">
      <RecipientField
        value={value}
        onValueChange={(v) => { last = v; setValue(v) }}
        loadSuggestions={loader}
        suggestDelay={0}
        {...rest}
      />
    </FormField>
  )
}

const input = () => screen.getByRole('combobox', { name: 'To' })
const chips = () => screen.queryAllByRole('listitem').map((li) => li.querySelector('.d3-rcp__name')!.textContent)
const setup = (props: Partial<RecipientFieldProps> & { initial?: Recipient[] } = {}) => {
  last = []
  loader.mockClear()
  const user = userEvent.setup()
  const utils = render(<Harness {...props} />)
  return { user, ...utils }
}

describe('RecipientField — combobox semantics (WAI-ARIA APG)', () => {
  it('is a labelled, collapsed combobox that controls a listbox', () => {
    setup()
    const box = input()
    expect(box).toHaveAttribute('aria-expanded', 'false')
    expect(box).toHaveAttribute('aria-autocomplete', 'list')
    const list = document.getElementById(box.getAttribute('aria-controls')!)!
    expect(list).toHaveAttribute('role', 'listbox')
    expect(box).not.toHaveAttribute('aria-activedescendant')
  })

  it('typing asks the loader and opens the listbox with the first option active', async () => {
    const { user } = setup()
    await user.type(input(), 'd')
    const listbox = await screen.findByRole('listbox')
    expect(loader).toHaveBeenLastCalledWith('d', expect.objectContaining({ signal: expect.any(AbortSignal) }))
    const options = screen.getAllByRole('option')
    expect(options.map((o) => o.textContent)).toEqual([
      expect.stringContaining('Linda Demers'), expect.stringContaining('Dana Okafor'),
    ])
    expect(input()).toHaveAttribute('aria-expanded', 'true')
    expect(input()).toHaveAttribute('aria-activedescendant', options[0]!.id)
    expect(options[0]).toHaveAttribute('aria-selected', 'true')
    // The match is bolded; options hold no interactive content.
    expect(options[0]!.querySelector('.d3-rcp__match')?.textContent).toBe('D')
    expect(listbox.querySelectorAll('button, a, input, [tabindex]')).toHaveLength(0)
  })

  it('arrow keys move aria-activedescendant and wrap; focus stays in the input', async () => {
    const { user } = setup()
    await user.type(input(), 'd')
    await screen.findByRole('listbox')
    const [a, b] = screen.getAllByRole('option')
    await user.keyboard('{ArrowDown}')
    expect(input()).toHaveAttribute('aria-activedescendant', b!.id)
    await user.keyboard('{ArrowDown}')
    expect(input()).toHaveAttribute('aria-activedescendant', a!.id)
    await user.keyboard('{ArrowUp}')
    expect(input()).toHaveAttribute('aria-activedescendant', b!.id)
    expect(input()).toHaveFocus()
  })

  it('Enter adds the active suggestion as a chip, with its name', async () => {
    const { user } = setup()
    await user.type(input(), 'd')
    await screen.findByRole('listbox')
    await user.keyboard('{ArrowDown}{Enter}')
    expect(last).toEqual([{ name: 'Dana Okafor', address: 'dana.okafor.builds@gmail.com' }])
    expect(input()).toHaveValue('')
    expect(input()).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('status')).toHaveTextContent('Added Dana Okafor.')
  })

  it('Tab adds the active suggestion and keeps focus', async () => {
    const { user } = setup()
    await user.type(input(), 'lin')
    await screen.findByRole('listbox')
    await user.keyboard('{Tab}')
    expect(last).toEqual([{ name: 'Linda Demers', address: 'linda.demers@gmail.com' }])
    expect(input()).toHaveFocus()
    // With nothing typed, Tab is Tab again — the field is not a trap.
    await user.keyboard('{Tab}')
    expect(input()).not.toHaveFocus()
  })

  it('Escape closes the list without clearing the text', async () => {
    const { user } = setup()
    await user.type(input(), 'd')
    await screen.findByRole('listbox')
    await user.keyboard('{Escape}')
    expect(input()).toHaveAttribute('aria-expanded', 'false')
    expect(input()).not.toHaveAttribute('aria-activedescendant')
    expect(input()).toHaveValue('d')
    // ↓ reopens it.
    await user.keyboard('{ArrowDown}')
    expect(input()).toHaveAttribute('aria-expanded', 'true')
  })

  it('a click on an option adds it and keeps focus in the input', async () => {
    const { user } = setup()
    await user.type(input(), 'priya')
    const opt = await screen.findByRole('option')
    await user.click(opt)
    expect(last).toEqual([{ name: 'Priya Shah', address: 'priya.shah@gmail.com' }])
    expect(input()).toHaveFocus()
  })

  it('does not suggest someone already added', async () => {
    const { user } = setup({ initial: [{ name: 'Linda Demers', address: 'Linda.Demers@gmail.com' }] })
    await user.type(input(), 'd')
    await screen.findByRole('listbox')
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([expect.stringContaining('Dana')])
  })

  it('shows only the answer to the latest query', async () => {
    const slow = vi.fn((q: string, { signal }: { signal: AbortSignal }) => new Promise<RecipientSuggestion[]>((res) => {
      setTimeout(() => res(signal.aborted ? [] : [{ name: `Answer ${q}`, address: `${q}@x.io` }]), q === 'd' ? 50 : 5)
    }))
    const { user } = setup({ loadSuggestions: slow })
    await user.type(input(), 'da')
    await screen.findByRole('listbox')
    await new Promise((r) => setTimeout(r, 80))
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([expect.stringContaining('Answer da')])
  })
})

describe('RecipientField — committing typed and pasted text', () => {
  it('Enter commits what was typed when no suggestion is active', async () => {
    const { user } = setup({ loadSuggestions: undefined })
    await user.type(input(), 'Sam <sam@x.io>{Enter}')
    expect(last).toEqual([{ name: 'Sam', address: 'sam@x.io' }])
  })

  it('a comma or semicolon commits — but not inside a quoted name', async () => {
    const { user } = setup({ loadSuggestions: undefined })
    await user.type(input(), 'a@x.io,b@x.io;')
    expect(last.map((r) => r.address)).toEqual(['a@x.io', 'b@x.io'])
    await user.type(input(), '"Shah, Priya" <p@x.io>,')
    expect(last[2]).toEqual({ name: 'Shah, Priya', address: 'p@x.io' })
  })

  it('paste splits on comma, semicolon and newline, and parses "Name <addr>"', async () => {
    const { user } = setup({ loadSuggestions: undefined })
    await user.click(input())
    await user.paste('Priya Shah <priya@x.io>; jonah@x.io\n"Park, Elena" <elena@x.io>')
    expect(last).toEqual([
      { name: 'Priya Shah', address: 'priya@x.io' },
      { address: 'jonah@x.io' },
      { name: 'Park, Elena', address: 'elena@x.io' },
    ])
    expect(input()).toHaveValue('')
    expect(screen.getByRole('status')).toHaveTextContent('Added 3 recipients.')
  })

  it('a pasted word with no address stays as text to search on', async () => {
    const { user } = setup({ loadSuggestions: undefined })
    await user.click(input())
    await user.paste('Okafor')
    expect(input()).toHaveValue('Okafor')
    expect(last).toEqual([])
  })

  it('does not add the same address twice', async () => {
    const { user } = setup({ loadSuggestions: undefined, initial: [{ address: 'a@x.io' }] })
    await user.click(input())
    await user.paste('A@X.io, b@x.io, b@x.io')
    expect(last.map((r) => r.address)).toEqual(['a@x.io', 'b@x.io'])
  })

  it('leaving the field commits what was typed', async () => {
    const { user } = setup({ loadSuggestions: undefined })
    await user.type(input(), 'sam@x.io')
    await user.tab({ shift: true })
    expect(last).toEqual([{ address: 'sam@x.io' }])
  })
})

describe('RecipientField — chips from the keyboard', () => {
  const initial = [
    { name: 'Priya Shah', address: 'priya@x.io' },
    { name: 'Jonah Reyes', address: 'jonah@x.io' },
    { name: 'Elena Park', address: 'elena@x.io' },
  ]

  it('Backspace on an empty field selects the last chip, then removes it', async () => {
    const { user } = setup({ initial })
    await user.click(input())
    await user.keyboard('{Backspace}')
    expect(last).toEqual([])
    const lastChip = screen.getAllByRole('listitem')[2]!
    expect(lastChip).toHaveClass('d3-rcp__chip--selected')
    expect(screen.getByRole('status')).toHaveTextContent('Elena Park selected. Backspace removes it.')
    await user.keyboard('{Backspace}')
    expect(chips()).toEqual(['Priya Shah', 'Jonah Reyes'])
    expect(screen.getByRole('status')).toHaveTextContent('Removed Elena Park.')
    // And again: select, then remove.
    await user.keyboard('{Backspace}{Backspace}')
    expect(chips()).toEqual(['Priya Shah'])
  })

  it('Backspace with text in the field edits the text, not the chips', async () => {
    const { user } = setup({ initial, loadSuggestions: undefined })
    await user.type(input(), 'ab{Backspace}')
    expect(input()).toHaveValue('a')
    expect(screen.queryByText('', { selector: '.d3-rcp__chip--selected' })).toBeNull()
  })

  it('← and → move the selection across chips; Delete removes the selected one', async () => {
    const { user } = setup({ initial })
    await user.click(input())
    await user.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(screen.getAllByRole('listitem')[1]).toHaveClass('d3-rcp__chip--selected')
    await user.keyboard('{Delete}')
    expect(chips()).toEqual(['Priya Shah', 'Elena Park'])
    await user.keyboard('{ArrowLeft}{ArrowRight}')
    expect(document.querySelector('.d3-rcp__chip--selected')).toBeNull()
    expect(input()).toHaveFocus()
  })

  it('Escape or typing drops the chip selection', async () => {
    const { user } = setup({ initial, loadSuggestions: undefined })
    await user.click(input())
    await user.keyboard('{Backspace}{Escape}')
    expect(document.querySelector('.d3-rcp__chip--selected')).toBeNull()
    await user.keyboard('{Backspace}x')
    expect(document.querySelector('.d3-rcp__chip--selected')).toBeNull()
    expect(input()).toHaveValue('x')
    expect(chips()).toHaveLength(3)
  })

  it('the remove buttons are for the pointer: out of the tab order, and named', async () => {
    const { user } = setup({ initial })
    const remove = screen.getByRole('button', { name: 'Remove Jonah Reyes' })
    expect(remove).toHaveAttribute('tabindex', '-1')
    await user.click(remove)
    expect(chips()).toEqual(['Priya Shah', 'Elena Park'])
    expect(input()).toHaveFocus()
  })
})

describe('RecipientField — what a chip shows', () => {
  it('initials and name, with the address in the title and the accessible text', () => {
    setup({ initial: [{ name: 'Priya Shah', address: 'priya@x.io' }] })
    const chip = screen.getByRole('listitem')
    expect(chip).toHaveAttribute('title', 'Priya Shah <priya@x.io>')
    expect(chip.querySelector('.d3-rcp__initials')).toHaveTextContent('PS')
    expect(chip.querySelector('.d3-rcp__initials')).toHaveAttribute('aria-hidden', 'true')
    expect(chip).toHaveTextContent('Priya Shah priya@x.io')
  })

  it('an invalid address is the danger tone, a "!" glyph, said in words, and marks the field invalid', () => {
    setup({ initial: [{ address: 'jonah@fastmail' }] })
    const chip = screen.getByRole('listitem')
    expect(chip).toHaveClass('d3-rcp__chip--invalid')
    expect(chip.querySelector('.d3-rcp__initials')).toHaveTextContent('!')
    expect(chip).toHaveTextContent('not a valid address')
    expect(input()).toHaveAttribute('aria-invalid', 'true')
  })

  it('validate replaces the default check', () => {
    setup({ initial: [{ address: 'root@localhost' }], validate: (a) => a.includes('@') })
    expect(screen.getByRole('listitem')).not.toHaveClass('d3-rcp__chip--invalid')
  })

  it('only chips added after first render scale in', async () => {
    const { user } = setup({ initial: [{ address: 'a@x.io' }], loadSuggestions: undefined })
    await user.type(input(), 'b@x.io,')
    const [a, b] = screen.getAllByRole('listitem')
    expect(a).not.toHaveClass('d3-rcp__chip--enter')
    expect(b).toHaveClass('d3-rcp__chip--enter')
  })
})

describe('RecipientField — the row variant', () => {
  it('draws its label visibly and names the combobox by it', () => {
    render(<RecipientField variant="row" label="Cc" trailing={<button type="button">Bcc</button>} />)
    const label = screen.getByText('Cc', { selector: 'label' })
    expect(label).toBeVisible()
    expect(screen.getByRole('combobox', { name: 'Cc' })).toBeInTheDocument()
    expect(screen.queryByRole('list')).toBeNull()
  })

  it('is uncontrolled with defaultValue', () => {
    render(<RecipientField variant="row" label="To" defaultValue={[{ address: 'a@x.io' }]} />)
    expect(screen.getByRole('list', { name: 'To recipients' })).toBeInTheDocument()
  })
})

describe('RecipientField — motion (CSSOM; jsdom computes no animation)', () => {
  const rule = (selector: string, inMedia = false) => {
    for (const sheet of Array.from(document.styleSheets)) {
      for (const r of Array.from(sheet.cssRules)) {
        if (!inMedia && r instanceof CSSStyleRule && r.selectorText === selector) return r.style
        if (inMedia && r instanceof CSSMediaRule && r.conditionText.includes('prefers-reduced-motion')) {
          for (const inner of Array.from(r.cssRules)) {
            if (inner instanceof CSSStyleRule && inner.selectorText === selector) return inner.style
          }
        }
      }
    }
    return null
  }

  it('chips scale in on a motion token, backwards-fill only', () => {
    render(<RecipientField aria-label="To" />)
    const a = rule('.d3-rcp__chip--enter')!.getPropertyValue('animation')
    expect(a).toContain('d3-rcp-chip-in')
    expect(a).toContain('var(--dur-2)')
    expect(a).toContain('var(--ease-spring)')
    expect(a).toContain('backwards')
  })

  it('under reduced motion they fade instead of scaling', () => {
    render(<RecipientField aria-label="To" />)
    expect(rule('.d3-rcp__chip--enter', true)!.getPropertyValue('animation')).toContain('d3-rcp-fade')
  })
})

describe('RecipientField — axe', () => {
  it('closed, with chips including an invalid one', async () => {
    const { container } = setup({ initial: [{ name: 'Priya Shah', address: 'p@x.io' }, { address: 'bad' }] })
    await expectNoAxeViolations(container)
  })

  it('open, with an active option', async () => {
    const { user, container } = setup()
    await user.type(input(), 'd')
    await screen.findByRole('listbox')
    await expectNoAxeViolations(container)
  })

  it('a row with a selected chip', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <RecipientField variant="row" label="To" defaultValue={[{ name: 'Priya Shah', address: 'p@x.io' }]} />)
    await user.click(screen.getByRole('combobox', { name: 'To' }))
    await user.keyboard('{Backspace}')
    await expectNoAxeViolations(container)
  })
})

describe('RecipientField — degrades', () => {
  it('renders with no props, and a loader that throws closes the list', async () => {
    expect(() => render(<RecipientField aria-label="x" />)).not.toThrow()
    const user = userEvent.setup()
    render(<RecipientField aria-label="Bad" suggestDelay={0} loadSuggestions={() => { throw new Error('offline') }} />)
    await user.type(screen.getByRole('combobox', { name: 'Bad' }), 'd')
    await act(async () => { await new Promise((r) => setTimeout(r, 10)) })
    expect(screen.getByRole('combobox', { name: 'Bad' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('a composition Enter (IME) commits nothing', () => {
    render(<RecipientField aria-label="To" />)
    const box = screen.getByRole('combobox', { name: 'To' })
    fireEvent.change(box, { target: { value: 'a@x.io' } })
    fireEvent.keyDown(box, { key: 'Enter', isComposing: true })
    expect(box).toHaveValue('a@x.io')
  })

  it('waits for the pause before calling the loader', async () => {
    const spy = vi.fn(async () => [])
    const user = userEvent.setup()
    render(<RecipientField aria-label="To" suggestDelay={40} loadSuggestions={spy} />)
    await user.type(screen.getByRole('combobox', { name: 'To' }), 'abc')
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1))
    expect(spy).toHaveBeenCalledWith('abc', expect.anything())
  })
})
