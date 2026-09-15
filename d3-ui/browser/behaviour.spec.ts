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

test('Select: a placeholder is visibly a placeholder, and a long value truncates', async ({ page }) => {
  await page.goto(storyUrl('forms-select--placeholder'))
  await settle(page)
  const placeholder = await page.evaluate(() => {
    const v = document.querySelector<HTMLElement>('.d3-sel__value')!
    const island = document.querySelector('[data-theme]')!
    const faint = getComputedStyle(island).getPropertyValue('--color-fg-faint').trim()
    // Normalise both through the browser so hex and rgb compare.
    const probe = document.createElement('span'); probe.style.color = faint; document.body.append(probe)
    const want = getComputedStyle(probe).color; probe.remove()
    return { got: getComputedStyle(v).color, want }
  })
  expect(placeholder.got).toBe(placeholder.want)

  await page.goto(storyUrl('forms-select--long-label-in-a-narrow-cell'))
  await settle(page)
  const box = await page.evaluate(() => {
    const trigger = document.querySelector<HTMLElement>('.d3-sel')!
    const value = document.querySelector<HTMLElement>('.d3-sel__value')!
    return { triggerWidth: trigger.offsetWidth, overflows: value.scrollWidth > value.clientWidth,
      ellipsis: getComputedStyle(value).textOverflow }
  })
  expect(box.triggerWidth).toBeLessThanOrEqual(180)
  expect(box.overflows).toBe(true)
  expect(box.ellipsis).toBe('ellipsis')
})
