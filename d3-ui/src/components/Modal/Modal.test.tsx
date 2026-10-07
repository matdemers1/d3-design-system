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
        footer={<ModalClose><Button>Cancel</Button></ModalClose>}
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

  it('takes rich content as its description, in a div, still describing the dialog', async () => {
    render(
      <Modal
        open
        title="Remove Ada Lovelace"
        description={<><p>She loses access to <strong>3 apps</strong> at once.</p><ul><li>Sessions end</li></ul></>}
      />,
    )
    const dlg = await screen.findByRole('dialog')
    const desc = dlg.querySelector('.d3-modal__desc')!
    expect(desc.tagName).toBe('DIV')
    expect(dlg.getAttribute('aria-describedby')).toBe(desc.id)
    expect(dlg).toHaveAccessibleDescription(/loses access to 3 apps at once/)
  })

  it('renders no description element for an empty one', async () => {
    render(<Modal open title="Rename" description="" />)
    const dlg = await screen.findByRole('dialog')
    expect(dlg.querySelector('.d3-modal__desc')).toBeNull()
  })
})

describe('Modal — the phone sheet structure', () => {
  // jsdom applies Modal.css but not its media queries, so the close button is
  // `display: none` here, as on a desktop, and has no computed accessible name.
  // It is found by class and its `aria-label` read; browser/sheet.spec.ts shows
  // it, named, on a phone.
  const closeBtn = () => document.querySelector<HTMLButtonElement>('.d3-modal__close')!

  it('wraps the description and children in one body region; the head and footer stay outside it', async () => {
    render(
      <Modal open title="Review" description="Read it first." footer={<Button>Done</Button>}>
        <p data-testid="child">Long content</p>
      </Modal>,
    )
    const dlg = await screen.findByRole('dialog')
    const body = dlg.querySelector('.d3-modal__body')!
    expect(body).not.toBeNull()
    expect(body.querySelector('.d3-modal__desc')).not.toBeNull()
    expect(body.contains(screen.getByTestId('child'))).toBe(true)
    expect(body.closest('.d3-modal__head')).toBeNull()
    expect(dlg.querySelector('.d3-modal__footer')!.parentElement).toBe(dlg)
    expect(dlg.querySelector('.d3-modal__head')!.parentElement).toBe(dlg)
    expect(body.parentElement).toBe(dlg)
  })

  it('keeps aria-describedby on the description inside the body', async () => {
    render(<Modal open title="Review" description="Read it first."><p>x</p></Modal>)
    const dlg = await screen.findByRole('dialog')
    const desc = dlg.querySelector('.d3-modal__body .d3-modal__desc')!
    expect(dlg.getAttribute('aria-describedby')).toBe(desc.id)
  })

  it('has a close button, named Close, in the head after the title', async () => {
    render(<Modal open title="Review" />)
    const dlg = await screen.findByRole('dialog')
    const close = closeBtn()
    expect(close).toHaveAttribute('aria-label', 'Close')
    expect(dlg.querySelector('.d3-modal__head')!.contains(close)).toBe(true)
  })

  it('closes the dialog from the close button', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<Modal open onOpenChange={onOpenChange} title="Review" />)
    await screen.findByRole('dialog')
    await user.click(closeBtn())
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('takes a translated close label', async () => {
    render(<Modal open title="Review" closeLabel="Fermer" />)
    await screen.findByRole('dialog')
    expect(closeBtn()).toHaveAttribute('aria-label', 'Fermer')
  })

  it('still sends focus to the panel, not the close button or the danger button, when destructive', async () => {
    render(<Modal open destructive title="Dismiss" footer={<Button variant="danger">Dismiss 3</Button>} />)
    const dlg = await screen.findByRole('dialog')
    await waitFor(() => expect(dlg).toHaveFocus())
  })
})

