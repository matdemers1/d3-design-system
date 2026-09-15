import { expect, test } from '@playwright/test'
import { storyUrl } from './stories'
import { settle } from './settle'

/**
 * Behaviour that jsdom cannot exercise in reasonable time, in a real browser.
 */
test('Tooltip opens on keyboard focus with no provider above it', async ({ page }) => {
  // This story has no TooltipProvider — the stories used to wrap every tooltip
  // in one, which is how the component's hard requirement on it stayed hidden.
  await page.goto(storyUrl('layers-tooltip--on-a-status'))
  await settle(page)
  await page.keyboard.press('Tab')
  // `.d3-tip` is the visible content. Radix also renders a visually hidden
  // role="tooltip" copy for screen readers, so a role query finds two.
  await expect(page.locator('.d3-tip')).toBeVisible()
  await expect(page.locator('.d3-tip')).toContainText('gave up')
})

test('Tooltip shares delays under a provider', async ({ page }) => {
  await page.goto(storyUrl('layers-tooltip--shared-delays'))
  await settle(page)
  await page.keyboard.press('Tab')
  await expect(page.locator('.d3-tip', { hasText: /^Settings$/ })).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(page.locator('.d3-tip', { hasText: 'Also settings' })).toBeVisible()
})
