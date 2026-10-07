import { expect, test, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { storyUrl } from './stories'
import { settle } from './settle'

/**
 * The Modal as a phone bottom sheet (DS-REQ-010, DS-REQ-013) and the Alert's
 * wrapping action row (DS-REQ-011), measured at 390px in both themes, with axe
 * (contrast included) clean. And the other side of the breakpoint: at 1000px
 * the Modal is still the centred dialog, with no close button showing.
 */
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8')

async function axeViolations(page: Page): Promise<string[]> {
  await page.addScriptTag({ content: axeSource })
  return page.evaluate(async () => {
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
}

for (const theme of ['dark', 'light'] as const) {
  for (const id of ['layers-modal--phone-sheet', 'layers-modal--phone-sheet-destructive']) {
    test(`${theme} · ${id} is a bottom sheet with a pinned footer at 390px`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await page.goto(storyUrl(id, theme))
      await settle(page)

      const geo = await page.evaluate(() => {
        const panel = document.querySelector<HTMLElement>('.d3-modal')!
        const r = panel.getBoundingClientRect()
        const cs = getComputedStyle(panel)
        const grab = getComputedStyle(panel, '::before')
        const close = document.querySelector<HTMLElement>('.d3-modal__close')!
        const cr = close.getBoundingClientRect()
        const body = document.querySelector<HTMLElement>('.d3-modal__body')!
        return {
          vh: window.innerHeight,
          rect: { left: r.left, right: r.right, bottom: r.bottom, width: r.width },
          radius: { tl: cs.borderTopLeftRadius, tr: cs.borderTopRightRadius,
                    bl: cs.borderBottomLeftRadius, br: cs.borderBottomRightRadius },
          grabber: { content: grab.content, w: grab.width, h: grab.height },
          close: { display: getComputedStyle(close).display, w: cr.width, h: cr.height,
                   label: close.getAttribute('aria-label') },
          body: { scroll: body.scrollHeight, client: body.clientHeight, overflowY: getComputedStyle(body).overflowY },
          panelScrolls: panel.scrollHeight > panel.clientHeight + 1,
        }
      })
      expect(Math.abs(geo.rect.bottom - geo.vh)).toBeLessThanOrEqual(1)
      expect(geo.rect.left).toBe(0)
      expect(geo.rect.width).toBe(390)
      expect(parseFloat(geo.radius.tl)).toBeGreaterThan(0)
      expect(parseFloat(geo.radius.tr)).toBeGreaterThan(0)
      expect(parseFloat(geo.radius.bl)).toBe(0)
      expect(parseFloat(geo.radius.br)).toBe(0)
      expect(geo.grabber.content).not.toBe('none')
      expect(parseFloat(geo.grabber.w)).toBeGreaterThan(0)
      expect(parseFloat(geo.grabber.h)).toBeGreaterThan(0)
      expect(geo.close.display).not.toBe('none')
      expect(geo.close.h).toBeGreaterThanOrEqual(28)
      expect(geo.close.label).toBe('Close')
      expect(geo.body.overflowY).toBe('auto')
      // A scrolling region must be reachable by keyboard.
      expect(await page.locator('.d3-modal__body').getAttribute('tabindex')).toBe('0')
      expect(geo.body.scroll).toBeGreaterThan(geo.body.client)
      // The body scrolls, not the panel.
      expect(geo.panelScrolls).toBe(false)

      // Scrolling the body leaves the footer exactly where it was, in view.
      const footerRect = () => page.evaluate(() => {
        const r = document.querySelector('.d3-modal__footer')!.getBoundingClientRect()
        return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, vh: window.innerHeight }
      })
      const before = await footerRect()
      await page.evaluate(() => {
        const b = document.querySelector<HTMLElement>('.d3-modal__body')!
        b.scrollTop = b.scrollHeight
      })
      const scrolled = await page.evaluate(() => document.querySelector<HTMLElement>('.d3-modal__body')!.scrollTop)
      expect(scrolled).toBeGreaterThan(0)
      const after = await footerRect()
      expect(after).toEqual(before)
      expect(after.bottom).toBeLessThanOrEqual(844)
      expect(after.top).toBeGreaterThanOrEqual(0)

      const violations = await axeViolations(page)
      expect(violations, violations.join('\n')).toEqual([])
    })
  }

  test(`${theme} · layers-alert--long-actions-phone wraps its actions at 390px`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(storyUrl('layers-alert--long-actions-phone', theme))
    await settle(page)

    const geo = await page.evaluate(() => {
      const alert = document.querySelector<HTMLElement>('.d3-alrt')!
      const row = alert.querySelector<HTMLElement>('.d3-alrt__actions')!
      const [a, b] = [...row.querySelectorAll('button')].map((el) => el.getBoundingClientRect())
      const alertRect = alert.getBoundingClientRect()
      return {
        wrap: getComputedStyle(row).flexWrap,
        alertScroll: alert.scrollWidth, alertClient: alert.clientWidth,
        docScroll: document.documentElement.scrollWidth,
        firstTop: a!.top, secondTop: b!.top,
        rightmost: Math.max(a!.right, b!.right), alertRight: alertRect.right,
        buttons: row.querySelectorAll('button').length,
      }
    })
    expect(geo.buttons).toBe(2)
    expect(geo.wrap).toBe('wrap')
    expect(geo.alertScroll).toBeLessThanOrEqual(geo.alertClient)
    expect(geo.docScroll).toBeLessThanOrEqual(390)
    expect(geo.rightmost).toBeLessThanOrEqual(geo.alertRight)
    // Two long labels do not fit one line at 390px, so the second drops a row.
    expect(geo.secondTop).toBeGreaterThan(geo.firstTop)

    const violations = await axeViolations(page)
    expect(violations, violations.join('\n')).toEqual([])
  })
}

