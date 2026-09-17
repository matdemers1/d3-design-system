import { expect, test, type Page } from '@playwright/test'
import { storyUrl } from './stories'
import { settle } from './settle'

/**
 * The v1.1 page primitives, measured.
 *
 * Every rule in D-021 and D-067 to D-070 that is about geometry — a content
 * width, a region gap, a row height, where actions go on a phone — is a
 * number or an order the unit suite cannot see. Each is measured here at the
 * widths it changes at.
 */
const PHONE = { width: 390, height: 844 }
const DESKTOP = { width: 1440, height: 900 }

async function open(page: Page, id: string, size = DESKTOP, theme: 'dark' | 'light' = 'dark') {
  await page.setViewportSize(size)
  await page.goto(storyUrl(id, theme))
  await settle(page)
}

const rect = (page: Page, selector: string, nth = 0) =>
  page.locator(selector).nth(nth).evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height }
  })

const noHorizontalOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)

test.describe('Page', () => {
  test('wide content is 1280px at 1440, padded 32px, regions 24px apart', async ({ page }) => {
    await open(page, 'layout-page--composed')
    const m = await page.locator('.d3-page').evaluate((el) => {
      const cs = getComputedStyle(el)
      const kids = [...el.children].map((c) => c.getBoundingClientRect())
      return {
        content: el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight),
        pad: parseFloat(cs.paddingLeft),
        gaps: kids.slice(1).map((r, i) => Math.round(r.top - kids[i]!.bottom)),
      }
    })
    expect(m.content).toBe(1280)
    expect(m.pad).toBe(32)
    expect(new Set(m.gaps)).toEqual(new Set([24]))
  })

  test('padding is 24px below lg', async ({ page }) => {
    await open(page, 'layout-page--narrow', { width: 1000, height: 800 })
    const pad = await page.locator('.d3-page').evaluate((el) => getComputedStyle(el).paddingLeft)
    expect(pad).toBe('24px')
  })

  for (const [id, want] of [['layout-page--narrow', 672], ['layout-page--form', 480]] as const) {
    test(`${id} caps its content at ${want}px`, async ({ page }) => {
      await open(page, id)
      const content = await page.locator('.d3-page').evaluate((el) => {
        const cs = getComputedStyle(el)
        return el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      })
      expect(content).toBe(want)
    })
  }

  test('does not overflow a phone', async ({ page }) => {
    await open(page, 'layout-page--composed', PHONE)
    expect(await noHorizontalOverflow(page)).toBe(true)
  })
})

test.describe('Grid', () => {
  test('tiles sit side by side on the 24px gutter from md, one column below it', async ({ page }) => {
    await open(page, 'layout-grid--status-tiles')
    const wide = await page.locator('.d3-grid > *').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().top))
    expect(new Set(wide.slice(0, 2)).size).toBe(1)
    const a = await rect(page, '.d3-grid > *', 0)
    const b = await rect(page, '.d3-grid > *', 1)
    expect(Math.round(b.left - a.right)).toBe(24)

    await open(page, 'layout-grid--status-tiles', PHONE)
    const lefts = await page.locator('.d3-grid > *').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().left)))
    expect(new Set(lefts).size).toBe(1)
  })
})

test.describe('Section', () => {
  test('the title is 20px at weight 600 from runtime tokens, in both themes', async ({ page }) => {
    for (const theme of ['dark', 'light'] as const) {
      await open(page, 'layout-section--card', DESKTOP, theme)
      const t = await page.locator('.d3-sec__title').first().evaluate((el) => {
        const cs = getComputedStyle(el)
        return { size: cs.fontSize, weight: cs.fontWeight }
      })
      expect(t).toEqual({ size: '20px', weight: '600' })
    }
  })

  test('card padding is 20px, and the body starts 16px under the head', async ({ page }) => {
    await open(page, 'layout-section--card')
    const pad = await page.locator('.d3-sec').evaluate((el) => getComputedStyle(el).paddingTop)
    expect(pad).toBe('20px')
    const head = await rect(page, '.d3-sec__head')
    const body = await rect(page, '.d3-sec__body')
    expect(Math.round(body.top - head.bottom)).toBe(16)
  })

  test('actions wrap under the title when narrow, never over it', async ({ page }) => {
    await open(page, 'layout-section--narrow')
    const title = await rect(page, '.d3-sec__lead')
    const actions = await rect(page, '.d3-sec__actions')
    expect(actions.top).toBeGreaterThanOrEqual(title.bottom)
  })
})

