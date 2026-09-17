import { forwardRef } from 'react'
import { cn } from '../../lib/cn'
import { devWarn } from '../../lib/dev'
import { ChevronUpDownGlyph } from '../../lib/glyphs'
import { Avatar } from '../Avatar/Avatar'
import { Menu, MenuContent, MenuTrigger } from '../Menu/Menu'
import { Tooltip } from '../Tooltip/Tooltip'
import { useAppShell } from '../AppShell/AppShellContext'
import './AccountMenu.css'

export interface AccountMenuProps {
  /** The signed-in person. Shown beside the avatar, and names the trigger. */
  name: string
  /** A second line: email, role, or organisation. */
  detail?: string
  avatarSrc?: string
  /**
   * The menu: `MenuItem`s, `MenuSeparator`s, and a `ThemeSwitch` if the app
   * offers one — it renders as menu radios in here. Sign-out is the app's
   * `MenuItem`, usually last and `tone="danger"`.
   */
  children?: React.ReactNode
  className?: string
}

/**
 * Who is signed in, and the things you set up once: account, settings, theme,
 * sign-out. It sits in the AppShell `footer`.
 *
 * **Sign-out belongs to the app.** It is a navigation or a form post the
 * library knows nothing about — a server session, an OIDC end-session
 * redirect, a CSRF token — so it is passed in as an item:
 *
 * ```tsx
 * <MenuItem asChild tone="danger"><button type="submit" form="sign-out">Sign out</button></MenuItem>
 * ```
 *
 * On a collapsed rail the trigger is the avatar alone, with the name in a
 * tooltip and still in the button's accessible name.
 */
export const AccountMenu = forwardRef<HTMLButtonElement, AccountMenuProps>(function AccountMenu(
  { name, detail, avatarSrc, children, className },
  ref,
) {
  if (process.env.NODE_ENV !== 'production') {
    if (typeof name !== 'string' || !name) {
      devWarn('AccountMenu.name', 'AccountMenu: `name` is required — it names the menu button, and a button ' +
        'announced as "menu button" says nothing about whose account it is.')
    }
  }
  const { collapsed } = useAppShell()
  const who = typeof name === 'string' ? name : ''

  const trigger = (
    <button
      ref={ref}
      type="button"
      className={cn('d3-acct', collapsed && 'd3-acct--collapsed', className)}
    >
      <Avatar name={who} src={avatarSrc} size="md" />
      <span className={cn('d3-acct__text', collapsed && 'd3-acct__vh')}>
        <span className="d3-acct__name">{who}</span>
        {detail ? <span className="d3-acct__detail">{detail}</span> : null}
      </span>
      {collapsed ? null : <span className="d3-acct__chevron" aria-hidden="true"><ChevronUpDownGlyph /></span>}
    </button>
  )

  return (
    <Menu>
      {collapsed && who ? (
        <Tooltip content={who} side="right"><MenuTrigger>{trigger}</MenuTrigger></Tooltip>
      ) : (
        <MenuTrigger>{trigger}</MenuTrigger>
      )}
      {/* Opens upward from the foot of the sidebar, or beside the rail. */}
      <MenuContent side={collapsed ? 'right' : 'top'} align={collapsed ? 'end' : 'start'}>
        {children}
      </MenuContent>
    </Menu>
  )
})
