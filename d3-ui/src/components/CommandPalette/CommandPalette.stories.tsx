import { useEffect, useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Archive, Calendar, ChevronDown, Clock, FolderInput, Inbox, Paperclip, Receipt, User } from 'lucide-react'
import { Avatar } from '../Avatar/Avatar'
import { Button } from '../Button/Button'
import {
  CommandPalette, CommandPaletteChip, CommandPaletteHint, type CommandPaletteGroup,
} from './CommandPalette'

const noop = () => {}

const MESSAGES = [
  { id: 'm1', label: 'Re: Acadia over Columbus Day weekend?', from: 'Priya Shah', when: '10:24 AM' },
  { id: 'm2', label: 'Reservation confirmed: Blackwoods Campground, Acadia NP', from: 'Recreation.gov', when: 'Sep 22' },
  { id: 'm3', label: 'Dad’s old Acadia photos from ’98', from: 'Linda Demers', when: 'Sep 14' },
  { id: 'm4', label: 'Kitchen reno — revised quote', from: 'Dana Okafor', when: 'Mon' },
]
const PLACES = [
  { id: 'inbox', label: 'Inbox', icon: <Inbox />, shortcut: ['G', 'I'] },
  { id: 'archive', label: 'Archive', icon: <Archive />, shortcut: ['G', 'A'] },
  { id: 'receipts', label: 'Receipts', icon: <Receipt /> },
]
const ACTIONS = [
  { id: 'archive-conv', label: 'Archive conversation', icon: <Archive />, shortcut: 'E' },
  { id: 'snooze', label: 'Snooze…', icon: <Clock />, shortcut: 'B' },
  { id: 'move', label: 'Move to…', icon: <FolderInput />, shortcut: 'V' },
]

const has = (text: string, q: string) => text.toLowerCase().includes(q.trim().toLowerCase())

/** A stand-in for the app's search: it filters; the palette only marks and moves. */
function useMailGroups(query: string): CommandPaletteGroup[] {
  return useMemo(() => {
    const q = query.trim()
    return [
      {
        id: 'messages', label: 'Messages',
        items: (q ? MESSAGES.filter((m) => has(m.label, q)) : MESSAGES.slice(0, 3)).map((m) => ({
          id: m.id, label: m.label, description: `${m.from} · ${m.when}`,
          leading: <Avatar name={m.from} size="sm" tint="auto" />, onSelect: noop,
        })),
      },
      {
        id: 'go', label: 'Go to',
        items: PLACES.filter((p) => !q || has(p.label, q) || q.toLowerCase() === 'acadia').map((p) => ({
          id: p.id, label: p.label, leading: p.icon, shortcut: p.shortcut, onSelect: noop,
        })),
      },
      {
        id: 'actions', label: 'Actions',
        items: ACTIONS.map((a) => ({ id: a.id, label: a.label, leading: a.icon, shortcut: a.shortcut, onSelect: noop })),
      },
    ]
  }, [query])
}

type Args = React.ComponentProps<typeof CommandPalette>

/** The palette as an app holds it: open state, query state, a way back in. */
function Palette(props: Partial<Args> & { initialQuery?: string; groupsFor?: (q: string) => CommandPaletteGroup[] }) {
  const { initialQuery = 'acadia', groupsFor, ...rest } = props
  const [open, setOpen] = useState(true)
  const [query, setQuery] = useState(initialQuery)
  const mail = useMailGroups(query)
  const groups = groupsFor ? groupsFor(query) : mail
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>Search</Button>
      <CommandPalette
        label="Search mail and commands"
        placeholder="Search mail, mailboxes and actions"
        {...rest}
        open={open}
        onOpenChange={setOpen}
        query={query}
        onQueryChange={setQuery}
        groups={groups}
      />
    </>
  )
}

const meta = {
  title: 'Layers/CommandPalette',
  component: CommandPalette,
  tags: ['autodocs'],
  args: { open: true, onOpenChange: noop, label: 'Search mail and commands', groups: [] },
  parameters: { docs: { description: { component:
    'A ⌘K palette: one input over grouped results — messages, places, actions.\n\n' +
    'Built on Radix Dialog like `Modal` (scrim, focus trap, Escape, focus return), with a 640px ' +
    'panel near the top third. The input is an APG **combobox** driving a **listbox** through ' +
    '`aria-activedescendant` (D-074, D-078): focus never leaves it. ↓/↑ move through every group ' +
    'and wrap, Home/End jump to the ends, Enter runs the active result and closes, Esc closes.\n\n' +
    'The palette does not search: the app passes `groups` already filtered for `query`, and the ' +
    'palette marks the match. **It listens for no global keys** — the app binds ⌘K itself ' +
    '(see *App owns the shortcut*).\n\n' +
    '**It moves like a popover, not a modal** (D-084): in on `--motion-popover-enter` (200ms ' +
    'ease-out, a 6px drop, no overshoot), out on `--motion-menu-exit` (140ms). It is opened dozens ' +
    'of times an hour, which is D-024\'s reason for the menu family\'s Confident tier. Under reduced ' +
    'motion it appears and goes with no animation at all.' } } },
} satisfies Meta<typeof CommandPalette>
export default meta
type Story = StoryObj<typeof meta>

