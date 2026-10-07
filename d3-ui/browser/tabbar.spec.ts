import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { storyUrl } from './stories'
import { settle } from './settle'

/**
 * The phone tab bar at phone width: every item a 44px+ target sharing the width
 * equally, the label under the icon, a count badge clear of the icon's box, one
 * current page, the safe-area padding in place, the bar hidden from lg unless
 * forced, and axe (with contrast) clean in both themes at 390px.
 */
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8')
const STORIES = [
  'frame-tabbar--three-destinations',
  'frame-tabbar--five-destinations',
  'frame-tabbar--large-count',
  'frame-tabbar--forced-visible',
]

for (const theme of ['dark', 'light'] as const) {
  for (const id of STORIES) {
    test(`${theme} · ${id} at 390px`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await page.goto(storyUrl(id, theme))
      await settle(page)

      const geo = await page.evaluate(() => {
        const bar = document.querySelector<HTMLElement>('.d3-tbar')!
        const barRect = bar.getBoundingClientRect()
        const itemEls = [...bar.querySelectorAll<HTMLElement>('.d3-tbar__item')]
        const rects = itemEls.map((el) => el.getBoundingClientRect())
        // Rect overlap: the boxes intersect only if they overlap on both axes.
        const hit = (a: DOMRect, b: DOMRect) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
        const items = itemEls.map((el, i) => {
          const r = rects[i]!
          const icon = el.querySelector('.d3-tbar__icon')!.getBoundingClientRect()
          const labelEl = el.querySelector<HTMLElement>('.d3-tbar__label')!
          const label = labelEl.getBoundingClientRect()
          const b = el.querySelector('.d3-bdg')?.getBoundingClientRect()
          return {
            w: r.width, h: r.height, iconBottom: icon.bottom, labelTop: label.top, iconW: icon.width,
            hasBadge: !!b,
            overlap: b ? hit(b, icon) : false,
            // The badge must not reach into a neighbouring item, and must sit inside its own.
            overlapsOther: b ? rects.some((o, j) => j !== i && hit(b, o)) : false,
            badgeInsideItemX: b ? b.left >= r.left && b.right <= r.right : true,
            label: {
              left: label.left, right: label.right, top: label.top, bottom: label.bottom,
              w: label.width, h: label.height, visible: labelEl.checkVisibility(),
            },
          }
        })
        const cs = getComputedStyle(bar)
        return {
          display: cs.display,
          borderTop: cs.borderTopWidth,
          paddingBottom: parseFloat(cs.paddingBottom),
          barLeft: barRect.left, barWidth: barRect.width, barBottom: barRect.bottom,
          // The width the items share: the bar less its padding and borders, less the gaps.
          shared: barRect.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
            - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth)
            - parseFloat(cs.columnGap) * (itemEls.length - 1),
          current: bar.querySelectorAll('[aria-current="page"]').length,
          anchors: bar.querySelectorAll('a.d3-tbar__item').length,
          nav: bar.tagName,
          ariaLabel: bar.getAttribute('aria-label'),
          items,
        }
      })
      expect(geo.display).toBe('flex')
      expect(geo.borderTop).toBe('1px')
      expect(geo.nav).toBe('NAV')
      expect(geo.ariaLabel).toBeTruthy()
      expect(geo.items.length).toBeGreaterThanOrEqual(3)
      expect(geo.items.length).toBeLessThanOrEqual(5)
      expect(geo.anchors).toBe(geo.items.length)
      expect(geo.current).toBe(1)
      // The bar spans the whole 390px frame (not shrink-wrapped by a centring decorator)
      // and sits wholly inside the 844px viewport, labels included.
      expect(Math.abs(geo.barLeft)).toBeLessThanOrEqual(1)
      expect(Math.abs(geo.barWidth - 390)).toBeLessThanOrEqual(1)
      expect(geo.barBottom).toBeLessThanOrEqual(844 + 1)
      // max(8px, env(safe-area-inset-bottom)): never under the 8px floor.
      expect(geo.paddingBottom).toBeGreaterThanOrEqual(8)
      expect(geo.items.some((it) => it.hasBadge)).toBe(true)
      const expectedW = geo.shared / geo.items.length
      for (const it of geo.items) {
        expect(it.w).toBeGreaterThanOrEqual(44)
        expect(it.h).toBeGreaterThanOrEqual(44)
        expect(it.iconW).toBe(22)
        expect(it.labelTop).toBeGreaterThanOrEqual(it.iconBottom)
        expect(it.overlap).toBe(false)
        expect(it.overlapsOther).toBe(false)
        expect(it.badgeInsideItemX).toBe(true)
        expect(Math.abs(it.w - geo.items[0]!.w)).toBeLessThan(1)
        // An equal share of the bar, not a 44px floor on a shrink-wrapped box.
        expect(Math.abs(it.w - expectedW)).toBeLessThanOrEqual(1)
        // The label is drawn and inside the viewport, not pushed below the fold.
        expect(it.label.visible).toBe(true)
        expect(it.label.w).toBeGreaterThan(0)
        expect(it.label.h).toBeGreaterThan(0)
        expect(it.label.left).toBeGreaterThanOrEqual(0)
        expect(it.label.right).toBeLessThanOrEqual(390)
        expect(it.label.top).toBeGreaterThanOrEqual(0)
        expect(it.label.bottom).toBeLessThanOrEqual(844)
      }

      await page.addScriptTag({ content: axeSource })
      const violations = await page.evaluate(async () => {
        const axe = (window as unknown as { axe: { run: (c: unknown, o: unknown) => Promise<{
          violations: { id: string; nodes: { target: string[] }[] }[] }> } }).axe
        // The a11y addon runs axe on render too, and axe allows one run at a time.
        for (let attempt = 0; ; attempt++) {
          try {
            const r = await axe.run(document.body, {
              runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
              rules: { region: { enabled: false }, 'landmark-one-main': { enabled: false }, 'page-has-heading-one': { enabled: false } },
            })
            return r.violations.map((v) => `${v.id} × ${v.nodes.length}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(', ')}`)
          } catch (e) {
            if (!String(e).includes('already running') || attempt > 40) throw e
            await new Promise((res) => setTimeout(res, 150))
          }
        }
      })
      expect(violations, violations.join('\n')).toEqual([])
    })
  }
}

