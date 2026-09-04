import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const DIR = join(__dirname, '..', 'tokens', 'build')
const files = readdirSync(DIR).filter((f) => f.endsWith('.css'))

/**
 * `color.css` shipped with a broken comment from Phase 3a until Bindery's build
 * rejected it: the header read `GENERATED from tokens/*.json`, and the `*​/` in
 * that glob terminates the comment early, spilling the rest into the stylesheet
 * as garbage. `theme.layout.css` had the same bug via `p-*​/m-*`.
 *
 * Browsers silently drop the fragment, which is why it survived six sub-phases
 * and a Storybook build. Tailwind does not.
 */
describe('generated token stylesheets', () => {
  it('there are stylesheets to check', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  it.each(files)('%s has balanced comments', (file) => {
    const css = readFileSync(join(DIR, file), 'utf8')
    const opens = (css.match(/\/\*/g) ?? []).length
    const closes = (css.match(/\*\//g) ?? []).length
    expect(opens, `${file}: a comment body contains */ and terminates early`).toBe(closes)
  })

  it.each(files)('%s has no glob pattern inside a comment', (file) => {
    const css = readFileSync(join(DIR, file), 'utf8')
    for (const match of css.matchAll(/\/\*([\s\S]*?)\*\//g)) {
      expect(match[1], `${file}: comment contains a nested */`).not.toContain('*/')
    }
  })
})
