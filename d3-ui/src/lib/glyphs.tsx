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
