import type { Page } from '@playwright/test'

/**
 * Waits until a story is safe to measure.
 *
 * "Loaded" is not enough. The first survey reported a 32px Button where the
 * system says 34 — it was inside a Modal, measured mid-entrance while the spring
 * still had it at 94% scale. So: the story has rendered, fonts have settled, and
 * every *finite* animation has finished. Infinite ones (the spinner) never will,
 * and are left running.
 */
export async function settle(page: Page) {
  await page.waitForFunction(() => {
    const root = document.querySelector('#storybook-root')
    return (root && root.childElementCount > 0) || document.querySelector('[role="dialog"]')
  }, null, { timeout: 10_000 })
  await page.evaluate(async () => {
    await document.fonts.ready
    const finite = document.getAnimations().filter((a) => {
      const t = a.effect?.getComputedTiming()
      return t && t.iterations !== Infinity && t.endTime !== Infinity
    })
    await Promise.all(finite.map((a) => a.finished.catch(() => undefined)))
  })
}

/** Collects page errors and console errors, minus the ones a story causes on purpose. */
export function watchErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() !== 'error') return
    const text = m.text()
    // The Avatar fallback story points at a missing image to show the fallback.
    if (text.includes('Failed to load resource') && m.location().url.includes('does-not-exist')) return
    errors.push(`console.error: ${text}`)
  })
  return errors
}
