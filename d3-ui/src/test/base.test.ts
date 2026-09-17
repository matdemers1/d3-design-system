import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * `@d3cloud/ui/base.css` — the opt-in document base. Exported, shipped, and
 * never pulled in by a component: an app embedding one widget in another page
 * must not have that page's body repainted.
 */
const root = resolve(__dirname, '../..')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  exports: Record<string, unknown>; files: string[]
}
const css = readFileSync(join(root, 'src/styles/base.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

const walk = (dir: string): string[] => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f)
  return statSync(p).isDirectory() ? walk(p) : [p]
})

describe('base.css', () => {
  it('is exported and shipped', () => {
    expect(pkg.exports['./base.css']).toBe('./src/styles/base.css')
    expect(pkg.files).toContain('src/styles/base.css')
  })

  it('sets the ground, the text colour and the face on html and body', () => {
    expect(css).toMatch(/html,\s*body\s*\{[^}]*background:\s*var\(--color-bg\)/)
    expect(css).toMatch(/color:\s*var\(--color-fg\)/)
    expect(css).toMatch(/font-family:\s*var\(--font-sans\)/)
    expect(css).toMatch(/body\s*\{[^}]*min-height/)
  })

  it('is layered in base, after the order statement, so an app rule wins', () => {
    expect(css.trimStart().startsWith('@layer theme, base, d3-ui, components, utilities;')).toBe(true)
    expect(css).toMatch(/@layer base\s*\{/)
  })

  it('is not imported by any component or the entry', () => {
    const importers = walk(join(root, 'src'))
      .filter((f) => /\.(ts|tsx|css)$/.test(f) && !f.endsWith('base.test.ts'))
      .filter((f) => /base\.css/.test(readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')))
    expect(importers).toEqual([])
  })
})