test('hidden from lg upward unless forced', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto(storyUrl('frame-tabbar--three-destinations'))
  await settle(page)
  await expect(page.locator('.d3-tbar')).toBeHidden()
  await page.goto(storyUrl('frame-tabbar--forced-visible'))
  await settle(page)
  await expect(page.locator('.d3-tbar')).toBeVisible()
})

test('the bar pads its bottom with env(safe-area-inset-bottom)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(storyUrl('frame-tabbar--three-destinations'))
  await settle(page)
  // A computed padding-bottom resolves env() to a pixel value (0 here, with no device
  // inset), so the clause can only be proved from the stylesheet source.
  const source = await page.evaluate(() => {
    const found: string[] = []
    const walk = (rules: CSSRuleList) => {
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSStyleRule && rule.selectorText === '.d3-tbar') found.push(rule.cssText)
        else if ('cssRules' in rule) walk((rule as CSSGroupingRule).cssRules)
      }
    }
    for (const sheet of Array.from(document.styleSheets)) {
      try { walk(sheet.cssRules) } catch { /* cross-origin sheet */ }
    }
    return found
  })
  expect(source.length).toBeGreaterThan(0)
  expect(source.some((t) => t.includes('safe-area-inset-bottom'))).toBe(true)
})

for (const theme of ['dark', 'light'] as const) {
  test(`${theme} · the current item stays distinguishable in forced-colors`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.emulateMedia({ forcedColors: 'active' })
    await page.goto(storyUrl('frame-tabbar--three-destinations', theme))
    await settle(page)
    const r = await page.evaluate(() => {
      const cur = document.querySelector<HTMLElement>('.d3-tbar__item[aria-current="page"]')!
      const others = [...document.querySelectorAll<HTMLElement>('.d3-tbar__item:not([aria-current])')]
      const mark = getComputedStyle(cur, '::before')
      return {
        forced: matchMedia('(forced-colors: active)').matches,
        markW: parseFloat(mark.width), markH: parseFloat(mark.height),
        markBg: mark.backgroundColor,
        weight: getComputedStyle(cur).fontWeight,
        otherWeights: others.map((o) => getComputedStyle(o).fontWeight),
        otherMarks: others.map((o) => getComputedStyle(o, '::before').content),
      }
    })
    expect(r.forced).toBe(true)
    // The accent bar is a shape, not just a colour: non-zero size, a drawn forced colour
    // (never transparent), and only on the current item.
    expect(r.markW).toBeGreaterThan(0)
    expect(r.markH).toBeGreaterThan(0)
    expect(r.markBg).not.toMatch(/^rgba\(0, 0, 0, 0\)$|^transparent$/)
    for (const c of r.otherMarks) expect(c).toMatch(/^(none|normal)$/)
    for (const w of r.otherWeights) expect(Number(r.weight)).toBeGreaterThan(Number(w))
  })
}
