import { expect, test, type Page } from '@playwright/test'
import { storyUrl } from './stories'
import { settle, watchErrors } from './settle'

/**
 * Cards on the recessed sheet (D-085, DS-REQ-007), measured.
 *
 * In 1.4.2 a Card painted `surface`, the sheet's own colour — 1.00:1, no edge —
 * and everything a card held was tuned to a card nobody could see: white chips on
 * white, a 20px section title, an empty state painting a second surface, hairlines
 * 4px short of an edge that did not exist. Each of those is a colour or a position,
 * so each is measured here, in both themes, at 1440 and at 390.
 */
const STORY = 'frame-appshell--recessed-with-cards'
const DESKTOP = { width: 1440, height: 900 }
const PHONE = { width: 390, height: 844 }

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

/** A token resolved to a computed colour, in the theme the shell is in. */
const token = (page: Page, name: string) => page.evaluate((n) => {
  const host = document.querySelector('.d3-shell') ?? document.documentElement
  const probe = document.createElement('span')
  probe.style.color = getComputedStyle(host).getPropertyValue(n).trim()
  host.append(probe)
  const c = getComputedStyle(probe).color
  probe.remove()
  return c
}, name)

const style = (page: Page, selector: string, prop: string, nth = 0) =>
  page.locator(selector).nth(nth).evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop)

const box = (page: Page, selector: string, nth = 0) =>
  page.locator(selector).nth(nth).evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height }
  })

/** The left and right of a card's content box: inside its border and padding. */
const contentEdges = (page: Page, selector: string, nth = 0) =>
  page.locator(selector).nth(nth).evaluate((el) => {
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return {
      left: r.left + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft),
      right: r.right - parseFloat(cs.borderRightWidth) - parseFloat(cs.paddingRight),
    }
  })

/** Where an element's text starts — not its box, which a button's padding pushes out. */
const textLeft = (page: Page, selector: string, nth = 0) =>
  page.locator(selector).nth(nth).evaluate((el) => {
    const range = document.createRange()
    range.selectNodeContents(el)
    return range.getBoundingClientRect().left
  })

