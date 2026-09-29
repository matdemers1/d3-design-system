import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { cn } from '../../lib/cn'
import { devWarn } from '../../lib/dev'
import { Toast, type ToastAction, type ToastDismissReason } from './Toast'
import './Toast.css'

export interface ToastOptions {
  message: React.ReactNode
  action?: ToastAction
  /** Milliseconds; `0` stays until closed. Default six seconds. */
  duration?: number
  /** Told when it leaves, and why. */
  onDismiss?: (reason: ToastDismissReason) => void
}

export interface ToastApi {
  /**
   * Shows a toast and returns its id. **One at a time:** a newer toast replaces
   * the one on screen in place, with a short cross-fade, rather than stacking.
   */
  show: (options: ToastOptions) => string
  /** Dismisses the toast with this id, or whichever is showing. */
  dismiss: (id?: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const noop: ToastApi = {
  show: () => {
    if (process.env.NODE_ENV !== 'production') {
      devWarn('useToast.region', 'useToast: no <ToastRegion> above this component, so nothing is shown. ' +
        'Wrap the app once, inside the theme provider: <ToastRegion>{app}</ToastRegion>.')
    }
    return ''
  },
  dismiss: () => {},
}

/** Shows and dismisses toasts. Needs a `ToastRegion` above it. */
export function useToast(): ToastApi {
  return useContext(ToastContext) ?? noop
}

export interface ToastRegionProps {
  children?: React.ReactNode
  /** Names the region for landmark navigation. */
  label?: string
  className?: string
}

interface Current extends ToastOptions { id: string; open: boolean; swap: boolean }

let seq = 0

/**
 * Where toasts appear, and the provider `useToast()` reads. Wrap the app once.
 *
 * The region is a polite live region that exists before any toast does — a
 * live region added in the same moment as its content is not announced. It
 * sits fixed at the bottom centre, over the page, so a toast never pushes
 * anything down; it lets pointer events through everywhere but the toast.
 */
export function ToastRegion({ children, label = 'Notifications', className }: ToastRegionProps) {
  const [current, setCurrent] = useState<Current | null>(null)
  const latest = useRef<Current | null>(null)
  latest.current = current

  const leave = useCallback((id: string | undefined, reason: ToastDismissReason) => {
    const c = latest.current
    if (!c || !c.open || (id !== undefined && c.id !== id)) return
    c.onDismiss?.(reason)
    setCurrent({ ...c, open: false })
  }, [])

  const api = useMemo<ToastApi>(() => ({
    show: (options) => {
      const id = `d3-toast-${++seq}`
      const was = latest.current
      if (was?.open) was.onDismiss?.('replaced')
      setCurrent({ ...options, id, open: true, swap: Boolean(was?.open) })
      return id
    },
    dismiss: (id) => leave(id, 'dismissed'),
  }), [leave])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <section className={cn('d3-toast-region', className)} aria-label={label}>
        <div className="d3-toast-region__live" aria-live="polite" aria-atomic="false">
          {current ? (
            <Toast
              key={current.id}
              message={current.message}
              action={current.action}
              duration={current.duration}
              open={current.open}
              swap={current.swap}
              onDismiss={(reason) => leave(current.id, reason)}
              onExited={() => setCurrent((c) => (c?.id === current.id ? null : c))}
            />
          ) : null}
        </div>
      </section>
    </ToastContext.Provider>
  )
}
