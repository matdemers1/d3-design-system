import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button — the contract', () => {
  it('activates with Enter and with Space', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save changes</Button>)
    screen.getByRole('button').focus()
    await user.keyboard('{Enter}')
    await user.keyboard(' ')
    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it('defaults to type="button" so it cannot submit a form by accident', () => {
    render(<Button>Save changes</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('while loading: marks aria-busy, blocks activation, and stays focusable', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button loading onClick={onClick}>Save changes</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-busy', 'true')
    await user.click(btn)
    expect(onClick).not.toHaveBeenCalled()
    // Focus must not be lost mid-action — a disabled button would drop it.
    btn.focus()
    expect(btn).toHaveFocus()
    expect(btn).not.toBeDisabled()
  })

  it('keeps its label unchanged while loading, so it does not resize', () => {
    const { rerender } = render(<Button>Save changes</Button>)
    const before = screen.getByRole('button').textContent
    rerender(<Button loading>Save changes</Button>)
    expect(screen.getByRole('button').textContent).toBe(before)
  })

  it('hides decorative icons from assistive technology', () => {
    render(<Button icon={<svg data-testid="ic" />}>New item</Button>)
    expect(screen.getByTestId('ic').parentElement).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('button')).toHaveAccessibleName('New item')
  })

  it('ships no margin — spacing belongs to the parent', () => {
    render(<Button>Save changes</Button>)
    expect(getComputedStyle(screen.getByRole('button')).margin).toBe('0px')
  })
})

describe('pressed — a toggle is a button that stays down', () => {
  it('reports its state, and says nothing when it is not a toggle', () => {
    const { rerender } = render(<Button pressed={false}>Live</Button>)
    expect(screen.getByRole('button', { name: 'Live' })).toHaveAttribute('aria-pressed', 'false')
    rerender(<Button pressed>Live</Button>)
    expect(screen.getByRole('button', { name: 'Live' })).toHaveAttribute('aria-pressed', 'true')
    // A plain action must not claim a state it does not have: `aria-pressed`
    // present and false turns every button in the app into a toggle that is off.
    rerender(<Button>Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' })).not.toHaveAttribute('aria-pressed')
  })
})

/* The CSSOM, not getComputedStyle: jsdom resolves no custom properties and
   computes nothing for pseudo-elements, so the rule as written is what can be
   asserted (the same approach as CommandPalette.test.tsx). Quotes in attribute
   selectors are normalised, since serialisers disagree on them. */
function cssRules(): CSSRule[] {
  const out: CSSRule[] = []
  const walk = (list: CSSRuleList) => {
    for (const r of Array.from(list)) {
      out.push(r)
      if ('cssRules' in r && (r as CSSGroupingRule).cssRules) walk((r as CSSGroupingRule).cssRules)
    }
  }
  for (const sheet of Array.from(document.styleSheets)) {
    try { walk(sheet.cssRules) } catch { /* cross-origin */ }
  }
  return out
}
const norm = (s: string) => s.replace(/"/g, "'").replace(/\s+/g, ' ').trim()
function cssRule(selector: string, inMedia?: string): CSSStyleDeclaration | undefined {
  const want = norm(selector)
  const hit = cssRules().find((r) =>
    r instanceof CSSStyleRule && r.selectorText.split(',').map(norm).includes(want) &&
    (inMedia ? r.parentRule instanceof CSSMediaRule && r.parentRule.conditionText.includes(inMedia)
      : !(r.parentRule instanceof CSSMediaRule))) as CSSStyleRule | undefined
  return hit?.style
}
/** A property as declared on a selector, across every rule that names it. */
function declared(selector: string, prop: string): string {
  const want = norm(selector)
  return cssRules().filter((r): r is CSSStyleRule =>
    r instanceof CSSStyleRule && !(r.parentRule instanceof CSSMediaRule) &&
    r.selectorText.split(',').map(norm).includes(want))
    .map((r) => r.style.getPropertyValue(prop)).filter(Boolean).pop() ?? ''
}

describe('Button — secondary has a findable edge (D-084, PST-DA-057)', () => {
  it('draws a 1px border-field border on secondary, and none on the other variants', () => {
    render(<Button variant="secondary">Cancel</Button>)
    expect(cssRule('.d3-btn--secondary')!.getPropertyValue('border'))
      .toBe('var(--border-width) solid var(--color-border-field)')
    expect(cssRule('.d3-btn')!.getPropertyValue('border')).toBe('0')
    for (const v of ['primary', 'ghost', 'danger', 'danger-ghost']) {
      expect(cssRule(`.d3-btn--${v}`)!.getPropertyValue('border')).toBe('')
    }
  })

  it('turns that border accent when pressed, rather than drawing a ring inside it', () => {
    render(<Button variant="secondary" pressed>Live</Button>)
    expect(declared(".d3-btn--secondary[aria-pressed='true']", 'border-color')).toBe('var(--color-accent)')
    expect(declared(".d3-btn--secondary[aria-pressed='true']", 'box-shadow')).toBe('')
    // Ghost has no border, so it keeps the inset ring.
    expect(declared(".d3-btn--ghost[aria-pressed='true']", 'box-shadow'))
      .toBe('inset 0 0 0 var(--border-width) var(--color-accent)')
  })
})
