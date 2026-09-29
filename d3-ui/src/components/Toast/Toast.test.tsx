import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { ToastRegion, useToast, type ToastApi } from './ToastRegion'
import { Toast, TOAST_DURATION } from './Toast'
import { expectNoAxeViolations } from '../../test/axe'

let api: ToastApi
function Grab() {
  api = useToast()
  return <button type="button">Archive</button>
}
const setup = () => render(<ToastRegion><Grab /></ToastRegion>)
const region = () => document.querySelector('.d3-toast-region__live') as HTMLElement

describe('Toast — through useToast and ToastRegion', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('the region is a polite live region that exists before any toast', () => {
    setup()
    expect(region()).toHaveAttribute('aria-live', 'polite')
    expect(region()).toBeEmptyDOMElement()
    expect(screen.getByRole('region', { name: 'Notifications' })).toContainElement(region())
  })

  it('shows the message inside the live region, and never takes focus', () => {
    setup()
    const before = screen.getByRole('button', { name: 'Archive' })
    before.focus()
    act(() => { api.show({ message: 'Archived · Re: Acadia', action: { label: 'Undo', onAction: () => {} } }) })
    expect(region()).toHaveTextContent('Archived · Re: Acadia')
    expect(before).toHaveFocus()
  })

  it('shows the action, its keyboard hint, and names the key for assistive technology', () => {
    setup()
    act(() => { api.show({ message: 'Archived', action: { label: 'Undo', shortcut: 'z', onAction: () => {} } }) })
    const undo = screen.getByRole('button', { name: 'Undo' })
    expect(undo).toHaveAttribute('aria-keyshortcuts', 'z')
    const kbd = undo.querySelector('kbd')!
    expect(kbd).toHaveTextContent('z')
    expect(kbd).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
  })

  it('the action runs, then the toast leaves with reason "action"', () => {
    setup()
    const onAction = vi.fn()
    const onDismiss = vi.fn()
    act(() => { api.show({ message: 'Archived', action: { label: 'Undo', onAction }, onDismiss }) })
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(onAction).toHaveBeenCalledOnce()
    expect(onDismiss).toHaveBeenCalledWith('action')
    expect(document.querySelector('.d3-toast')).toHaveAttribute('data-state', 'closed')
    act(() => { vi.advanceTimersByTime(500) })
    expect(document.querySelector('.d3-toast')).toBeNull()
  })

  it('the close button dismisses it', () => {
    setup()
    const onDismiss = vi.fn()
    act(() => { api.show({ message: 'Saved', onDismiss }) })
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(onDismiss).toHaveBeenCalledWith('close')
  })

  it('dismisses itself after six seconds by default', () => {
    setup()
    const onDismiss = vi.fn()
    act(() => { api.show({ message: 'Saved', onDismiss }) })
    act(() => { vi.advanceTimersByTime(TOAST_DURATION - 1) })
    expect(onDismiss).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(1) })
    expect(onDismiss).toHaveBeenCalledWith('timeout')
    act(() => { vi.advanceTimersByTime(500) })
    expect(document.querySelector('.d3-toast')).toBeNull()
  })

  it('pauses while hovered, and resumes with what was left rather than starting over', () => {
    setup()
    const onDismiss = vi.fn()
    act(() => { api.show({ message: 'Saved', duration: 1000, onDismiss }) })
    act(() => { vi.advanceTimersByTime(600) })
    const toast = document.querySelector('.d3-toast')!
    fireEvent.pointerEnter(toast)
    act(() => { vi.advanceTimersByTime(5000) })
    expect(onDismiss).not.toHaveBeenCalled()
    fireEvent.pointerLeave(toast)
    act(() => { vi.advanceTimersByTime(399) })
    expect(onDismiss).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(2) })
    expect(onDismiss).toHaveBeenCalledWith('timeout')
  })

  it('pauses while focus is inside it', () => {
    setup()
    const onDismiss = vi.fn()
    act(() => { api.show({ message: 'Saved', duration: 1000, onDismiss, action: { label: 'Undo', onAction: () => {} } }) })
    act(() => { screen.getByRole('button', { name: 'Undo' }).focus() })
    act(() => { vi.advanceTimersByTime(5000) })
    expect(onDismiss).not.toHaveBeenCalled()
    act(() => { screen.getByRole('button', { name: 'Archive' }).focus() })
    act(() => { vi.advanceTimersByTime(1001) })
    expect(onDismiss).toHaveBeenCalledWith('timeout')
  })

  it('duration 0 stays until closed', () => {
    setup()
    const onDismiss = vi.fn()
    act(() => { api.show({ message: 'Offline', duration: 0, onDismiss }) })
    act(() => { vi.advanceTimersByTime(60_000) })
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('one at a time: a newer toast replaces the one on screen, with a cross-fade', () => {
    setup()
    const first = vi.fn()
    act(() => { api.show({ message: 'Archived 1', onDismiss: first }) })
    act(() => { api.show({ message: 'Archived 2' }) })
    expect(first).toHaveBeenCalledWith('replaced')
    const toasts = document.querySelectorAll('.d3-toast')
    expect(toasts).toHaveLength(1)
    expect(toasts[0]).toHaveTextContent('Archived 2')
    expect(toasts[0]).toHaveClass('d3-toast--swap')
  })

  it('dismiss() from the hook closes it', () => {
    setup()
    const onDismiss = vi.fn()
    let id = ''
    act(() => { id = api.show({ message: 'Sending…', duration: 0, onDismiss }) })
    act(() => { api.dismiss('some-other-id') })
    expect(onDismiss).not.toHaveBeenCalled()
    act(() => { api.dismiss(id) })
    expect(onDismiss).toHaveBeenCalledWith('dismissed')
  })

  it('Escape inside it closes it, and focus goes back where it came from', () => {
    setup()
    const archive = screen.getByRole('button', { name: 'Archive' })
    act(() => { api.show({ message: 'Archived', duration: 0, action: { label: 'Undo', onAction: () => {} } }) })
    archive.focus()
    const undo = screen.getByRole('button', { name: 'Undo' })
    act(() => { undo.focus() })
    fireEvent.keyDown(undo, { key: 'Escape' })
    act(() => { vi.advanceTimersByTime(500) })
    expect(document.querySelector('.d3-toast')).toBeNull()
    expect(archive).toHaveFocus()
  })
})

describe('Toast — outside a region', () => {
  it('useToast without a ToastRegion shows nothing and does not throw', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Grab />)
    expect(() => api.show({ message: 'x' })).not.toThrow()
    warn.mockRestore()
  })

  it('has no accessibility violations with an action', async () => {
    const { container } = render(
      <div aria-live="polite">
        <Toast message="Archived" duration={0} action={{ label: 'Undo', shortcut: 'z', onAction: () => {} }} />
      </div>,
    )
    await expectNoAxeViolations(container)
  })
})
