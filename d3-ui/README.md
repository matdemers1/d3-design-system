# @d3cloud/ui

The D3 Cloud component library. Consumed by **Bindery**, **App B**, **App C** and (last) **App A**.

Design work, decisions and specs live in the workspace at `design-system/` — `AUDIT.md`, `BRIEF.md`, `DECISIONS.md` and the exploration pages. This repo is what ships.

## Supported environments

- React 18.2+ or 19, rendered on the client. React Server Components are not
  supported: the components use state, effects and context.
- A bundler that replaces `process.env.NODE_ENV` (Vite, webpack, esbuild and
  Rollup all do), which strips the development contract checks from
  production builds. The package is ESM-only.
- Evergreen browsers. The CSS relies on cascade layers, `:has()` and
  `color-mix()`.

## Install

Each release attaches a packed tarball to its GitHub release. Install by URL;
there is no registry (D-064):

```
npm i https://github.com/matdemers1/d3-design-system/releases/download/v1.0.0/d3cloud-ui-1.0.0.tgz
```

Upgrade by changing the version in the URL, twice. The tarball is immutable
and the lockfile records its integrity hash.

## Use

```js
import '@d3cloud/ui/tokens.css'   // required — custom properties and fonts
import { Button } from '@d3cloud/ui'
```

`tokens.css` is plain CSS. **The components do not require Tailwind** — App C does not use it. Apps that do want matching utilities add:

```js
import '@d3cloud/ui/theme.css'    // optional — Tailwind v4 preset
```

The Tailwind names that preset declares (`--font-weight-semibold`,
`--text-24--line-height`) do not exist at runtime — `@theme inline` emits no
custom properties. In CSS of your own, use the runtime tokens (`--weight-*`,
`--leading-*`, `--text-*`). The usage gate reports the Tailwind names unless it
is told the app uses Tailwind:

```bash
npx d3-check-usage src              # no Tailwind
npx d3-check-usage --tailwind src   # Tailwind v4 with theme.css
```

### Page layout (1.1)

`Page` (container width and rhythm), `Stack` and `Cluster` (gaps by spacing
step name only), `Grid` (auto-fit tiles), `Section` (a titled region),
`AuthLayout` (a single-task page), `DescriptionList`, `DataList` (rows, not a
table), `FormActions` and `FilterBar`. Each story documents its rules; the
reasoning is D-067 to D-070 in `design-system/DECISIONS.md`.

### Names

`label` is used where a component builds the accessible name itself: it is
visible on Checkbox and FormField, and name-only on IconButton, Spinner and
CountBadge. Group components (SegmentedControl, Tabs, Select outside a
FormField) take `aria-label` verbatim. `tone` means colour carries meaning
(Alert, Badge), `variant` means emphasis or shape (Button, Link, Skeleton), and
`kind` means the situation (EmptyState).

### Overriding a component

Component rules live in the cascade layer `d3-ui`, ordered after Tailwind's
`base` and before its `utilities`. So a `className` on a component wins
(`<Input className="w-72">` is 288px wide), an app's own unlayered CSS wins, and
Tailwind's preflight cannot reset one. An app with its own global rules for bare
elements (`button { … }`) should put them in a layer too, or they override the
components.

## Colour mode

Dark is primary. Light is applied with `data-theme="light"` on `<html>`, and is also honoured via `prefers-color-scheme` when no attribute is set.

## Develop

```
npm run dev          # Storybook on :6006
npm run typecheck
npm run build
npm run test         # vitest — every story rendered + axe, plus contract tests
npm run verify       # typecheck, test, build
```

### Tests

`src/test/stories.test.tsx` composes **every story** through the real preview
decorators and asserts two things per story: that it renders, and that axe finds no
violations. A guard fails the suite if the glob ever matches nothing, so it cannot
pass silently.

`color-contrast` is disabled in jsdom — there is no layout or paint, so axe would
report every pair as *incomplete*, which is worse than silence. Contrast is covered
in two other places: the token layer measures 106 shipped pairs, and a browser sweep
checks every story in both modes.

Alongside those, each component has a **contract test** asserting the specific
promises in its Phase 4 spec — that a FormField label is really associated, that
`indeterminate` is `aria-checked="mixed"`, that a loading Button stays focusable, that
read-only stays copyable while disabled does not.

Every story is also checked by `@storybook/addon-a11y` live in the panel, configured to
**fail rather than warn**. Batch 1 was verified at **78/78** — 39 stories × 2 colour modes,
zero violations.

Every component ships with an implementation, exported types, a story per variant **and per state**, an automated accessibility check, and a docs entry.
