import { expect, test } from '@playwright/test'
import { storyUrl } from './stories'
import { settle } from './settle'

/**
 * Coarse-pointer sizing (DS-REQ-009, DS-REQ-012): a thumb needs 44px.
 *
 * Under `pointer: coarse`, Button (sm, md, lg), IconButton (44 x 44), the
 * SegmentedControl items and the SideNav items — expanded and the collapsed rail
 * — each measure at least 44px tall, on their existing stories, in both themes.
 * Under a fine pointer nothing moves: the desktop ramp is asserted at the end.
 *
 * Chromium reports `pointer: coarse` for a hasTouch + isMobile context, which the
 * first test pins so a Playwright change cannot turn the rest into vacuous passes.
 * Measured with getBoundingClientRect (what a finger hits); the 0.5px tolerance is
 * for subpixel layout only.
 */
const STORIES = [
  'primitives-button--sizes',
  'primitives-button--all-variants',
  'primitives-button--with-icon',
  'primitives-button--all-states',
  'primitives-iconbutton--sizes',
  'primitives-iconbutton--all-states',
  'primitives-iconbutton--toggle',
  'layers-segmentedcontrol--sizes',
  'layers-segmentedcontrol--default',
  'layers-segmentedcontrol--with-icons',
  'layers-segmentedcontrol--with-counts',
  'frame-sidenav--groups',
  'frame-sidenav--flat',
  'frame-sidenav--collapsed',
]
const SELECTOR = '.d3-btn, .d3-ibtn, .d3-seg__item, .d3-snav__item'

test.describe('pointer: coarse', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

  test('the context reports a coarse primary pointer', async ({ page }) => {
    await page.goto(storyUrl('primitives-button--sizes'))
    await settle(page)
    expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true)
    expect(await page.evaluate(() => matchMedia('(hover: none)').matches)).toBe(true)
  })

  for (const theme of ['dark', 'light'] as const) {
    for (const id of STORIES) {
      test(`${theme} · ${id}`, async ({ page }) => {
        await page.goto(storyUrl(id, theme))
        await settle(page)

        const found = await page.evaluate((selector) => {
          return [...document.querySelectorAll<HTMLElement>(selector)]
            .filter((el) => el.getClientRects().length > 0)
            .map((el) => {
              const r = el.getBoundingClientRect()
              return { cls: String(el.className).split(' ')[0]!, w: r.width, h: r.height, label: (el.textContent ?? '').trim().slice(0, 20) }
            })
        }, SELECTOR)

        expect(found.length).toBeGreaterThan(0)
        for (const c of found) {
          expect(c.h, `${c.cls} "${c.label}" is ${c.h}px tall`).toBeGreaterThanOrEqual(43.5)
          if (c.cls === 'd3-ibtn') expect(c.w, `${c.cls} is ${c.w}px wide`).toBeGreaterThanOrEqual(43.5)
        }
        // The collapsed rail's targets are square-ish: 44 wide as well.
        if (id === 'frame-sidenav--collapsed') {
          for (const c of found) expect(c.w, `rail item is ${c.w}px wide`).toBeGreaterThanOrEqual(43.5)
        }
      })
    }
  }

  test('the segmented thumb still lines up with the chosen item', async ({ page }) => {
    await page.goto(storyUrl('layers-segmentedcontrol--sizes'))
    await settle(page)
    const gaps = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('.d3-seg')].map((seg) => {
        const thumb = seg.querySelector<HTMLElement>('.d3-seg__thumb')!.getBoundingClientRect()
        const item = seg.querySelector<HTMLElement>('.d3-seg__item[aria-checked="true"]')!.getBoundingClientRect()
        return { dTop: Math.abs(thumb.top - item.top), dH: Math.abs(thumb.height - item.height) }
      }),
    )
    expect(gaps.length).toBeGreaterThan(0)
    for (const g of gaps) {
      expect(g.dTop).toBeLessThan(1)
      expect(g.dH).toBeLessThan(1)
    }
  })
})

// A default desktop context: no touch, a fine pointer. Nothing here may have moved.
test('fine pointer keeps the desktop sizes', async ({ page }) => {
  await page.goto(storyUrl('primitives-button--sizes'))
  await settle(page)
  expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(false)
  const btn = await page.evaluate(() =>
    Object.fromEntries(['sm', 'md', 'lg'].map((s) => [s, document.querySelector<HTMLElement>(`.d3-btn--${s}`)!.getBoundingClientRect().height])),
  )
  expect(btn).toEqual({ sm: 28, md: 34, lg: 40 })

  await page.goto(storyUrl('primitives-iconbutton--sizes'))
  await settle(page)
  const ibtn = await page.evaluate(() =>
    Object.fromEntries(['sm', 'md', 'lg'].map((s) => {
      const r = document.querySelector<HTMLElement>(`.d3-ibtn--${s}`)!.getBoundingClientRect()
      return [s, [r.width, r.height]]
    })),
  )
  expect(ibtn).toEqual({ sm: [28, 28], md: [34, 34], lg: [40, 40] })

  await page.goto(storyUrl('layers-segmentedcontrol--sizes'))
  await settle(page)
  const seg = await page.evaluate(() =>
    Object.fromEntries(['sm', 'md'].map((s) => [s, document.querySelector<HTMLElement>(`.d3-seg--${s} .d3-seg__item`)!.getBoundingClientRect().height])),
  )
  expect(seg).toEqual({ sm: 24, md: 28 })

  await page.goto(storyUrl('frame-sidenav--flat'))
  await settle(page)
  expect(await page.evaluate(() => document.querySelector<HTMLElement>('.d3-snav__item')!.getBoundingClientRect().height)).toBeGreaterThanOrEqual(36)
  expect(await page.evaluate(() => document.querySelector<HTMLElement>('.d3-snav__item')!.getBoundingClientRect().height)).toBeLessThan(44)
  await page.goto(storyUrl('frame-sidenav--collapsed'))
  await settle(page)
  expect(await page.evaluate(() => document.querySelector<HTMLElement>('.d3-snav__item')!.getBoundingClientRect().height)).toBe(40)
})
