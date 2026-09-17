import { readFileSync, readdirSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'

/**
 * D-072 — strict CSP. The fixture (`browser/csp-fixture/`, built into
 * `storybook-static/csp/` by `npm run storybook:build`) is an app built from
 * `dist/` under `style-src 'self' 'nonce-TEST'` with no 'unsafe-inline'. It
 * calls `setStyleNonce(readStyleNonce())` before rendering.
 *
 * Every test records `securitypolicyviolation` from before the first script
 * runs. The `?nononce` control is the same page without the setup call: it must
 * record a violation and leave the page scrollable, or none of the passing
 * checks would prove the policy was in force.
 */
async function load(page: Page, query = '') {
  await page.addInitScript(() => {
    const w = window as unknown as { __csp: string[] }
    w.__csp = []
    document.addEventListener('securitypolicyviolation', (e) => {
      w.__csp.push(`${e.effectiveDirective} ${e.blockedURI} ${e.sample}`)
    })
  })
  const errors: string[] = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  await page.goto(`/csp/index.html${query}`)
  await expect(page.getByRole('heading', { level: 1, name: 'Strict CSP' })).toBeVisible()
  return {
    violations: () => page.evaluate(() => (window as unknown as { __csp: string[] }).__csp),
    errors,
  }
}

const lockState = (page: Page) => page.evaluate(() => ({
  overflow: getComputedStyle(document.body).overflow,
  locked: document.body.hasAttribute('data-scroll-locked'),
  nonced: [...document.head.querySelectorAll('style')]
    .filter((s) => s.textContent?.includes('data-scroll-locked'))
    .map((s) => s.nonce),
}))

test('the fixture bundle carries exactly one copy of get-nonce', () => {
  // get-nonce's body is the only code that names __webpack_nonce__. Two copies
  // would mean setStyleNonce and Radix's singleton read different variables.
  const dir = 'storybook-static/csp/assets'
  const js = readdirSync(dir).filter((f) => f.endsWith('.js')).map((f) => readFileSync(`${dir}/${f}`, 'utf8')).join('\n')
  expect(js.match(/typeof __webpack_nonce__/g)).toHaveLength(1)
})

test('Modal: no violation, the style is nonced, and the page behind is locked', async ({ page }) => {
  const csp = await load(page)
  await page.getByRole('button', { name: 'Open modal' }).click()
  await expect(page.getByRole('dialog', { name: 'Remove Ada Lovelace' })).toBeVisible()
  const state = await lockState(page)
  expect(state.nonced).toEqual(['TEST'])
  expect(state.locked).toBe(true)
  expect(state.overflow).toBe('hidden')
  // A wheel over the scrim does not move the page.
  await page.mouse.move(20, 400)
  await page.mouse.wheel(0, 800)
  await page.waitForTimeout(100)
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
  expect(await csp.violations()).toEqual([])
  expect(csp.errors.filter((e) => /Content Security Policy/i.test(e))).toEqual([])

  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect.poll(async () => (await lockState(page)).overflow).not.toBe('hidden')
})

test('Select: its list styles and scroll lock load under the policy', async ({ page }) => {
  const csp = await load(page)
  await page.getByRole('combobox', { name: 'Role' }).click()
  await expect(page.getByRole('listbox')).toBeVisible()
  const viewportNonce = await page.evaluate(() =>
    [...document.querySelectorAll('style')].find((s) => s.textContent?.includes('data-radix-select-viewport'))?.nonce)
  expect(viewportNonce).toBe('TEST')
  expect((await lockState(page)).locked).toBe(true)
  expect(await csp.violations()).toEqual([])
})

test.describe('AppShell drawer at 390px', () => {
  test.use({ viewport: { width: 390, height: 800 } })
  test('opens with no violation and locks the page', async ({ page }) => {
    const csp = await load(page)
    await page.getByRole('button', { name: 'Open navigation' }).click()
    await expect(page.getByRole('dialog', { name: 'Navigation' })).toBeVisible()
    const state = await lockState(page)
    expect(state.nonced).toEqual(['TEST'])
    expect(state.overflow).toBe('hidden')
    expect(await csp.violations()).toEqual([])
  })
})

test('control: without setStyleNonce the policy blocks the lock', async ({ page }) => {
  const csp = await load(page, '?nononce')
  await page.getByRole('button', { name: 'Open modal' }).click()
  await expect(page.getByRole('dialog', { name: 'Remove Ada Lovelace' })).toBeVisible()
  await expect.poll(async () => (await csp.violations()).length).toBeGreaterThan(0)
  expect((await csp.violations()).every((v) => v.startsWith('style-src'))).toBe(true)
  expect((await lockState(page)).overflow).not.toBe('hidden')
})
