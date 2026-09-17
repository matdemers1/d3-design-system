import type { Meta, StoryObj } from '@storybook/react'
import { Copy, Download, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuTrigger } from './Menu'
import { Button } from '../Button/Button'
import { IconButton } from '../IconButton/IconButton'

const icon = (I: typeof Copy) => <I size={16} strokeWidth={1.8} />

const meta = {
  title: 'Layers/Menu',
  component: Menu,
  tags: ['autodocs'],
  parameters: { docs: { description: { component:
    'Actions or destinations behind a button — the account menu, a row\'s overflow actions.\n\n' +
    'A thin wrapper over Radix DropdownMenu, so roving focus, typeahead, Escape, focus return and ' +
    '`aria-expanded` are Radix\'s and the look is the system\'s: a floating layer at `surface-raised` ' +
    'with a 1px `border-float`, `radius-lg`, and **no shadow** (D-023). It opens on the Confident ' +
    'tier — 200ms, no overshoot, no stagger — because a menu is opened dozens of times an hour (D-024).\n\n' +
    'A menu is for doing and going. A choice inside a form is a `Select`; switching what a region ' +
    'shows is a `SegmentedControl`.' } } },
} satisfies Meta<typeof Menu>
export default meta
type Story = StoryObj<typeof meta>

function RowActions() {
  return (
    <Menu>
      <MenuTrigger>
        <IconButton label="Actions for Invoice 2026-114" icon={icon(MoreHorizontal)} />
      </MenuTrigger>
      <MenuContent align="end">
        <MenuItem icon={icon(Pencil)}>Rename</MenuItem>
        <MenuItem icon={icon(Copy)}>Copy link</MenuItem>
        <MenuItem icon={icon(Download)}>Download original</MenuItem>
        <MenuSeparator />
        <MenuItem icon={icon(Trash2)} tone="danger">Delete invoice</MenuItem>
      </MenuContent>
    </Menu>
  )
}

/**
 * A row's overflow actions. The trigger's name says which row it acts on. The
 * destructive item names its object and sits last, after a separator — it is
 * never the first thing an arrow key reaches.
 *
 * (There is no open-by-default story: positioning an open menu in jsdom takes
 * seconds per render. The open panel is checked in the browser suite.)
 */
export const RowOverflow: Story = { render: () => <RowActions /> }

/**
 * Destinations are real links, through `asChild`, so they open in a new tab on
 * a modified click and a router keeps client-side navigation. A form post is a
 * real submit button pointed at a form the app owns.
 */
export const LinksAndAFormPost: Story = {
  render: () => (
    <>
      <form id="story-sign-out" method="post" action="#" hidden />
      <Menu>
        <MenuTrigger><Button>Account</Button></MenuTrigger>
        <MenuContent>
          <MenuLabel>dana@example.com</MenuLabel>
          <MenuItem asChild><a href="#account">Your account</a></MenuItem>
          <MenuItem asChild><a href="#settings">Settings</a></MenuItem>
          <MenuSeparator />
          <MenuItem asChild tone="danger">
            <button type="submit" form="story-sign-out">Sign out</button>
          </MenuItem>
        </MenuContent>
      </Menu>
    </>
  ),
}

export const DisabledItem: Story = {
  render: () => (
    <Menu>
      <MenuTrigger><Button>Export</Button></MenuTrigger>
      <MenuContent>
        <MenuItem>As PDF</MenuItem>
        <MenuItem disabled>As spreadsheet</MenuItem>
      </MenuContent>
    </Menu>
  ),
}
