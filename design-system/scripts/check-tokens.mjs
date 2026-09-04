/**
 * The token sources and the stylesheets built from them must agree.
 *
 * Every built stylesheet in `tokens/build/` opens with "GENERATED … do not edit
 * by hand", and for eleven phases that was not true of anything: the generator
 * was never committed, so the files are hand-maintained and the instruction was
 * unenforceable advice. Rewriting them from JSON is not the fix — their
 * comments carry the reasoning behind the numbers, which no generator can
 * reproduce and which is most of their value.
 *
 * So this checks the half that matters: **values cannot drift**. It compares
 * resolved values rather than names, which is what lets it work at all — the
 * naming rule is per-group and bespoke (`duration.1` becomes `--dur-1`,
 * `pattern.modal-enter` becomes `--motion-modal-enter`), while the values are
 * literal on both sides.
 *
 * It also checks the copy of the tokens vendored into `d3-ui`, because there
 * are two of them and nothing else notices when they part company.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { resolve, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const vendored = resolve(root, '../d3-ui/src/tokens')
const fail = []
const note = (m) => fail.push(m)

/* ── the JSON side ───────────────────────────────────────────────────── */
const sources = readdirSync(`${root}/tokens`).filter((f) => f.endsWith('.json'))
const flat = new Map()   // "color.neutral.50" -> "#f9fafd"
const skipped = new Map() // tokens that deliberately reach no stylesheet, and why
for (const f of sources) {
  const walk = (o, p = '') => {
    for (const [k, v] of Object.entries(o)) {
      if (k.startsWith('$')) continue
      if (v && typeof v === 'object' && '$value' in v) {
        const d3 = v.$extensions?.d3
        // A token may declare that it is not a custom property — a breakpoint, a
        // package name, a value only ever composed into a shorthand, or prose
        // stating a rule. It must say why, so that silencing one is a decision
        // somebody wrote down rather than a line in this script.
        if (d3 && d3.emit === false) {
          if (!d3.why) note(`${p}${k} sets emit:false with no reason`)
          skipped.set(p + k, d3.why)
          continue
        }
        flat.set(p + k, Array.isArray(v.$value) ? v.$value.join(', ') : String(v.$value))
      }
      else if (v && typeof v === 'object') walk(v, `${p}${k}.`)
    }
  }
  walk(JSON.parse(readFileSync(`${root}/tokens/${f}`, 'utf8')))
}

/** `420ms {easing.spring}` -> `420ms cubic-bezier(...)`. */
function resolveJson(value, seen = new Set()) {
  return value.replace(/\{([^}]+)\}/g, (whole, ref) => {
    if (seen.has(ref)) return whole
    const hit = flat.get(ref)
    if (hit === undefined) { note(`token alias {${ref}} resolves to nothing`); return whole }
    return resolveJson(hit, new Set([...seen, ref]))
  })
}
const jsonValues = new Set([...flat.values()].map((v) => resolveJson(v).trim()))

/* ── the CSS side ────────────────────────────────────────────────────── */
// Only the source stylesheets. `theme.*.css` are Tailwind wiring that re-exports
// these under utility names, so scanning them would compare a file to itself.
const SOURCE_CSS = ['color.css', 'type.css', 'shape.css', 'layout.css', 'motion.css', 'icon.css']
const decls = new Map()
for (const f of SOURCE_CSS) {
  const path = `${root}/tokens/build/${f}`
  if (!existsSync(path)) { note(`tokens/build/${f} is missing`); continue }
  const css = readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  for (const m of css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) decls.set(m[1], m[2].trim())
}
function resolveCss(value, seen = new Set()) {
  return value.replace(/var\((--[\w-]+)(?:\s*,[^)]*)?\)/g, (whole, name) => {
    if (seen.has(name)) return whole
    const hit = decls.get(name)
    return hit === undefined ? whole : resolveCss(hit, new Set([...seen, name]))
  })
}

/* ── 1 · every token value reaches the stylesheets ───────────────────── */
const cssValues = new Set([...decls.values()].map((v) => resolveCss(v).trim()))
/** Compare what the value *is*, not how it was typed: whitespace, quotes and
 *  trailing zeros differ between a JSON source and a stylesheet without either
 *  being wrong. `rgba(0,0,0,0.58)` and `rgba(0, 0, 0, 0.58)` are one value. */
const norm = (s) =>
  s.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/['"]/g, '')
    .replace(/\b(\d+)\.0+\b/g, '$1')
const cssNorm = new Set([...cssValues].map(norm))
const missing = [...jsonValues].filter((v) => !cssNorm.has(norm(v)))
if (missing.length) {
  note(`${missing.length} token value(s) in the JSON sources appear in no stylesheet: ` +
       missing.slice(0, 6).join(', '))
}

/* ── 2 · nothing in the stylesheets was invented by hand ─────────────── */
const jsonNorm = new Set([...jsonValues].map(norm))
const orphans = [...decls].filter(([, v]) => !jsonNorm.has(norm(resolveCss(v))))
if (orphans.length) {
  note(`${orphans.length} custom propert(ies) hold a value no token source declares — ` +
       `edited in the CSS without the JSON: ` +
       orphans.slice(0, 6).map(([k, v]) => `${k}: ${v}`).join(' · '))
}

/* ── 3 · the vendored copy has not drifted ───────────────────────────── */
// theme.css differs on purpose: the library's is the optional-utilities entry,
// and tokens.css exists only there. Everything else must match byte for byte.
const ALLOWED_DIFF = new Set(['theme.css', 'tokens.css'])
if (!existsSync(vendored)) note('the vendored token copy in d3-ui is missing entirely')
else {
  for (const f of [...sources, ...SOURCE_CSS.map((c) => `build/${c}`)]) {
    const a = `${root}/tokens/${f}`
    const b = `${vendored}/${f}`
    if (ALLOWED_DIFF.has(basename(f))) continue
    if (!existsSync(b)) { note(`d3-ui is missing the vendored ${f}`); continue }
    if (readFileSync(a, 'utf8') !== readFileSync(b, 'utf8')) {
      note(`tokens/${f} and the copy vendored into d3-ui have diverged`)
    }
  }
}

if (fail.length) {
  console.error('\n  token check failed:\n' + fail.map((f) => `   ✗ ${f}`).join('\n') + '\n')
  process.exit(1)
}
console.log(`  tokens ok — ${flat.size} emitted tokens across ${sources.length} sources, ` +
            `${decls.size} custom properties, values agree, vendored copy in step ` +
            `(${skipped.size} tokens declare emit:false, each with a reason).`)
