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
        const items = [...bar.querySelectorAll<HTMLElement>('.d3-tbar__item')].map((el) => {
          const r = el.getBoundingClientRect()
          const icon = el.querySelector('.d3-tbar__icon')!.getBoundingClientRect()
          const label = el.querySelector('.d3-tbar__label')!.getBoundingClientRect()
          const b = el.querySelector('.d3-bdg')?.getBoundingClientRect()
          // Rect overlap: the boxes intersect only if they overlap on both axes.
          const overlap = b ? (b.left < icon.right && b.right > icon.left && b.top < icon.bottom && b.bottom > icon.top) : false
          return {
            w: r.width, h: r.height, iconBottom: icon.bottom, labelTop: label.top, iconW: icon.width,
            hasBadge: !!b, overlap,
          }
        })
        const cs = getComputedStyle(bar)
        return {
          display: cs.display,
          borderTop: cs.borderTopWidth,
          paddingBottom: parseFloat(cs.paddingBottom),
          current: bar.querySelectorAll('[aria-current="page"]').length,
          anchors: bar.querySelectorAll('a.d3-tbar__item').length,
          nav: bar.tagName,
          items,
        }
      })
      expect(geo.display).toBe('flex')
      expect(geo.borderTop).toBe('1px')
      expect(geo.nav).toBe('NAV')
      expect(geo.items.length).toBeGreaterThanOrEqual(3)
      expect(geo.items.length).toBeLessThanOrEqual(5)
      expect(geo.anchors).toBe(geo.items.length)
      expect(geo.current).toBe(1)
      // max(8px, env(safe-area-inset-bottom)): never under the 8px floor.
      expect(geo.paddingBottom).toBeGreaterThanOrEqual(8)
      expect(geo.items.some((it) => it.hasBadge)).toBe(true)
      for (const it of geo.items) {
        expect(it.w).toBeGreaterThanOrEqual(44)
        expect(it.h).toBeGreaterThanOrEqual(44)
        expect(it.iconW).toBe(22)
        expect(it.labelTop).toBeGreaterThanOrEqual(it.iconBottom)
        expect(it.overlap).toBe(false)
        expect(Math.abs(it.w - geo.items[0]!.w)).toBeLessThan(1)
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