export const MailSearch: Story = {
  render: () => <Palette />,
  parameters: { docs: { description: { story:
    'The mail search from the Postroom canvas: "acadia" marked in every message subject, avatars ' +
    'as leading, key caps for the items that have their own shortcut.' } } },
}

export const WithFilterChips: Story = {
  render: function Render() {
    const [attach, setAttach] = useState(true)
    return (
      <Palette
        filters={
          <>
            <CommandPaletteChip>In: <b>All mail</b><ChevronDown size={12} aria-hidden="true" /></CommandPaletteChip>
            <CommandPaletteChip><User size={12} aria-hidden="true" />From</CommandPaletteChip>
            <CommandPaletteChip pressed={attach} onClick={() => setAttach((a) => !a)}>
              <Paperclip size={12} aria-hidden="true" />Has attachment
            </CommandPaletteChip>
            <CommandPaletteChip><Calendar size={12} aria-hidden="true" />Date</CommandPaletteChip>
          </>
        }
        footer={
          <>
            <CommandPaletteHint keys={['↑', '↓']}>navigate</CommandPaletteHint>
            <CommandPaletteHint keys={['↵']}>open</CommandPaletteHint>
            <CommandPaletteHint keys={['⌘', '↵']}>open in new tab</CommandPaletteHint>
          </>
        }
      />
    )
  },
  parameters: { docs: { description: { story:
    '`filters` takes `CommandPaletteChip`s: real buttons, one tab stop each after the input. ' +
    'A toggle chip sets `pressed`, which is `aria-pressed`. A custom footer is built from ' +
    '`CommandPaletteHint`s.' } } },
}

export const Empty: Story = {
  render: () => <Palette initialQuery="zzzz" groupsFor={() => []} />,
  parameters: { docs: { description: { story:
    'No results: a line of text in place of the list, and the same words announced politely. ' +
    'There is no listbox with nothing in it — that is an ARIA error.' } } },
}

export const Loading: Story = {
  render: () => <Palette initialQuery="acad" loading groupsFor={() => []} />,
  parameters: { docs: { description: { story:
    'Waiting with nothing yet: placeholder rows shaped like results, and the results region is ' +
    '`aria-busy`. With stale results already showing, a spinner sits in the input row instead.' } } },
}

export const AppOwnsTheShortcut: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true)
    const [query, setQuery] = useState('')
    const groups = useMailGroups(query)
    // The app, not the library, binds ⌘K / Ctrl+K — and decides where it applies.
    useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault()
          setOpen((o) => !o)
        }
      }
      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
    }, [])
    return (
      <>
        <Button variant="secondary" aria-keyshortcuts="Meta+K Control+K" onClick={() => setOpen(true)}>
          Search (⌘K)
        </Button>
        <CommandPalette
          label="Search mail and commands"
          open={open}
          onOpenChange={(o) => { setOpen(o); if (!o) setQuery('') }}
          query={query}
          onQueryChange={setQuery}
          groups={groups}
        />
      </>
    )
  },
  parameters: { docs: { description: { story:
    'The library adds no global key listener. The app registers ⌘K / Ctrl+K on `window`, ' +
    'toggles `open`, and clears the query on close — and puts `aria-keyshortcuts` on the ' +
    'button that opens it.' } } },
}

/** Open it, close it, open it again — in both themes. */
export const OpensLikeAPopover: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const groups = useMailGroups(query)
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>Open the palette</Button>
        <CommandPalette
          label="Search mail and commands"
          open={open}
          onOpenChange={(o) => { setOpen(o); if (!o) setQuery('') }}
          query={query}
          onQueryChange={setQuery}
          groups={groups}
        />
      </>
    )
  },
  parameters: { docs: { description: { story:
    'The panel and its scrim land in 200ms on `--motion-popover-enter` and leave in 140ms on ' +
    '`--motion-menu-exit` — the Confident tier the Select list and the Menu use, not the ' +
    "Modal's 420ms spring (D-084, PST-DA-068)." } } },
}
