import { createContext, useContext } from 'react'

export interface AppShellState {
  /** The sidebar is a 64px rail: navigation shows icons, the account menu an avatar. */
  collapsed: boolean
  /** Rendering inside the off-canvas drawer, below `lg`. Never collapsed there. */
  drawer: boolean
}

export const AppShellContext = createContext<AppShellState>({ collapsed: false, drawer: false })

/**
 * Where a component is in the shell, so the `brand` slot can swap a wordmark
 * for a mark when the sidebar collapses. Outside an AppShell both are `false`.
 */
export function useAppShell(): AppShellState {
  return useContext(AppShellContext)
}
