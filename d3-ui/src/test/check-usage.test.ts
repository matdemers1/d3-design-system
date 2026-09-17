import { afterAll, describe, expect, it } from 'vitest'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/**
 * The usage gate, run the way an app runs it: as a process, against a directory.
 *
 * The unknown-token rule once built its list of known names from every token
 * stylesheet, including the Tailwind theme files whose `@theme inline` blocks
 * emit nothing at runtime. So `var(--font-weight-title)` passed in the D3 Auth
 * console, which has no Tailwind, and every heading rendered at weight 400.
 */
const SCRIPT = join(__dirname, '..', '..', 'scripts', 'check-usage.mjs')
const dirs: string[] = []
afterAll(() => { for (const d of dirs) rmSync(d, { recursive: true, force: true }) })

function gate(css: string, ...flags: string[]) {
  const dir = mkdtempSync(join(tmpdir(), 'd3-usage-'))
  dirs.push(dir)
  writeFileSync(join(dir, 'app.css'), css)
  const r = spawnSync(process.execPath, [SCRIPT, ...flags, dir], { encoding: 'utf8' })
  return { code: r.status, out: `${r.stdout}${r.stderr}` }
}

describe('check-usage — which token names exist', () => {
  it('accepts runtime tokens', () => {
    const r = gate('.t { font-weight: var(--weight-title); line-height: var(--leading-24); gap: var(--space-16); }')
    expect(r.out).toContain('usage ok')
    expect(r.code).toBe(0)
  })

  it('reports Tailwind-only theme names by default, as their own rule', () => {
    const r = gate('.t { font-weight: var(--font-weight-title); line-height: var(--text-24--line-height); }')
    expect(r.code).toBe(1)
    expect(r.out).toContain('tailwind-only-token')
    expect(r.out).toContain('--font-weight-title')
    expect(r.out).toContain('--text-24--line-height')
  })

  it('admits the theme names with --tailwind', () => {
    const r = gate('.t { font-weight: var(--font-weight-title); line-height: var(--text-24--line-height); }', '--tailwind')
    expect(r.out).toContain('usage ok')
    expect(r.code).toBe(0)
  })

  it('still reports a name that exists nowhere, with or without --tailwind', () => {
    for (const flags of [[], ['--tailwind']]) {
      const r = gate('.t { color: var(--color-text-muted); }', ...flags)
      expect(r.code).toBe(1)
      expect(r.out).toContain('unknown-token')
    }
  })
})
