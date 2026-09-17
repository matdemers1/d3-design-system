import { expect, test, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { storyUrl } from './stories'
import { settle, watchErrors } from './settle'
import { themeBootScript } from '../src/components/Theme/themeBootScript'

/**
 * The frame (D-065, D-066), in a real browser at the widths it changes shape.
 *
 * jsdom has no layout and no media queries, and positions a menu so slowly that
 * the unit suite never opens one — so the collapse width, the drawer's focus
 * trap, the open menu and the theme surviving a reload are all checked here.
 */
const SHELL = 'frame-appshell--default'
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8')

async function axe(page: Page) {
  await page.addScriptTag({ content: axeSource })
  return page.evaluate(async () => {
    const a = (window as unknown as { axe: { run: (c: unknown, o: unknown) => Promise<{ violations: {
      id: string; nodes: { target: string[] }[] }[] }> } }).axe
    for (let attempt = 0; ; attempt++) {
      try {
        const r = await a.run(document.body, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
          rules: { region: { enabled: false } },
        })
        return r.violations.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(', ')}`)
      } catch (e) {
        if (!String(e).includes('already running') || attempt > 40) throw e
        await new Promise((r) => setTimeout(r, 150))
      }
    }
  })
}

const width = (page: Page, selector: string) =>
  page.locator(selector).evaluate((el) => (el as HTMLElement).getBoundingClientRect().width)

test.describe('at lg and wider — the sidebar column', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('240px, collapses to 64px, and the choice survives a reload', async ({ page }) => {
    const errors = watchErrors(page)
    await page.goto(storyUrl(SHELL))
    await settle(page)
    expect(await width(page, '.d3-shell__sidebar')).toBe(240)
    await expect(page.getByRole('button', { name: 'Open navigation' })).toHaveCount(0)

    await page.getByRole('button', { name: 'Collapse sidebar' }).click()
    expect(await width(page, '.d3-shell__sidebar')).toBe(64)
    // Icon only — and still named, and labelled on focus.
    const review = page.getByRole('link', { name: 'Review, 3 items' })
    await expect(review).toBeVisible()
    expect((await review.boundingBox())!.width).toBe(40)

    await page.reload()
    await settle(page)
    expect(await width(page, '.d3-shell__sidebar')).toBe(64)
    await expect(page.getByRole('button', { name: 'Expand sidebar' })).toBeVisible()
    await page.getByRole('link', { name: 'Search' }).focus()
    await expect(page.locator('.d3-tip', { hasText: /^Search$/ })).toBeVisible()
    expect(errors, errors.join('\n')).toEqual([])
  })

  test('the sidebar is a tone, not a box: no border and no shadow', async ({ page }) => {
    await page.goto(storyUrl(SHELL))
    await settle(page)
    const s = await page.locator('.d3-shell__sidebar').evaluate((el) => {
      const cs = getComputedStyle(el)
      const probe = document.createElement('span')
      probe.style.color = getComputedStyle(el).getPropertyValue('--color-surface').trim()
      el.append(probe)
      const surface = getComputedStyle(probe).color
      probe.remove()
      return { border: cs.borderRightWidth, shadow: cs.boxShadow, bg: cs.backgroundColor, surface }
    })
    expect(s.border).toBe('0px')
    expect(s.shadow).toBe('none')
    expect(s.bg).toBe(s.surface)
  })

  test('skip link is the first stop and lands in main', async ({ page }) => {
    await page.goto(storyUrl(SHELL))
    await settle(page)
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'Skip to content' })
    await expect(skip).toBeFocused()
    await expect(skip).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('main')).toBeFocused()
    await expect(page.getByRole('main')).toHaveCount(1)
  })

  test('the account menu: a floating panel, theme radios that keep it open, focus returned', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto(storyUrl(SHELL))
    await settle(page)
    const trigger = page.getByRole('button', { name: /Dana Whitfield/ })
    await trigger.focus()
    await page.keyboard.press('Enter')
    const menu = page.getByRole('menu')
    await expect(menu).toBeVisible()
    await settle(page)

    const panel = await menu.evaluate((el) => {
      const cs = getComputedStyle(el)
      const probe = document.createElement('span')
      probe.style.color = cs.getPropertyValue('--color-surface-raised').trim()
      document.body.append(probe)
      const raised = getComputedStyle(probe).color
      probe.remove()
      return { shadow: cs.boxShadow, border: cs.borderTopWidth, bg: cs.backgroundColor, raised }
    })
    expect(panel.shadow).toBe('none')
    expect(panel.border).toBe('1px')
    expect(panel.bg).toBe(panel.raised)

    const theme = menu.getByRole('group', { name: 'Theme' })
    await expect(theme.getByRole('menuitemradio')).toHaveText(['System', 'Light', 'Dark'])
    await expect(theme.getByRole('menuitemradio', { name: 'System' })).toHaveAttribute('aria-checked', 'true')

    // Keyboard: the menu owns the arrows, and the radios are ordinary stops in it.
    const light = theme.getByRole('menuitemradio', { name: 'Light' })
    // One step at a time, waiting for each to land: reading focus before a
    // keypress has been handled overshoots under load.
    const active = () => page.evaluate(() => document.activeElement?.textContent ?? '')
    for (let i = 0; i < 12 && (await active()) !== 'Light'; i++) {
      const before = await active()
      await page.keyboard.press('ArrowDown')
      await expect.poll(active).not.toBe(before)
    }
    await expect(light).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(light).toHaveAttribute('aria-checked', 'true')
    await expect(menu).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBe('light')

    await page.keyboard.press('Escape')
    await expect(menu).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })
})

for (const vw of [390, 768]) {
  test.describe(`below lg — the drawer · ${vw}px`, () => {
    test.use({ viewport: { width: vw, height: 800 } })

    const open = async (page: Page) => {
      await page.getByRole('button', { name: 'Open navigation' }).click()
      const drawer = page.getByRole('dialog', { name: 'Navigation' })
      await expect(drawer).toBeVisible()
      await settle(page)
      return drawer
    }

    test('traps focus, and closes on Escape with focus returned', async ({ page }) => {
      const errors = watchErrors(page)
      await page.goto(storyUrl(SHELL))
      await settle(page)
      await expect(page.locator('.d3-shell__sidebar')).toHaveCount(0)
      const drawer = await open(page)
      expect(await width(page, '.d3-shell__drawer')).toBe(240)

      const inside: boolean[] = []
      for (let i = 0; i < 16; i++) {
        await page.keyboard.press('Tab')
        inside.push(await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]'))))
      }
      expect(inside.every(Boolean), `focus left the drawer: ${inside.join(',')}`).toBe(true)

      await page.keyboard.press('Escape')
      await expect(drawer).toHaveCount(0)
      await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused()
      expect(errors, errors.join('\n')).toEqual([])
    })

    test('closes on the scrim, and when a link is activated', async ({ page }) => {
      await page.goto(storyUrl(SHELL))
      await settle(page)
      let drawer = await open(page)
      await page.mouse.click(vw - 20, 400)
      await expect(drawer).toHaveCount(0)

      drawer = await open(page)
      await drawer.getByRole('link', { name: 'Search' }).focus()
      await page.keyboard.press('Enter')
      await expect(drawer).toHaveCount(0)
    })
  })
}

test.describe('theme', () => {
  test('a chosen theme survives a reload, whatever the OS says', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto(storyUrl('frame-theme--on-a-page'))
    await settle(page)
    expect(await page.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBe('light')
    await page.getByRole('radio', { name: 'Dark' }).click()
    expect(await page.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBe('dark')

    await page.reload()
    await settle(page)
    expect(await page.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBe('dark')
    await expect(page.getByRole('radio', { name: 'Dark' })).toHaveAttribute('aria-checked', 'true')
    // And the dark tokens are what an explicit dark gets, on a light OS.
    const bg = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim())
    expect(bg).toBe('#101117')
  })

  test('system follows the OS while the page is open', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto(storyUrl('frame-theme--on-a-page'))
    await settle(page)
    expect(await page.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBe('dark')
    await page.emulateMedia({ colorScheme: 'light' })
    await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBe('light')
  })

  for (const [stored, os, want] of [
    ['light', 'dark', 'light'], ['dark', 'light', 'dark'], ['system', 'light', 'light'], [null, 'dark', 'dark'],
  ] as const) {
    test(`boot script: stored ${stored} on a ${os} OS paints ${want} before the body exists`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: os })
      await page.goto('/index.json')
      await page.evaluate((v) => { if (v) localStorage.setItem('d3.theme', v); else localStorage.removeItem('d3.theme') }, stored)
      await page.setContent(
        `<!doctype html><html><head><script>${themeBootScript()}</script>` +
        '<script>window.__atHead = document.documentElement.getAttribute("data-theme"); ' +
        'window.__bodyYet = Boolean(document.body)</script></head><body></body></html>',
      )
      const seen = await page.evaluate(() => ({
        at: (window as unknown as { __atHead: string }).__atHead,
        body: (window as unknown as { __bodyYet: boolean }).__bodyYet,
      }))
      expect(seen.body).toBe(false)
      expect(seen.at).toBe(want)
    })
  }
})

for (const theme of ['dark', 'light'] as const) {
  for (const vw of [390, 768, 1280]) {
    test(`axe · ${theme} · ${vw}px · shell with its layer open`, async ({ page }) => {
      await page.setViewportSize({ width: vw, height: 800 })
      await page.goto(storyUrl(SHELL, theme))
      await settle(page)
      expect(await axe(page), 'closed').toEqual([])
      if (vw < 1024) {
        await page.getByRole('button', { name: 'Open navigation' }).click()
        await expect(page.getByRole('dialog')).toBeVisible()
      } else {
        await page.getByRole('button', { name: /Dana Whitfield/ }).click()
        await expect(page.getByRole('menu')).toBeVisible()
      }
      await settle(page)
      expect(await axe(page), 'open').toEqual([])
    })
  }
}
