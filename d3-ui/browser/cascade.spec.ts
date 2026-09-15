import { expect, test } from '@playwright/test'
import { storyUrl } from './stories'
import { settle } from './settle'

/**
 * Where component rules sit in an app's cascade.
 *
 * Tailwind v4 puts its preflight in `@layer base` and every utility in
 * `@layer utilities`. Component CSS used to be unlayered, and unlayered rules
 * beat layered ones whatever the specificity: in Bindery `<Input className="w-72">`
 * rendered full width and `<CardBody className="mb-3">` had no margin. The
 * rules below stand in for Tailwind's two layers, injected into a real page.
 */
test('an app utility overrides a component rule, and a base reset does not', async ({ page }) => {
  await page.goto(storyUrl('layers-card--with-actions'))
  await settle(page)
  const got = await page.evaluate(() => {
    const style = document.createElement('style')
    style.textContent = `
      @layer base { .d3-crd__body { margin-bottom: 7px; } .d3-crd { padding: 0; } }
      @layer utilities { .probe-mb-3 { margin-bottom: 12px; } .probe-w-72 { width: 288px; } }`
    document.head.append(style)
    const body = document.querySelector<HTMLElement>('.d3-crd__body')!
    const card = document.querySelector<HTMLElement>('.d3-crd')!
    const before = getComputedStyle(body).marginBottom
    body.classList.add('probe-mb-3')
    card.classList.add('probe-w-72')
    return {
      before,
      utilityMargin: getComputedStyle(body).marginBottom,
      utilityWidth: getComputedStyle(card).width,
      padding: getComputedStyle(card).paddingTop,
    }
  })
  expect(got.before, 'a base-layer reset overrode the component').toBe('0px')
  expect(got.padding, 'a base-layer reset overrode the component').not.toBe('0px')
  expect(got.utilityMargin, 'a utility class on a component was ignored').toBe('12px')
  expect(got.utilityWidth, 'a utility class on a component was ignored').toBe('288px')
})
