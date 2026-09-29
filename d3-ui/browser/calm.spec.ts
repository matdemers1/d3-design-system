import { expect, test, type Page } from '@playwright/test'
import { storyUrl } from './stories'
import { settle, watchErrors } from './settle'

/**
 * The 1.3 additions for calm apps (D-073), measured in a real browser: the
 * filled field's geometry, fill, edge contrast and single focus ring; the
 * SearchField hint; the Toast's motion and its refusal to take focus; and the
 * retuned tab glide. jsdom can compute none of these.
 */

/** WCAG relative-luminance contrast between two computed `rgb()` strings. */
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

for (const theme of ['dark', 'light'] as const) {
  test.describe(`filled field · ${theme}`, () => {
    test('36px, 14px text, bg fill, border-field edge at 3:1 or better', async ({ page }) => {
      await page.goto(storyUrl('forms-input--appearance-filled', theme))
      await settle(page)
      const fields = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('.d3-inp--filled')].map((el) => {
          const cs = getComputedStyle(el)
          return { area: el.classList.contains('d3-inp--area'), disabled: el.classList.contains('d3-inp--disabled'),
            invalid: el.classList.contains('d3-inp--invalid'),
            h: el.offsetHeight, size: cs.fontSize, fill: cs.backgroundColor, edge: cs.borderTopColor, bw: cs.borderTopWidth }
        }))
      expect(fields.length).toBe(6)
      const bg = await tokenColor(page, '--color-bg')
      const field = await tokenColor(page, '--color-border-field')
      for (const f of fields) {
        if (!f.area) expect(f.h).toBe(36)
        expect(f.size).toBe('14px')
        expect(f.fill).toBe(bg)
        expect(f.bw).toBe('1px')
        if (!f.invalid) expect(f.edge).toBe(field)
      }
      const ratio = await contrast(page, field, bg)
      console.log(`[measure] ${theme}: filled edge vs fill ${ratio.toFixed(2)}:1`)
      expect(ratio).toBeGreaterThanOrEqual(3)
    })

    test('focus: one 2px outline over the edge, and the edge colour does not change', async ({ page }) => {
      await page.goto(storyUrl('forms-input--appearance-filled', theme))
      await settle(page)
      const frame = page.locator('.d3-inp--filled').nth(1)
      const before = await frame.evaluate((el) => getComputedStyle(el).borderTopColor)
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await expect(frame.locator('input')).toBeFocused()
      const at = await frame.evaluate((el) => {
        const cs = getComputedStyle(el)
        return { edge: cs.borderTopColor, style: cs.outlineStyle, width: cs.outlineWidth, offset: cs.outlineOffset, color: cs.outlineColor }
      })
      expect(at.edge).toBe(before)
      expect(at.style).toBe('solid')
      expect(at.width).toBe('2px')
      expect(at.offset).toBe('-1px')
      expect(at.color).toBe(await tokenColor(page, '--color-focus'))
      const rings = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('body *')]
        .filter((el) => { const cs = getComputedStyle(el); return cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0 }).length)
      expect(rings).toBe(1)
    })

    test('the filled Select trigger rings the same way', async ({ page }) => {
      await page.goto(storyUrl('forms-input--appearance-filled', theme))
      await settle(page)
      const trigger = page.locator('.d3-sel.d3-inp--filled')
      const before = await trigger.evaluate((el) => getComputedStyle(el).borderTopColor)
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press('Tab')
        if (await trigger.evaluate((el) => el === document.activeElement)) break
      }
      await expect(trigger).toBeFocused()
      const at = await trigger.evaluate((el) => {
        const cs = getComputedStyle(el)
        return { edge: cs.borderTopColor, width: cs.outlineWidth, offset: cs.outlineOffset, h: el.offsetHeight }
      })
      expect(at).toEqual({ edge: before, width: '2px', offset: '-1px', h: 36 })
    })

    test('SearchField: 36px, the hint shows empty and hides once typed', async ({ page }) => {
      await page.goto(storyUrl('forms-searchfield--default', theme))
      await settle(page)
      const frame = page.locator('.d3-search')
      expect(await frame.evaluate((el) => (el as HTMLElement).offsetHeight)).toBe(36)
      const kbd = page.locator('.d3-search kbd')
      await expect(kbd).toBeVisible()
      await page.getByRole('searchbox', { name: 'Search mail' }).fill('acadia')
      await expect(kbd).toBeHidden()
      const k = await page.locator('.d3-search kbd').evaluate((el) => getComputedStyle(el).color)
      const faint = await tokenColor(page, '--color-fg-faint')
      expect(k).toBe(faint)
    })
  })

  test(`toast · ${theme} · rises on the toast token, takes no focus, measured`, async ({ page }) => {
    const errors = watchErrors(page)
    await page.goto(storyUrl('layers-toast--in-a-region', theme))
    await settle(page)
    const live = page.locator('.d3-toast-region__live')
    await expect(live).toHaveAttribute('aria-live', 'polite')
    const archive = page.getByRole('button', { name: 'Archive' })
    await archive.focus()
    await page.keyboard.press('Enter')
    const toast = page.locator('.d3-toast')
    await expect(toast).toBeVisible()
    const enter = await toast.evaluate((el) => {
      const cs = getComputedStyle(el)
      return { name: cs.animationName, dur: cs.animationDuration, fill: cs.animationFillMode }
    })
    expect(enter).toEqual({ name: 'd3-toast-in', dur: '0.2s', fill: 'backwards' })
    await expect(archive).toBeFocused()
    await settle(page)
    const look = await toast.evaluate((el) => {
      const cs = getComputedStyle(el)
      const ref = document.createElement('div')
      ref.style.boxShadow = 'var(--shadow-float)'
      el.append(ref)
      const float = getComputedStyle(ref).boxShadow
      ref.remove()
      return { bg: cs.backgroundColor, border: cs.borderTopWidth, shadow: cs.boxShadow, float, transform: cs.transform,
        pos: getComputedStyle(el.closest('.d3-toast-region')!).position }
    })
    expect(look.bg).toBe(await tokenColor(page, '--color-surface-raised'))
    expect(look.border).toBe('1px')
    // A floating layer carries the float shadow (D-075).
    expect(look.shadow).not.toBe('none')
    expect(look.shadow).toBe(look.float)
    expect(look.transform).toBe('none')
    expect(look.pos).toBe('fixed')
    // The action reads at AA on the toast.
    const undo = page.getByRole('button', { name: 'Undo' })
    const undoColor = await undo.evaluate((el) => getComputedStyle(el).color)
    const r = await contrast(page, undoColor, look.bg)
    console.log(`[measure] ${theme}: toast action ${r.toFixed(2)}:1`)
    expect(r).toBeGreaterThanOrEqual(4.5)

    await page.getByRole('button', { name: 'Dismiss', exact: true }).click()
    const exit = await toast.evaluate((el) => {
      const cs = getComputedStyle(el)
      return { name: cs.animationName, dur: cs.animationDuration }
    })
    expect(exit).toEqual({ name: 'd3-toast-out', dur: '0.14s' })
    await expect(toast).toHaveCount(0)
    expect(errors, errors.join('\n')).toEqual([])
  })
}

test('the tab pill glides on the retuned token: 160ms ease-out', async ({ page }) => {
  await page.goto(storyUrl('layers-tabs--automatic'))
  await settle(page)
  const t = await page.locator('.d3-tabs__glide').first().evaluate((el) => {
    const cs = getComputedStyle(el)
    return { dur: cs.transitionDuration, ease: cs.transitionTimingFunction }
  })
  expect(t.dur).toBe('0.16s, 0.16s')
  expect(t.ease).toBe('cubic-bezier(0.2, 0.7, 0.3, 1), cubic-bezier(0.2, 0.7, 0.3, 1)')
})
