# Phase 0 — Audit of the current state

**Date:** 3 September 2026
**Scope:** the five in-scope D3 Cloud product frontends. Marketing sites, games, personal tools and the Swift apps are out of scope (see `DECISIONS.md`, D-001).
**Companion:** [`explorations/00-current-state.html`](explorations/00-current-state.html) — every finding below, rendered.

> **A note on names.** Bindery is named throughout because it is the app this system
> was migrated into first, and the migration notes are specific to it. The other four
> in-scope apps appear as **App A–E** and the out-of-scope ones are described rather
> than named. The letters are stable across this document and `DECISIONS.md`, so a
> finding about App A in Phase 0 is the same app as App A in Phase 6.
>
> | | |
> |---|---|
> | **App A** | a feedback and review tool |
> | **App B** | a chat client |
> | **App C** | a planning board |
> | **App D** | a commercial product, not yet launched |
> | **App E** | a portfolio site |

---

## The blunt summary

**176 distinct colour values. 18 distinct blues. 16 reds. 19 distinct type sizes. 5 CSS approaches. 170 distinct button recipes and not one Button component. 0 shared code between any two apps.**

Four of the five apps declare a typeface they never load. Two draw form-field borders below 1.4:1 — invisible until focused. The primary call-to-action in the one app people pay for fails WCAG AA in light mode at 3.55:1, and passes at 9.08:1 in dark, because the two themes were never checked against each other.

The most useful thing the audit found is not a failure. It is that **Bindery and App D have each independently, and well, solved most of the problems a design system solves** — semantic token layers, documented contrast reasoning, focus-visible rings, reduced-motion handling. They solved them with different token names, different colour models and different files, in two repos that cannot see each other. There is no design language to invent from nothing here. There is a design language to extract, reconcile and publish.

---

## 1. The five apps

| App | Path | CSS approach | Config size | Colour mode | Brand |
|---|---|---|---|---|---|
| **App A** | `App A/packages/frontend` | MUI v5 + Emotion | 52 lines | light + dark | `#6366f1` indigo (h 277°) |
| **Bindery** | `bindery/web` | Tailwind v4 `@theme`, semantic tokens | 102 lines | **dark only** | `#d8a657` amber (h 77°) |
| **App D** | `someday-vault/apps/web` | Tailwind v4 `@theme inline`, semantic tokens | 204 lines | light-first + dark | `#c96f3a` terracotta (h 49°) |
| **App B** | `app-b/frontend` | Tailwind v4, raw palette utilities | 55 lines | **dark only** | `#3b82f6` blue (h 260°) |
| **App C** | `app-c` | Hand-rolled CSS, OKLCH custom properties | 1,469 lines | **dark only** | `#4fa188` teal (h 171°) |

Five stacks. No two agree. Three are dark-only, one is light-first, one supports both — so **dark mode is not a mode in this portfolio, it is a per-app identity**, and any system that treats it as a late-stage toggle will break three apps.

### Existing theme/config files

- `App A/packages/frontend/src/theme/index.js` — MUI `createTheme`, a palette and three component overrides
- `bindery/web/src/index.css` — `@theme` block, 7 semantic colour tokens, heavily commented with contrast arithmetic
- `someday-vault/apps/web/src/index.css` — `:root` + `.dark` token pairs, `@theme inline` bridge, self-hosted font, motion language
- `app-b/frontend/src/index.css` — 2 tokens (`--color-brand`, `--color-brand-accent`) and six keyframes
- `app-c/app/styles.css` — 22 OKLCH custom properties and 128 hand-written class selectors

---

## 2. Colour

**176 distinct values render across the five apps** — 101 chromatic, 75 neutral.

| Hue family | Distinct values | Apps |
|---|---:|---|
| neutral / near-neutral | 75 | all five |
| orange / amber | 19 | all five |
| **blue** | **18** | Bindery, App B, App A, Project Mgmt |
| teal / emerald | 16 | all five |
| red | 16 | all five |
| violet / indigo | 11 | all five |
| yellow | 8 | four |
| green | 7 | App B, Project Mgmt |
| cyan / sky | 4 | three |
| purple | 2 | App B |

The blues are the clearest illustration. Six of the eighteen sit between L 0.55 and L 0.65 — `#3b82f6`, `#2b7fff`, `#5b7ec8`, `#5882bb`, `#6791cc`, `#708ecd`. Three of those are App C's own; two are App B's brand and Tailwind's `blue-500`, which are 6 units apart and both in use. None of these can be swapped for another without a visual diff, and all of them have to be maintained.

