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
import { createRequire } from 'node:module'

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

  // Every component rule sits in `@layer d3-ui`, and the order statement comes
  // before it. Unlayered, a component beat every Tailwind utility an app put on
  // it — `className="w-72"` on an Input was ignored without a word. Remove the
  // layer blocks and what is left must be nothing.
  const ORDER = '@layer theme,base,d3-ui,components,utilities;'
  check(css.replace(/\/\*[\s\S]*?\*\//g, '').trimStart().startsWith(ORDER),
    `dist/index.css does not open with \`${ORDER}\` — layer order is set by first mention, so without it ` +
    'd3-ui can land after an app\'s utilities and override them again. See layerComponentCss() in vite.config.ts.')
  let residue = css.replace(/\/\*[\s\S]*?\*\//g, '').split(ORDER).join('')
  for (let at = residue.indexOf('@layer d3-ui{'); at !== -1; at = residue.indexOf('@layer d3-ui{')) {
    let depth = 0, i = at + '@layer d3-ui'.length
    for (; i < residue.length; i++) {
      if (residue[i] === '{') depth++
      else if (residue[i] === '}' && --depth === 0) break
    }
    residue = residue.slice(0, at) + residue.slice(i + 1)
  }
  check(residue.trim() === '',
    `dist/index.css has rules outside @layer d3-ui: ${residue.trim().slice(0, 120)}… Unlayered component CSS ` +
    'overrides every utility class an app passes.')

  // Phase 3a: a `*/` inside a comment terminates it early and browsers drop the
  // rest of the block. This shipped once already.
  check(!/\/\*[^*]*\*\/[^{}]*\*\//.test(css.slice(0, 4000)),
    'dist/index.css opens with a malformed comment — check for `*/` inside a comment body.')
}

// D-072: `setStyleNonce` works only if it sets the same `get-nonce` module the
// style singleton inside Radix reads. Bundled into dist, it would set a private
// copy and every strict-CSP page would still lose its scroll lock, silently.
// So: dist imports it as a bare specifier, carries no copy of its body, and the
// specifier resolves — from this package and from react-style-singleton, the
// module that reads it — to one file.
if (!fail.length) {
  const js = readFileSync(`${dist}/index.js`, 'utf8')
  check(/^import \{[^}]*\bsetNonce\b[^}]*\} from ["']get-nonce["'];/m.test(js),
    'dist/index.js does not import setNonce from "get-nonce" — keep it in rollupOptions.external (vite.config.ts).')
  check(!js.includes('__webpack_nonce__'),
    'dist/index.js contains a bundled copy of get-nonce, so setStyleNonce sets a nonce nothing reads.')
  const pkgRoot = resolve(dist, '..')
  const req = createRequire(`${pkgRoot}/package.json`)
  const ours = req.resolve('get-nonce')
  const chain = ['@radix-ui/react-dialog', 'react-remove-scroll', 'react-remove-scroll-bar', 'react-style-singleton']
  let from = `${pkgRoot}/package.json`
  for (const name of chain) from = createRequire(from).resolve(name)
  const theirs = createRequire(from).resolve('get-nonce')
  check(ours === theirs,
    `get-nonce resolves to two copies: ${ours} for this package and ${theirs} for react-style-singleton. ` +
    'Align the get-nonce range in package.json with the one react-style-singleton resolves.')
}

// The development contract checks must vanish from a consumer's production
// bundle — the check *and* its message strings, not just the console call.
// Bundled here the way an app would: esbuild with NODE_ENV defined and minified.
// Bundled a second time for development, to prove this check can see the
// strings at all; a check that passes because it finds nothing proves nothing.
if (!fail.length) {
  const { build } = await import('esbuild')
  const bundle = async (mode) => (await build({
    entryPoints: [`${dist}/index.js`], bundle: true, write: false, format: 'esm', minify: true,
    platform: 'browser', logLevel: 'silent',
    external: ['react', 'react-dom', 'react/*', '@radix-ui/*', 'clsx', 'lucide-react', 'get-nonce'],
    loader: { '.css': 'empty' },
    define: { 'process.env.NODE_ENV': JSON.stringify(mode) },
  })).outputFiles[0].text
  const PROBES = ['[d3-ui]', 'is required', 'no accessible name', 'there is no `color` prop']
  const dev = await bundle('development')
  const prod = await bundle('production')
  check(PROBES.every((p) => dev.includes(p)),
    'the development bundle is missing the contract warnings, so the production check below would pass vacuously.')
  const leaked = PROBES.filter((p) => prod.includes(p))
  check(leaked.length === 0,
    `contract warnings survive a production build (${leaked.join(', ')}). Every check must sit inside ` +
    "`if (process.env.NODE_ENV !== 'production')` so the bundler deletes it.")
  check(!prod.includes('process.env'),
    'a production bundle still references process.env — something reads it outside a replaceable expression.')
}

if (fail.length) {
  console.error('\n  dist check failed:\n' + fail.map((f) => `   ✗ ${f}`).join('\n') + '\n')
  process.exit(1)
}
console.log('  dist ok — entry imports its stylesheet, and the stylesheet has rules.')