test.describe('AuthLayout', () => {
  test('fits a 390px phone: form width, page padding, no overflow', async ({ page }) => {
    await open(page, 'layout-authlayout--sign-in', PHONE)
    expect(await noHorizontalOverflow(page)).toBe(true)
    const r = await rect(page, '.d3-auth')
    expect(r.width).toBeLessThanOrEqual(390)
    const card = await rect(page, '.d3-auth .d3-crd')
    expect(card.left).toBeGreaterThanOrEqual(24)
  })

  test('is at most 480px of content on a desktop, centred', async ({ page }) => {
    await open(page, 'layout-authlayout--sign-in')
    const card = await rect(page, '.d3-auth .d3-crd')
    expect(card.width).toBe(480)
    const vw = await page.evaluate(() => document.documentElement.clientWidth)
    expect(Math.abs(card.left + card.width / 2 - vw / 2)).toBeLessThanOrEqual(1)
  })
})

test.describe('DescriptionList', () => {
  test('term beside value from sm, above it below sm', async ({ page }) => {
    await open(page, 'lists-descriptionlist--person')
    let term = await rect(page, '.d3-desc__term')
    let value = await rect(page, '.d3-desc__value')
    expect(value.left).toBeGreaterThan(term.right)

    await open(page, 'lists-descriptionlist--person', PHONE)
    term = await rect(page, '.d3-desc__term')
    value = await rect(page, '.d3-desc__value')
    expect(value.top).toBeGreaterThanOrEqual(term.bottom)
  })

  test('numeric values use tabular figures', async ({ page }) => {
    await open(page, 'lists-descriptionlist--numeric')
    const v = await page.locator('.d3-desc__value').first().evaluate((el) => getComputedStyle(el).fontVariantNumeric)
    expect(v).toContain('tabular-nums')
  })
})

test.describe('DataList', () => {
  test('rows are at least 48px, padded 12/16, and actions share one trailing edge', async ({ page }) => {
    await open(page, 'lists-datalist--with-actions')
    const rows = await page.locator('.d3-dlrow').evaluateAll((els) => els.map((el) => {
      const cs = getComputedStyle(el)
      return { h: el.getBoundingClientRect().height, py: cs.paddingTop, px: cs.paddingLeft }
    }))
    for (const r of rows) {
      expect(r.h).toBeGreaterThanOrEqual(48)
      expect([r.py, r.px]).toEqual(['12px', '16px'])
    }
    const rights = await page.locator('.d3-dlrow__actions').evaluateAll((els) =>
      els.map((e) => Math.round(e.getBoundingClientRect().right)))
    expect(rights.length).toBeGreaterThan(1)
    expect(new Set(rights).size).toBe(1)
    // …and meta lines up down the list as well.
    const metaLefts = await page.locator('.d3-dlrow__meta').evaluateAll((els) =>
      els.map((e) => Math.round(e.getBoundingClientRect().left)))
    expect(new Set(metaLefts).size).toBe(1)
  })

  test('a long title truncates instead of pushing the actions out', async ({ page }) => {
    await open(page, 'lists-datalist--truncated')
    const d = await page.locator('.d3-dlrow__desc').nth(1).evaluate((el) =>
      ({ overflows: el.scrollWidth > el.clientWidth, ellipsis: getComputedStyle(el).textOverflow }))
    expect(d).toEqual({ overflows: true, ellipsis: 'ellipsis' })
    expect(await noHorizontalOverflow(page)).toBe(true)
  })

  test('below sm the actions move under the text, and nothing overflows', async ({ page }) => {
    await open(page, 'lists-datalist--with-actions', PHONE)
    const text = await rect(page, '.d3-dlrow__text', 1)
    const actions = await rect(page, '.d3-dlrow__actions', 0)
    expect(actions.top).toBeGreaterThanOrEqual(text.bottom)
    expect(Math.abs(actions.left - text.left)).toBeLessThanOrEqual(1)
    expect(await noHorizontalOverflow(page)).toBe(true)
  })

  for (const size of [PHONE, DESKTOP]) {
    test(`every row action is reachable by keyboard at ${size.width}px`, async ({ page }) => {
      await open(page, 'lists-datalist--with-actions', size)
      const want = await page.locator('.d3-dlist a[href], .d3-dlist button').count()
      const reached = new Set<string>()
      for (let i = 0; i < want + 2; i++) {
        await page.keyboard.press('Tab')
        const id = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null
          if (!el?.closest('.d3-dlist')) return null
          const all = [...document.querySelectorAll('.d3-dlist a[href], .d3-dlist button')]
          return String(all.indexOf(el))
        })
        if (id) reached.add(id)
      }
      expect(reached.size).toBe(want)
    })
  }

  test('a linked row is one focus stop with one ring', async ({ page }) => {
    await open(page, 'lists-datalist--interactive')
    await page.keyboard.press('Tab')
    const focused = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement
      return { cls: el.className, outline: getComputedStyle(el).outlineStyle }
    })
    expect(focused.cls).toContain('d3-dlrow')
    expect(focused.outline).not.toBe('none')
  })

  test('inside a card, row text lines up with the section title', async ({ page }) => {
    await open(page, 'lists-datalist--in-a-section')
    const title = await rect(page, '.d3-sec__title')
    const text = await page.locator('.d3-dlrow__text').first().evaluate((el) => {
      // The row's text starts after its leading avatar; compare the row's own content edge.
      const row = el.closest('.d3-dlrow')!
      return row.getBoundingClientRect().left + parseFloat(getComputedStyle(row).paddingLeft)
    })
    expect(Math.abs(text - title.left)).toBeLessThanOrEqual(1)
  })
})

