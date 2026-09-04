import axe, { type AxeResults, type RunOptions } from 'axe-core'

/**
 * Runs axe against a rendered container.
 *
 * `color-contrast` is disabled here and NOT because it is inconvenient: jsdom
 * has no layout or paint, so axe cannot compute a rendered colour and would
 * report every pair as "incomplete", which is worse than silence. Contrast is
 * covered in two other places instead —
 *   1. the token layer, where 106 shipped pairs are measured (D-014, D-018), and
 *   2. a browser sweep over every story in both modes (D-039).
 */
const RULESETS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

export async function runAxe(container: Element, options: RunOptions = {}): Promise<AxeResults> {
  return axe.run(container, {
    runOnly: { type: 'tag', values: RULESETS },
    rules: { 'color-contrast': { enabled: false } },
    ...options,
  })
}

export function formatViolations(results: AxeResults): string {
  return results.violations
    .map((v) => {
      const nodes = v.nodes.map((n) => `      ${n.html.slice(0, 120)}`).join('\n')
      return `  [${v.impact}] ${v.id}: ${v.help}\n${nodes}`
    })
    .join('\n')
}

export async function expectNoAxeViolations(container: Element) {
  const results = await runAxe(container)
  if (results.violations.length > 0) {
    throw new Error(
      `${results.violations.length} accessibility violation(s):\n${formatViolations(results)}`,
    )
  }
}
