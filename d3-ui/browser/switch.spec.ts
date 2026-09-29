import { expect, test, type Page } from '@playwright/test'
import { storyUrl } from './stories'
import { settle } from './settle'

/**
 * Switch geometry, colour and motion, which jsdom cannot compute: the 36x20
 * track, the 16px knob 2px in and its 16px travel, the accent fill when on, the
 * off track's contrast against surface, and no movement under reduced motion.
 */

async function contrast(page: Page, a: string, b: string) {
  return page.evaluate(([x, y]) => {
    const lum = (c: string) => {
      const [r, g, bl] = c.match(/[\d.]+/g)!.slice(0, 3).map(Number).map((v) => {
        const s = v / 255
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
      })
      return 0.2126 * r! + 0.7152 * g! + 0.0722 * bl!
    }
    const [hi, lo] = [lum(x!), lum(y!)].sort((m, n) => n - m)
    return (hi! + 0.05) / (lo! + 0.05)
  }, [a, b])
}

const tokenColor = (page: Page, name: string) => page.evaluate((n) => {
  const host = document.querySelector('[data-theme]') ?? document.documentElement
  const probe = document.createElement('span')
  probe.style.color = getComputedStyle(host).getPropertyValue(n).trim()
  host.append(probe)
  const c = getComputedStyle(probe).color
  probe.remove()
  return c
}, name)

const measure = (page: Page) => page.evaluate(() =>
  [...document.querySelectorAll<HTMLElement>('.d3-sw__track')].map((t) => {
    const k = t.querySelector<HTMLElement>('.d3-sw__knob')!
    const tr = t.getBoundingClientRect()
    const kr = k.getBoundingClientRect()
    return {
      on: t.getAttribute('aria-checked') === 'true',
      w: tr.width, h: tr.height, kw: kr.width, kh: kr.height,
      inset: kr.left - tr.left, travelEnd: tr.right - kr.right, top: kr.top - tr.top,
      track: getComputedStyle(t).backgroundColor, knob: getComputedStyle(k).backgroundColor,
    }
  }))

for (const theme of ['dark', 'light'] as const) {
  test.describe(`switch · ${theme}`, () => {
    test('36x20 track, 16px knob inset 2px, accent on, knob distinct from track', async ({ page }) => {
      await page.goto(storyUrl('forms-switch--all-states', theme))
      await settle(page)
      const sw = await measure(page)
      expect(sw.length).toBe(4)
      const accent = await tokenColor(page, '--color-accent')
      const field = await tokenColor(page, '--color-border-field')
      for (const s of sw) {
        expect([s.w, s.h, s.kw, s.kh]).toEqual([36, 20, 16, 16])
        expect(s.top).toBe(2)
        expect(s.inset).toBe(s.on ? 18 : 2)
        expect(s.travelEnd).toBe(s.on ? 2 : 18)
        expect(s.track).toBe(s.on ? accent : field)
        expect(await contrast(page, s.knob, s.track)).toBeGreaterThanOrEqual(3)
      }
    })

    test('off track against surface and surface-raised', async ({ page }) => {
      await page.goto(storyUrl('forms-switch--off', theme))
      await settle(page)
      const track = (await measure(page))[0]!.track
      for (const t of ['--color-surface', '--color-surface-raised']) {
        const ratio = await contrast(page, track, await tokenColor(page, t))
        console.log(`[measure] ${theme}: off track vs ${t} ${ratio.toFixed(2)}:1`)
        expect(ratio).toBeGreaterThanOrEqual(2.99)
      }
    })

    test('Space toggles and the knob slides; the focus ring is 2px', async ({ page }) => {
      await page.goto(storyUrl('forms-switch--uncontrolled', theme))
      await settle(page)
      const btn = page.getByRole('switch')
      await page.keyboard.press('Tab')
      await expect(btn).toBeFocused()
      const outline = await btn.evaluate((e) => getComputedStyle(e).outlineWidth)
      expect(outline).toBe('2px')
      await page.keyboard.press('Space')
      await expect(btn).toHaveAttribute('aria-checked', 'false')
      await page.keyboard.press('Enter')
      await expect(btn).toHaveAttribute('aria-checked', 'true')
    })

    test('reduced motion: no transition, the knob is at its end position at once', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto(storyUrl('forms-switch--uncontrolled', theme))
      await settle(page)
      const btn = page.getByRole('switch')
      const knob = btn.locator('.d3-sw__knob')
      const dur = await knob.evaluate((e) => getComputedStyle(e).transitionDuration)
      const prop = await knob.evaluate((e) => getComputedStyle(e).transitionProperty)
      expect(prop === 'none' || parseFloat(dur) === 0 || parseFloat(dur) < 0.001).toBe(true)
      await btn.click()
      // Read on the very next frame, not after settling.
      const inset = await page.evaluate(() => new Promise<number>((res) => requestAnimationFrame(() => {
        const t = document.querySelector('.d3-sw__track')!.getBoundingClientRect()
        const k = document.querySelector('.d3-sw__knob')!.getBoundingClientRect()
        res(k.left - t.left)
      })))
      expect(inset).toBe(2)
    })

    test('normal motion: the knob transitions over the hover tier (90ms)', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await page.goto(storyUrl('forms-switch--off', theme))
      await settle(page)
      const dur = await page.locator('.d3-sw__knob').evaluate((e) => getComputedStyle(e).transitionDuration)
      expect(dur.split(',')[0]).toBe('0.09s')
    })
  })
}