test.describe('FormActions', () => {
  test('from sm: one row, primary rightmost, leading on the far left', async ({ page }) => {
    await open(page, 'forms-formactions--with-leading')
    const buttons = await page.locator('.d3-fa button').evaluateAll((els) =>
      els.map((e) => ({ text: e.textContent, top: Math.round(e.getBoundingClientRect().top), left: e.getBoundingClientRect().left })))
    expect(new Set(buttons.map((b) => b.top)).size).toBe(1)
    const byLeft = [...buttons].sort((a, b) => a.left - b.left).map((b) => b.text)
    expect(byLeft).toEqual(['Delete this app', 'Cancel', 'Save manifest'])
  })

  test('below sm: full width, primary on top, leading at the bottom', async ({ page }) => {
    await open(page, 'forms-formactions--with-leading', PHONE)
    const fa = await rect(page, '.d3-fa')
    const buttons = await page.locator('.d3-fa button').evaluateAll((els) =>
      els.map((e) => ({ text: e.textContent, top: e.getBoundingClientRect().top, width: e.getBoundingClientRect().width })))
    const byTop = [...buttons].sort((a, b) => a.top - b.top).map((b) => b.text)
    expect(byTop).toEqual(['Save manifest', 'Cancel', 'Delete this app'])
    for (const b of buttons) expect(Math.round(b.width)).toBe(Math.round(fa.width))
  })
})

test.describe('FilterBar', () => {
  test('from md: controls share a row and the trailing slot takes the far edge', async ({ page }) => {
    await open(page, 'forms-filterbar--audit')
    const tops = await page.locator('.d3-fb__controls > *').evaluateAll((els) =>
      els.map((e) => Math.round(e.getBoundingClientRect().bottom)))
    expect(new Set(tops).size).toBe(1)
    const bar = await rect(page, '.d3-fb')
    const trailing = await rect(page, '.d3-fb__trailing')
    expect(Math.round(trailing.right)).toBe(Math.round(bar.right))
  })

  test('below md: every control full width, stacked', async ({ page }) => {
    await open(page, 'forms-filterbar--audit', PHONE)
    const bar = await rect(page, '.d3-fb')
    const widths = await page.locator('.d3-fb__controls > *').evaluateAll((els) =>
      els.map((e) => Math.round(e.getBoundingClientRect().width)))
    for (const w of widths) expect(w).toBe(Math.round(bar.width))
    expect(await noHorizontalOverflow(page)).toBe(true)
  })
})