test('at 1000px the Modal is still the centred dialog and the close button is not shown', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 800 })
  await page.goto(storyUrl('layers-modal--open-by-default'))
  await settle(page)
  const geo = await page.evaluate(() => {
    const panel = document.querySelector<HTMLElement>('.d3-modal')!
    const r = panel.getBoundingClientRect()
    const cs = getComputedStyle(panel)
    return {
      cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: r.width,
      closeDisplay: getComputedStyle(document.querySelector('.d3-modal__close')!).display,
      bodyDisplay: getComputedStyle(document.querySelector('.d3-modal__body')!).display,
      radiusBottom: cs.borderBottomLeftRadius, bottomEdge: r.bottom,
      active: document.activeElement?.className ?? '',
    }
  })
  expect(Math.abs(geo.cx - 500)).toBeLessThan(1)
  expect(Math.abs(geo.cy - 400)).toBeLessThan(1)
  expect(geo.closeDisplay).toBe('none')
  expect(geo.bodyDisplay).toBe('contents')
  expect(parseFloat(geo.radiusBottom)).toBeGreaterThan(0)
  expect(geo.bottomEdge).toBeLessThan(800)
  // The destructive story focuses the panel, as before; the hidden close button never takes focus.
  expect(geo.active).toContain('d3-modal')
  expect(geo.active).not.toContain('d3-modal__close')
})

test('at 1000px a non-destructive Modal still focuses its first visible control, not the hidden close button', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 800 })
  await page.goto(storyUrl('layers-modal--phone-sheet'))
  await settle(page)
  const active = await page.evaluate(() => ({
    text: document.activeElement?.textContent ?? '',
    cls: document.activeElement?.className ?? '',
    bodyTabindex: document.querySelector('.d3-modal__body')!.getAttribute('tabindex'),
  }))
  expect(active.cls).not.toContain('d3-modal__close')
  expect(active.text).toBe('Cancel')
  // The body is a tab stop only where it scrolls: not at desktop width.
  expect(active.bodyTabindex).toBeNull()
})
