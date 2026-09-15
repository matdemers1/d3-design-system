# Changelog

Semver. The public surface is what `d3-ui/src/index.ts` exports plus the token
names; CSS class names (`.d3-btn`, `.d3-seg`) are an implementation detail and
apps must not select on them.

## Unreleased — toward v1.0.0

### Added

- **Development-mode contract checks.** The guardrails that are types in
  TypeScript are now also checked at runtime for JavaScript callers: missing
  accessible names (IconButton `label`, Modal `title`, SegmentedControl and Tabs
  names, and Input/Textarea checked against the real DOM), unknown `tone`,
  `kind` and `variant` values that silently fall back, `color` on Badge, and
  contradictions such as `pressed` on a primary Button. Each warns once, and
  every check is removed from production builds — verified by bundling the
  package the way an app does.
- **Tooltip warns when its trigger cannot take focus**, because such a tooltip
  only ever appears on hover.

### Changed

- **Browser checks in CI.** Every story, in both themes, in a real browser:
  control geometry, token resolution, font loading, axe with real colour
  contrast, and pixel baselines. Storybook does not publish unless they pass.
- `@storybook/test-runner` removed; the browser suite supersedes it.
- Select accepts `name` and `required`, so it submits with a native form like the
  `<select>` it replaces.
- **The usage gate flags references to tokens that do not exist.** A renamed
  token fails silently — the property is undefined and the colour falls back
  without an error — and typecheck, lint and the other rules all passed while
  Bindery still read `--color-text-muted` after the V1-1 rename. Custom properties
  an app declares for itself are not flagged.
- `@d3cloud/ui/package.json` is exported, for tools that read the version.
- **`Link` accepts `asChild`**, to style a router's own link. A plain `<a href>`
  reloads the whole page under a client router, so Link previously had no use in
  a single-page app — Bindery has no external links at all.
- **`PageHeader` accepts `icon`**, a decorative icon ahead of the title.

### Fixed

- **Select crashed on an option whose value is `""`** — Radix reserves the empty
  string for "nothing selected". "Everything", "None" and "Any" are ordinary
  options a native `<select>` allowed; they now work, translated at the boundary.
- **Select's placeholder looked like a chosen value, and long labels widened the
  trigger.** Radix drops `className` on its Value element, so both the
  placeholder colour and the truncation rule had never applied.

- **Six components crashed on a missing prop** instead of degrading: Avatar
  (`name`), CountBadge (`count`), Tabs and SegmentedControl (`items`), Select
  (`options`) and Tooltip (no provider). They now render safely, and a test
  renders every export with no props at all.
- **Tooltip no longer requires `TooltipProvider`.** It supplies its own when
  none is above it; wrapping the app once is still how delays are shared.
- **A checked Checkbox with no `checkIcon` showed no tick** — checked was
  conveyed by fill colour alone. It now has a built-in tick, and an external Link
  a built-in cue, both overridable. An uncontrolled `defaultChecked="indeterminate"`
  also showed a tick instead of the dash; state is now read from the DOM.
- **The Tabs count failed contrast** — 3.69:1 on the active pill, 4.29:1 on an
  inactive tab — because it was dimmed with opacity. SegmentedControl used the
  same pattern and passed by luck; both now use weight, not opacity.
- **PageHeader's visible count still read "1 items"** after its accessible name was
  fixed; both now share one pluralisation.
- **PageHeader counted one thing as "1 items"** — it built its own label and
  missed the fix Tabs and SegmentedControl received in v0.1.1.

### Breaking

- **`PageHeader.backTo` and `backIcon` are replaced by a `back` slot.** The old
  prop rendered a plain `<a href>`, which reloads the page under a client router.
  Pass the link instead: `back={<Link asChild><RouterLink to="/inbox">Inbox</RouterLink></Link>}`.
  PageHeader warns in development if the link says only "Back".

- **`--color-text`, `--color-text-muted` and `--color-text-faint` are now
  `--color-fg`, `--color-fg-muted` and `--color-fg-faint`.** The Tailwind
  utilities were already `text-fg*`, so apps using utilities change nothing;
  plain CSS reading the old custom properties must rename them. This closes
  D-017: three tokens had two names depending on which layer you read, and a
  1.0 would have frozen that.

## v0.1.1 — 2026-09-04

**The usage gate now ships inside the package**, as the `d3-check-usage` bin.

It previously lived in `design-system/scripts/` and apps ran it by relative
path. That works on a machine with both repositories checked out beside each
other and nowhere else: Bindery's CI went red on the first push after adopting
the library, with `Cannot find module '…/d3-design-system/design-system/
scripts/check-usage.mjs'`. A gate that only runs on the author's laptop is not
a gate.

```bash
npx d3-check-usage src
```

No component or token changes.

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
