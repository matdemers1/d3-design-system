import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal, readStyleNonce, setStyleNonce } from '../index'
import { Button } from '../components/Button/Button'

/**
 * D-072. The browser half — a real `style-src` with a nonce, and the page
 * actually locked — is `browser/csp.spec.ts`. This half proves the wiring: the
 * nonce set through the package reaches the `<style>` Radix's scroll lock
 * injects, which only happens when both share one `get-nonce` instance.
 */
afterEach(() => {
  cleanup()
  // get-nonce treats an empty string as unset.
  setStyleNonce('')
  document.head.querySelectorAll('meta[name="d3-style-nonce"]').forEach((m) => m.remove())
})

const lockStyles = () =>
  [...document.head.querySelectorAll('style')].filter((s) => s.textContent?.includes('data-scroll-locked'))

describe('setStyleNonce', () => {
  it('puts the nonce on the style element the Modal scroll lock injects', async () => {
    setStyleNonce('abc123')
    render(<Modal title="Remove Ada" trigger={<Button>Open</Button>} />)
    await userEvent.setup().click(screen.getByRole('button', { name: 'Open' }))
    await screen.findByRole('dialog')
    const styles = lockStyles()
    expect(styles).toHaveLength(1)
    expect(styles[0]).toHaveAttribute('nonce', 'abc123')
  })

  it('leaves the style element un-nonced when nothing was set', async () => {
    render(<Modal title="Remove Ada" trigger={<Button>Open</Button>} />)
    await userEvent.setup().click(screen.getByRole('button', { name: 'Open' }))
    await screen.findByRole('dialog')
    expect(lockStyles()[0]).not.toHaveAttribute('nonce')
  })
  // Select's own <style> is checked in the browser (browser/csp.spec.ts): opening a
  // Select in jsdom takes floating-ui several seconds of getComputedStyle.
})

describe('readStyleNonce', () => {
  const meta = (content: string) => {
    const m = document.createElement('meta')
    m.name = 'd3-style-nonce'
    m.content = content
    document.head.append(m)
  }

  it('reads the meta the server emits', () => {
    meta('r4nd0m')
    expect(readStyleNonce()).toBe('r4nd0m')
  })

  it('is undefined with no meta or an empty one', () => {
    expect(readStyleNonce()).toBeUndefined()
    meta('  ')
    expect(readStyleNonce()).toBeUndefined()
  })
})
