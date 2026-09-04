# Changelog

Semver. The public surface is what `d3-ui/src/index.ts` exports plus the token
names; CSS class names (`.d3-btn`, `.d3-seg`) are an implementation detail and
apps must not select on them.

## v0.1.0 — 2026-09-04

First tag. Everything below is new, so this reads as a description rather than
a diff.

### Components — 21

**Primitives** — Avatar, Badge (+CountBadge), Button, IconButton, Link,
Skeleton, Spinner
**Forms** — Checkbox, FormField, Input, Label, Select, Textarea
**Layers** — Alert, Card, Modal, SegmentedControl, Tabs, Tooltip
**Patterns** — EmptyState, PageHeader

361 tests. Every story is swept by axe, and the glob picks up new files, so a
component with stories is a component with an accessibility check.

### Foundations

- Dark-first OKLCH colour on one violet accent, with a light theme, applied
  per element so a subtree can be an island of the other theme.
- A 7-step type scale on self-hosted Inter, and JetBrains Mono for metadata.
  No app in the audit loaded the face it declared; these files are the fix.
- **No shadow token exists.** Elevation is tone; detachment is a boundary.
- Motion is tokenised and expressive. Under `prefers-reduced-motion` it slows
  rather than stopping — a frozen spinner reads as a hung request.
- The spinner is a graph, not a wheel: a small network still resolving, with a
  signal relaying around its edges.

### Deliberate omissions

Not oversights. Each is a decision recorded in `DECISIONS.md`.

- No `danger` variant on `IconButton` — a destructive action carries its noun.
  The affordance is removed rather than the rule documented.
- Three badge tones, not seven. A status earns a hue only if seeing it changes
  what you do next.
- No letter-spacing scale. Four uses across two patterns is not enough evidence
  to invent one.
- No Toast and no DropdownMenu. They are the first two components of v0.2.

### Gates

`npm run verify` runs tokens → usage → typecheck → tests → build → dist check.

- **`check-tokens.mjs`** — the JSON sources and the built stylesheets must
  agree, and the copy vendored into the library must match the original.
- **`check-usage.mjs`** — bans raw hex, raw Tailwind palette classes,
  off-scale values, primitive `--p-*` tokens and shadows. The library passes
  it with zero exemptions.

### Known limitations

- **Consumers must not import the CSS separately.** `dist/index.js` imports its
  own stylesheet, and `./styles.css` is exported only for ordering control.
- **Linked installs need help with React.** `file:` linking makes Radix resolve
  its own copy: use `resolve.dedupe` for the dev server and build, and
  `test.server.deps.inline` for vitest. See `MIGRATING.md`.
- **Bindery is the only app migrated.** App A–E are not, and App A is
  JavaScript, where the type-level guardrails become runtime surprises.
