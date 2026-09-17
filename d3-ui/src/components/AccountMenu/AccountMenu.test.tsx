import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AccountMenu } from './AccountMenu'
import { MenuItem } from '../Menu/Menu'
import { AppShellContext } from '../AppShell/AppShellContext'

describe('AccountMenu', () => {
  it('is a menu button named by who is signed in', () => {
    render(<AccountMenu name="Dana Whitfield" detail="dana@example.com"><MenuItem>Sign out</MenuItem></AccountMenu>)
    const trigger = screen.getByRole('button', { name: /Dana Whitfield/ })
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger).toHaveTextContent('dana@example.com')
    // The avatar is decorative: the name beside it is the name.
    expect(trigger.querySelector('.d3-avt')).toHaveAttribute('aria-hidden', 'true')
  })

  it('on a collapsed rail shows the avatar alone, and keeps the name', () => {
    render(
      <AppShellContext.Provider value={{ collapsed: true, drawer: false }}>
        <AccountMenu name="Dana Whitfield" detail="dana@example.com" />
      </AppShellContext.Provider>,
    )
    const trigger = screen.getByRole('button', { name: /Dana Whitfield/ })
    expect(trigger).toHaveClass('d3-acct--collapsed')
    expect(screen.getByText('Dana Whitfield').parentElement).toHaveClass('d3-acct__vh')
  })
})
