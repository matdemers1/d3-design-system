import { expect, test } from '@playwright/test'
import { storyUrl } from './stories'
import { settle } from './settle'

/**
 * The foundations resolve in a real browser, in both themes.
 *
 * A token that resolves to nothing fails silently — no error, just a missing
 * colour. Proven by giving `--color-fg-muted` a cycle, which this catches.
 *
 * It does *not* cover the Tailwind case, and an earlier version of this comment
 * said it did. Storybook loads the plain tokens, not the Tailwind theme, so the
 * layer-precedence fragility cannot occur here; that invariant is guarded
 * statically in `check-tokens.mjs`, where it holds for every consumer.
 */
for (const theme of ['dark', 'light'] as const) {
  test(`${theme} · every colour token resolves`, async ({ page }) => {
    await page.goto(storyUrl('primitives-button--all-variants', theme))
    await settle(page)
    const { names, empty } = await page.evaluate(() => {
      const island = document.querySelector('[data-theme]') ?? document.documentElement
      const names = new Set<string>()
      for (const sheet of document.styleSheets) {
        let rules: CSSRuleList
        try { rules = sheet.cssRules } catch { continue }
        const walk = (list: CSSRuleList) => {
          for (const r of list) {
            if ('cssRules' in r && (r as CSSGroupingRule).cssRules) walk((r as CSSGroupingRule).cssRules)
            const style = (r as CSSStyleRule).style
            if (!style) continue
            for (let i = 0; i < style.length; i++) if (style[i].startsWith('--color-')) names.add(style[i])
          }
        }
        walk(rules)
      }
      const cs = getComputedStyle(island)
      return { names: [...names], empty: [...names].filter((n) => !cs.getPropertyValue(n).trim()) }
    })
    expect(names.length, 'found no colour tokens — the check is reading nothing').toBeGreaterThan(20)
    expect(empty, `colour tokens that resolve to nothing: ${empty.join(', ')}`).toEqual([])
  })
}

test('the two themes are actually different', async ({ page }) => {
  const read = async (theme: 'dark' | 'light') => {
    await page.goto(storyUrl('primitives-button--all-variants', theme))
    await settle(page)
    return page.evaluate(() => getComputedStyle(document.querySelector('[data-theme]')!).getPropertyValue('--color-fg').trim())
  }
  expect(await read('dark')).not.toEqual(await read('light'))
})

test('Inter and JetBrains Mono actually load, not merely declare', async ({ page }) => {
  // Twice before, a font 403'd or was never loaded and the page fell back to a
  // system face — which looks like a styling bug, not a missing file.
  await page.goto(storyUrl('guides-using-the-system--one-primary-per-view'))
  await settle(page)
  const loaded = await page.evaluate(async () => {
    await document.fonts.load('600 13px Inter')
    await document.fonts.load('400 12px "JetBrains Mono"')
    return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, ''))
  })
  expect(loaded).toContain('Inter')
  expect(loaded).toContain('JetBrains Mono')
})
