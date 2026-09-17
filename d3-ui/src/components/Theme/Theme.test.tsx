import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, useTheme } from './ThemeProvider'
import { ThemeSwitch } from './ThemeSwitch'
import { themeBootScript } from './themeBootScript'
import { mockMatchMedia, PREFERS_LIGHT } from '../../test/media'

const html = document.documentElement
let media: ReturnType<typeof mockMatchMedia>

beforeEach(() => {
  localStorage.clear()
  html.removeAttribute('data-theme')
  media = mockMatchMedia({ [PREFERS_LIGHT]: false })
})
afterEach(() => {
  media.restore()
  vi.restoreAllMocks()
})

function Readout() {
  const { preference, resolved } = useTheme()
  return <output>{preference}/{resolved}</output>
}

describe('ThemeProvider — the document gets one answer', () => {
  it('resolves system through the OS setting, and follows it live', () => {
    render(<ThemeProvider><Readout /></ThemeProvider>)
    expect(html).toHaveAttribute('data-theme', 'dark')
    expect(screen.getByRole('status')).toHaveTextContent('system/dark')
    act(() => media.set(PREFERS_LIGHT, true))
    expect(html).toHaveAttribute('data-theme', 'light')
    expect(screen.getByRole('status')).toHaveTextContent('system/light')
  })

  it('writes an explicit dark as data-theme="dark", not as an absent attribute', async () => {
    // An absent attribute means "follow the OS" to the token CSS, which on a
    // light OS is light. A person who chose dark must get dark.
    media.set(PREFERS_LIGHT, true)
    render(<ThemeProvider><ThemeSwitch /></ThemeProvider>)
    await userEvent.click(screen.getByRole('radio', { name: 'Dark' }))
    expect(html).toHaveAttribute('data-theme', 'dark')
    expect(localStorage.getItem('d3.theme')).toBe('dark')
  })

  it('remembers the choice under its key, and reads it back', async () => {
    const { unmount } = render(<ThemeProvider storageKey="app.theme"><ThemeSwitch /></ThemeProvider>)
    await userEvent.click(screen.getByRole('radio', { name: 'Light' }))
    expect(localStorage.getItem('app.theme')).toBe('light')
    unmount()
    html.removeAttribute('data-theme')
    render(<ThemeProvider storageKey="app.theme"><ThemeSwitch /></ThemeProvider>)
    expect(screen.getByRole('radio', { name: 'Light' })).toHaveAttribute('aria-checked', 'true')
    expect(html).toHaveAttribute('data-theme', 'light')
  })

  it('ignores a stored value it does not recognise', () => {
    localStorage.setItem('d3.theme', 'sepia')
    render(<ThemeProvider><Readout /></ThemeProvider>)
    expect(screen.getByRole('status')).toHaveTextContent('system/dark')
  })

  it('still works when storage throws', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('denied') })
    render(<ThemeProvider><ThemeSwitch /><Readout /></ThemeProvider>)
    await userEvent.click(screen.getByRole('radio', { name: 'Light' }))
    expect(screen.getByRole('status')).toHaveTextContent('light/light')
    expect(html).toHaveAttribute('data-theme', 'light')
  })

  it('follows a change made in another tab', () => {
    render(<ThemeProvider><Readout /></ThemeProvider>)
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'd3.theme', newValue: 'light' }))
    })
    expect(screen.getByRole('status')).toHaveTextContent('light/light')
  })
})

describe('ThemeSwitch', () => {
  it('is a named radiogroup of System, Light and Dark on a page', () => {
    render(<ThemeProvider><ThemeSwitch /></ThemeProvider>)
    const group = screen.getByRole('radiogroup', { name: 'Theme' })
    expect(group).toBeInTheDocument()
    expect(screen.getAllByRole('radio').map((r) => r.textContent)).toEqual(['System', 'Light', 'Dark'])
    expect(screen.getByRole('radio', { name: 'System' })).toHaveAttribute('aria-checked', 'true')
  })

  it('without a provider, reports the OS and changes nothing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<><ThemeSwitch /><Readout /></>)
    await userEvent.click(screen.getByRole('radio', { name: 'Light' }))
    expect(screen.getByRole('status')).toHaveTextContent('system/dark')
    expect(warn.mock.calls.some((c) => String(c[0]).includes('no ThemeProvider'))).toBe(true)
  })
})

describe('themeBootScript — the first paint is already right', () => {
  const run = (key?: string) => new Function(themeBootScript(key))()

  it('applies a stored preference', () => {
    localStorage.setItem('d3.theme', 'light')
    run()
    expect(html).toHaveAttribute('data-theme', 'light')
  })

  it('resolves system, and anything unrecognised, from the OS', () => {
    localStorage.setItem('d3.theme', 'system')
    media.set(PREFERS_LIGHT, true)
    run()
    expect(html).toHaveAttribute('data-theme', 'light')
    localStorage.setItem('d3.theme', 'nonsense')
    media.set(PREFERS_LIGHT, false)
    run()
    expect(html).toHaveAttribute('data-theme', 'dark')
  })

  it('reads a custom key', () => {
    localStorage.setItem('app.theme', 'light')
    run('app.theme')
    expect(html).toHaveAttribute('data-theme', 'light')
  })

  it('survives storage that throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied') })
    media.set(PREFERS_LIGHT, true)
    expect(() => run()).not.toThrow()
    expect(html).toHaveAttribute('data-theme', 'light')
  })

  it('cannot close the script element it is inlined into', () => {
    expect(themeBootScript('</script><script>alert(1)')).not.toContain('</script>')
  })
})