**Five brand colours spanning 228° of hue.** Nothing connects Bindery's amber to App A's indigo. A user moving between two D3 Cloud products has no visual reason to believe they were built by the same person.

### The near-duplicate problem, concretely

- `#10b981` — App B's accent *and* App A's `secondary.main`/`success.main`. Same value, two apps, arrived at independently, meaning two things in each.
- `#34d399` — App A's `secondary.light` *and* App D's dark-mode `success`.
- `#f59e0b` — App A's `warning.main` *and* a raw literal in App B.
- App A additionally carries `#ff0000` and `#003399` — raw literals with no token, no name and no reason.

---

## 3. Typography

**19 distinct rendered sizes:** 9, 10, 10.4, 11, 11.2, 12, 12.8, 13, 13.6, 14, 15, 16, 18, 20, 22, 24, 30, 34, 36 px.

Ten of those nineteen fall in the 10–15px band. That is where the apps quietly disagree: 10 vs 10.4, 11 vs 11.2, 12 vs 12.8 vs 13 vs 13.6, 14 vs 15. None of those differences is perceptible in isolation. All of them are permanent.

| App | Sizes | Scale source | Most-used |
|---|---:|---|---|
| App A | 12 | MUI variants + 5 one-off `sx` `fontSize` values | `body2` (74), `caption` (64) |
| Bindery | 9 | Tailwind steps + `text-[10px]`, `[11px]`, `[15px]` | `text-sm` ×412, `text-xs` ×237 |
| App D | 11 | Tailwind steps + `[9px]`, `[10px]`, `[11px]` | `text-sm` ×167, `text-xs` ×114 |
| App B | 7 | Tailwind steps + `text-[10px]` | `text-sm` ×78, `text-xs` ×54 |
| Project Mgmt | 11 | hand-set px, no ratio | 13px ×19, 12px ×13 |

`text-[11px]` appears 40 times in Bindery and 6 in App D — an arbitrary value used often enough to have earned a scale step, in two apps, without becoming one in either.

### Nobody loads their font

App A declares `"Inter", "Roboto", "Helvetica", "Arial"`. App C declares `-apple-system, "Inter", "Segoe UI"`. **Neither ships a `@font-face`, a Google Fonts link, or `next/font`.** A repo-wide search for font loading in App A, App C, App B and Bindery returns nothing. App A falls through Inter (absent) to Roboto (absent) to Helvetica.

**App D is the only app in the portfolio that loads the typeface it was designed against** — Fraunces, OFL, self-hosted, variable, roman and italic. It is also the only app using a serif, in 30 places, deliberately, as the product's voice.

Weights in use: Bindery 3 (`normal`/`medium`/`semibold`), App D 3, App B 3 (`medium`/`semibold`/`bold`), App C 4 (400/500/600/700), App A 2 declared. Bindery reaches for `font-medium` 125 times and `font-semibold` 22 — an implicit two-weight system that was never written down.

---

## 4. Spacing, radius, elevation

| App | Spacing base | Steps used | Radii | Shadows |
|---|---|---:|---|---|
| App A | 8px (MUI) | 8 | one: `8px` | 1 hard-coded on `MuiCard` |
| Bindery | 4px (Tailwind) | 17 | 4, 6, 8, 12, 9999 + `[2px]`, `[3px]` | `shadow-2xl` once in 52 files |
| App D | 4px (Tailwind) | 18 | 8, 12, 16, 24, 9999 | 5 Tailwind steps + 2 hand-written insets |
| App B | 4px (Tailwind) | 10 | 4, 8, 12, 16 | 4 steps, no rule |
| Project Mgmt | none | 17 raw px | 4, 5, 6, 8, 10, 999, 50% | 2 total |

App C's spacing includes 5px, 7px and 14px — values no scale produces. Its radii include a lone 5px and a lone 10px.

**Elevation has no shared theory.** Bindery separates surfaces with a 1.2:1 stroke and almost never uses shadow. App D uses shadow as atmosphere (inset glows, a paper-grain overlay). App A uses one Tailwind-derived card shadow. App B picks a step per call site. Five apps, five unrelated answers to "how does depth work here".

---

## 5. Components

**There is no `ui/` directory, no `Button.tsx`, and no `Input.tsx` anywhere in the five apps.**

