import { cn } from '../../lib/cn'
import './Kbd.css'

/**
 * A keyboard hint — the key that does the same thing as the control beside it.
 * Internal — not exported from the package: Toast and SearchField draw it. It is decoration for sighted
 * keyboard users; the key itself reaches assistive technology through
 * `aria-keyshortcuts` on the control, so this is always `aria-hidden`.
 */
export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return <kbd className={cn('d3-kbd', className)} aria-hidden="true">{children}</kbd>
}
