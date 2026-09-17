import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuTrigger } from './Menu'
import { Button } from '../Button/Button'
import { __resetDevWarnings } from '../../lib/dev'

/*
 * Opening a positioned layer in jsdom takes seconds (floating-ui reads every
 * ancestor's computed style), so the open menu — roles, keyboard, the theme
 * radios and the panel's look — is exercised in browser/shell.spec.ts. These
 * are the parts that do not need it to be open.
 */
let warn: ReturnType<typeof vi.spyOn>
beforeEach(() => { __resetDevWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
afterEach(() => warn.mockRestore())
const warned = (s: string) => warn.mock.calls.some((c: unknown[]) => String(c[0]).includes(s))

describe('Menu — the closed contract', () => {
  it('makes its trigger a menu button', () => {
    render(
      <Menu>
        <MenuTrigger><Button>Actions</Button></MenuTrigger>
        <MenuContent><MenuItem>Rename</MenuItem></MenuContent>
      </Menu>,
    )
    const trigger = screen.getByRole('button', { name: 'Actions' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('a part outside its menu renders nothing and says why, instead of throwing', () => {
    expect(() => render(
      <>
        <MenuTrigger><button>x</button></MenuTrigger>
        <MenuContent />
        <MenuItem>Rename</MenuItem>
        <MenuSeparator />
        <MenuLabel>Label</MenuLabel>
      </>,
    )).not.toThrow()
    expect(screen.queryByText('Rename')).toBeNull()
    expect(warned('MenuItem: render it inside <MenuContent>')).toBe(true)
    expect(warned('MenuContent: render it inside <Menu>')).toBe(true)
  })

  it('warns on a tone that does not exist', () => {
    render(<MenuItem tone={'warning' as 'danger'}>x</MenuItem>)
    expect(warned('MenuItem: `tone="warning"`')).toBe(true)
  })
})
