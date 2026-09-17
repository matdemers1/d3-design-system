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

/*
 * CodeInput: clicking a box puts the caret in that box.
 *
 * The click lands on one invisible input stretched over the boxes, whose own
 * caret positions come from text metrics. With letter-spacing standing in for
 * the boxes, box 1 of a half-filled code put the caret at 3 and box 4 of a
 * recovery code at 5 — so a digit could not be clicked to fix it. The caret is
 * now placed from the box under the pointer; this clicks every box centre at a
 * wide and a phone width.
 */
for (const width of [1000, 380]) {
  for (const [story, boxes, filled] of [
    ['forms-codeinput--partly-filled', 6, 3],
    ['forms-codeinput--recovery-code', 12, 6],
  ] as const) {
    test(`CodeInput: clicking box n puts the caret at n · ${story} · ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 600 })
      await page.goto(storyUrl(story))
      await settle(page)
      const slots = page.locator('.d3-code__slot')
      await expect(slots).toHaveCount(boxes)
      const input = page.locator('.d3-code__control')
      for (let i = 0; i < boxes; i++) {
        const r = (await slots.nth(i).boundingBox())!
        await page.mouse.click(r.x + r.width / 2, r.y + r.height / 2)
        const caret = await input.evaluate((el: HTMLInputElement) => [el.selectionStart, el.selectionEnd])
        const want = Math.min(i, filled)
        expect(caret, `box ${i}`).toEqual([want, want])
        // And the drawing agrees with the control.
        await expect(slots.nth(want === boxes ? boxes - 1 : want)).toHaveClass(/d3-code__slot--active/)
      }
    })
  }
}

test("a TooltipProvider's delay applies to the tooltips under it", async ({ page }) => {
  // Every Tooltip used to pass its own 400ms to Radix, which prefers a Root's
  // delay over its Provider's, so no provider delay ever took effect.
  await page.goto(storyUrl('layers-tooltip--provider-delay'))
  await settle(page)
  await page.locator('.d3-ibtn').hover()
  await page.waitForTimeout(800)
  await expect(page.locator('.d3-tip')).toHaveCount(0)
  await expect(page.locator('.d3-tip')).toBeVisible({ timeout: 2000 })
})

test('Textarea mono sets the manifest in the mono face, at the same size step', async ({ page }) => {
  await page.goto(storyUrl('forms-textarea--mono'))
  await settle(page)
  const got = await page.evaluate(() => {
    const control = document.querySelector<HTMLElement>('.d3-inp--mono .d3-inp__control')!
    return { family: getComputedStyle(control).fontFamily, size: getComputedStyle(control).fontSize }
  })
  expect(got.family).toMatch(/^"?JetBrains Mono/)
  expect(got.size).toBe('13px')
})

test('Modal: a rich description is valid block content, with its own rhythm', async ({ page }) => {
  await page.goto(storyUrl('layers-modal--rich-description'))
  await settle(page)
  const got = await page.evaluate(() => {
    const dlg = document.querySelector<HTMLElement>('[role="dialog"]')!
    const desc = dlg.querySelector<HTMLElement>('.d3-modal__desc')!
    const [p1, p2] = [...desc.querySelectorAll('p')]
    return {
      tag: desc.tagName,
      describedBy: dlg.getAttribute('aria-describedby') === desc.id,
      firstMargin: getComputedStyle(p1!).marginTop,
      gap: Math.round(p2!.getBoundingClientRect().top - p1!.getBoundingClientRect().bottom),
      code: getComputedStyle(desc.querySelector('code')!).fontFamily,
    }
  })
  expect(got).toMatchObject({ tag: 'DIV', describedBy: true, firstMargin: '0px', gap: 8 })
  expect(got.code).toMatch(/^"?JetBrains Mono/)
})

test('PageHeader countNoun shows the noun it was given', async ({ page }) => {
  await page.goto(storyUrl('patterns-pageheader--count-noun'))
  await settle(page)
  await expect(page.locator('.d3-ph__count')).toHaveText('5 people')
  await expect(page.getByRole('heading', { level: 1, name: 'People, 5 people' })).toBeVisible()
})
