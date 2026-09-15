import { useCallback, useEffect, useRef } from 'react'

/**
 * Development-only contract checks.
 *
 * The library's guardrails are mostly types — `kind` is required on EmptyState,
 * `label` on IconButton, `tone` is a closed set. A JavaScript consumer gets none
 * of that, and every one of those mistakes fails silently: the component renders,
 * it just has no accessible name, or quietly falls back to a default. So the same
 * contracts are checked at runtime, in development, and say what to do instead.
 *
 * Every call site wraps its checks in `process.env.NODE_ENV !== 'production'`
 * rather than relying on this function returning early, so a consumer's bundler
 * deletes the check *and* its message strings, not just the console call.
 *
 * `process.env.NODE_ENV` is deliberately left for the consuming bundler to
 * replace, as React itself does: Vite, webpack and Next all do. Loading the
 * package without a bundler is not supported.
 */
const warned = new Set<string>()

export function devWarn(key: string, message: string): void {
  // Guarded here as well as at every call site. esbuild drops the calls but can
  // keep this function's shell, and the guard is what removes the template
  // inside it — found by bundling the package the way an app does.
  if (process.env.NODE_ENV !== 'production') {
    if (warned.has(key)) return
    warned.add(key)
    // eslint-disable-next-line no-console
    console.warn(`[d3-ui] ${message}`)
  }
}

/** Warns when `value` is not one of `allowed` — the silent-fallback case. */
export function devOneOf(
  component: string, prop: string, value: unknown, allowed: readonly string[],
): void {
  if (value === undefined || allowed.includes(value as string)) return
  devWarn(`${component}.${prop}.${String(value)}`,
    `${component}: \`${prop}="${String(value)}"\` is not one of ${allowed.map((a) => `"${a}"`).join(', ')}. ` +
    'It renders as the default instead, which is easy to miss.')
}

/** Test-only. Warnings are once per session, which a test suite needs to undo. */
export function __resetDevWarnings(): void {
  warned.clear()
}

/** Combines a forwarded ref with a local one. */
export function useMergedRef<T>(forwarded: React.Ref<T> | undefined, local: React.MutableRefObject<T | null>) {
  return useCallback((node: T | null) => {
    local.current = node
    if (typeof forwarded === 'function') forwarded(node)
    else if (forwarded) (forwarded as React.MutableRefObject<T | null>).current = node
  }, [forwarded, local])
}

/**
 * Warns when a form control ends up with no accessible name.
 *
 * Checked against the real element after the tree commits, not inferred from
 * props: a label can arrive through FormField, an external `<label htmlFor>`,
 * `aria-label` or `aria-labelledby`, and only the DOM knows which, if any, won.
 * A placeholder is not a name, and is not counted as one.
 */
export function useNameCheck<T extends HTMLInputElement | HTMLTextAreaElement>(component: string) {
  const local = useRef<T | null>(null)
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return
    // A frame later, so a label rendered after the control has had its turn.
    const id = requestAnimationFrame(() => {
      const el = local.current
      if (!el || el.type === 'hidden') return
      const named = (el.labels && el.labels.length > 0) ||
        el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')
      if (!named) {
        devWarn(`${component}.name`,
          `${component}: this control has no accessible name. Wrap it in <FormField label="…">, ` +
          'or give it aria-label. A placeholder is not a label — it disappears on the first keystroke.')
      }
    })
    return () => cancelAnimationFrame(id)
  }, [component])
  return local
}
