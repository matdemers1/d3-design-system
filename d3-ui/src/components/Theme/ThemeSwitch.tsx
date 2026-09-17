import { SegmentedControl } from '../SegmentedControl/SegmentedControl'
import { MenuRadioGroup, useInMenu } from '../Menu/Menu'
import { useTheme } from './ThemeProvider'
import type { ThemePreference } from './ThemeProvider'

export interface ThemeSwitchProps {
  /** Names the choice. Visible inside a menu; the group's name elsewhere. */
  label?: string
  /** Outside a menu only — the SegmentedControl size. */
  size?: 'sm' | 'md'
  className?: string
}

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

/**
 * System / Light / Dark, wired to `ThemeProvider`.
 *
 * It renders the right control for where it is placed:
 * - **inside a `MenuContent`** (the account menu) — a labelled group of
 *   `menuitemradio`s. A menu may only contain menu items, and Radix's roving
 *   focus and typeahead own every arrow key in it, so a radiogroup there would
 *   be both invalid and unreachable (D-066). Choosing keeps the menu open.
 * - **anywhere else** (a settings page) — a `SegmentedControl`, the system's
 *   one-of-a-few radiogroup.
 */
export function ThemeSwitch({ label = 'Theme', size = 'md', className }: ThemeSwitchProps) {
  const { preference, setPreference } = useTheme()
  const inMenu = useInMenu()
  const choose = (v: string) => setPreference(v as ThemePreference)
  if (inMenu) {
    return <MenuRadioGroup label={label} value={preference} onValueChange={choose} options={OPTIONS} />
  }
  return (
    <SegmentedControl
      items={OPTIONS}
      value={preference}
      onValueChange={choose}
      size={size}
      aria-label={label}
      className={className}
    />
  )
}
