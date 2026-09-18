# Changelog

Semver. The public surface is what `d3-ui/src/index.ts` exports plus the token
names; CSS class names (`.d3-btn`, `.d3-seg`) are an implementation detail and
apps must not select on them.

## v1.2.1 — 2026-09-18

**A bounded `Table` was pointer-only.** Found by running axe over a real consuming app rather than
by reading the spec: `maxHeight` makes the table a scroll container, and a region that scrolls has
to be reachable by keyboard or the rows below the fold can only be seen with a mouse
(WCAG 2.1.1 — axe's `scrollable-region-focusable`, serious).

### Fixed

- **`Table`** — a bounded table's scroll region now takes focus (`tabIndex=0`) and is named by its
  own caption. Only when `maxHeight` is set: an unbounded table does not scroll, and a tab stop
  that does nothing is worse than none.

## v1.2.0 — 2026-09-18

**Records.** `DataList` covers like things with a name and some meta (D-067); it deliberately is not
a table, and until now the system had nothing for the case a table is actually for — columns that
line up, so a value can be compared down one or ordered by it. Additive: no existing export, prop or
default changed.

### Added

- **`Table`** — columns declared as data (`key` · `header` · `cell` · `sortable` · `numeric` ·
  `width` · `align`), a header that stays put, and virtualization past a threshold.
  - **Sorting** cycles ascending → descending → **back to the order the caller passed**. The third
    state is not decoration: the given order is often itself meaningful. `aria-sort` goes on the
    column rather than on the button inside it, which is where a screen reader looks for it.
    Numbers sort by value, so a Phase 8.5 does not land between 12 and 2.
  - **Virtualization** renders a window of rows with spacer rows above and below, so the table stays
    a real `<table>` — the browser's own column sizing and cell semantics still apply — and the
    scrollbar still describes the whole set. `aria-rowcount` reports the true count, not the
    rendered one.
  - **`stickyHeader` and `virtualize` both need `maxHeight`**: each needs a scroll container, and
    virtualization needs a viewport to measure against. Asking for virtualization without one warns
    in development, because the failure is silent otherwise — every row renders.
  - Below `sm` the table keeps its shape and scrolls sideways rather than becoming a stack of cards:
    stacking destroys exactly the alignment that was the reason to use a table. Reach for `DataList`
    when the small screen is the primary one.

Built for Foreman's requirements register, and measured against it: `browser/table.spec.ts` loads
439 rows, asserts fewer than forty are ever in the DOM across a full scroll, and holds the
90th-percentile frame under 50ms while scrolling.

## v1.1.0 — 2026-09-17

**The frame and the page patterns.** v1.0 gave apps good parts and no guidance on putting them
together; every internal app improvised its own shell, lists and forms. v1.1 adds them, additively —
no existing export, prop or default changed:

- **The frame** (D-065, D-066): `AppShell` + `AppShellBrand`, `SideNav`, `Menu`, `AccountMenu`, and
  System / Light / Dark theming (`ThemeProvider`, `useTheme`, `ThemeSwitch`, `themeBootScript`).
- **Page primitives** (D-068): `Page`, `Stack`, `Cluster`, `Grid`, `Section`, `AuthLayout`.
- **Lists and forms** (D-067, D-069): `DescriptionList`, `DataList`, `FormActions`, `FilterBar`;
  `FormField width`.
- **Patterns** — nine full-screen compositions with written rules under `Patterns/` in Storybook,
  and "Building a page" in the README. Reviewed by the owner before release (D-071).
- **Strict CSP** (D-072): `setStyleNonce` / `readStyleNonce` let dialogs, the phone drawer and
  `Select` lock scroll and position under `style-src 'self' 'nonce-…'` with no `'unsafe-inline'`.
- **Smaller additions:** `PageHeader countNoun`, rich `Modal description`, `Textarea mono`,
  `@d3cloud/ui/base.css`; the usage gate now reports Tailwind-only token names in apps that do not
  use Tailwind (D-070); date and time inputs draw their focus ring.

First consumer: the D3 Auth console, rebuilt on rc.2 and running in production at
auth.d3cloud.io. v1.1.0 is rc.2 with the version number changed; the release candidates' own entries
follow.

## v1.1.0-rc.2 — 2026-09-17

Fixes found by rebuilding the D3 Auth console on rc.1. Additive only.

### Added

- **`setStyleNonce(nonce)` and `readStyleNonce()`** (D-072) — strict CSP.
  `Modal`, the `AppShell` drawer, `Select` and a modal `Menu` lock scroll
  through Radix, which injects a `<style>` element; under `style-src` without
  `'unsafe-inline'` it was blocked (a console error, and the page behind still
  scrolled). The server sends a per-response nonce in `style-src 'nonce-…'`
  and in `<meta name="d3-style-nonce">`; the app calls
  `setStyleNonce(readStyleNonce())` before rendering. `Select` passes the nonce
  to its list's own `<style>`. New dependency: `get-nonce` ^1.0.1, the copy
  Radix already resolves; the dist check fails if it is bundled or resolves
  twice.
- **`PageHeader countNoun`** — `{ one: 'person', other: 'people' }` shows
  "5 people" and names the heading "People, 5 people". Default unchanged
  ("items"); `countLabel` still replaces the whole name. Type `CountNoun`.
- **`Textarea mono`** — `--font-mono`, no ligatures, for JSON and manifests.
- **`@d3cloud/ui/base.css`** — opt-in document base: `html` and `body` on
  `--color-bg`, `--color-fg`, `--font-sans`, antialiased, `body` at least the
  viewport tall, in `@layer base`. Not imported by any component.
- README: the strict-CSP pattern, and the one line Vitest needs in an app
  (`test.server.deps.inline: ['@d3cloud/ui']`) because the package imports its
  own CSS.

### Changed

- **`Modal description`** accepts `React.ReactNode`, not only a string. It
  renders in a `div` (was Radix's `<p>`) so paragraphs and lists are valid; it
  is still the dialog's accessible description. Rich content gets 8px between
  blocks, `strong` in the foreground colour and `code` in mono. A plain-string
  description renders identically.

### Fixed

- **Dead modifier classes.** `Card` no longer emits `d3-crd--md` (20px is the
  base rule) and `Section` no longer emits `d3-sec--card` or `d3-sec--plain`;
  no stylesheet had a rule for any of them. No rendered change.
- **Date `Input` focus ring** — in Chromium the frame drew no ring at the
  calendar-picker tab stop (rc.1 known issue). Date and time fields also ring
  on `:focus-within`.

## v1.1.0-rc.1 — 2026-09-17

Additive only: no existing export, prop or default changes. The frame arrives (D-065, D-066); page, list and form primitives (D-067–D-070).

### Added

- **`AppShell`** — D-021's shell. `brand`, `nav`, `footer` and `children`
  slots. At `lg` and above: a 240px sidebar, collapsible to a 64px rail,
  remembered in `localStorage` (`storageKey`, default `d3.sidebar.collapsed`;
  `defaultCollapsed`). Below `lg`: a top bar with a menu button, and the
  sidebar as a drawer over a scrim (Radix Dialog: focus trapped, Escape, scrim
  and any link activation close it, focus returns). A "Skip to content" link
  and exactly one `<main>` (`mainId`, default `content`). Router-agnostic.
  `useAppShell()` returns `{ collapsed, drawer }` for the brand slot.
- **`SideNav`, `SideNavGroup`, `SideNavItem`** — a named `<nav>` landmark;
  groups labelled by their visible (or `hideTitle`) title; items take `href` or
  `asChild` with a router link, `icon`, `label`, `current`
  (`aria-current="page"`), and `count`/`countLabel`, rendered as a `CountBadge`
  and joined to the name. On a collapsed rail an item is its icon, with the
  label as a Tooltip.
- **`Menu`, `MenuTrigger`, `MenuContent`, `MenuItem`, `MenuSeparator`,
  `MenuLabel`** — Radix DropdownMenu with the system's floating layer
  (surface-raised, 1px border-float, no shadow). `MenuItem` takes `icon`,
  `tone="danger"`, `disabled`, `onSelect` and `asChild`. Non-modal by default.
  New dependency: `@radix-ui/react-dropdown-menu`.
- **`AccountMenu`** — `name`, `detail`, `avatarSrc`, and the app's menu items.
  Sign-out is an item the app provides (a navigation or a form post it owns).
  Avatar only on a collapsed rail.
- **`ThemeProvider`, `useTheme`, `ThemeSwitch`, `themeBootScript`** — System /
  Light / Dark. Writes the resolved mode to `data-theme` on `<html>`, follows
  the OS live under `system`, remembers the choice (`storageKey`, default
  `d3.theme`) and follows other tabs. `ThemeSwitch` is a SegmentedControl on a
  page and menu radios inside a menu. `themeBootScript()` returns an inline
  `<head>` script that sets the theme before first paint.

- **Page primitives** (D-068). `Page` — the content container: `width`
  `wide | narrow | form | prose` from the container tokens, `--page-pad`,
  regions 24px apart; a `div` by default because the app shell owns `<main>`.
  `Stack` and `Cluster` — a column and a wrapping row whose `gap` takes a
  spacing step by name (`gap="16"`), never a length; `align`, `justify`, `as`.
  `Grid` — auto-fit tiles with a named minimum width (`sm | md | lg`), on
  `--grid-gutter`, one column below `md`. `Section` — a `<section>` named by
  its `h2` (or `h3`), with `description`, trailing `actions` and
  `surface="card" | "plain"`. `AuthLayout` — a single-task page: brand slot,
  PageHeader title, the task, a footnote slot, at form width.
- **Lists and forms** (D-067, D-069). `DataList` and `DataListRow` — rows, not
  a table: `leading`, `title`, `description`, `meta`, `actions`, 48px rows,
  meta and actions aligned down the list, actions under the text below `sm`,
  truncation per D-019, an `empty` slot. A row is one link (`href`) or holds
  actions, never both. `DescriptionList` and `DescriptionItem` — a `<dl>`, two
  columns from `sm`, `numeric` for tabular figures. `FormActions` — primary
  last; a row on the aligned edge from `sm`, full width with the primary on top
  below it; optional `leading` action. `FilterBar` — filter controls in a
  wrapping row with a `trailing` slot, stacked below `md`.

- **Patterns guide** — nine full-screen compositions under `Patterns/` in
  Storybook, each built only from package exports, with its rules as do/don't
  lists: App frame, List page, Detail page, Settings page, Dashboard, Auth page,
  Confirmation, Page states, Forms. The README gains "Building a page".
- **`AppShellBrand`** — the home link for the shell's `brand` slot: `name`,
  decorative `mark`, `href` or `asChild`. On a collapsed rail it shows the mark
  and keeps the name as the link's name. Every app had written this inline.
- **`FormField width`** — `full` (default) · `lg` 24rem · `md` 20rem · `sm`
  16rem · `xs` 8rem, capping the control while the label and help keep the
  field's width. A number of days no longer has to be a 640px field.
- **Form attributes on `Stack` and `Cluster`** — `action`, `method`, `encType`,
  `target`, `noValidate`, `autoComplete`, `name`, `acceptCharset` pass through
  for `as="form"` (type `LayoutFormAttributes`). A Stack could render a form
  that could not say where it posts.
- Storybook: `parameters.canvas: 'app'` renders a story as a full page under a
  real `ThemeProvider` following the toolbar theme, so portalled menus and
  modals match the page. The unit story sweep now includes `src/patterns` and
  `src/guides`.

### Fixed

- **`Select`** drew an option's `description` inside the closed trigger, as a
  second line squeezed into a 34px control. Only the label is copied now.
- **`Section`**: a description longer than the row pushed `actions` under it,
  so a status badge dropped below a tile's text. The lead's flex basis is 16rem,
  as its comment always said.
- **`Modal`**: opened from the keyboard with a destructive action in it, the
  panel took focus (correctly) and the global focus ring framed the whole
  dialog. The panel draws no ring, like a page heading focused on navigation.
- **`DataList`**: a list that is a Card's whole content bleeds vertically as
  well as horizontally, so the first row sits the card's padding from its top
  rather than 32px; `code` in a row uses the mono face; a title that is a
  `Link` is the foreground colour, underlined on hover, rather than a column of
  accent-coloured names (pixel baseline regenerated).

- **Owner review (D-071):** `Page align` (`start` default, `center`); `FormActions layout` (`row` default, `stack` for single-task pages). The Settings pattern's saves are secondary; the Auth pattern stacks its actions.

### Changed

- **The usage gate reports Tailwind-only token names** (D-070). Names declared
  only inside `@theme` (`--font-weight-title`, `--text-24--line-height`) do not
  exist at runtime, and the gate used to accept them. They now fail as
  `tailwind-only-token` unless the gate is run with `--tailwind`. An app without
  Tailwind that passed on 1.0 may fail here: each finding is a style that was
  never applied. The D3 Auth console has 7.

### Known issues

- In Chromium, an `Input type="date"` draws no focus ring while focus is on its
  internal calendar-picker stop (D-069). Fixed in rc.2.

## v1.0.0 — 2026-09-15

The first stable release. The public API is frozen (D-063): from here, a rename
or removal is a major version. Adopted by Bindery and d3-qr, and verified
rendered in both apps, in both themes and with keyboard focus.

### Added

- **`CodeInput`** — one-time codes, PINs and recovery codes, one character per
  box. A single transparent input owns the value, so paste, `one-time-code`
  autofill and screen readers see one labelled field; the boxes are drawn and
  `aria-hidden`. Numeric and alphanumeric modes, decorative `groups`, `masked`,
  `md`/`lg` on the control ramp. Characters pop in, the active box carries a
  caret, `status="error"` shakes the row and `status="success"` waves across it
  — never the only signal, and under reduced motion the shake becomes a tinted
  fill. First consumer: Bindery's sign-in and first-run setup.
- **`PasswordInput`** — Input's geometry with a real reveal toggle inside the
  boundary (keeps focus in the field; its name says what it will do), a
  strength meter fed by the app's own `strength` prop (bars plus words; no
  estimator dependency), and a Caps Lock warning while focused.
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

- **A `TooltipProvider`'s delays never took effect.** Every Tooltip passed its
  own 400ms to Radix, which prefers that over the provider's. Proven with a
  1.5s provider in a real browser.
- **`Link asChild` dropped the caller's ref on React 18** (a plain function
  component never receives `ref`) and logged a deprecation warning on React 19
  (it read `element.ref`). `Slot` now forwards refs and reads the child's ref
  where each major version keeps it.
