import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { devWarn } from '../../lib/dev'
import { DEFAULT_THEME_STORAGE_KEY } from './themeBootScript'

export type ThemePreference = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

export interface ThemeContextValue {
  /** What the person chose. `system` follows the OS, live. */
  preference: ThemePreference
  /** What is on screen now. */
  resolved: ResolvedTheme
  setPreference: (preference: ThemePreference) => void
}

export interface ThemeProviderProps {
  children?: React.ReactNode
  /** localStorage key. Pass the same one to `themeBootScript`. */
  storageKey?: string
  /** Used when nothing is stored. `system` unless an app has a reason. */
  defaultPreference?: ThemePreference
}

const LIGHT_QUERY = '(prefers-color-scheme: light)'
const PREFERENCES: readonly ThemePreference[] = ['system', 'light', 'dark']

const isPreference = (v: unknown): v is ThemePreference =>
  typeof v === 'string' && (PREFERENCES as readonly string[]).includes(v)

function readStored(key: string): ThemePreference | null {
  try {
    const v = window.localStorage.getItem(key)
    return isPreference(v) ? v : null
  } catch {
    return null
  }
}

function writeStored(key: string, value: ThemePreference) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Storage can be unavailable (private mode, a blocked policy). The choice
    // still applies for this visit; it just is not remembered.
  }
}

function subscribeSystem(onChange: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const mq = window.matchMedia(LIGHT_QUERY)
  mq.addEventListener?.('change', onChange)
  return () => mq.removeEventListener?.('change', onChange)
}
// Dark is primary (D-011): anything short of an explicit light preference from
// the OS resolves dark, including a browser with no matchMedia at all.
const systemSnapshot = (): ResolvedTheme =>
  typeof window !== 'undefined' && window.matchMedia?.(LIGHT_QUERY).matches ? 'light' : 'dark'
const serverSnapshot = (): ResolvedTheme => 'dark'

const ThemeContext = createContext<ThemeContextValue | null>(null)

/**
 * Owns the colour mode for the whole document.
 *
 * Writes the resolved mode to `data-theme` on `<html>` — always `light` or
 * `dark`, never absent — so everything, portalled menus and tooltips included,
 * reads one answer. `system` is resolved through `matchMedia` and followed live
 * when the OS switches. The preference is kept in `localStorage` and followed
 * across tabs.
 *
 * Pair it with `themeBootScript()` in `<head>` so the first paint is already
 * right; this provider then agrees with what the script set.
 */
export function ThemeProvider({
  children, storageKey = DEFAULT_THEME_STORAGE_KEY, defaultPreference = 'system',
}: ThemeProviderProps) {
  const [preference, setPreferenceState] = useState<ThemePreference>(
    () => (typeof window === 'undefined' ? null : readStored(storageKey)) ?? defaultPreference,
  )
  const system = useSyncExternalStore(subscribeSystem, systemSnapshot, serverSnapshot)
  const resolved: ResolvedTheme = preference === 'system' ? system : preference

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved)
  }, [resolved])

  // Another tab changed it.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== storageKey) return
      setPreferenceState(isPreference(e.newValue) ? e.newValue : defaultPreference)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [storageKey, defaultPreference])

  const setPreference = useCallback((next: ThemePreference) => {
    if (!isPreference(next)) {
      if (process.env.NODE_ENV !== 'production') {
        devWarn(`ThemeProvider.preference.${String(next)}`, `useTheme: \`setPreference("${String(next)}")\` is not ` +
          'one of "system", "light", "dark", and was ignored.')
      }
      return
    }
    setPreferenceState(next)
    writeStored(storageKey, next)
  }, [storageKey])

  const value = useMemo(() => ({ preference, resolved, setPreference }), [preference, resolved, setPreference])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/**
 * The colour mode: `{ preference, resolved, setPreference }`.
 *
 * Outside a ThemeProvider it reports the OS setting and cannot change anything
 * — it warns in development rather than throwing, so a component rendered in
 * isolation (a test, a story) does not take the page down.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  const system = useSyncExternalStore(subscribeSystem, systemSnapshot, serverSnapshot)
  if (ctx) return ctx
  return {
    preference: 'system',
    resolved: system,
    setPreference: () => {
      if (process.env.NODE_ENV !== 'production') {
        devWarn('useTheme.provider', 'useTheme: there is no ThemeProvider above this component, so the theme ' +
          'cannot change. Wrap the app once in <ThemeProvider>.')
      }
    },
  }
}
