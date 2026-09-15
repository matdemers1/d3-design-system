import { expect, test } from '@playwright/test'
import { storyUrl } from './stories'
import { settle } from './settle'

/**
 * A few pixel baselines — deliberately few.
 *
 * Geometry assertions carry the coverage; these exist for what geometry cannot
 * see, like a colour that resolves but is the wrong colour, or an icon that
 * lost its stroke. They run only inside the pinned Playwright image
 * (`npm run test:browser:image`), because the same page renders differently on
 * another machine through antialiasing alone, and a check that fails on a
 * laptop gets switched off.
 */
const COMPOSITIONS = [
  'primitives-button--all-variants',
  'primitives-button--toggle',
  'primitives-badge--sizes',
  'forms-formfield--every-control',
  'layers-alert--all-tones',
  'layers-segmentedcontrol--with-counts',
  'layers-tabs--with-icons',
  'patterns-emptystate--no-results',
  'guides-using-the-system--one-primary-per-view',
]

test.skip(!process.env.D3_PIXEL_IMAGE,
  'pixel baselines only run inside mcr.microsoft.com/playwright:v1.63.0-noble — use `npm run test:browser:image`')

for (const theme of ['dark', 'light'] as const) {
  for (const id of COMPOSITIONS) {
    test(`${theme} · ${id}`, async ({ page }) => {
      await page.goto(storyUrl(id, theme))
      await settle(page)
      await expect(page.locator('#storybook-root')).toHaveScreenshot(`${id}.${theme}.png`)
    })
  }
}