| App | Hand-rolled `<button>` | Form controls | Distinct button recipes |
|---|---:|---:|---:|
| Bindery | 151 | 80 | 88 |
| App D | 114 | 50 | 49 |
| App B | 54 | 31 | 33 |
| Project Mgmt | 38 | 15 | 7 CSS rules |
| App A | 76 `<Button>` (MUI) | 55 `<TextField>`/`<Select>` | MUI variants |
| **Total** | **433** | **231** | **170 + 7** |

Also: **357 distinct card/container recipes** across the three Tailwind apps (Bindery 243, App B 51, App D 63).

App C is the only app with a real button abstraction — `.btn` plus five modifiers and a size. It is a CSS class in a 1,469-line stylesheet, it is not exported, and no other app can reach it.

### App D defines its primary button four times

| Where | Recipe |
|---|---|
| `components/Shell.tsx:100` | `rounded-lg bg-accent px-4 py-2 font-medium text-on-accent …` |
| `pages/StewardConsole.tsx:14` | `rounded-lg bg-accent px-5 py-2.5 font-medium text-on-accent …` |
| `components/Wizard.tsx:82` | `rounded-full bg-accent px-8 py-3 font-medium text-on-accent …` |
| `pages/Admin.tsx:120` | `rounded-full bg-inset px-4 py-1.5 text-xs …` |

The first two are near-identical copies differing only in padding; `StewardConsole` re-declares privately what `Shell` already exports. `cardCls` is likewise defined twice (`p-8` in one file, `p-4` in another). This is the app furthest along on design discipline.

### The same component, built repeatedly

| Concept | Independent implementations |
|---|---:|
| Application shell / sidebar | 5 |
| Modal / dialog | 4 |
| Login / auth screen | 5 |
| Empty state | 5 |
| Skeleton / loading | 5 |
| Badge / status chip | 5 (App C alone has 5 badge families) |
| Admin table + settings | 4 |
| Multi-step wizard | 3 |
| Avatar / person mark | 4 |
| Command palette (⌘K) | 2 |

Two independently written command palettes — `bindery/web/src/features/palette/CommandPalette.tsx` and `someday-vault/apps/web/src/components/CommandPalette.tsx` — is the clearest single argument for the library.

---

## 6. Accessibility — contrast

Measured against WCAG 2.2 AA (4.5:1 body text, 3:1 large text and UI component boundaries). **These are not matrix combinations — every pair below is a foreground and background that actually co-occur in the code.** 63 real pairs were found; **16 fail**, affecting **254 call sites**.

### Failures, worst first

| App | Pair | Ratio | Uses | Result |
|---|---|---:|---:|---|
| App D | `on-accent` on `canvas` | 1.06:1 | 1 | fails AA and 3:1 |
| App D | `white` on `canvas` | 1.08:1 | 1 | fails AA and 3:1 |
| App D | `on-accent` on `inset` | 1.17:1 | 1 | fails AA and 3:1 |
| App D | `ink-dim` on `canvas` | 2.16:1 | 15 | fails AA and 3:1 |
| App B | `gray-600` on `gray-900` | 2.35:1 | 10 | fails AA and 3:1 |
| Bindery | `neutral-600` on `ink` | 2.49:1 | 1 | fails AA and 3:1 |
| App B | `white` on `brand-accent` | 2.54:1 | 1 | fails AA and 3:1 |
| **App D** | **`ink-faint` on `canvas`** | **2.94:1** | **126** | **fails AA and 3:1** |
| App D | `accent` on `inset` | 3.05:1 | 1 | fails AA |
| App D | `accent` on `canvas` | 3.35:1 | 39 | fails AA |
| **App D** | **`on-accent` on `accent` — the primary CTA** | **3.55:1** | **8** | **fails AA** |
| App B | `red-400` on `gray-700` | 3.57:1 | 1 | fails AA |
| App B | `gray-500` on `gray-900` | 3.67:1 | 38 | fails AA |
| App B | `white` on `brand` | 3.68:1 | 6 | fails AA |
| App D | `success` on `canvas` | 4.03:1 | 4 | fails AA |
| App D | `danger` on `inset` | 4.40:1 | 1 | fails AA |

**App D's light theme is where the damage is.** `ink-faint` is used as body text in 126 places at 2.94:1 — below AA and below the 3:1 floor that applies to anything at all. The brand terracotta as text runs 3.35:1 in 39 places. The primary call to action fails at 3.55:1.

