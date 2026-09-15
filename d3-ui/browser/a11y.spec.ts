import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { allStories, storyUrl } from './stories'
import { settle } from './settle'

/**
 * axe, in a real browser, in both themes.
 *
 * The unit suite already runs axe on every story — in jsdom, which cannot compute
 * a colour. So the contrast rule has never actually evaluated a component, and
 * the light theme has never had its contrast checked anywhere. This is that check.
 */
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8')

for (const theme of ['dark', 'light'] as const) {
  for (const story of allStories()) {
    test(`${theme} · ${story.id}`, async ({ page }) => {
      await page.goto(storyUrl(story.id, theme))
      await settle(page)
      await page.addScriptTag({ content: axeSource })
      const violations = await page.evaluate(async () => {
        const axe = (window as unknown as { axe: { run: (ctx: unknown, opts: unknown) => Promise<{ violations: {
          id: string; impact: string; nodes: { target: string[]; failureSummary: string }[] }[] }> } }).axe
        // Portals render outside the story root, so the whole body is the context.
        const r = await axe.run(document.body, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
          // Storybook's own scaffolding around the story is not ours to fix.
          rules: { region: { enabled: false }, 'landmark-one-main': { enabled: false }, 'page-has-heading-one': { enabled: false } },
        })
        return r.violations.map((v) => `${v.id} (${v.impact}) × ${v.nodes.length}\n` +
          v.nodes.slice(0, 3).map((n) => `    ${n.target.join(' ')} — ${n.failureSummary.split('\n').slice(1, 2).join(' ').trim()}`).join('\n'))
      })
      expect(violations, violations.join('\n')).toEqual([])
    })
  }
}
