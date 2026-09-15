import * as React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { __resetDevWarnings } from '../lib/dev'
import * as UI from '../index'
import {
  Alert, Avatar, Badge, Button, Checkbox, CountBadge, EmptyState, FormField, IconButton,
  Input, Link, Modal, PageHeader, SegmentedControl, Select, Tabs, Textarea, Tooltip, TooltipProvider,
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

describe('code and password entry', () => {
  it('CodeInput with no name, checked against the real DOM', async () => {
    render(<UI.CodeInput />)
    await frame(); await frame()
    expect(warned('CodeInput: this control has no accessible name')).toBe(true)
  })

  it('CodeInput with a length it cannot draw, or groups that do not add up', () => {
    render(<UI.CodeInput aria-label="Code" length={0} />)
    render(<UI.CodeInput aria-label="Code" length={6} groups={[4, 4]} />)
    expect(warned('CodeInput: `length={0}`')).toBe(true)
    expect(warned('CodeInput: `groups` adds up to 8')).toBe(true)
    // Degrades rather than drawing nothing.
    expect(document.querySelectorAll('.d3-code').length).toBe(2)
  })

  it('PasswordInput strength with no words, or a score out of range', () => {
    render(<UI.PasswordInput aria-label="Password" strength={js<{ score: 0; label: string }>({ score: 9, label: '' })} />)
    expect(warned('PasswordInput: `strength.score` is 9')).toBe(true)
    expect(warned('PasswordInput: `strength.label` is empty')).toBe(true)
  })

  it('PasswordInput with no autoComplete, which password managers read', () => {
    render(<UI.PasswordInput aria-label="Password" />)
    expect(warned('PasswordInput: give it `autoComplete`')).toBe(true)
  })

  it('correct use warns about nothing', async () => {
    render(<FormField label="Code"><UI.CodeInput length={12} groups={[4, 4, 4]} mode="alphanumeric" /></FormField>)
    render(<FormField label="Password"><UI.PasswordInput autoComplete="new-password" strength={{ score: 3, label: 'Good' }} /></FormField>)
    await frame(); await frame()
    expect(warn).not.toHaveBeenCalled()
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

  // Opening a Tooltip is checked in the browser suite (browser/behaviour.spec.ts),
  // not here. In jsdom it took ~6s on a laptop and timed out at 20s on a CI
  // runner: floating-ui walks every ancestor through getComputedStyle, which
  // jsdom does slowly with real stylesheets loaded. A browser does it in a frame.
  it('Tooltip renders with no provider above it', () => {
    expect(() => render(<Tooltip content="Copy the link"><button>copy</button></Tooltip>)).not.toThrow()
  })

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

describe('meaning never rests on colour alone', () => {
  it('a checked Checkbox shows a tick with no checkIcon passed', () => {
    const { container } = render(<Checkbox label="Remember me" defaultChecked />)
    expect(container.querySelector('.d3-cbx__tick svg')).not.toBeNull()
  })

  it('an uncontrolled indeterminate Checkbox shows the dash, not the tick', () => {
    const { container } = render(<Checkbox label="All" defaultChecked="indeterminate" />)
    expect(container.querySelector('.d3-cbx__indicator')?.getAttribute('data-state')).toBe('indeterminate')
  })

  it('an external Link shows a visible cue with no externalIcon passed', () => {
    const { container } = render(<Link href="https://example.com" external>Docs</Link>)
    expect(container.querySelector('.d3-lnk__ext svg')).not.toBeNull()
  })
})

describe('Select accepts what a native <select> accepted', () => {
  it('an id, so a <label htmlFor> outside a FormField names it', () => {
    const { getByRole } = render(<><label htmlFor="lvl">Minimum level</label>
      <Select id="lvl" options={[{ value: 'a', label: 'A' }]} /></>)
    expect(getByRole('combobox', { name: 'Minimum level' })).toBeInTheDocument()
  })

  it('an option whose value is the empty string renders', () => {
    // Radix throws on this. Bindery's log filter ("Everything" = "") crashed on first render.
    expect(() => render(<Select aria-label="Level" value="" onValueChange={() => {}}
      options={[{ value: '', label: 'Everything' }, { value: 'error', label: 'Errors only' }]} />)).not.toThrow()
  })

  it('shows the empty-string option as selected rather than as the placeholder', () => {
    const { container } = render(<Select aria-label="Level" value="" onValueChange={() => {}} placeholder="Pick one"
      options={[{ value: '', label: 'Everything' }, { value: 'error', label: 'Errors only' }]} />)
    expect(container.querySelector('.d3-sel__value')?.textContent).toBe('Everything')
  })

  it('still shows the placeholder for value="" when no option is empty', () => {
    const { container } = render(<Select aria-label="Level" value="" onValueChange={() => {}} placeholder="Pick one"
      options={[{ value: 'warning', label: 'Warnings' }, { value: 'error', label: 'Errors only' }]} />)
    expect(container.querySelector('.d3-sel__value')?.textContent).toBe('Pick one')
  })

  it('submits with a native form under its name', () => {
    const { container } = render(<form><Select name="level" defaultValue="error"
      options={[{ value: 'warning', label: 'Warnings' }, { value: 'error', label: 'Errors only' }]} aria-label="Level" /></form>)
    expect(new FormData(container.querySelector('form')!).get('level')).toBe('error')
  })
})

describe('Link asChild — a router link keeps its navigation', () => {
  // Stands in for react-router's Link: an anchor whose click it handles itself.
  const RouterLink = React.forwardRef<HTMLAnchorElement, { to: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>>(
    ({ to, ...rest }, ref) => <a ref={ref} href={to} data-router="yes" {...rest} />)

  it('renders the child element, styled, instead of an anchor of its own', () => {
    const { container } = render(<Link asChild variant="inline"><RouterLink to="/pipeline">Pipeline</RouterLink></Link>)
    const anchors = container.querySelectorAll('a')
    expect(anchors).toHaveLength(1)
    const a = anchors[0]!
    expect(a).toHaveAttribute('data-router', 'yes')
    expect(a).toHaveAttribute('href', '/pipeline')
    expect(a.className).toContain('d3-lnk')
    expect(a.className).toContain('d3-lnk--inline')
  })

  it("keeps the child's own handlers and gives both refs the node", () => {
    const onClick = vi.fn()
    const outer = React.createRef<HTMLAnchorElement>()
    const inner = React.createRef<HTMLAnchorElement>()
    const { getByText } = render(
      <Link asChild ref={outer}><RouterLink ref={inner} to="/x" onClick={onClick}>Go</RouterLink></Link>)
    getByText('Go').click()
    expect(onClick).toHaveBeenCalledOnce()
    expect(outer.current).toBe(inner.current)
    expect(outer.current?.tagName).toBe('A')
  })

  it('does not ask for an href when asChild is set', () => {
    render(<Link asChild><RouterLink to="/x">Go</RouterLink></Link>)
    expect(warned('Link: `href` is required')).toBe(false)
  })
})

describe('bodies that hold real content', () => {
  it('EmptyState accepts paragraphs in its body without invalid nesting', () => {
    // Same defect Alert had in D-050, found again migrating Bindery's "Not here".
    const { container } = render(
      <EmptyState kind="no-access" heading="Not here"><p>One.</p><p>Two.</p></EmptyState>)
    const body = container.querySelector('.d3-es__body')!
    expect(body.tagName).toBe('DIV')
    expect(body.querySelectorAll('p')).toHaveLength(2)
  })
})
