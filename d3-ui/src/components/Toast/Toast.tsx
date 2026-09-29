import { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/cn'
import { CloseGlyph } from '../../lib/glyphs'
import { Button } from '../Button/Button'
import { IconButton } from '../IconButton/IconButton'
import { Kbd } from '../Kbd/Kbd'
import './Toast.css'

export interface ToastAction {
  /** A verb for what it does — "Undo", "View". Never "OK". */
  label: string
  onAction: () => void
  /**
   * The key that does the same thing from anywhere — `z` for Undo. Drawn as a
   * hint on the button and announced through `aria-keyshortcuts`. **The app
   * binds the key**: the toast only says what it is, because only the app knows
   * whether that key is free in the view underneath.
   */
  shortcut?: string
}

/** Why a toast left. `action` means the action ran first. */
export type ToastDismissReason = 'timeout' | 'close' | 'action' | 'replaced' | 'dismissed'

/** Six seconds: long enough to read a line and reach Undo; paused while in use. */
export const TOAST_DURATION = 6000

export interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** One line saying what just happened — "Archived · Re: Acadia". */
  message: React.ReactNode
  /** At most one action. A second action belongs in the view, not a toast. */
  action?: ToastAction
  /**
   * Milliseconds before it leaves by itself, counted only while neither the
   * pointer nor focus is inside it. `0` keeps it until it is closed.
   */
  duration?: number
  /** Leaving: `false` plays the exit and then calls `onExited`. */
  open?: boolean
  /** Asked to leave — by the timer, the close button, Escape or the action. */
  onDismiss?: (reason: ToastDismissReason) => void
  /** The exit has finished; the owner removes it now. */
  onExited?: () => void
  /** The close button's accessible name. */
  closeLabel?: string
  /** Replacing a toast already on screen: a short cross-fade rather than a second rise. */
  swap?: boolean
}

/**
 * A transient, self-dismissing note about something the user just did, with at
 * most one way to take it back (D-028, D-073). Usually shown through
 * `useToast()` inside a `ToastRegion`, which owns the live region, the
 * one-at-a-time rule and removal; render `Toast` directly only inside your own
 * `aria-live="polite"` container.
 *
 * - **Never takes focus.** It arrives while the user is doing something else.
 *   The action is reachable by its shortcut, and by Tab.
 * - **Pauses** while the pointer or focus is inside it, so reading it or
 *   reaching for Undo never races the timer (WCAG 2.2.1).
 * - **Escape** inside it closes it; if focus was inside when it left, focus
 *   goes back to where it came from rather than to the page body.
 * - A floating layer: `surface-raised` and the float shadow; a 3:1 `border-float`
 *   edge returns under forced colours or more contrast (D-075).
 *   Rises 16px on `--motion-toast-enter`, leaves on `--motion-toast-exit`.
 */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  { message, action, duration = TOAST_DURATION, open = true, onDismiss, onExited, closeLabel = 'Dismiss',
    swap = false, className, onPointerEnter, onPointerLeave, onFocus, onBlur, onKeyDown, ...rest }, ref,
) {
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const paused = hovered || focused
  const remaining = useRef(duration)
  const node = useRef<HTMLDivElement | null>(null)
  const returnTo = useRef<HTMLElement | null>(null)
  const dismissRef = useRef(onDismiss)
  dismissRef.current = onDismiss

  const setNode = useCallback((el: HTMLDivElement | null) => {
    node.current = el
    if (typeof ref === 'function') ref(el)
    else if (ref) ref.current = el
  }, [ref])

  // The countdown runs only while nothing is inside it, and resumes with what
  // was left rather than starting over.
  useEffect(() => {
    if (!open || paused || duration <= 0) return
    const started = Date.now()
    const id = setTimeout(() => dismissRef.current?.('timeout'), Math.max(0, remaining.current))
    return () => {
      clearTimeout(id)
      remaining.current -= Date.now() - started
    }
  }, [open, paused, duration])

  // Leaving. The exit is a CSS animation; removal waits for it, with a fallback
  // for an environment that never fires animationend (hidden tab, test DOM).
  const exited = useRef(false)
  const finish = useCallback(() => {
    if (exited.current) return
    exited.current = true
    const el = node.current
    const back = returnTo.current
    if (el && el.contains(document.activeElement) && back?.isConnected) back.focus()
    onExited?.()
  }, [onExited])
  useEffect(() => {
    if (open) return
    const id = setTimeout(finish, 400)
    return () => clearTimeout(id)
  }, [open, finish])

  return (
    <div
      ref={setNode}
      className={cn('d3-toast', swap && 'd3-toast--swap', className)}
      data-state={open ? 'open' : 'closed'}
      onAnimationEnd={(e) => { if (!open && e.target === e.currentTarget) finish() }}
      onPointerEnter={(e) => { setHovered(true); onPointerEnter?.(e) }}
      onPointerLeave={(e) => { setHovered(false); onPointerLeave?.(e) }}
      onFocus={(e) => {
        const from = e.relatedTarget as HTMLElement | null
        if (from && !e.currentTarget.contains(from)) returnTo.current = from
        setFocused(true)
        onFocus?.(e)
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
        onBlur?.(e)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) { e.stopPropagation(); onDismiss?.('close') }
        onKeyDown?.(e)
      }}
      {...rest}
    >
      <div className="d3-toast__message">{message}</div>
      {action ? (
        <Button
          variant="ghost"
          size="sm"
          className="d3-toast__action"
          aria-keyshortcuts={action.shortcut}
          onClick={() => { action.onAction(); onDismiss?.('action') }}
          tabIndex={open ? undefined : -1}
        >
          {action.label}
          {action.shortcut ? <Kbd className="d3-toast__kbd">{action.shortcut}</Kbd> : null}
        </Button>
      ) : null}
      <IconButton
        size="sm"
        label={closeLabel}
        icon={<CloseGlyph size={14} />}
        className="d3-toast__close"
        onClick={() => onDismiss?.('close')}
        tabIndex={open ? undefined : -1}
      />
    </div>
  )
})
