import { expect, test } from '@playwright/test'
import { storyUrl } from './stories'
import { settle } from './settle'

/**
 * SplitButton's open menu (D-077), in a real browser.
 *
 * jsdom positions a Radix menu so slowly (floating-ui reads every ancestor's
 * computed style) that on a CI runner one open took 20–30s and the suite timed
 * out — the same reason Menu's open state lives in shell.spec.ts. The unit suite
 * keeps the closed contract; the menu itself is checked here.
 */
const PRIMARY = 'actions-splitbutton--primary'

for (const theme of ['dark', 'light'] as const) {
  test.describe(`${theme} · SplitButton menu`, () => {
    test('the main half runs the action and never opens the menu', async ({ page }) => {
      await page.goto(storyUrl(PRIMARY, theme))
      await settle(page)
      await page.getByRole('button', { name: 'Send', exact: true }).click()
      await expect(page.getByRole('menu')).toHaveCount(0)
      await expect(page.getByRole('button', { name: 'More send options' })).toHaveAttribute('aria-expanded', 'false')
    })

    test('the chevron opens the items; choosing one closes the menu', async ({ page }) => {
      await page.goto(storyUrl(PRIMARY, theme))
      await settle(page)
      const chevron = page.getByRole('button', { name: 'More send options' })
      await chevron.click()
      const menu = page.getByRole('menu')
      await expect(menu).toBeVisible()
      await expect(chevron).toHaveAttribute('aria-expanded', 'true')
      await expect(menu.getByRole('menuitem')).toHaveText(['Send later', 'Schedule…', 'Save as draft'])
      await menu.getByRole('menuitem', { name: 'Send later' }).click()
      await expect(page.getByRole('menu')).toHaveCount(0)
    })

    test('Enter opens it, Escape closes it and focus returns to the chevron', async ({ page }) => {
      await page.goto(storyUrl(PRIMARY, theme))
      await settle(page)
      const chevron = page.getByRole('button', { name: 'More send options' })
      await chevron.focus()
      await page.keyboard.press('Enter')
      await expect(page.getByRole('menu')).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(page.getByRole('menu')).toHaveCount(0)
      await expect(chevron).toBeFocused()
    })

    test('ArrowDown opens it on the first item, and arrows move through the items', async ({ page }) => {
      await page.goto(storyUrl(PRIMARY, theme))
      await settle(page)
      await page.getByRole('button', { name: 'More send options' }).focus()
      await page.keyboard.press('ArrowDown')
      await expect(page.getByRole('menuitem', { name: 'Send later' })).toBeFocused()
      await page.keyboard.press('ArrowDown')
      await expect(page.getByRole('menuitem', { name: 'Schedule…' })).toBeFocused()
    })
  })
}
