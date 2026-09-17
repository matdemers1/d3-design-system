import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { cn } from '../../lib/cn'
import { CloseGlyph, MenuGlyph, SidebarGlyph } from '../../lib/glyphs'
import { IconButton } from '../IconButton/IconButton'
import { Tooltip } from '../Tooltip/Tooltip'
import { AppShellContext } from './AppShellContext'
import './AppShell.css'

export interface AppShellProps {
  /** Top of the sidebar, and of the top bar below `lg`. Usually a home link. */
  brand?: React.ReactNode
  /** Usually a `SideNav`. */
  nav?: React.ReactNode
  /** Foot of the sidebar. Usually an `AccountMenu`. */
  footer?: React.ReactNode
  /** The page. Rendered inside the one `<main>` landmark. */
  children?: React.ReactNode
  /** Where the collapsed choice is remembered, per browser. */
  storageKey?: string
  /** Used when nothing is stored. */
  defaultCollapsed?: boolean
  /** The `id` of `<main>`, which the skip link targets. */
  mainId?: string
  className?: string
}

/** `lg` — the shell breakpoint (D-021). Below it the sidebar is a drawer. */
const WIDE_QUERY = '(min-width: 1024px)'

function subscribeWide(onChange: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const mq = window.matchMedia(WIDE_QUERY)
  mq.addEventListener?.('change', onChange)
  return () => mq.removeEventListener?.('change', onChange)
}
const wideSnapshot = () => (typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia(WIDE_QUERY).matches : true)

function readCollapsed(key: string): boolean | null {
  try {
    const v = window.localStorage.getItem(key)
    return v === '1' ? true : v === '0' ? false : null
  } catch {
    return null
  }
}
function writeCollapsed(key: string, value: boolean) {
  try {
    window.localStorage.setItem(key, value ? '1' : '0')
  } catch {
    // Unavailable storage: the choice holds for this visit and is not remembered.
  }
}

/**
 * The application frame — D-021's shell, adopted from Bindery.
 *
 * - **At `lg` and above** a 240px sidebar column, collapsible by the user to a
 *   64px rail. The choice is remembered in `localStorage`.
 * - **Below `lg`** a top bar with a menu button and the brand; the sidebar
 *   becomes an off-canvas drawer over a scrim. The drawer is a Radix Dialog, so
 *   focus is trapped, the page behind is inert, Escape and the scrim close it,
 *   and focus returns to the menu button. Activating any link inside it closes
 *   it too, whichever router rendered the link.
 *
 * A "Skip to content" link comes first in the tab order, and the page is the
 * one `<main>` landmark. Routing belongs to the app: the shell never reads or
 * changes the URL.
 *
 * The sidebar is a resting surface, so it is a tone step with no border or
 * shadow; the drawer floats, so it is `surface-raised` with a boundary (D-023).
 */
export function AppShell({
  brand, nav, footer, children, storageKey = 'd3.sidebar.collapsed', defaultCollapsed = false,
  mainId = 'content', className,
}: AppShellProps) {
  const wide = useSyncExternalStore(subscribeWide, wideSnapshot, () => true)
  const [collapsedChoice, setCollapsedChoice] = useState<boolean>(
    () => (typeof window === 'undefined' ? null : readCollapsed(storageKey)) ?? defaultCollapsed,
  )
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [root, setRoot] = useState<HTMLDivElement | null>(null)
  const main = useRef<HTMLElement>(null)

  // Growing past `lg` with the drawer open leaves nothing to close it with.
  useEffect(() => { if (wide) setDrawerOpen(false) }, [wide])

  const collapsed = wide && collapsedChoice
  const toggle = useCallback(() => {
    setCollapsedChoice((was) => {
      writeCollapsed(storageKey, !was)
      return !was
    })
  }, [storageKey])

  const column = useMemo(() => ({ collapsed, drawer: false }), [collapsed])
  const inDrawer = useMemo(() => ({ collapsed: false, drawer: true }), [])

  // Closing on the click rather than on a route change: it is the same moment,
  // it works with any router (or none), and it also covers choosing the page
  // you are already on. A router's Link has already called preventDefault by
  // the time this runs, so that is deliberately not checked; a modified click
  // opens a new tab and leaves the drawer where it is.
  const closeOnLink = (e: React.MouseEvent) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if ((e.target as Element).closest?.('a[href]')) setDrawerOpen(false)
  }

  const collapseLabel = collapsed ? 'Expand sidebar' : 'Collapse sidebar'

  return (
    <div
      ref={setRoot}
      className={cn('d3-shell', wide ? 'd3-shell--wide' : 'd3-shell--narrow', className)}
      data-collapsed={collapsed || undefined}
    >
      <a
        className="d3-shell__skip"
        href={`#${mainId}`}
        // Focus is moved rather than left to the fragment: a hash router would
        // treat `#content` as a route.
        onClick={(e) => { e.preventDefault(); main.current?.focus() }}
      >
        Skip to content
      </a>

      {wide ? (
        <AppShellContext.Provider value={column}>
          <div className="d3-shell__sidebar">
            <div className="d3-shell__head">
              {brand ? <div className="d3-shell__brand">{brand}</div> : null}
              <Tooltip content={collapseLabel} side="right">
                <IconButton
                  size="sm"
                  label={collapseLabel}
                  icon={<SidebarGlyph collapsed={collapsed} />}
                  onClick={toggle}
                  className="d3-shell__toggle"
                />
              </Tooltip>
            </div>
            {nav ? <div className="d3-shell__nav">{nav}</div> : null}
            {footer ? <div className="d3-shell__foot">{footer}</div> : null}
          </div>
        </AppShellContext.Provider>
      ) : (
        <header className="d3-shell__bar">
          <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
            <Dialog.Trigger asChild>
              <IconButton label="Open navigation" icon={<MenuGlyph />} />
            </Dialog.Trigger>
            {/* Portalled into the shell rather than <body>, so a subtree theme
                (D-037) reaches the drawer as it reaches the page. */}
            <Dialog.Portal container={root}>
              <Dialog.Overlay className="d3-shell__scrim" />
              <Dialog.Content className="d3-shell__drawer" aria-describedby={undefined} onClick={closeOnLink}>
                <Dialog.Title className="d3-shell__vh">Navigation</Dialog.Title>
                <AppShellContext.Provider value={inDrawer}>
                  <div className="d3-shell__head">
                    {brand ? <div className="d3-shell__brand">{brand}</div> : null}
                    <Dialog.Close asChild>
                      <IconButton size="sm" label="Close navigation" icon={<CloseGlyph />} />
                    </Dialog.Close>
                  </div>
                  {nav ? <div className="d3-shell__nav">{nav}</div> : null}
                  {footer ? <div className="d3-shell__foot">{footer}</div> : null}
                </AppShellContext.Provider>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
          {brand ? <div className="d3-shell__brand">{brand}</div> : null}
        </header>
      )}

      <main id={mainId} ref={main} tabIndex={-1} className="d3-shell__main">
        {children}
      </main>
    </div>
  )
}
