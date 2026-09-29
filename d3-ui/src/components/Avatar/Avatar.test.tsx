import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Avatar, initialsOf, avatarTintFor } from './Avatar'
import { __resetDevWarnings } from '../../lib/dev'

describe('Avatar — the contract', () => {
  it('derives at most two initials, first and last', () => {
    expect(initialsOf('Dana Whitfield')).toBe('DW')
    expect(initialsOf('Priya')).toBe('P')
    expect(initialsOf('Ada Byron King Lovelace')).toBe('AL')
    expect(initialsOf('   ')).toBe('')
  })

  it('is decorative by default, so the name is not announced twice', () => {
    const { container } = render(<Avatar name="Dana Whitfield" />)
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('carries the person’s name when standing alone', () => {
    render(<Avatar name="Dana Whitfield" decorative={false} />)
    expect(screen.getByRole('img', { name: 'Dana Whitfield' })).toBeInTheDocument()
  })

  it('never renders alt text on the image — the wrapper owns the name', () => {
    render(<Avatar name="Dana Whitfield" src="/x.png" decorative={false} />)
    expect(screen.getByRole('img', { name: 'Dana Whitfield' })).toBeInTheDocument()
    const img = document.querySelector('img')
    expect(img).toHaveAttribute('alt', '')
  })
})

const tintClass = (el: Element | null) => el?.className.match(/d3-avt--tint-(\d)/)?.[1]

describe('Avatar — tint', () => {
  beforeEach(() => __resetDevWarnings())
  afterEach(() => vi.restoreAllMocks())

  it('is the neutral look by default — no tint class, so existing apps do not change', () => {
    const { container } = render(<Avatar name="Dana Whitfield" />)
    expect(container.firstElementChild?.className).toBe('d3-avt d3-avt--md')
    const none = render(<Avatar name="Dana Whitfield" tint="none" />)
    expect(none.container.firstElementChild?.className).toBe('d3-avt d3-avt--md')
  })

  it('pins a tint by number', () => {
    for (const n of [1, 2, 3, 4, 5, 6] as const) {
      const { container } = render(<Avatar name="Dana Whitfield" tint={n} />)
      expect(container.firstElementChild).toHaveClass(`d3-avt--tint-${n}`)
    }
  })

  it('auto gives the same tint for the same name, on every render and however it is typed', () => {
    const a = render(<Avatar name="Dana Whitfield" tint="auto" />)
    const b = render(<Avatar name="Dana Whitfield" tint="auto" />)
    const c = render(<Avatar name="  dana WHITFIELD " tint="auto" />)
    expect(tintClass(a.container.firstElementChild)).toBe('2')
    expect(tintClass(b.container.firstElementChild)).toBe('2')
    expect(tintClass(c.container.firstElementChild)).toBe('2')
  })

  it('pins known names to known tints — this table is a public contract', () => {
    // FNV-1a 32-bit over the UTF-8 of the trimmed, lower-cased name, mod 6, + 1.
    // If this test fails, the hash changed and every avatar in every app recoloured.
    const pinned: Record<string, number> = {
      'Priya Shah': 5,
      'Jonah Reyes': 4,
      'Linda Demers': 4,
      'Sam Whitaker': 4,
      'Dana Okafor': 4,
      'Elena Park': 5,
      'Dana Whitfield': 2,
      'Priya Raman': 6,
      'Ada Lovelace': 3,
      'Björn Ek': 5,
      '李雷': 6,
    }
    for (const [name, tint] of Object.entries(pinned)) expect(avatarTintFor(name), name).toBe(tint)
  })

  it('reaches all six tints across a spread of names, and never leaves 1–6', () => {
    const seen = new Set<number | undefined>()
    for (const first of ['Ana', 'Ben', 'Cy', 'Di', 'Ed', 'Flo', 'Gus', 'Hal']) {
      for (const last of ['Ames', 'Bose', 'Cruz', 'Diaz', 'Eze']) seen.add(avatarTintFor(`${first} ${last}`))
    }
    expect([...seen].sort()).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('auto with no name stays neutral', () => {
    expect(avatarTintFor('   ')).toBeUndefined()
    const { container } = render(<Avatar name="" tint="auto" />)
    expect(container.firstElementChild?.className).not.toMatch(/tint/)
  })

  it('leaves an image avatar alone — the tint only exists behind initials', () => {
    const { container } = render(<Avatar name="Dana Whitfield" src="/x.png" tint="auto" />)
    expect(container.querySelector('img')).toBeInTheDocument()
    expect(container.textContent).toBe('')
  })

  it('warns in development on a bad tint and renders neutral', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // @ts-expect-error — the point is a value the types would refuse
    const { container } = render(<Avatar name="Dana Whitfield" tint={7} />)
    expect(container.firstElementChild?.className).not.toMatch(/tint/)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('tint'))
  })
})
