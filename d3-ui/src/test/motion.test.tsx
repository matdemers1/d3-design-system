import { describe, it, expect } from 'vitest'
// Importing the component pulls in its stylesheet, which vitest injects into
// the document — so the rules below are the real parsed CSS, not source text.
import '../tokens/build/motion.css'
import '../components/Spinner/Spinner'
import '../components/Skeleton/Skeleton'
import '../components/Button/Button'
import '../components/IconButton/IconButton'
import '../components/Card/Card'
import '../components/Input/Input'
import '../components/Tabs/Tabs'
import '../components/Modal/Modal'
import '../components/Select/Select'
import '../components/Tooltip/Tooltip'
import '../components/Alert/Alert'
import '../components/Badge/Badge'
import '../components/Avatar/Avatar'
import '../components/PageHeader/PageHeader'
import '../components/EmptyState/EmptyState'

/**
 * D-024 set a motion tier per interaction and, just as importantly, a list of
 * things that must NOT move. This asserts both halves.
 *
 * It reads the CSSOM rather than `getComputedStyle`, because **jsdom does not
 * implement computed animation or transition properties** — it returns '' for
 * every one of them, so a computed-style assertion here would pass on an empty
 * string and guard nothing. The parsed rule is the real declaration.
 *
 * Whether the animation actually runs is verified in a browser sweep; this
 * catches the regression that actually happens — a token renamed, an animation
 * dropped in a refactor.
 */
function ruleFor(selector: string): CSSStyleDeclaration | null {
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList
    try { rules = sheet.cssRules } catch { continue }
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule && rule.selectorText === selector) return rule.style
    }
  }
  return null
}
const decl = (selector: string) => {
  const s = ruleFor(selector)
  expect(s, `no CSS rule found for ${selector}`).not.toBeNull()
  return s!
}
/** jsdom leaves longhand accessors undefined; getPropertyValue is the
 *  spec-compliant read and returns '' when a property is absent. */
const prop = (selector: string, name: string) => decl(selector).getPropertyValue(name)

describe('things that move', () => {
  it('Spinner relays over a substrate that settles at exactly twice the period', () => {
    // The 2:1 ratio is the whole reason the two readings do not beat against
    // each other. If someone retimes one, this is what says so.
    const relay = prop('.d3-spn__edge', 'animation')
    const settle = prop('.d3-spn__g', 'animation')
    expect(relay).toContain('d3-spin-hop')
    expect(relay).toContain('1200ms')
    expect(relay).toContain('infinite')
    expect(settle).toContain('d3-spin-settle')
    expect(settle).toContain('2400ms')
    expect(settle).toContain('infinite')
    // Nodes wake on the relay's clock, not their own.
    expect(prop('.d3-spn__node', 'animation')).toContain('1200ms')
  })

  it('Skeleton gets one slow shimmer and nothing more', () => {
    const a = prop('.d3-skl', 'animation')
    expect(a).toContain('d3-shimmer')
    expect(a).toContain('1800ms')
  })

  it.each([['.d3-btn'], ['.d3-ibtn'], ['.d3-crd--interactive'], ['.d3-inp']])(
    '%s hovers through the shared --motion-hover token', (sel) => {
      const s = decl(sel)
      // Not a hard-coded duration in six places: one token, so a change to the
      // hover feel is one edit.
      expect(s.transition).toContain('var(--motion-hover)')
      expect(s.transition).not.toContain('all ')
    },
  )

  it('the Tabs pill travels — D-024 asked for a moving pill, not a cross-fade', () => {
    const t = prop('.d3-tabs__glide', 'transition')
    expect(t).toContain('transform var(--motion-tab-glide)')
    expect(t).toContain('width var(--motion-tab-glide)')
  })

  it('layers animate in AND out', () => {
    expect(prop('.d3-modal', 'animation')).toContain('var(--motion-modal-enter)')
    expect(prop(".d3-modal[data-state='closed']", 'animation')).toContain('var(--motion-modal-exit)')
    expect(prop('.d3-sel__content', 'animation')).toContain('var(--motion-menu-enter)')
    expect(prop(".d3-sel__content[data-state='closed']", 'animation')).toContain('var(--motion-menu-exit)')
    expect(prop('.d3-tip', 'animation')).toContain('var(--motion-tooltip-enter)')
  })

  it('the Select chevron rotates on open — one of the three animated icons', () => {
    expect(prop('.d3-sel .d3-inp__affix', 'transition')).toContain('transform')
    expect(prop(".d3-sel[data-state='open'] .d3-inp__affix", 'transform')).toBe('rotate(180deg)')
  })
})

describe('things that must not move', () => {
  it.each([['.d3-alrt'], ['.d3-bdg'], ['.d3-avt'], ['.d3-ph'], ['.d3-es']])(
    '%s is static — entrance motion belongs to layers that arrive, not to content', (sel) => {
      expect(prop(sel, 'animation')).toBe('')
      expect(prop(sel, 'transition')).toBe('')
    },
  )
})

describe('reduced motion', () => {
  it('every tier collapses under prefers-reduced-motion', () => {
    let found = false
    for (const sheet of Array.from(document.styleSheets)) {
      let rules: CSSRuleList
      try { rules = sheet.cssRules } catch { continue }
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSMediaRule && rule.conditionText.includes('prefers-reduced-motion')) {
          const text = Array.from(rule.cssRules).map((r) => r.cssText).join(' ')
          if (text.includes('animation-duration') && text.includes('transition-duration')) found = true
        }
      }
    }
    expect(found, 'no global prefers-reduced-motion rule reached the document').toBe(true)
  })
})