**The same theme passes in dark mode.** `on-accent` on `accent` is 9.08:1 there. The two themes were built to the same token names and never checked against each other, which is exactly what a dark mode bolted on beside a light one produces — and it is the app people pay for.

App D's dark theme has its own smaller version of the problem: `ink-faint` runs 3.78/3.50/3.07:1 on canvas/card/inset, and `ink-dim` runs 2.38/2.20/1.93:1.

### Form-field borders

`app-c/app/styles.css:56` outlines every `input`, `textarea` and `select` in `--line` — **1.35:1 on `--surface`**. WCAG 1.4.11 asks 3:1 of a user-interface component boundary. The field is invisible until focused.

**Bindery hit this exact bug, diagnosed it in a code comment, and shipped a second token to fix it:**

> `--color-field: #606c7e` — "`edge` is a card stroke — 1.2:1 against surface, which is all a divider needs to be. A form control's border is not a divider … WCAG 1.4.11 asks for 3:1 so the box can be found before it is focused."

That fix is correct, it is well reasoned, and it lives in one repo where the other four cannot use it. This is the audit's argument for a design system in a single example.

### What is already right

Not everything is broken, and the system should keep these rather than reinvent them:

- **Bindery and App D both use `:focus-visible`, not `:focus`** — the distinction that keeps keyboard focus styling switched on. Both ring in the app's accent at 2px with 2px offset. App A, App B and App C have no explicit focus treatment beyond browser or MUI defaults; App C's `--focus-ring` is a 0.35-alpha box-shadow on inputs only.
- **Both handle `prefers-reduced-motion`.** App D's motion comment explains *why* its entrance animations use `backwards` fill — a retained transform makes wrappers containing blocks and breaks every `position: fixed` overlay inside them. That is a real, hard-won constraint the system must inherit.
- **Bindery sets `color-scheme: dark`**, so browser-painted UI (date pickers, unstyled checkboxes, scrollbars, autofill) is not drawn light-on-black. Its comment records the bug that prompted it: the "I have written the passphrase down" checkbox rendered as a pale grey box.
- **Bindery enforces a 24px minimum target height** on `button`, `[role="button"]` and `select`, and ships a skip link.
- **App D's tokens are strictly semantic** — `canvas`, `card`, `ink`, `ink-mid`, `accent` — and components genuinely never know which mode they are in. Its raw-Tailwind-palette usage is **one utility in 40 files**. It is the discipline the other apps need.

---

## 7. What this means for Phase 1

Three things the audit settles, which the brief should not re-litigate:

1. **Dark mode cannot be a late addition.** Three of five apps are dark-only, one is light-first, one does both. The token layer has to be mode-agnostic from the first commit.
2. **The system is an extraction, not an invention.** Bindery's contrast reasoning, its `field`-vs-`edge` distinction and its `color-scheme` handling; App D's semantic-only token layer, its motion constraint and its self-hosted-font discipline — these are the design language, already written, in two places, in two vocabularies.
3. **App D will resist unification, and should.** Warm ivory, Fraunces, terracotta, paper grain and a daypart-reactive canvas are not drift — they are a deliberate, documented answer to "never morbid" for a product about death. The other four apps have no such claim. Phase 1 needs to decide whether the system is one skin or a shared structural layer with per-product expression, and the honest answer from the audit is the second.

Two things Phase 1 must ask about, because the audit cannot answer them:

- Whether the five brand colours collapse to one, or whether products keep an accent over a shared neutral and structural core.
- Whether App A stays on MUI. It is the only app carrying a component framework, the only one whose type scale is inherited rather than chosen, and the only one that would need a full rewrite rather than a migration.

---

## Method

Everything above was extracted mechanically from the repos at HEAD on 3 September 2026, not read off by eye:

- Colour values resolved from tokens, raw literals and the *actual* Tailwind v4 palette (`tailwindcss/theme.css`), converted OKLCH → sRGB, then clustered by OKLCH hue with a chroma floor of 0.045 separating tinted neutrals from true hues.
- Button, input and card recipes parsed from JSX with named class constants (`primaryBtn`, `ghostBtn`, `wizardNext`) resolved to their definitions, so a recipe used via a constant is counted once, not once per call site.
- Contrast computed only for foreground/background pairs that co-occur in the same `className`, or where the element inherits a known app surface — no theoretical matrix pairs.
- Specimens in the companion HTML are compiled from the exact class strings and CSS rules in the repos, so the page shows what the apps render, not an approximation.