- **Checkbox with no visible label** renders no empty `<label>`. The type now
  requires either `label` or `aria-label`.
- The Tailwind weight utilities reference `--weight-*` instead of repeating
  the numbers, so the two cannot drift apart.

- **The usage gate no longer scans test files.** A fixture's `fgColor: '#000000'`
  is data under test, not a colour anyone sees. In d3-qr those were 17 of the
  gate's 30 findings, and exempting each fixture line teaches people to exempt.

- **Focused text fields drew two rings, and every page heading drew one.** The
  global focus ring sat unlayered in the token stylesheet, so once components
  moved into `@layer d3-ui` it overrode each component that hands its ring to a
  wrapper: Input, Textarea, PasswordInput and CodeInput drew a second ring
  on the control inside the frame. PageHeader's title, focused on navigation,
  drew a violet box on every keyboard navigation. The global ring now sits in
  `@layer base`, the title has no ring, and PasswordInput's toggle no longer
  lights the frame. A browser sweep Tabs through every story and requires
  exactly one ring at each stop.

- **A `className` on a component was ignored whenever it touched a property the
  component sets.** Component CSS was unlayered, and unlayered rules beat every
  Tailwind utility whatever the specificity: in Bindery `<Input className="w-72">`
  rendered full width and `<CardBody className="mb-3">` had no margin, with no
  error. Component rules now sit in `@layer d3-ui`, after `base` and before
  `utilities`. An app's unlayered global element rules now override components.