async function open(page: Page, theme: 'dark' | 'light', size = DESKTOP) {
  await page.setViewportSize(size)
  await page.goto(storyUrl(STORY, theme))
  await settle(page)
  expect(await page.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBe(theme)
}

const CARD = '.d3-shell__main .d3-crd'

for (const theme of ['dark', 'light'] as const) {
  test.describe(`cards on the recessed sheet · ${theme}`, () => {
    test('a card is surface-card with a 1px border edge, visible against the card and the sheet', async ({ page }) => {
      const errors = watchErrors(page)
      await open(page, theme)
      const card = await style(page, CARD, 'background-color')
      const sheet = await style(page, '.d3-shell__main', 'background-color')
      expect(card).toBe(await token(page, '--color-surface-card'))
      expect(sheet).toBe(await token(page, '--color-surface'))
      expect(card).not.toBe(sheet)
      expect(await style(page, CARD, 'border-top-width')).toBe('1px')
      const edge = await style(page, CARD, 'border-top-color')
      expect(edge).toBe(await token(page, '--color-border'))
      expect(await style(page, CARD, 'box-shadow')).toBe('none')
      const inside = await contrast(page, edge, card)
      const outside = await contrast(page, edge, sheet)
      console.log(`[measure] ${theme}: card edge vs card ${inside.toFixed(2)}:1, vs sheet ${outside.toFixed(2)}:1, ` +
        `card vs sheet ${(await contrast(page, card, sheet)).toFixed(2)}:1`)
      expect(inside).toBeGreaterThanOrEqual(1.2)
      expect(outside).toBeGreaterThanOrEqual(1.2)
      expect(errors, errors.join('\n')).toEqual([])
    })

    test('badges, the quiet count, the tab track and the segmented track are visible on the card', async ({ page }) => {
      await open(page, theme)
      const card = await style(page, CARD, 'background-color')
      const quiet = await token(page, '--color-fill-quiet')
      const fills: Record<string, string> = {
        'neutral badge': await style(page, `${CARD} .d3-bdg--neutral`, 'background-color'),
        'danger badge': await style(page, `${CARD} .d3-bdg--danger`, 'background-color'),
        'quiet count': await style(page, `${CARD} .d3-bdg--count-quiet`, 'background-color'),
        'tab track': await style(page, `${CARD} .d3-tabs__list`, 'background-color'),
        'segmented track': await style(page, `${CARD} .d3-seg`, 'background-color'),
      }
      for (const [what, fill] of Object.entries(fills)) {
        expect(fill, what).toBe(quiet)
        const ratio = await contrast(page, fill, card)
        console.log(`[measure] ${theme}: ${what} vs card ${ratio.toFixed(2)}:1`)
        expect(ratio, what).toBeGreaterThanOrEqual(1.1)
      }
      // The text on each chip still reads (axe sweeps this too; here it is a number).
      for (const sel of ['.d3-bdg--neutral', '.d3-bdg--danger', '.d3-bdg--count-quiet']) {
        const ink = await style(page, `${CARD} ${sel}`, 'color')
        expect(await contrast(page, ink, quiet), sel).toBeGreaterThanOrEqual(4.5)
      }
      // What rides on the tracks is distinct from them.
      const glide = await style(page, `${CARD} .d3-tabs__glide`, 'background-color')
      const thumb = await style(page, `${CARD} .d3-seg__thumb`, 'background-color')
      expect(await contrast(page, glide, quiet)).toBeGreaterThanOrEqual(1.1)
      expect(await contrast(page, thumb, quiet)).toBeGreaterThanOrEqual(1.1)
      // The thumb edge is the divider, not the field edge that read as a focus ring.
      expect(await style(page, `${CARD} .d3-seg__thumb`, 'border-top-color')).toBe(await token(page, '--color-border'))
    })

    test('a field edge clears 3:1 against its fill and against the card, and no more than it needs', async ({ page }) => {
      await open(page, theme)
      const card = await style(page, CARD, 'background-color')
      const fields = await page.locator(`${CARD} .d3-inp--filled`).evaluateAll((els) =>
        els.map((el) => ({ fill: getComputedStyle(el).backgroundColor, edge: getComputedStyle(el).borderTopColor })))
      expect(fields.length).toBe(2)
      const field = await token(page, '--color-border-field')
      for (const f of fields) {
        expect(f.edge).toBe(field)
        const onFill = await contrast(page, f.edge, f.fill)
        const onCard = await contrast(page, f.edge, card)
        console.log(`[measure] ${theme}: field edge vs fill ${onFill.toFixed(2)}:1, vs card ${onCard.toFixed(2)}:1`)
        expect(onFill).toBeGreaterThanOrEqual(3)
        expect(onCard).toBeGreaterThanOrEqual(3)
      }
      // And on the raised ground a modal puts a field on.
      const raised = await contrast(page, field, await token(page, '--color-surface-raised'))
      console.log(`[measure] ${theme}: field edge vs surface-raised ${raised.toFixed(2)}:1`)
      expect(raised).toBeGreaterThanOrEqual(3)
      // Light was retuned to sit just over the line (D-085); 1.4.2's 3.92:1 read as a heavy ring.
      if (theme === 'light') expect(await contrast(page, field, fields[0]!.fill)).toBeLessThan(3.2)
    })

    test('inside a card: a 16px h2, an empty state with no fill, hairlines on the content edge', async ({ page }) => {
      await open(page, theme)
      const title = page.locator(`${CARD} > .d3-sec__head .d3-sec__title`).first()
      expect(await title.evaluate((el) => el.tagName)).toBe('H2')
      expect(await title.evaluate((el) => getComputedStyle(el).fontSize)).toBe('16px')
      expect(await page.locator('.d3-ph__title').evaluate((el) => getComputedStyle(el).fontSize)).toBe('24px')

      expect(await style(page, `${CARD} .d3-es`, 'background-color')).toBe('rgba(0, 0, 0, 0)')

      const list = page.locator(CARD).filter({ has: page.locator('.d3-dlist') })
      const edges = await list.evaluate((el) => {
        const r = el.getBoundingClientRect()
        const cs = getComputedStyle(el)
        return {
          left: r.left + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft),
          right: r.right - parseFloat(cs.borderRightWidth) - parseFloat(cs.paddingRight),
        }
      })
      const hairlines = await list.locator('.d3-dlist__item + .d3-dlist__item').evaluateAll((els) =>
        els.map((el) => {
          const r = el.getBoundingClientRect()
          return { left: r.left, right: r.right, top: getComputedStyle(el).borderTopWidth }
        }))
      expect(hairlines.length).toBeGreaterThan(0)
      for (const h of hairlines) {
        expect(h.top).toBe('1px')
        expect(Math.abs(h.left - edges.left)).toBeLessThanOrEqual(0.5)
        expect(Math.abs(h.right - edges.right)).toBeLessThanOrEqual(0.5)
      }
      // The row text starts on the same edge as the card's title.
      // Text, not boxes: a truncating row title carries 4px of room for a focus ring.
      const ink = (el: Element) => { const r = document.createRange(); r.selectNodeContents(el); return r.getBoundingClientRect().left }
      const titleLeft = await list.locator('.d3-sec__title').evaluate(ink)
      const rowLeft = await list.locator('.d3-dlrow__title').first().evaluate(ink)
      expect(Math.abs(rowLeft - titleLeft)).toBeLessThanOrEqual(0.5)
      // So does a row-sized empty state.
      const es = await box(page, `${CARD} .d3-es--row`)
      const esCard = await contentEdges(page, CARD, 3)
      expect(Math.abs(es.left - esCard.left)).toBeLessThanOrEqual(0.5)
    })

    test('StatusDot tone="warning" is the warning hue, and reads on the card', async ({ page }) => {
      await open(page, theme)
      const dot = page.locator(`${CARD} .d3-sdot--warning`)
      const ink = await dot.evaluate((el) => getComputedStyle(el).color)
      expect(ink).toBe(await token(page, '--color-warning'))
      expect(await dot.locator('.d3-sdot__dot').evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(ink)
      const ratio = await contrast(page, ink, await style(page, CARD, 'background-color'))
      console.log(`[measure] ${theme}: warning text on card ${ratio.toFixed(2)}:1`)
      expect(ratio).toBeGreaterThanOrEqual(4.5)
    })

    test('the selection tint: accent text on it at 4.5:1, and (dark) a tint, not a hole, on the sheet', async ({ page }) => {
      await open(page, theme)
      const muted = await token(page, '--color-accent-muted')
      const text = await contrast(page, await token(page, '--color-accent'), muted)
      const sheet = await contrast(page, muted, await token(page, '--color-surface'))
      console.log(`[measure] ${theme}: accent on accent-muted ${text.toFixed(2)}:1, accent-muted vs sheet ${sheet.toFixed(2)}:1`)
      expect(text).toBeGreaterThanOrEqual(4.5)
      if (theme === 'dark') expect(sheet).toBeGreaterThanOrEqual(1.3)
    })

    test('the document behind the shell paints bg, so a long page keeps its ground', async ({ page }) => {
      await open(page, theme)
      const bg = await token(page, '--color-bg')
      expect(await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor)).toBe(bg)
      expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(bg)
    })

    test('Page align="center" sits in the middle of the sheet', async ({ page }) => {
      await open(page, theme)
      const main = await box(page, '.d3-shell__main')
      const pg = await box(page, '.d3-page')
      const left = pg.left - main.left
      const right = main.right - pg.right
      expect(left).toBeGreaterThan(100)
      expect(Math.abs(left - right)).toBeLessThanOrEqual(1)
    })

    test.describe('at 390px', () => {
      test('the sheet drops to bg, cards sit inset on it, and page and card pad 16px', async ({ page }) => {
        await open(page, theme, PHONE)
        expect(await style(page, '.d3-shell__main', 'background-color')).toBe(await token(page, '--color-bg'))
        expect(await style(page, CARD, 'background-color')).toBe(await token(page, '--color-surface-card'))
        expect(await style(page, CARD, 'border-top-width')).toBe('1px')
        expect(await style(page, CARD, 'padding-left')).toBe('16px')
        expect(await style(page, '.d3-page', 'padding-left')).toBe('16px')
        const card = await box(page, CARD)
        expect(card.left).toBe(16)
        expect(card.right).toBe(PHONE.width - 16)
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= 390)).toBe(true)
      })

      test('only the primary header action stretches; a secondary keeps its own width', async ({ page }) => {
        await open(page, theme, PHONE)
        const actions = await box(page, '.d3-ph__actions')
        const secondary = await box(page, '.d3-ph__actions .d3-btn--secondary')
        const primary = await box(page, '.d3-ph__actions .d3-btn--primary')
        const intrinsic = await page.locator('.d3-ph__actions .d3-btn--secondary').evaluate((el) => {
          const range = document.createRange()
          range.selectNodeContents(el)
          return range.getBoundingClientRect().width
        })
        console.log(`[measure] ${theme}: secondary ${secondary.width}px for ${intrinsic.toFixed(0)}px of label; primary ${primary.width}px`)
        expect(secondary.width).toBeLessThanOrEqual(intrinsic + 32 + 2)
        expect(Math.abs(primary.right - actions.right)).toBeLessThanOrEqual(0.5)
        expect(primary.width).toBeGreaterThan(actions.width / 2)
      })

      test('a compact settings control stays beside its text; the first ghost row action lines up with the text', async ({ page }) => {
        await open(page, theme, PHONE)
        for (const title of ['Theme', 'Message previews', 'Two-factor']) {
          const row = page.locator('.d3-setrow').filter({ has: page.getByText(title, { exact: true }) })
          const text = await row.locator('.d3-setrow__text').evaluate((el) => el.getBoundingClientRect())
          const control = await row.locator('.d3-setrow__control').evaluate((el) => el.getBoundingClientRect())
          expect(control.left, title).toBeGreaterThanOrEqual(text.right)
          expect(control.top, title).toBeLessThan(text.bottom)
        }
        const row = page.locator('.d3-dlrow').filter({ has: page.getByRole('button', { name: 'Sign out' }) }).first()
        const label = await row.getByRole('button', { name: 'Sign out' }).evaluate((el) => {
          const range = document.createRange()
          range.selectNodeContents(el)
          return range.getBoundingClientRect().left
        })
        const titleLeft = await textLeft(page, '.d3-dlrow__title', 1)
        expect(Math.abs(label - titleLeft)).toBeLessThanOrEqual(1)
      })
    })
  })
}
