import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Avatar, initialsOf } from './Avatar'

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
