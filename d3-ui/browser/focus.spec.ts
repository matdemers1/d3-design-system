import { expect, test } from '@playwright/test'
import { allStories, storyUrl } from './stories'
import { settle } from './settle'

/**
 * Focus rings, in a keyboard-focused state nothing else in this suite reaches.
 *
 * The global ring lives in the token stylesheet and component rules in
 * `@layer d3-ui`. When the global rule was unlayered it beat every component
 * rule that hands the ring to a wrapper: a focused Input drew one ring on its
 * frame and a second on the <input> inside it, and every page heading that
 * takes focus on navigation drew a violet box. Bindery's screenshots showed
 * both; no story had ever been looked at with keyboard focus in it.
 */

/** Elements currently drawing an outline. */
const ringed = () =>
  [...document.querySelectorAll<HTMLElement>('body *')]
    .filter((el) => {
      const cs = getComputedStyle(el)
      return cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0 && el.getClientRects().length > 0
    })
    .map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`)

const TABS = 6

for (const story of allStories()) {
  test(`one focus ring at a time: ${story.id}`, async ({ page }) => {
    await page.goto(storyUrl(story.id))
    await settle(page)
    for (let i = 0; i < TABS; i++) {
      await page.keyboard.press('Tab')
      const focused = await page.evaluate(() => {
        const el = document.activeElement
        return el && el !== document.body ? el.tagName : null
      })
      if (!focused) break
      const rings = await page.evaluate(ringed)
      expect(rings.length, `Tab ${i + 1} in ${story.id}: ${rings.join(' + ') || 'no ring'}`).toBe(1)
    }
  })
}

test('a heading focused on navigation draws no ring, even after keyboard use', async ({ page }) => {
  // A page heading is focused programmatically (tabindex="-1") so a route change
  // is announced. After any keypress, browsers treat programmatic focus as
  // :focus-visible — which is exactly the state of someone who pressed Enter
  // on a link — so a ring there would appear on every keyboard navigation.
  await page.goto(storyUrl('patterns-pageheader--title-only'))
  await settle(page)
  await page.keyboard.press('Shift')
  await page.evaluate(() => document.querySelector<HTMLElement>('.d3-ph__title')!.focus())
  expect(await page.evaluate(() => document.activeElement?.classList.contains('d3-ph__title'))).toBe(true)
  expect(await page.evaluate(ringed)).toEqual([])
})

test('a destructive Modal opened from the keyboard focuses its panel without a ring', async ({ page }) => {
  // The panel takes focus so that Enter on a fresh dialog destroys nothing. It
  // is not a control; a keyboard open made that focus :focus-visible, and the
  // global ring drew a violet frame around the whole dialog.
  await page.goto(storyUrl('layers-modal--confirmation'))
  await settle(page)
  await page.locator('button', { hasText: 'Dismiss 3 items' }).focus()
  await page.keyboard.press('Enter')
  await page.waitForSelector('.d3-modal')
  await settle(page)
  expect(await page.evaluate(() => document.activeElement?.classList.contains('d3-modal'))).toBe(true)
  expect(await page.evaluate(ringed)).toEqual([])
})

test('a date Input keeps its ring on the calendar-picker stop (Chromium)', async ({ page }) => {
  // D-069 found it: at the picker's internal tab stop the <input> matches neither
  // :focus nor :focus-visible, so the frame's :has(> :focus-visible) ring vanished.
  await page.goto(storyUrl('forms-input--date-field'))
  await settle(page)
  const frameRing = () => page.evaluate(() => {
    const cs = getComputedStyle(document.querySelector('.d3-inp')!)
    return cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0
  })
  let stops = 0
  for (; stops < 6; stops++) {
    await page.keyboard.press('Tab')
    const onInput = await page.evaluate(() => document.activeElement?.tagName === 'INPUT')
    if (!onInput) break
    expect(await frameRing(), `stop ${stops + 1} inside the date field`).toBe(true)
  }
  // month, day, year and the picker: the loop really reached the picker stop.
  expect(stops).toBeGreaterThanOrEqual(4)
})
