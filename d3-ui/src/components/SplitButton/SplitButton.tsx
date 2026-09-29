import { forwardRef } from 'react'
import { cn } from '../../lib/cn'
import { devOneOf, devWarn } from '../../lib/dev'
import { Button } from '../Button/Button'
import type { ButtonProps, ButtonSize } from '../Button/Button'
import { Menu, MenuContent, MenuTrigger } from '../Menu/Menu'
import './SplitButton.css'

export type SplitButtonVariant = 'primary' | 'secondary'

export interface SplitButtonProps
  extends Omit<ButtonProps, 'variant' | 'size' | 'children' | 'iconAfter' | 'pressed' | 'className'> {
  /** `primary` — the one action the view exists for. **One per view.** */
  variant?: SplitButtonVariant
  size?: ButtonSize
  /** The main action's visible label: "Send". */
  label: React.ReactNode
  /**
   * The chevron's accessible name — it says what the menu holds, not that it is
   * a chevron: "More send options". Required, because the chevron has no text
   * and would otherwise be an unnamed button.
   */
  menuLabel: string
  /**
   * The alternatives, as `MenuItem`s (and `MenuSeparator` / `MenuLabel` if
   * needed). They are Menu's own parts so items, icons, `asChild` links and
   * `onSelect` all behave exactly as in a Menu.
   */
  children?: React.ReactNode
  /** Applied to the wrapper that holds both halves, for layout. */
  className?: string
}

/* The library ships no icon set (see lib/glyphs), and this is the one glyph the
   component cannot do without. */
function ChevronDownGlyph({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

/**
 * A primary action with a menu of alternatives — Send, and Send later.
 *
 * Two adjacent Buttons in one pill: the main half runs the action, the chevron
 * half opens a Menu and does nothing else. Both halves are Buttons, so height,
 * radius, type, colour and hover are Button's by construction. The `ref` goes
 * to the main button.
 */
export const SplitButton = forwardRef<HTMLButtonElement, SplitButtonProps>(function SplitButton(
  { variant = 'primary', size = 'md', label, menuLabel, children, className, disabled, loading, ...rest },
  ref,
) {
  if (process.env.NODE_ENV !== 'production') {
    devOneOf('SplitButton', 'variant', variant, ['primary', 'secondary'])
    if (!menuLabel) {
      devWarn('SplitButton.menuLabel', 'SplitButton: `menuLabel` is required. The chevron has no text, so ' +
        'without it the menu button has no accessible name. Name what it holds: "More send options".')
    }
  }
  // Anything but the two supported variants renders as the default, not as a
  // Button variant SplitButton has no divider for.
  const v: SplitButtonVariant = variant === 'secondary' ? 'secondary' : 'primary'
  return (
    <div className={cn('d3-split', `d3-split--${v}`, `d3-split--${size}`, className)}>
      <Button {...rest} ref={ref} variant={v} size={size} disabled={disabled} loading={loading}
        className="d3-split__main">
        {label}
      </Button>
      <Menu>
        <MenuTrigger>
          <Button variant={v} size={size} disabled={disabled} aria-label={menuLabel}
            className="d3-split__chevron" icon={<ChevronDownGlyph />} />
        </MenuTrigger>
        <MenuContent align="end">{children}</MenuContent>
      </Menu>
    </div>
  )
})
