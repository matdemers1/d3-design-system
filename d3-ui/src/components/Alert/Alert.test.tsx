import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Alert } from './Alert'

describe('Alert — the role contract', () => {
  it('a static alert has NO role', () => {
    // role="alert" on a page-load alert makes a screen reader interrupt itself
    // to announce something that was already there.
    const { container } = render(<Alert tone="danger" title="Expired">You were signed out.</Alert>)
    expect(container.firstElementChild).not.toHaveAttribute('role')
  })

  it('a dynamic error is assertive', () => {
    render(<Alert tone="danger" dynamic title="Expired">You were signed out.</Alert>)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('dynamic success and info are polite, not assertive', () => {
    const { rerender } = render(<Alert tone="success" dynamic>3 items dismissed.</Alert>)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    rerender(<Alert tone="info" dynamic>Read-only.</Alert>)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('hides the decorative icon', () => {
    render(<Alert tone="info" icon={<svg data-testid="ic" />}>Read-only.</Alert>)
    expect(screen.getByTestId('ic').parentElement).toHaveAttribute('aria-hidden', 'true')
  })
})

it('hosts block content in the message', () => {
  // The body is a `div` on purpose. A `p` cannot legally contain the list of
  // recovery codes or the copyable block these alerts exist to show, and the
  // browser fixes it by closing the paragraph early — which reflows the alert
  // rather than failing, so nothing would have caught it.
  const { container } = render(
    <Alert tone="warning" title="Write these down">
      <ul><li>one</li></ul>
    </Alert>,
  )
  const message = container.querySelector('.d3-alrt__message')!
  expect(message.tagName).toBe('DIV')
  expect(message.querySelector('ul')).not.toBeNull()
})

it('spans its container when flush, and keeps its tone', () => {
  const { container } = render(
    <Alert tone="warning" flush title="Still writing">
      What you are reading is slightly behind.
    </Alert>,
  )
  const alert = container.querySelector('.d3-alrt')!
  expect(alert.classList.contains('d3-alrt--flush')).toBe(true)
  expect(alert.classList.contains('d3-alrt--warning')).toBe(true)
})
