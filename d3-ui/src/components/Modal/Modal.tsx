import * as Dialog from '@radix-ui/react-dialog'
import { cn } from '../../lib/cn'
import './Modal.css'

export type ModalSize = 'sm' | 'md' | 'lg'

export interface ModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** The trigger. Focus returns here on close — always. */
  trigger?: React.ReactNode
  /** Names the action, not the object type: "Dismiss 3 items", never "Confirm". */
  title: string
  /** The consequence, and whether it is reversible. This is the sentence that prevents the mistake. */
  description?: string
  children?: React.ReactNode
  footer?: React.ReactNode
  size?: ModalSize
  /**
   * A destructive confirmation requires an explicit choice: the scrim does not
   * dismiss it, and focus does not land on the destructive button.
   */
  destructive?: boolean
  className?: string
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
  size = 'md', destructive = false, className,
}: ModalProps) {
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
          </div>
          {description ? (
            <Dialog.Description className="d3-modal__desc">{description}</Dialog.Description>
          ) : null}
          {children}
          {footer ? <div className="d3-modal__footer">{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export const ModalClose = Dialog.Close
