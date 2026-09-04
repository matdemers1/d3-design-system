/**
 * The published artifact, checked as an artifact.
 *
 * Everything else in this repository tests `src`, where each component's
 * `import './Button.css'` is honoured by the dev server. That is precisely why
 * the packaging defect survived twenty components and 326 green tests: the only
 * place it was observable was a file nothing read.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '../dist')
const fail = []
const check = (ok, msg) => { if (!ok) fail.push(msg) }

check(existsSync(`${dist}/index.js`), 'dist/index.js is missing — did the build run?')
check(existsSync(`${dist}/index.css`), 'dist/index.css is missing — no component CSS was emitted.')

if (!fail.length) {
  const js = readFileSync(`${dist}/index.js`, 'utf8')
  const css = readFileSync(`${dist}/index.css`, 'utf8')

  check(
    /^import ["']\.\/index\.css["'];/m.test(js),
    'dist/index.js does not import dist/index.css. Consumers of the built package ' +
      'get every class name and none of the rules, and it fails silently — the ' +
      'component renders, unstyled, at the wrong size. See importOwnStyles() in vite.config.ts.',
  )

  // A stylesheet that exists but lost its content is the same outage. The
  // expected selectors are read off `src` rather than listed here, so a new
  // component is covered the moment it has a stylesheet.
  const src = resolve(dist, '../src/components')
  const roots = new Set()
  for (const dir of readdirSync(src)) {
    for (const f of readdirSync(resolve(src, dir)).filter((f) => f.endsWith('.css'))) {
      for (const m of readFileSync(resolve(src, dir, f), 'utf8').matchAll(/^\.(d3-[a-z-]+)/gm)) {
        roots.add(m[1])
      }
    }
  }
  check(roots.size > 40, `only ${roots.size} selectors found in src — the scan is not reading the components.`)
  const missing = [...roots].filter((r) => !css.includes(`.${r}`))
  check(missing.length === 0, `dist/index.css is missing ${missing.length} selector(s): ${missing.slice(0, 8).join(', ')}`)
  check(css.includes('height:34px') || css.includes('height: 34px'),
    'dist/index.css has no 34px control height — the size ramp did not survive the build.')

  // Phase 3a: a `*/` inside a comment terminates it early and browsers drop the
  // rest of the block. This shipped once already.
  check(!/\/\*[^*]*\*\/[^{}]*\*\//.test(css.slice(0, 4000)),
    'dist/index.css opens with a malformed comment — check for `*/` inside a comment body.')
}

if (fail.length) {
  console.error('\n  dist check failed:\n' + fail.map((f) => `   ✗ ${f}`).join('\n') + '\n')
  process.exit(1)
}
console.log('  dist ok — entry imports its stylesheet, and the stylesheet has rules.')
