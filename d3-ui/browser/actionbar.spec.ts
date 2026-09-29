import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { storyUrl } from './stories'
import { settle } from './settle'

/**
 * The phone bar at phone width: every item a 44px+ target sharing the width
 * equally, the label under the icon, the bar hidden from lg unless forced, and
 * axe (with contrast) clean in both themes at 390px.
 */
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8')
const STORIES = [
  'frame-actionbar--conversation',
  'frame-actionbar--disabled-item',
  'frame-actionbar--links',
  'frame-actionbar--forced-visible',
]

for (const theme of ['dark', 'light'] as const) {
  for (const id of STORIES) {
    test(`${theme} · ${id} at 390px`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await page.goto(storyUrl(id, theme))
      await settle(page)

      const geo = await page.evaluate(() => {
        const bar = document.querySelector<HTMLElement>('.d3-abar')!
        const items = [...bar.querySelectorAll<HTMLElement>('.d3-abar__item')].map((el) => {
          const r = el.getBoundingClientRect()
          const icon = el.querySelector('.d3-abar__icon')!.getBoundingClientRect()
          const label = el.querySelector('.d3-abar__label')!.getBoundingClientRect()
          return { w: r.width, h: r.height, iconBottom: icon.bottom, labelTop: label.top, iconW: icon.width }
        })
        const cs = getComputedStyle(bar)
        return { display: cs.display, borderTop: cs.borderTopWidth, items }
      })
      expect(geo.display).toBe('flex')
      expect(geo.borderTop).toBe('1px')
      expect(geo.items.length).toBeGreaterThanOrEqual(4)
      for (const it of geo.items) {
        expect(it.w).toBeGreaterThanOrEqual(44)
        expect(it.h).toBeGreaterThanOrEqual(44)
        expect(it.iconW).toBe(22)
        expect(it.labelTop).toBeGreaterThanOrEqual(it.iconBottom)
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
  await page.goto(storyUrl('frame-actionbar--conversation'))
  await settle(page)
  await expect(page.locator('.d3-abar')).toBeHidden()
  await page.goto(storyUrl('frame-actionbar--forced-visible'))
  await settle(page)
  await expect(page.locator('.d3-abar')).toBeVisible()
})
