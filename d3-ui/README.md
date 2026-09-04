# @d3cloud/ui

The D3 Cloud component library. Consumed by **Bindery**, **App B**, **App C** and (last) **App A**.

Design work, decisions and specs live in the workspace at `design-system/` — `AUDIT.md`, `BRIEF.md`, `DECISIONS.md` and the exploration pages. This repo is what ships.

## Install

Installed by git tag; there is no registry (D-035).

```
npm i "@d3cloud/ui@github:<owner>/d3-ui#v0.1.0"
```

## Use

```js
import '@d3cloud/ui/tokens.css'   // required — custom properties and fonts
import { Button } from '@d3cloud/ui'
```

`tokens.css` is plain CSS. **The components do not require Tailwind** — App C does not use it. Apps that do want matching utilities add:

```js
import '@d3cloud/ui/theme.css'    // optional — Tailwind v4 preset
```

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
