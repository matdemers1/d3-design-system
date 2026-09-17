/**
 * A controllable `matchMedia` for tests. The setup file's stub answers `false`
 * to every query and never changes, which is enough for rendering but cannot
 * exercise a breakpoint or an OS theme switching while the page is open.
 */
export function mockMatchMedia(initial: Record<string, boolean>) {
  const state = { ...initial }
  const listeners = new Map<string, Set<() => void>>()
  const original = window.matchMedia
  window.matchMedia = ((query: string) => ({
    get matches() { return state[query] ?? false },
    media: query,
    onchange: null,
    addEventListener: (_: string, l: () => void) => {
      if (!listeners.has(query)) listeners.set(query, new Set())
      listeners.get(query)!.add(l)
    },
    removeEventListener: (_: string, l: () => void) => { listeners.get(query)?.delete(l) },
    addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
  return {
    set(query: string, matches: boolean) {
      state[query] = matches
      for (const l of listeners.get(query) ?? []) l()
    },
    restore() { window.matchMedia = original },
  }
}

export const WIDE = '(min-width: 1024px)'
export const PREFERS_LIGHT = '(prefers-color-scheme: light)'