- **Select takes `id`**, so a `<label htmlFor>` outside a FormField names it.
- **Card renders `section`, `article` or `li` (`as`), and CardTitle a heading
  (`as="h2"`)**, so a card that is a region of the page appears in its outline.
  The parts merge an app's `className` with their own instead of replacing it.

- **EmptyState's body was a `<p>`**, so paragraphs inside it — Bindery's "Not here"
  state has two — were invalid nesting the browser repairs by closing the outer
  paragraph early. The same defect Alert had in D-050. Body content in both now
  gets the system's paragraph spacing rather than browser defaults.

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

API freeze for 1.0 (V1-6, D-063). Neither consuming app imported any of these,
so no app code changed.

- **Not exported any more:** `useFormField`, `FormFieldContext`,
  `FormFieldContextValue`, `initialsOf`. They are internals, and exporting them
  froze wiring that isn't finished (the context's `required` is read by nothing).
- **Package entry points:** only `.`, `./tokens.css`, `./theme.css` and
  `./package.json`. `./styles.css` is gone, because the entry imports its own
  CSS and layers settle ordering (D-061). The `./tokens/*` wildcard, which
  published the DTCG sources and font files as import paths, is gone too.
- **Tooltip:** `delayDuration` and `className` are removed, and `content` is
  `string`. A per-tooltip delay is what stopped `TooltipProvider`'s delay from
  ever applying (fixed below), and D-033 sets the delay system-wide.
- **Own prop types instead of Radix's:** `CheckboxProps`,
  `TooltipProviderProps`, `TabPanelProps`, and `ModalClose`, which now always
  wraps one button (no `asChild`). A Radix major release is no longer a
  breaking change here.
- **`CardBody`, `PageHeader` description, and `FormField` help and error**
  render a `div`, so they can hold more than a sentence (as Alert did in D-050).
- **Renamed:** `SegmentedItem` to `SegmentedControlItem`. `PasswordInputSize`
  is now an alias of `InputSize`.


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
