import { expect, test, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { storyUrl } from './stories'
import { settle } from './settle'

/**
 * RecipientField, keyboard only, in a real browser — and axe on the states a
 * story cannot hold still: the suggestion list open with an active option,
 * and a chip selected for removal. The story sweep (a11y.spec.ts) sees only
 * the closed field.
 */
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8')

async function axe(page: Page) {
  await page.addScriptTag({ content: axeSource })
  return page.evaluate(async () => {
    const a = (window as unknown as { axe: { run: (c: unknown, o: unknown) => Promise<{ violations: {
      id: string; nodes: { target: string[] }[] }[] }> } }).axe
    for (let i = 0; ; i++) {
      try {
        const r = await a.run(document.body, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
          rules: { region: { enabled: false }, 'landmark-one-main': { enabled: false }, 'page-has-heading-one': { enabled: false } },
        })
        return r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
      } catch (e) {
        if (!String(e).includes('already running') || i > 40) throw e
        await new Promise((r) => setTimeout(r, 150))
      }
    }
  })
}

const combobox = (page: Page, name: string) => page.getByRole('combobox', { name })
const chipNames = (page: Page) => page.locator('.d3-rcp__chip .d3-rcp__name').allTextContents()

for (const theme of ['dark', 'light'] as const) {
  test(`composer row, keyboard only · ${theme}`, async ({ page }) => {
    await page.goto(storyUrl('forms-recipientfield--composer-rows', theme))
    await settle(page)

    // One tab stop for the field: Tab lands in the text, not on a chip's remove button.
    await page.keyboard.press('Tab')
    const to = combobox(page, 'To')
    await expect(to).toBeFocused()

    // Type → suggestions, first active, the match bolded at the word start.
    await page.keyboard.type('d')
    const list = page.getByRole('listbox')
    await expect(list).toBeVisible()
    await expect(to).toHaveAttribute('aria-expanded', 'true')
    const options = page.getByRole('option')
    await expect(options).toHaveCount(2)
    await expect(to).toHaveAttribute('aria-activedescendant', (await options.nth(0).getAttribute('id'))!)
    await expect(options.nth(0).locator('.d3-rcp__opt-name .d3-rcp__match')).toHaveText('D')
    await settle(page)
    expect(await axe(page), 'axe with the list open').toEqual([])

    // ↓ moves the active option; Enter adds it; focus never left the input.
    await page.keyboard.press('ArrowDown')
    await expect(to).toHaveAttribute('aria-activedescendant', (await options.nth(1).getAttribute('id'))!)
    await page.keyboard.press('Enter')
    await expect(to).toBeFocused()
    expect(await chipNames(page)).toEqual(['Priya Shah', 'Jonah Reyes', 'Dana Okafor'])

    // Tab adds too.
    await page.keyboard.type('lin')
    await expect(list).toBeVisible()
    await page.keyboard.press('Tab')
    expect(await chipNames(page)).toEqual(['Priya Shah', 'Jonah Reyes', 'Dana Okafor', 'Linda Demers'])

    // Esc closes, keeps the text.
    await page.keyboard.type('e')
    await expect(list).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(list).toBeHidden()
    await expect(to).toHaveValue('e')
    await page.keyboard.press('Backspace')

    // Backspace selects the last chip, then removes it.
    await page.keyboard.press('Backspace')
    await expect(page.locator('.d3-rcp__chip--selected')).toHaveText(/Linda Demers/)
    await settle(page)
    expect(await axe(page), 'axe with a chip selected').toEqual([])
    await page.keyboard.press('Backspace')
    expect(await chipNames(page)).toEqual(['Priya Shah', 'Jonah Reyes', 'Dana Okafor'])

    // Comma commits typed text; an invalid one is drawn in the danger tone.
    await page.keyboard.type('sam@nowhere,')
    await expect(page.locator('.d3-rcp__chip--invalid')).toHaveText(/sam@nowhere/)

    // Tab with nothing typed leaves the field for the Cc link; Enter reveals the Cc row, focused.
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Cc', exact: true })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(combobox(page, 'Cc')).toBeFocused()
  })
}

test('paste becomes chips in a real clipboard event', async ({ page }) => {
  await page.goto(storyUrl('forms-recipientfield--default'))
  await settle(page)
  const box = page.getByRole('combobox', { name: 'Share with' })
  await box.focus()
  await box.evaluate((el) => {
    const data = new DataTransfer()
    data.setData('text/plain', 'Priya Shah <priya@x.io>; jonah@x.io\n"Park, Elena" <elena@x.io>')
    el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }))
  })
  expect(await chipNames(page)).toEqual(['Priya Shah', 'jonah@x.io', 'Park, Elena'])
})

test('the row keeps a visible label, a divider, and one focus ring', async ({ page }) => {
  await page.goto(storyUrl('forms-recipientfield--composer-rows', 'light'))
  await settle(page)
  const got = await page.evaluate(() => {
    const row = document.querySelector<HTMLElement>('.d3-rcp--row')!
    const label = row.querySelector<HTMLElement>('.d3-rcp__label')!
    const cs = getComputedStyle(row)
    const r = label.getBoundingClientRect()
    return {
      labelVisible: r.width > 10 && r.height > 10 && getComputedStyle(label).visibility === 'visible',
      divider: cs.borderBottomStyle === 'solid' && parseFloat(cs.borderBottomWidth) >= 1,
      // The 3:1 field boundary, not the decorative --color-border (invisible on surface-raised in dark).
      dividerIsFieldBoundary: (() => {
        const probe = document.createElement('span')
        probe.style.color = 'var(--color-border-field)'; row.append(probe)
        const want = getComputedStyle(probe).color; probe.remove()
        return cs.borderBottomColor === want
      })(),
      noBox: cs.borderTopStyle === 'none' && cs.borderLeftStyle === 'none',
      height: row.offsetHeight,
    }
  })
  expect(got).toEqual({ labelVisible: true, divider: true, dividerIsFieldBoundary: true, noBox: true, height: 44 })
})

test('a new chip scales in, and only fades under reduced motion', async ({ page }) => {
  for (const motion of ['no-preference', 'reduce'] as const) {
    await page.emulateMedia({ reducedMotion: motion })
    await page.goto(storyUrl('forms-recipientfield--default'))
    await settle(page)
    await page.getByRole('combobox', { name: 'Share with' }).fill('a@x.io')
    await page.keyboard.press('Enter')
    const anim = await page.evaluate(() => {
      const chip = document.querySelector<HTMLElement>('.d3-rcp__chip--enter')!
      const cs = getComputedStyle(chip)
      return { name: cs.animationName, duration: cs.animationDuration }
    })
    if (motion === 'reduce') expect(anim.name).toBe('d3-rcp-fade')
    else expect(anim).toEqual({ name: 'd3-rcp-chip-in', duration: '0.14s' })
  }
})
