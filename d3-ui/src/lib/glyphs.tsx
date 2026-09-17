/**
 * The few glyphs a component cannot do without.
 *
 * The library does not depend on an icon set — lucide is a dev dependency, for
 * the stories — so icons arrive as props. That is right for decoration and wrong
 * for an affordance that carries meaning: a checked Checkbox with no `checkIcon`
 * was a filled square with no tick, so "checked" was conveyed by colour alone
 * (WCAG 1.4.1). These are the defaults for exactly those cases, drawn here rather
 * than copied, and always overridable by the prop.
 */
export function CheckGlyph({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />
    </svg>
  )
}

export function ExternalGlyph({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M8 16 17 7M9 7h8v8" />
    </svg>
  )
}

/* The shell's own affordances: an app shell with no way to open its drawer or
   collapse its sidebar is not a shell, and the library ships no icon set. */
export function MenuGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" aria-hidden="true" focusable="false">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function CloseGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" aria-hidden="true" focusable="false">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

/** A panel with its left rail; the chevron points the way the rail will move. */
export function SidebarGlyph({ size = 16, collapsed = false }: { size?: number; collapsed?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M9 4v16" />
      <path d={collapsed ? 'M13.5 10l2 2-2 2' : 'M15.5 10l-2 2 2 2'} />
    </svg>
  )
}

export function ChevronUpDownGlyph({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />
    </svg>
  )
}
