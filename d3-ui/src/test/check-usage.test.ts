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

/**
 * D-075 admits exactly two shadows, each only as the whole value of a
 * box-shadow. Everything the rule rejected before, it still rejects.
 */
describe('check-usage — the two shadows (D-075)', () => {
  it.each([
    '.a { box-shadow: var(--shadow-sheet); }',
    '.a { box-shadow: var(--shadow-float); }',
    '.a { box-shadow:var(--shadow-float) }',
    '.a {\n  box-shadow: var( --shadow-float );\n}',
    '.a { box-shadow: none; }',
    '.a { box-shadow: inset 0 0 0 var(--border-width) var(--color-accent); }',
    // A custom property's name is not a Tailwind class.
    '.a { --x: var(--shadow-float); }',
  ])('accepts %s', (css) => {
    const r = gate(css)
    expect(r.out).toContain('usage ok')
    expect(r.code).toBe(0)
  })

  it.each([
    ['a raw shadow', '.a { box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); }'],
    ['a light source token', '.a { box-shadow: var(--shadow-float-light); }'],
    ['a dark source token', '.a { box-shadow: var(--shadow-sheet-dark); }'],
    ['an invented shadow token', '.a { box-shadow: var(--shadow-md); }'],
    ['a fallback', '.a { box-shadow: var(--shadow-float, 0 2px 4px black); }'],
    ['a second layer', '.a { box-shadow: var(--shadow-float), 0 0 0 4px var(--color-focus); }'],
    ['a layer before it', '.a { box-shadow: 0 0 0 2px var(--color-focus), var(--shadow-sheet); }'],
    ['a shadow as a focus ring', '.a:focus-visible { box-shadow: 0 0 0 2px var(--color-focus); }'],
    ['an app-local shadow token', '.a { --lift: 0 4px 8px black; box-shadow: var(--lift); }'],
  ])('rejects %s', (_name, css) => {
    const r = gate(css)
    expect(r.code).toBe(1)
    expect(r.out).toContain('shadow — ')
    expect(r.out).toContain('D-075')
  })

  it('rejects Tailwind shadow utilities, the two names included', () => {
    const dir = mkdtempSync(join(tmpdir(), 'd3-usage-'))
    dirs.push(dir)
    writeFileSync(join(dir, 'a.tsx'),
      'export const A = () => <div className="shadow-md hover:shadow-lg drop-shadow-sm shadow-float shadow-sheet" />\n')
    const r = spawnSync(process.execPath, [SCRIPT, dir], { encoding: 'utf8' })
    const out = `${r.stdout}${r.stderr}`
    expect(r.status).toBe(1)
    for (const hit of ['shadow-md', 'shadow-lg', 'shadow-sm', 'shadow-float', 'shadow-sheet']) expect(out).toContain(hit)
  })

  it('a stated exemption still admits a genuinely exceptional shadow', () => {
    expect(gate('/* d3-allow: a print preview mimics paper */\n.a { box-shadow: 0 1px 2px black; }').code).toBe(0)
  })
})
