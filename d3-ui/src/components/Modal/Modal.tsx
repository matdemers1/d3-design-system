import * as Dialog from '@radix-ui/react-dialog'
import { useEffect, useState } from 'react'
import { cn } from '../../lib/cn'
import { devWarn } from '../../lib/dev'
import { CloseGlyph } from '../../lib/glyphs'
import { IconButton } from '../IconButton/IconButton'
import './Modal.css'

export type ModalSize = 'sm' | 'md' | 'lg'

export interface ModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** The trigger. Focus returns here on close — always. */
  trigger?: React.ReactNode
  /** Names the action, not the object type: "Dismiss 3 items", never "Confirm". */
  title: string
  /**
   * The consequence, and whether it is reversible. This is the sentence that prevents the mistake.
   * Text, or rich content — a name in `<strong>`, a `<code>` identifier, paragraphs or a list.
   * It renders in a `div`, so block content is valid, and stays the dialog's accessible description.
   */
  description?: React.ReactNode
  children?: React.ReactNode
  footer?: React.ReactNode
  size?: ModalSize
  /**
   * A destructive confirmation requires an explicit choice: the scrim does not
   * dismiss it, and focus does not land on the destructive button.
   */
  destructive?: boolean
  /**
   * The accessible name of the close control, which shows below 600px where a
   * Modal is a bottom sheet and a phone has no Escape key. Translate it with
   * the rest of the app.
   */
  closeLabel?: string
  className?: string
}

/**
 * Whether an element's content is taller than its box — which, for the phone
 * sheet's body, is exactly when it needs to be a keyboard tab stop (WCAG 2.1.1;
 * axe `scrollable-region-focusable`). Measured rather than assumed because a
 * permanent `tabindex` would also be a candidate for the dialog's initial focus
 * at desktop width, where the body is `display: contents` and measures zero.
 */
function useScrolls(el: HTMLElement | null) {
  const [scrolls, setScrolls] = useState(false)
  useEffect(() => {
    if (!el) return
    const measure = () => setScrolls(el.scrollHeight > el.clientHeight + 1)
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [el])
  // Content that changes without the body's own box changing.
  useEffect(() => {
    if (el) setScrolls(el.scrollHeight > el.clientHeight + 1)
  })
  return scrolls
}

/**
 * A focused task that interrupts the page.
 *
 * Built on Radix Dialog. Focus trap, scroll lock, Escape and `aria-modal` are
 * not things to re-implement per app — App B hand-rolled four dialogs and
 * none of them has a role, a focus trap, an Escape handler or focus return.
 */
export function Modal({
  open, onOpenChange, trigger, title, description, children, footer,
  size = 'md', destructive = false, closeLabel = 'Close', className,
}: ModalProps) {
  const [bodyEl, setBodyEl] = useState<HTMLDivElement | null>(null)
  const bodyScrolls = useScrolls(bodyEl)
  if (process.env.NODE_ENV !== 'production') {
    if (!title) {
      devWarn('Modal.title', 'Modal: `title` is required. It is the dialog\'s accessible name, so without it ' +
        'a screen reader announces "dialog" and nothing about what it is for.')
    }
  }
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <Dialog.Trigger asChild>{trigger}</Dialog.Trigger> : null}
      <Dialog.Portal>
        <Dialog.Overlay className="d3-modal__scrim" />
        <Dialog.Content
          // Radix provides modality by putting aria-hidden on everything outside
          // the dialog, which is more reliably supported than aria-modal alone.
          // aria-modal is set as well because it costs nothing and some tooling
          // and older AT look for it.
          aria-modal="true"
          className={cn('d3-modal', size !== 'md' && `d3-modal--${size}`, className)}
          // A destructive confirmation must be answered, not dismissed by a
          // stray click on the page behind it.
          onPointerDownOutside={destructive ? (e) => e.preventDefault() : undefined}
          onInteractOutside={destructive ? (e) => e.preventDefault() : undefined}
          // Never auto-focus a destructive button. This does not rely on the
          // author remembering `destructive`: if the dialog contains a danger
          // button, focus goes to the panel and the user chooses. Otherwise
          // pressing Enter on a freshly opened dialog destroys something.
          onOpenAutoFocus={(e) => {
            const panel = e.currentTarget as HTMLElement | null
            const hasDestructive = destructive || Boolean(panel?.querySelector('.d3-btn--danger'))
            if (!hasDestructive) return
            e.preventDefault()
            panel?.focus()
          }}
        >
          <div className="d3-modal__head">
            <Dialog.Title className="d3-modal__title">{title}</Dialog.Title>
            {/* Shown only below 600px (Modal.css), where the panel is a bottom
                sheet and the scrim is a thin strip a thumb can miss. From 600px
                it is display: none, so it is neither seen nor in the a11y tree
                and the desktop dialog is exactly what it was. */}
            <Dialog.Close asChild>
              <IconButton
                size="sm"
                label={closeLabel}
                icon={<CloseGlyph size={16} />}
                className="d3-modal__close"
              />
            </Dialog.Close>
          </div>
          {/* The body is the part of a phone sheet that scrolls, so the footer can
              stay pinned. From 600px it is `display: contents`, with no box of its own,
              and the whole panel scrolls as it always has. */}
          <div className="d3-modal__body" ref={setBodyEl} tabIndex={bodyScrolls ? 0 : undefined}>
            {description !== undefined && description !== null && description !== false && description !== '' ? (
              // A div, not Radix's default <p>: a description may be paragraphs or a
              // list, and a <p> cannot hold either (the same fix as Alert, D-050).
              // Radix still gives it the id the dialog's aria-describedby points at.
              <Dialog.Description asChild>
                <div className="d3-modal__desc">{description}</div>
              </Dialog.Description>
            ) : null}
            {children}
          </div>
          {footer ? <div className="d3-modal__footer">{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/**
 * Makes a footer button close the Modal — the way an uncontrolled Modal (one
 * opened by `trigger`, with no state of its own) is dismissed from Cancel.
 * Always wraps a single button; the button keeps its own look and label.
 * Its own type rather than Radix's, which would make a Radix major release a
 * breaking change here.
 */
export function ModalClose({ children }: { children: React.ReactElement }) {
  return <Dialog.Close asChild>{children}</Dialog.Close>
}
