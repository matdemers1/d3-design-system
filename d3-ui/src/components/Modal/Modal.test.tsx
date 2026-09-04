import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal, ModalClose } from './Modal'
import { Button } from '../Button/Button'

/**
 * Every assertion here is something all four of App B's hand-rolled dialogs
 * fail: no role, no aria-modal, no Escape handler, no focus management.
 */
describe('Modal — the contract App B has never met', () => {
  const open = async () => {
    const user = userEvent.setup()
    render(
      <Modal
        title="Dismiss 3 items"
        description="They leave the inbox and stay searchable."
        trigger={<Button>Open</Button>}
        footer={<ModalClose asChild><Button>Cancel</Button></ModalClose>}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Open' }))
    return user
  }

  it('is a dialog, and says so', async () => {
    await open()
    const dlg = await screen.findByRole('dialog')
    expect(dlg).toHaveAttribute('aria-modal', 'true')
  })

  it('makes the page behind it unavailable', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <p data-testid="behind">Page content</p>
        <Modal title="Dismiss 3 items" trigger={<Button>Open two</Button>} />
      </div>,
    )
    await user.click(screen.getByRole('button', { name: 'Open two' }))
    await screen.findByRole('dialog')
    // This is the mechanism that actually delivers modality: Radix marks
    // everything outside the dialog aria-hidden, which is more reliably
    // supported than aria-modal on its own.
    const behind = screen.getByTestId('behind')
    const hidden = behind.closest('[aria-hidden="true"]')
    expect(hidden).not.toBeNull()
  })

  it('is named by its title and described by its description', async () => {
    await open()
    const dlg = await screen.findByRole('dialog')
    expect(dlg).toHaveAccessibleName('Dismiss 3 items')
    expect(dlg).toHaveAccessibleDescription(/stay searchable/)
  })

  it('moves focus into the dialog on open', async () => {
    await open()
    await screen.findByRole('dialog')
    await waitFor(() => {
      expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true)
    })
  })

  it('closes on Escape', async () => {
    const user = await open()
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('returns focus to the trigger on close — the step App B never implemented', async () => {
    const user = await open()
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus()
    })
  })

  it('will not auto-focus a danger button even without the destructive prop', async () => {
    // Found by looking at the rendered story: `OpenByDefault` had no
    // `destructive` prop, so Radix auto-focused the only control — which was
    // the destructive one. Relying on the author to remember a prop is not a
    // guarantee.
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <Modal
        title="Dismiss 3 items"
        trigger={<Button>Open</Button>}
        footer={<Button variant="danger" onClick={onConfirm}>Dismiss 3 items</Button>}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Open' }))
    await screen.findByRole('dialog')
    expect(screen.getByRole('button', { name: 'Dismiss 3 items' })).not.toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('does not auto-focus the destructive button', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <Modal
        title="Dismiss 3 items"
        destructive
        trigger={<Button>Open</Button>}
        footer={<Button variant="danger" onClick={onConfirm}>Dismiss 3 items</Button>}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Open' }))
    await screen.findByRole('dialog')
    expect(screen.getByRole('button', { name: 'Dismiss 3 items' })).not.toHaveFocus()
    // ...so pressing Enter straight away cannot destroy anything.
    await user.keyboard('{Enter}')
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
