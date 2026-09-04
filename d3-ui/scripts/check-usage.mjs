#!/usr/bin/env node
/**
 * The rules the audit exists because nobody was enforcing.
 *
 * Phase 0 counted 176 distinct colour values, 18 blues, 19 type sizes and 170
 * button recipes across five apps. None of that was carelessness — it is what
 * happens when the only thing standing between a developer and a raw hex is a
 * convention written down somewhere. So this is a gate, not a guideline.
 *
 *   npx d3-check-usage <dir> [<dir>…]
 *
 * It ships inside the package rather than beside the design record, because a
 * gate that lives in a sibling directory is a gate that fails in CI: Bindery's
 * lint called it across repositories and its build went red on the first push.
 *
 * Scans .ts/.tsx/.js/.jsx/.css. Anything genuinely exceptional carries
 * `d3-allow: <reason>` in a comment on the same line or the line above — the
 * reason is required, so an exemption is a decision somebody wrote down rather
 * than a line quietly added to this file.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, extname, relative } from 'node:path'

const PALETTE =
  'slate|gray|grey|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|' +
  'teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
const UTIL =
  'bg|text|border|ring|from|to|via|fill|stroke|divide|outline|decoration|accent|' +
  'caret|placeholder|shadow'

const RULES = [
  { id: 'raw-hex',
    re: /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g,
    css: true, js: true,
    say: 'a raw hex colour. Use a semantic token — this is the single habit that produced 176 colour values.' },

  { id: 'palette-class',
    re: new RegExp(`\\b(?:${UTIL})-(?:${PALETTE})-\\d{2,3}\\b`, 'g'),
    css: false, js: true,
    say: "a raw Tailwind palette class. The system's colours are semantic: bg-surface, text-muted, border-field." },

  // Only the scales the system actually owns. The first version of this rule
  // flagged every arbitrary value, which meant `grid-cols-[1fr_22rem]` and
  // `max-h-[80vh]` — a layout template and a viewport height, neither of which
  // the system has an opinion about. A gate that reports 73 things when 42 are
  // real is a gate people learn to skip, which is the same failure the Phase 2
  // contrast matrix had.
  { id: 'off-scale-value',
    re: new RegExp(
      String.raw`\b(?:text|leading|tracking|font|rounded|` +
      String.raw`[pm][xytrbl]?|gap(?:-[xy])?|space-[xy])` +
      // …and only for a fixed length. vh/vw/%/calc/fr are not on any scale here.
      String.raw`-\[(?![^\]]*(?:vh|vw|%|calc|fr|auto))[^\]\s]+\]`, 'g'),
    css: false, js: true,
    say: 'an off-scale value on a scale the system owns (type, spacing, radius, weight). ' +
         'If the scale has no step for it, the scale is the thing to change — not the call site.' },

  { id: 'primitive-token',
    re: /var\(\s*--p-[\w-]+/g,
    css: true, js: true,
    say: 'a primitive token. Primitives are exposed for tooling only; components read semantic tokens.' },

  { id: 'shadow',
    // `box-shadow: none` is the rule being enforced, not broken — the library
    // writes it explicitly on Card, Modal, Select and Tooltip. `inset` is a ring
    // drawn inside a control (a pressed toggle), which is a boundary, not lift.
    re: /\bshadow-(?!none\b)[a-z0-9-]+\b|box-shadow\s*:(?!\s*none\b)(?![^;]*inset)/g,
    css: true, js: true,
    say: 'a shadow. Elevation in this system is tone, and detachment is a boundary (D-015).' },
]

const dirs = process.argv.slice(2)
if (!dirs.length) { console.error('usage: check-usage.mjs <dir> [<dir>…]'); process.exit(2) }

const SKIP = new Set(['node_modules', 'dist', 'build', '.git', 'coverage', '.next', 'storybook-static'])
function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) yield* walk(p)
    else if (['.ts', '.tsx', '.js', '.jsx', '.css'].includes(extname(p))) yield p
  }
}

const findings = []
let allowed = 0
let scanned = 0
for (const dir of dirs) {
  for (const file of walk(dir)) {
    scanned++
    const isCss = extname(file) === '.css'
    const lines = readFileSync(file, 'utf8').split('\n')
    // Which lines are inside a comment, block or line. One pass, so the
    // lookback above can ask instead of guess.
    const inComment = []
    let open = false
    for (const l of lines) {
      const startsOpen = open
      let scan = l
      while (true) {
        if (!open) {
          const a = scan.indexOf('/*')
          if (a === -1) break
          open = true; scan = scan.slice(a + 2)
        } else {
          const b = scan.indexOf('*/')
          if (b === -1) break
          open = false; scan = scan.slice(b + 2)
        }
      }
      inComment.push(startsOpen || open || /^\s*(?:\/\/|\{?\/\*)/.test(l) || /\*\//.test(l))
    }
    lines.forEach((line, i) => {
      // Look back through the comment block this line sits under. Detecting the
      // block properly rather than pattern-matching line prefixes: a reason worth
      // stating usually wraps, and continuation lines have no leading marker, so
      // a prefix test silently stops applying the moment somebody reflows a
      // sentence — an exemption mechanism that fails quietly is worse than none.
      const exempt = (() => {
        if (/d3-allow:\s*\S/.test(line)) return true
        for (let j = i - 1; j >= 0 && i - j <= 10; j--) {
          if (/d3-allow:\s*\S/.test(lines[j])) return true
          if (!inComment[j]) return false
        }
        return false
      })()
      for (const rule of RULES) {
        if (isCss ? !rule.css : !rule.js) continue
        rule.re.lastIndex = 0
        const hits = line.match(rule.re)
        if (!hits) continue
        if (exempt) { allowed += hits.length; continue }
        findings.push({ file, line: i + 1, rule, hits: [...new Set(hits)] })
      }
    })
  }
}

const byRule = new Map()
for (const f of findings) byRule.set(f.rule.id, [...(byRule.get(f.rule.id) ?? []), f])

if (!findings.length) {
  console.log(`  usage ok — ${scanned} files, no violations` +
              (allowed ? `, ${allowed} exemption(s) with a stated reason.` : '.'))
  process.exit(0)
}
console.error(`\n  ${findings.length} usage violation(s) across ${scanned} files:\n`)
for (const [id, list] of byRule) {
  console.error(`  ${id} — ${list[0].rule.say}`)
  for (const f of list.slice(0, 12)) {
    console.error(`     ${relative(process.cwd(), f.file)}:${f.line}  ${f.hits.join(' ')}`)
  }
  if (list.length > 12) console.error(`     … and ${list.length - 12} more`)
  console.error('')
}
process.exit(1)
