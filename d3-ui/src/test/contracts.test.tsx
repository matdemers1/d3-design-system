import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { __resetDevWarnings } from '../lib/dev'
import * as UI from '../index'
import {
  Alert, Avatar, Badge, Button, Checkbox, CountBadge, EmptyState, FormField, IconButton,
  Input, Link, Modal, PageHeader, SegmentedControl, Tabs, Textarea, Tooltip, TooltipProvider,
} from '../index'

/**
 * The runtime half of the component contracts — what a JavaScript consumer
 * gets instead of a type error. Each rule is checked both ways: the misuse
 * warns, and correct use does not. A check that also fires on correct code is
 * noise, and noise is how real warnings get ignored.
 */
let warn: ReturnType<typeof vi.spyOn>
beforeEach(() => { __resetDevWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
afterEach(() => { cleanup(); warn.mockRestore() })

const warned = (fragment: string) =>
  warn.mock.calls.some((c: unknown[]) => String(c[0]).includes(fragment))
// JS callers are exactly the ones who can do this; the cast is the test.
const js = <T,>(props: unknown) => props as T
const frame = () => new Promise((r) => requestAnimationFrame(() => r(null)))

describe('missing accessible names', () => {
  it('IconButton without label', () => {
    render(<IconButton {...js<{ label: string; icon: React.ReactNode }>({ icon: <span /> })} />)
    expect(warned('IconButton: `label` is required')).toBe(true)
  })

  it('Modal without title', () => {
    render(<Modal {...js<{ title: string }>({ open: true })} />)
    expect(warned('Modal: `title` is required')).toBe(true)
  })

  it('SegmentedControl and Tabs without a name', () => {
    render(<SegmentedControl {...js<React.ComponentProps<typeof SegmentedControl>>({
      items: [{ value: 'a', label: 'A' }], value: 'a', onValueChange: () => {} })} />)
    render(<Tabs items={[{ value: 'a', label: 'A' }]} />)
    expect(warned('SegmentedControl: `aria-label` is required')).toBe(true)
    expect(warned('Tabs: give the tab list `aria-label`')).toBe(true)
  })

  it('Input and Textarea with no label, checked against the real DOM', async () => {
    render(<Input placeholder="Search…" />)
    render(<Textarea />)
    await frame(); await frame()
    expect(warned('Input: this control has no accessible name')).toBe(true)
    expect(warned('Textarea: this control has no accessible name')).toBe(true)
  })

  it('does not warn when the name arrives through FormField, htmlFor or aria-label', async () => {
    render(<FormField label="Email"><Input /></FormField>)
    render(<><label htmlFor="x">Name</label><Input id="x" /></>)
    render(<Input aria-label="Filter" />)
    await frame(); await frame()
    expect(warned('no accessible name')).toBe(false)
  })

  it('a placeholder does not count as a name', async () => {
    render(<Input placeholder="you@example.com" />)
    await frame(); await frame()
    expect(warned('A placeholder is not a label')).toBe(true)
  })
})

describe('silent fallbacks', () => {
  it('an unknown tone, kind or variant', () => {
    render(<Alert {...js<{ tone: 'info'; children: string }>({ tone: 'error', children: 'x' })} />)
    render(<Badge {...js<{ tone: 'neutral' }>({ tone: 'success' })}>x</Badge>)
    render(<Button {...js<{ variant: 'primary' }>({ variant: 'link' })}>x</Button>)
    render(<EmptyState {...js<{ kind: 'empty'; heading: string }>({ kind: 'missing', heading: 'x' })} />)
    expect(warned('Alert: `tone="error"`')).toBe(true)
    expect(warned('Badge: `tone="success"`')).toBe(true)
    expect(warned('Button: `variant="link"`')).toBe(true)
    expect(warned('EmptyState: `kind="missing"`')).toBe(true)
  })

  it('EmptyState with no kind at all', () => {
    render(<EmptyState {...js<{ kind: 'empty'; heading: string }>({ heading: 'Nothing' })} />)
    expect(warned('EmptyState: `kind` is required')).toBe(true)
  })

  it('the props other libraries have', () => {
    render(<Badge {...js<object>({ color: 'green' })}>Paid</Badge>)
    render(<IconButton {...js<{ label: string; icon: React.ReactNode }>({ label: 'Delete', icon: <span />, variant: 'danger' })} />)
    expect(warned('Badge: there is no `color` prop')).toBe(true)
    expect(warned('there is deliberately no `danger` variant')).toBe(true)
  })
})

describe('contradictions', () => {
  it('pressed on a primary Button', () => {
    render(<Button variant="primary" pressed>Live</Button>)
    expect(warned('`pressed` is defined for secondary and ghost only')).toBe(true)
  })

  it('a SegmentedControl that can never move, or has nothing selected', () => {
    render(<SegmentedControl {...js<React.ComponentProps<typeof SegmentedControl>>({
      'aria-label': 'Group', items: [{ value: 'a', label: 'A' }], value: 'zzz' })} />)
    expect(warned('without `onValueChange` the selection can never move')).toBe(true)
    expect(warned('`value="zzz"` matches no item')).toBe(true)
  })

  it('controlled Tabs with no way to change', () => {
    render(<Tabs aria-label="Views" items={[{ value: 'a', label: 'A' }]} value="a" />)
    expect(warned('`value` without `onValueChange`')).toBe(true)
  })

  it('CountBadge with no unit', () => {
    render(<CountBadge {...js<{ count: number; label: string }>({ count: 3 })} />)
    expect(warned('CountBadge: `label` is required')).toBe(true)
  })
})

describe('behaviour of the checks themselves', () => {
  it('stays quiet for correct usage across the library', async () => {
    render(<>
      <IconButton label="Edit" icon={<span />} />
      <Button variant="secondary" pressed>Live</Button>
      <Alert tone="warning">x</Alert>
      <Badge tone="attention">x</Badge>
      <CountBadge count={3} label="3 waiting" />
      <EmptyState kind="no-results" heading="No matches" />
      <SegmentedControl aria-label="Group" items={[{ value: 'a', label: 'A' }]} value="a" onValueChange={() => {}} />
      <Tabs aria-label="Views" items={[{ value: 'a', label: 'A' }]} />
      <FormField label="Email"><Input /></FormField>
      <Checkbox label="Remember me" />
      <Avatar name="" />
      <Link href="/x">x</Link>
      <PageHeader title="Inbox" focusOnMount={false} />
    </>)
    await frame(); await frame()
    expect(warn).not.toHaveBeenCalled()
  })

  it('warns once, not once per render', () => {
    const bad = js<{ label: string; icon: React.ReactNode }>({ icon: <span /> })
    const { rerender } = render(<IconButton {...bad} />)
    rerender(<IconButton {...bad} />)
    rerender(<IconButton {...bad} />)
    expect(warn.mock.calls.filter((c: unknown[]) => String(c[0]).includes('IconButton: `label`'))).toHaveLength(1)
  })

  it('an empty Avatar name is data, not a mistake', () => {
    render(<Avatar name="" />)
    render(<Avatar {...js<{ name: string }>({})} />)
    expect(warn.mock.calls.filter((c: unknown[]) => String(c[0]).includes('Avatar'))).toHaveLength(1)
  })
})

describe('PageHeader counts', () => {
  it('counts one thing correctly', () => {
    const { container } = render(<PageHeader title="Inbox" count={1} focusOnMount={false} />)
    // Found while adding the checks: PageHeader built its own label and missed
    // the pluralisation fix that Tabs and SegmentedControl got in D-053.
    expect(container.querySelector('[aria-label]')?.getAttribute('aria-label')).toBe('Inbox, 1 item')
  })
})

describe('a missing prop degrades — it never throws', () => {
  // The JavaScript caller these checks exist for is exactly the one who omits a
  // required prop. When this was first written, six components answered that
  // with a warning *and then a crash* — Avatar, CountBadge, Tabs,
  // SegmentedControl and Select on a missing list or value, and Tooltip on a
  // missing provider. A warning followed by a blank page helps nobody.
  const exportsUnderTest = Object.entries(UI).filter(
    ([name, C]) => /^[A-Z]/.test(name) && (typeof C === 'function' || typeof C === 'object')
      && !['TabPanel', 'ModalClose', 'FormFieldContext'].includes(name),
  )

  it('covers the exports it means to', () => {
    expect(exportsUnderTest.length).toBeGreaterThan(20)
  })

  it.each(exportsUnderTest)('%s renders with no props at all', (_name, C) => {
    const Component = C as React.ComponentType<Record<string, unknown>>
    expect(() => render(<Component />)).not.toThrow()
  })

  // Slow on purpose, not by accident: opening a tooltip makes floating-ui walk
  // every ancestor through getComputedStyle, and jsdom with the real
  // stylesheets loaded takes about five seconds to do it. A browser does it in
  // one frame — this path is also checked in Storybook.
  it('Tooltip works with no provider above it', async () => {
    render(<Tooltip content="Copy the link" delayDuration={0}><button>copy</button></Tooltip>)
    act(() => { screen.getByText('copy').focus() })
    await waitFor(() =>
      expect(document.querySelector('[role="tooltip"]')).toHaveTextContent('Copy the link'),
    { timeout: 15_000 })
  }, 20_000)

  it('and still uses the provider when there is one', () => {
    expect(() => render(
      <TooltipProvider delayDuration={0}>
        <Tooltip content="One"><button>a</button></Tooltip>
        <Tooltip content="Two"><button>b</button></Tooltip>
      </TooltipProvider>,
    )).not.toThrow()
  })
})

describe('Tooltip triggers', () => {
  it('warns when the trigger cannot take focus', () => {
    render(<Tooltip content="Why"><span>Gave up</span></Tooltip>)
    expect(warned('Tooltip: the trigger <span> cannot receive focus')).toBe(true)
  })

  it('is quiet for a button, or a span made focusable', () => {
    render(<Tooltip content="Why"><button>Retry</button></Tooltip>)
    render(<Tooltip content="Why"><span tabIndex={0}>Gave up</span></Tooltip>)
    expect(warned('cannot receive focus')).toBe(false)
  })
})
