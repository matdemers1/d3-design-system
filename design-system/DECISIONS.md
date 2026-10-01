# Design system — decision log

Every decision, what it rules out, and when it was made. Append-only.

---

### D-001 · Repo scope for the design system
**Date:** 2026-09-03
**Question:** Which repos should Phase 0 audit, and which will the component library ship into?
**Chosen:** Product apps only, no marketing sites — **App A, Bindery, App D, App B, App C**.
**Why:** These five are the apps where a shared library pays for itself: dense, stateful, long-lived UI with real overlap (5 app shells, 4 modal systems, 2 command palettes). Marketing sites solve a different problem and would drag the token set toward expressive layout it does not need.
**Rules out:**
- The two marketing sites keep bespoke design and will drift from the system by design. One of them is a client site, so this is the right call, but it means the portfolio still has two visual identities after this work.
- The two games are excluded — their art direction is deliberately divergent. One excluded app is currently the **only** repo using headless primitives (9 Radix packages); excluding it means the system cannot inherit that work and must make its own primitive choice in Phase 5.
- `subtitler`, the YouTube dashboard, and the unbuilt `bambu` frontend are excluded as personal/unstarted.

---

### D-002 · Target platforms
**Date:** 2026-09-03
**Question:** What has to be able to consume the finished system?
**Chosen:** **Web app UI only.**
**Why:** Keeps the token set optimised for dense product interfaces rather than compromising between app and marketing contexts.
**Rules out:**
- No token bridge to the four Swift apps. If that is wanted later it is a Phase 3 export format decision, and retrofitting is cheaper than compromising now — but the four iOS apps stay visually unrelated to the web portfolio indefinitely.
- No marketing-page component tier (hero, feature grid, pricing table, testimonial). App D's `Landing.tsx` and `Pricing.tsx` are therefore **in** the audited codebase but **out** of the library's remit; they will keep bespoke components.

---

### D-003 · Audience, and the accessibility floor it implies
**Date:** 2026-09-03
**Question:** Who actually uses these apps?
**Chosen:** **Internal tools** (Bindery, App C, App B) **and paying customers** (App D, App A).
**Why:** Two audiences with genuinely different tolerances, in one system.
**Consequences:**
- Density can lean toward the internal end — these are archives, boards and inboxes, not brochures.
- **WCAG AA is a floor, not a target, and it is non-negotiable for the commercial apps.** The audit found the App D primary CTA at 3.55:1 and its most-used muted text at 2.94:1 across 126 call sites. A system that ships without fixing that has failed at its first job.
- Not chosen: "portfolio audience". The system does not have to perform for prospective employers, which frees it to be plain where plain is correct.

---

### D-004 · Where the design system lives
**Date:** 2026-09-03
**Question:** `design-system/` at the workspace root, or in the Obsidian vault per `CLAUDE.md`?
**Chosen:** `design-system/` at the workspace root, as the brief specifies.
**Why:** Tokens, explorations and (from Phase 5) real component code are build artefacts and source, not planning documents — they need to sit next to the repos that consume them. `CLAUDE.md` forbids cross-project docs *inside project repos*; the workspace root is neither a project repo nor the vault.
**Follow-up:** Narrative decisions worth preserving — the brief, the three directions, the ADR for the token architecture — should be mirrored into `D3 Cloud Vault/Master Notes/Architecture/` once Phase 2 locks a direction. Not yet: nothing is settled enough to write down there.

---

### D-005 · App D removed from scope
**Date:** 2026-09-03
**Question:** Does the design system have to accommodate App D?
**Chosen:** **No.** App D keeps its own design language. The system targets **App A, Bindery, App B and App C** — four apps.
**Why:** App D's warm ivory, Fraunces serif, terracotta, paper grain and daypart-reactive canvas are a deliberate, documented answer to "warm and comforting, never morbid" for a product about death. That is a product decision, not drift, and unifying it would damage it.
**Consequences:**
- **The remaining four apps are all dark-first or dark-only.** App A is the only one with a light theme, and it is MUI's default rather than a designed one. This substantially simplifies Phase 3: dark is the primary mode, not a parallel obligation.
- The system loses its only serif, its only light-first product, and its only self-hosted font. Whatever typeface the system picks now has to be chosen and loaded from scratch — no existing app loads one (see AUDIT.md §3).
- **The single worst accessibility finding leaves with it.** The 126 uses of `ink-faint` at 2.94:1 and the 3.55:1 primary CTA are now App D's own problem to fix, outside this system. Remaining contrast failures are App B's (`gray-500`/`gray-600` on `gray-900`, 48 call sites) and App C's 1.35:1 field border.
- App D's *reasoning* is still inherited even though its look is not: semantic-only tokens, `:focus-visible`, the `backwards` fill-mode motion constraint. Recorded in AUDIT.md §6.
- Revised headline scope: **4 apps · 5 app shells → 4 · 2 command palettes → 1 · 319 hand-rolled buttons.**

---

### D-006 · Reaction test result (Phase 1a)
**Date:** 2026-09-03
**Question:** Unprimed hot/cold reaction to twelve aesthetics rendering an identical App A triage fragment.
**Result:**
- **Liked:** 02 (soft rounded, violet), 05 (high-contrast dark technical, mint), 06 (flat pastel, coral), 12 (warm cozy dark, sage)
- **Disliked:** 01 (brutalist), 03 (dense enterprise), 04 (editorial serif), 08 (glassy), 09 (retro terminal), 10 (Swiss grid)
- **Interesting but rejected as a system language:** 11 (neo-brutalist hard shadow)
- **No reaction:** 07 (sharp monochrome)

**What the picks have in common — the actual brief:**
1. **Filled, not outlined.** All four liked variants build controls from tinted fills; every rejected variant leans on strokes, rules or hairlines.
2. **Rounded, never square.** Every zero-radius variant (01, 04, 09, 10) was rejected. Liked radii run 4–22px.
3. **One confident chromatic accent, applied as a solid fill.** Violet, mint, coral, sage — saturated but not loud, and always the CTA's background rather than its border.
4. **No typographic performance.** No serif, no display sizes, no mono as a primary voice. Title-to-meta size ratio in the liked set is ~1.4:1; in the rejected editorial and Swiss variants it is ~2:1. Emphasis comes from weight, not scale.
5. **Mono is a metadata voice, not a UI voice.** Accepted in 05 for timestamps and labels; rejected in 01 and 09 where it sets everything.
6. **Mode-independent taste.** Two liked variants are light (02, 06), two are dark (05, 12). The preference is about surface treatment, not about light or dark.
7. **Comfortable density.** The only explicitly dense variant (03) was rejected.

**Rules out:**
- Brutalism, Swiss/editorial typography, terminal aesthetics, glassmorphism, and the default enterprise look. None of these returns in Phase 2.
- **A bordered design language.** Cards, inputs, chips and badges are surfaces, not outlines. This is a structural decision, not a colour one — it changes how elevation, separation and states are expressed throughout Phase 3d.
- Serif anywhere in the system.
- Expressive-by-default character (per the 11 note): personality is welcome in a single element, not as the system's baseline posture.

**Open tension to resolve in 1b:** the liked set is spacious, but the four in-scope apps are a document archive, a triage inbox, a chat client and a kanban board — all dense, table-heavy, list-heavy products. The taste and the workload disagree.

---

### D-007 · Density: comfortable everywhere, no compact mode
**Date:** 2026-09-03
**Chosen:** One spacing scale. Comfortable is the default and the only mode.
**Consequence, stated and accepted:** Bindery's list rows are `py-1.5` + `text-sm` ≈ 32px today; comfortable lands nearer 44px — roughly a third fewer rows per screen. App A's inbox currently sets MUI `size="small"` on every control, so its density need is demonstrated, not hypothetical. This cost was on the table when the choice was made.
**Interpretation (flagged in BRIEF.md for correction):** "no compact mode" = no user-facing density toggle and no second set of spacing tokens. It does *not* mean every component shares one padding value — a list row, table row and message row each get an appropriate vertical rhythm inside their own component spec, decided once rather than exposed as a switch.
**Rules out:** a `density` token, a `compact` prop on data components, and per-app spacing overrides.

---

### D-008 · One accent colour across all four apps
**Date:** 2026-09-03
**Chosen:** A single accent. Bindery's amber `#d8a657`, App A's indigo `#6366f1`, App C's teal `#4fa188` and App B's blue `#3b82f6` all retire.
**Why:** The four apps should read as one product line. Family resemblance comes from hue as well as structure.
**Rules out:** per-product accents, and the "shared neutral core + product accent" model.
**Open — deferred to Phase 2/3a:** *which* hue. Constraint discovered while writing the brief: of the four accents that tested well, **mint and sage collide with `success` and coral collides with `warning`/`danger`.** Violet and blue are the only two that don't fight a standard semantic palette. Blue additionally has the only existing claim — `#3b82f6` is already the d3cloud.io accent and App B's brand — but it was the one family that drew no positive reaction in the test. The three Phase 2 directions must render this trade-off rather than assert it.

---

### D-009 · Radix primitives + own styling layer
**Date:** 2026-09-03
**Chosen:** Headless Radix primitives for anything with real accessibility complexity (dialog, menu, combobox, tooltip, popover, tabs); all styling is ours.
**Why:** Proven in this workspace already — one app here runs 9 Radix packages. We own every visual decision and none of the focus-management or ARIA plumbing.
**Rules out:** hand-rolled dialogs and comboboxes; shadcn-style copy-in (the copies-drift failure mode the audit documented); any pre-styled library as the substrate.

---

### D-010 · App A migrates off MUI
**Date:** 2026-09-03
**Chosen:** Remove MUI + Emotion from App A and rebuild it on the system.
**Scope:** 58 components, 76 `<Button>`, 55 `<TextField>`/`<Select>`, plus the MUI theme file.
**Why:** The only option where all four apps genuinely converge. App A also stops being the one app whose type scale was inherited rather than chosen.
**Rules out:** theming MUI from system tokens; maintaining two component libraries; a three-app system.
**Note:** This is the largest single migration in the project and should be sequenced last in Phase 6, after the other three apps have proved the component set.

---

### D-011 · Dark is primary, light is first-class
**Date:** 2026-09-03
**Chosen:** Dark is the system's primary mode. Light is built from the first commit, not added later.
**Why:** All four in-scope apps are dark-first or dark-only; App A's light theme is MUI's default rather than a designed one. But two of the four aesthetics that tested well were light, so light cannot be a degraded afterthought.
**Rules out:** a dark-only token set; any component whose states are only specified in one mode.
**Status:** my assumption from the audit, stated in BRIEF.md for correction rather than asked.

---

### D-012 · WCAG AA is the floor
**Date:** 2026-09-03
**Chosen:** AA minimum on every shipped pair, full keyboard operability, a designed focus ring.
**Why:** App A has paying customers. The audit found App B's muted text at 3.67:1 across 38 call sites and App C's form-field border at 1.35:1.
**Rules out:** shipping any token pair without a measured ratio; inheriting browser or Radix default focus styling.
**Not chosen:** AAA — unrealistic for dense product UI and not warranted by the audience (D-003).
**Status:** my assumption, stated in BRIEF.md for correction rather than asked.

---

### D-013 · Fields carry a 3:1 boundary; nothing else does
**Date:** 2026-09-03
**Question:** The brief says the language is fills, not outlines. But WCAG 1.4.11 requires a user-interface component to be distinguishable from its surroundings at 3:1 — and a filled field on a filled page is not.
**Chosen:** Inputs, selects, textareas and checkboxes carry a 1px `field` border solved to ≥3:1 against every surface they sit on. Cards, chips, badges, tabs, the bulk bar and the table carry no border at all.
**Why:** It resolves the collision without weakening either side, and it is the same distinction Bindery reached independently with its `edge` (1.2:1 divider) / `field` (3.3:1 control boundary) split — the single best piece of reasoning found in the Phase 0 audit.
**Applies to:** all three Phase 2 directions, and to whatever is locked.
**Rules out:** borderless fields; a single `border` token used for both dividers and controls (the mistake App C made at 1.35:1).

> [!note] Amended 2026-10-01 by D-084
> Two non-field controls now carry the 1px `border-field` edge, because tone alone left them unfindable: the **SegmentedControl thumb** (1.12:1 light / 1.43:1 dark against its track, PST-DA-048) and the **secondary Button** (1.04:1 against a light `surface`, PST-DA-057). The principle is unchanged — a boundary marks something that must be found — and these two turned out to be such things.

---

### D-014 · Palette validation is part of authoring, not review
**Date:** 2026-09-03
**Chosen:** No token value is written by eye. Where a colour fails its floor, its lightness is solved numerically in OKLCH with hue and chroma held fixed, then re-checked.
**Evidence:** the first draft of all three directions failed — 21 pairs across six themes, every one of them either the field boundary (2.1–2.9:1 against 3.0) or the tertiary text token (3.9–4.5:1 against 4.5). Twelve values were solved and every theme now passes 30 pairs in both modes.
**Rules out:** shipping a token whose contrast has not been measured; hand-tuning hex values in review.
**Open, flagged on every direction page:** the priority dot conveys meaning by colour alone. All four steps now clear 3:1, but critical and high are not distinguishable without colour vision. This is a component-spec fix (shape or label), not a palette fix — Phase 4.

---

### D-015 · Direction locked: Quiet
**Date:** 2026-09-03
**Question:** Which of the three Phase 2 directions becomes the system?
**Chosen:** **Quiet** — violet accent, cool blue-grey neutrals, tonal elevation with no shadows, 8/10/14px radii, 14px base, 48px table rows, conventional status hues.
**Why:** Preferred on sight. It is also the reading of the brief that removes the most: four flat greys, one accent, no shadow anywhere, and no collision between the accent and the status palette.
**Consequences:**
- **The accent is violet.** `#8f80f7` in dark, `#5a44d4` in light are the Phase 2 values; the exact steps get resolved when the full ramp is built in Phase 3a.
- **d3cloud.io's blue is not inherited.** The landing site and the four products will not share an accent unless the site is later brought to the system. Hearth was the only direction offering that continuity and it was not chosen.
- **Zero shadows in the system.** Elevation is tone: a nearer surface is a step lighter. This has to hold for the modal, popover, dropdown menu, tooltip and toast — every component whose conventional implementation reaches for a shadow. Phase 3d has to make that work rather than quietly reintroduce elevation.
- Bindery's amber, App A's indigo, App B's blue and App C's teal all retire (D-008).
**Rules out:** Signal's flat/zebra table treatment, Hearth's warm neutrals, shadow-based elevation, and green or blue as the accent.
**Not yet decided:** whether to adopt Signal's de-chromatised status logic, which is separable from hue.
**Naming:** "Quiet" was an exploration label. The system will want a real name before Phase 5.

---

### D-016 · Status is neutral by default; hue is spent only on "needs you"
**Date:** 2026-09-03
**Question:** Does Quiet keep conventional status hues, or adopt Signal's de-chromatised rule?
**Chosen:** Neither wholesale. **Status pills are neutral by default. Colour is spent only on the small number of states that demand action.**
**Why:** Colour-coding reliably distinguishes about five categories. App A already ships seven statuses (`new`, `in_review`, `awaiting_response`, `response_received`, `sent_to_backlog`, `dismissed`, `snoozed`), so a fully chromatic scheme was already past what hue can carry — it was decoration, not information. This keeps status scannable where scanning matters and keeps a forty-row table calm everywhere else.
**The rule:** a status earns a hue only if seeing it should change what the user does next. Everything in progress, parked or terminal is neutral.
**Worked example — App A triage** (per-app mappings finalised in Phase 4):

| Status | Treatment |
|---|---|
| `new` | accent — unprocessed, needs triage |
| `response_received` | accent — the customer replied, it is back on you |
| `awaiting_response` | neutral — parked on someone else |
| `in_review` | neutral — in progress |
| `sent_to_backlog` | neutral — resolved |
| `snoozed` | neutral, dimmed |
| `dismissed` | neutral, dimmed |
| blocked / failed | danger — the only other hue status may use |

**Rules out:** a status palette with one hue per state; `success` green and `info` blue as routine status colours. `success`, `warning` and `info` remain in the token set for alerts, toasts, validation and inline messaging — they simply stop being how a table communicates state.
**Consequence for Phase 4:** the Badge/Status component takes a semantic `tone` (`neutral` | `attention` | `danger`), not a free colour. Which statuses map to which tone is an app-level decision made once per app, not per call site.

---

### D-017 · Text aliases are emitted as `fg` in the Tailwind layer
**Date:** 2026-09-03
**Question:** Tailwind v4 derives utility names from token names, so a token called `text-muted` generates `text-text-muted`.
**Chosen:** The token source keeps the brief's names — `text`, `text-muted`, `text-faint`. The generated Tailwind theme emits them as `fg`, `fg-muted`, `fg-faint`, producing `text-fg-muted`.
**Cost:** three tokens are called two things depending on which layer you are reading. That is a real smell in a system whose whole point is one name per thing.
**Alternative rejected:** renaming the canonical tokens to `fg` everywhere, which reads worse in the DTCG source and in plain CSS (`color: var(--color-fg)` is less obvious than `var(--color-text)`).
**Status:** flagged on the 3a page for approval or reversal. If reversed, the rename disappears and component code writes `text-text-muted`.

**Closed in D-058 (2026-09-15): `fg` everywhere.** The canonical tokens are now `--color-fg*`, so there is one name at every layer.

---

### D-018 · Phase 3a colour foundations
**Date:** 2026-09-03
**Built:** six OKLCH ramps × 12 steps, 19 semantic aliases, dark and light mappings, generated CSS and Tailwind theme.
**Decisions inside it:**
- **12 steps per ramp, not 11.** A dark-first system with no shadows needs five closely-spaced dark surface steps (`bg-sunken`, `bg`, `surface`, `surface-raised`, `surface-hover`) *and* wide middle spacing for text contrast. Eleven evenly-spaced steps cannot serve both.
- **The lightness ladder is non-linear** — tight at both ends, wide through the middle — for the same reason.
- **Chroma is clamped, never lightness or hue.** Where a requested chroma falls outside sRGB, chroma is reduced by binary search while L and H are held exact, which is what keeps the ramps perceptually even and the hue families coherent.
- **Ramp hues are measured from the locked Quiet palette,** not invented: accent h=286.6, warning h=79.8, danger h=21.4, success h=157.8, info h=248.3.
- **`border-field` resolves to `neutral-500` in both modes** — the same step satisfies 3:1 against every surface in dark and in light.
- **Light-mode elevation ascends to white:** sunken `neutral-200` → bg `neutral-100` → surface `neutral-50` → raised `white`. This is how the no-shadow rule (D-015) survives light mode, where tonal lift would otherwise have nowhere to go.
**Validation:** 106 shipped pairs measured, zero failures. The first build failed eight — six were the light tertiary text token and two were chromatic tokens on a hovered row. Fixed by moving one ladder value (`L[700]` 0.330 → 0.310) and remapping light `text-muted`/`text-faint` one step darker.
**Correction made during review:** the first contrast matrix flagged 36 "failures" that were cross-product pairings no component renders. The matrix now holds only shipped pairings to a floor and shows the rest greyed for reference. A matrix that fails combinations nothing produces is noise, and noise is how real failures get ignored.
**Open:** the priority dot still conveys meaning by colour alone (carried from D-014). Phase 4.

---

### D-019 · Type scale, weights, measure and the mono face
**Date:** 2026-09-03
**Decided without asking** (these are ratios and rules, not taste):

**Scale — seven sizes, topping out at 24px.**

| Size | Ratio | Role | Weight | Line height |
|---|---|---|---|---|
| 11px | 0.79× | uppercase label, table header, keyboard hint | 600 | 1.3 |
| 12px | 0.86× | metadata, caption, validation error | 400 / 600 | 1.5 |
| 13px | 0.93× | dense label, chip, button | 500 / 600 | 1.4 |
| 14px | 1.00× | body — base | 400 / 500 | 1.55 |
| 16px | 1.14× | emphasis, empty-state heading | 500 / 600 | 1.5 |
| 20px | 1.43× | section title | 600 | 1.35 |
| 24px | 1.71× | page title | 650 | 1.25 |

The audit found nineteen sizes across the four apps with ten crammed between 10 and 15px. This scale puts four steps in that band — 11, 12, 13, 14 — each with a distinct job and none a near-duplicate of another. **There is no display size**, because the brief rules out typographic performance: emphasis is weight, so 14px/600 outranks 16px/400.

**Weights — four, no italic.** 400 body · 500 anything interactive · 600 headings, labels, primary button · 650 page title only. Bindery had already converged on an unwritten two-weight system (`font-medium` ×125, `font-semibold` ×22); this writes it down and adds one.

**Measure.** Body 65ch ideal / 75ch hard max · table cell 38ch then truncate with a tooltip (matches App A's existing 300px clamp) · empty state and helper text 50ch · validation errors full field width, never truncated.

**Tabular figures are on by default for every numeric cell**, not a per-component choice. Measured across the four candidates, all-ones versus all-eights differs by 2.0–2.6em over ten digits, so proportional figures make every column wander — and Bindery and App A both poll, so a changing value visibly jitters in place.

**Monospace: JetBrains Mono (SIL OFL 1.1).** Reference IDs, timings, byte counts, hashes, keyboard hints — the metadata voice the reaction test endorsed and the UI voice it rejected. Already vendored elsewhere in the workspace, so it is a known quantity. Not up for a vote.

**Open:** the sans family. Four OFL candidates rendered and measured in `03b-typography.html`.

---

### D-020 · Sans family: Inter
**Date:** 2026-09-03
**Chosen:** **Inter** (SIL OFL 1.1, Rasmus Andersson), variable, self-hosted.
**Why:** Measured largest x-height of the four candidates at 0.546em — 6.00px of actual lowercase at the system's 11px step, against Figtree's 5.50px. This system's smallest step is 11px and it leans hard on 12px for table metadata, reference IDs and validation errors, which is exactly where x-height decides legibility. Legibility beat novelty.
**The tension, acknowledged:** Inter is the default UI face of the Tailwind/Vercel world, and "a system that looks like untouched Tailwind" is a stated non-goal (BRIEF.md). The mitigation is that nothing else about this system is default — tonal elevation with zero shadows, a filled rather than outlined language, de-chromatised status, and a violet accent are all doing the differentiating. The font was never going to carry the point of view on its own.
**Also:** both App A and App C already *declare* Inter and never load it, so this is the first time either will actually render the face it asks for.
**Rejected:** Geist (−2.9% x-height, more character), Instrument Sans (−6.6%, and only ships 400–700 so the 650 title weight would round to 700), Figtree (−8.4%, roundest).
**Shipped:** `tokens/fonts/` — Inter and JetBrains Mono, latin and latin-ext variable subsets, 189 KB total, with `unicode-range` so latin-ext only downloads when a page needs it.

---

### D-021 · Spacing, breakpoints and the shell
**Date:** 2026-09-03

**Base unit 4px, twelve steps:** 2 · 4 · 6 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64. 6px is the only step off the grid and it earns its place — 4px is too tight inside a button and 8px too loose at 13px type. The audit found Bindery on 17 steps, App D 18, and App C on 17 raw pixel values including 5, 7 and 14. Anything off this scale becomes a lint error in Phase 6.

**Four breakpoints, not six:** sm 640 · md 768 · lg 1024 · xl 1280. Tailwind's defaults, kept deliberately — three of the four apps already use them and inventing different numbers buys migration churn and nothing else. **2xl is dropped**: the four apps reference it zero times and `xl` once. A breakpoint nobody uses is still a state somebody has to test.

**The shell is Bindery's, adopted wholesale.** 240px column at `lg` and above, collapsible to 64px by user choice and persisted in `localStorage`, off-canvas drawer with a scrim below it.
- Today: Bindery 224px / collapses / drawers at lg · App B 256px / **no responsive behaviour at all** · App C 260px / drawers at md · App A 240px / drawers at sm.
- Bindery's own code comment justifies the sidebar — eleven destinations do not fit in a top bar — and that reasoning holds for App A's fourteen.
- **App B gains responsive behaviour it has never had.** Its sidebar is currently a fixed 256px column that breaks below roughly 900px.

**Columns drop, they do not shrink.** Below `md` a data table loses Date; below `sm` it loses Submitter. Description and Status survive every width, because a triage row that cannot be identified or acted on is not a row.

**Data pages cap at 1280px** (`--container-wide`). The audit found no max-width on any table page in any app — on a 4K monitor a Bindery archive row is ~3,000px wide and the eye has to travel the whole way to connect a filename to its date.

**Page rhythm:** page padding 24px, 32px at `lg` · row height 48px · cell padding 12/16 · card and modal padding 20px · region gap 24px · dashboard grid 12 columns with a 24px gutter, collapsing to one below `md`.

**Rules out:** per-app breakpoints, per-app sidebar widths, `2xl`, arbitrary spacing values, and unbounded table pages.

---

### D-022 · Correction: the tonal ladder was not ordered
**Date:** 2026-09-03
**Found while building 3d.** The 3a mapping put `surface-raised` at `neutral-800` (L 0.275) and `surface-hover` at `neutral-700` (L 0.310) — so **a floating panel was darker than a hovered row.** A tooltip opening over a hovered table row sat *below* it tonally.
**Why it matters here specifically:** in a system whose only depth cue is tone, an unordered ladder is not a nitpick, it is the mechanism failing.
**Fixed:** `surface-hover` → `neutral-800`, `surface-raised` → `neutral-700`. The ladder is now monotonic in dark: 0.143 → 0.180 → 0.225 → 0.275 → 0.310.
**Also fixed in the same pass:** light-mode `surface-hover` was `neutral-200`, the same value as `bg-sunken` and a heavier darkening than a row hover wants; it is now `neutral-100`.
**Re-validated:** 124 pairs across both modes, zero failures. 3a's tokens, generated CSS and page were regenerated.
**Lesson recorded:** contrast validation alone would never have caught this — every pair passed. Ordering is a separate property from contrast and needs its own check.

---

### D-023 · Shape and the shadow-free elevation model
**Date:** 2026-09-03

**The rule: elevation is tone, detachment is a boundary.**
- **Resting surfaces** — shell, page, card, hovered row — differ by tone alone and carry no border.
- **Floating layers** — menu, popover, tooltip, toast, modal — sit at `surface-raised` *and* carry a 1px `border-float` at 3:1.
- **A modal adds a scrim.** Nothing else does.

**Why a boundary at all, in a system that chose "filled, not outlined":** in light mode the tonal ladder terminates at white, so a menu opening over a white card has no lighter step available. The alternatives were running two different elevation mechanisms in the two modes, or reintroducing a shadow. One rule in both modes is cheaper to hold and it also solves the genuinely hard case — a menu opening *inside* a modal, where tone has already been spent. This is the same principle as D-013: a boundary marks something that must be found, not something that wants decoration.

**New token:** `border-float` (`neutral-500` in both modes — the same primitive as `border-field`, kept as a separate alias so the two roles can diverge later without hunting call sites).

**Radius — five steps:** xs 6 (checkbox, keyboard hint) · sm 8 (chip, status pill) · md 10 (button, input, select, menu item, tab) · lg 14 (card, table, modal, menu panel) · full 999 (pill, avatar, switch).

**Border weight — one value: 1px.** No 2px border anywhere. Selection is a fill (`accent-muted`), not a thicker outline. Two roles, one weight: `border` is a decorative divider with no contrast requirement; `border-field` and `border-float` are findable boundaries held to 3:1.

**Focus ring — 2px `outline`, 2px offset, always the accent, on `:focus-visible` only.**
- `outline` rather than a `box-shadow` ring, so the offset reveals the surface behind the control — a violet ring drawn tight against a violet button would vanish. It also keeps the no-shadow rule literal rather than technically-honoured-via-`box-shadow`.
- Verified at 3:1 or better against all six grounds a focusable element can sit on: `bg`, `bg-sunken`, `surface`, `surface-hover`, `surface-raised`, `accent-muted`.
- `prefers-contrast: more` widens it to 3px.

**Enforcement:** `theme.shape.css` sets Tailwind's seven `--shadow-*` keys to `initial`, so `shadow-md` and friends do not exist as utilities. Reaching for a shadow is a build-visible act, not a quiet one.

**Verification:** the 3d page was checked programmatically — zero elements in any rendered component had a computed `box-shadow`. Amended by D-075: **shadows only on the listed components** — `--shadow-float` on Menu, Tooltip, Toast, Modal and RecipientField's suggestion list, `--shadow-sheet` on AppShell `navTone="recessed"` `<main>` — checked on every story in both themes by `browser/elevation.spec.ts`. An inset ring drawn inside a control is a boundary, not a shadow.

---

### D-024 · Motion: Expressive, except the menu family
**Date:** 2026-09-03
**Prompted by:** "Animation is something I'd really like to lean heavy into."
**Chosen, per interaction:**

| Interaction | Tier | Enter |
|---|---|---|
| Modal | **Expressive** | 420ms spring, rises from 26px with overshoot |
| Toast | **Expressive** | 420ms spring, plus the checkmark drawing itself |
| Tab switch | **Expressive** | 280ms spring, the pill travels between tabs |
| List load | **Expressive** | 280ms spring, 80ms stagger — **first paint only** |
| Row dismissal | **Expressive** | 420ms spring, the row leaves sideways then collapses |
| **Dropdown menu** | **Confident** | 200ms ease-out, no overshoot, no item stagger |
| **Popover** | **Confident** | 200ms ease-out — extended by the same reasoning |
| **Tooltip** | **Confident** | 140ms fade — fastest of the family |

> [!note] Amended 2026-09-29 by D-073
> Four rows retuned for high-frequency use: **toast** 200ms spring rising 16px (was 420ms from 26px), exit 140ms (was 280ms); **row dismissal** 180ms ease-in, no overshoot (was 420ms spring); **tab switch** 160ms ease-out, no overshoot (was 280ms spring). The modal, list load, drawer and the menu family are unchanged. Token names are unchanged.

**The menu carve-out is the user's call and it is the right one.** A menu is opened dozens of times an hour; a choreographed entrance with staggered items is charming the tenth time and tiring the hundredth. A modal is occasional, so it can afford theatre. I extended the ruling to popovers and tooltips, which are the same family for the same reason.

**This amends BRIEF.md.** The restrained↔expressive slider was "strongly restrained"; it is now split — restrained in the static picture, expressive in motion. Amended in the brief itself rather than left as a contradiction between two documents.

**Guardrails, and they apply at every tier — they are not the price of choosing Expressive:**
- Never animate a table row whose *content* changed on a poll. Bindery and App A both repoll; animating self-updating values turns a quiet screen into a slot machine. New rows may enter on first paint; a changed cell just changes.
- Never animate a route change inside a data view — it makes the app feel slower and delays what the user came to read.
- Never animate text reflow, column widths or table layout. Columns drop at a breakpoint; they do not slide.
- Never animate the focus ring. It must appear on the same frame as the keypress.
- Never animate validation errors appearing — an error that animates in reads as decoration.
- Skeletons get one slow shimmer and nothing more.

**Inherited constraint (from App D, out of scope as a product but right about this):** entrances animate *from* an offset *to* the element's natural state with `animation-fill-mode: backwards`, never `forwards`. A retained transform turns the wrapper into a containing block and silently breaks every `position: fixed` overlay inside it.

**Reduced motion is a supported mode, not a downgrade path:** every tier collapses to opacity-only at 0.001ms. The 3e page honours it itself, so on a machine with the setting on, the demos are correctly static rather than broken.

---

### D-025 · Iconography: Lucide, four sizes, stroke as a function of size
**Date:** 2026-09-03
**The state today:** Bindery imports 49 icons from **Lucide**; App A imports 27 from **@mui/icons-material**; App B hand-rolls **19 inline SVGs** across two viewBoxes; App C has **no icons at all** — no library, no SVG.

**Chosen: Lucide** (ISC, 2,022 icons, v1.35.0). Already vendored and proven in Bindery across 36 files, drawn on a consistent 24×24 grid, tree-shakeable. **All 27 of App A's MUI icons map one-to-one** — the mapping is written to `migration/mui-to-lucide.json` as a machine-readable artifact, and it removes `@mui/icons-material` along with MUI itself (D-010).

**Four sizes, each with its own stroke-width:**

| Size | stroke-width (viewBox) | rendered |
|---|---|---|
| 14px | 2.0 | 1.17px |
| 16px | 1.8 | 1.20px |
| 20px | 1.6 | 1.33px |
| 24px | 1.5 | 1.50px |

Lucide defaults to stroke-width 2, which at 11px renders a **0.92px** line — under one device pixel, so it blurs on any 1× display. Bindery renders icons at eight sizes (11, 12, 13, 14, 15, 16, 19, 44) all at the default, so its icon weight varies by 45% across a single screen. Pairing each size with its own stroke keeps the rendered line inside a 1.17–1.50px band.

**Pairing rule: the icon box is one step larger than the text.** 12px text takes a 14px icon; 14px text takes 16px. A stroke glyph reads lighter than a letterform of the same height, so matching the em box makes the icon look shrunken. Alignment is `display:inline-flex; align-items:center` — never `vertical-align`, never a hand-tuned `margin-top`, both of which break when a line-height changes.

**Icon-only is allowed** when the action is non-destructive and reversible, sits in a persistent learnable location, carries an `aria-label` (always), has a tooltip on hover *and* keyboard focus, and belongs to a small learnable set. **Icon-only is forbidden** for anything destructive, anything that spends money or messages a person, anything appearing only a handful of times, the primary action of a page or dialog, and anywhere the icon is the only signal of a state.

**Three animated icons and no others:** disclosure chevron rotating 180° over 200ms, loading spinner at 1s linear, confirmation check drawing once. Motion is expressive (D-024) but icons are not where that budget goes — an icon animating for decoration competes with the layer animations carrying real meaning, and in forty rows it is noise.

**Custom icons** only where Lucide has no equivalent (the D3 Cloud mark; Bindery's document-type glyphs). Same constraints so they do not read as guests: 24×24 viewBox, stroke-based, round caps and joins, 2-unit nominal stroke, no fills except where the shape *is* the meaning.

---

### D-026 · The colour-only priority indicator is fixed
**Date:** 2026-09-03
**Closes:** the open accessibility item carried from D-014 and D-018.
**Was:** four identical 8px circles distinguished only by hue. After 3a every step cleared 3:1, so they were *visible* — but critical and high were indistinguishable without colour vision, and the dot carried no accessible name.
**Now:** four distinct silhouettes at 14px, each with an `aria-label` — filled circle (critical), filled triangle (high), filled square (medium), bar (low). Colour still carries urgency for everyone who can see it; shape carries it for everyone who cannot.
**Generalised as a rule:** an icon may never be the only signal of a state. It is recorded in `icon.json` under `d3.icon-only-forbidden` so it applies to future components, not just this one.

---

### D-027 · Voice and content
**Date:** 2026-09-03
**Grounded in:** every "today" example is a real string pulled from the four apps.

**Casing: sentence case for everything a person reads.** Buttons, form labels, headings, navigation, dialog titles, menu items, empty states, tooltips. Capitals only for the first letter and proper nouns. The audit found forms in Title Case ("Confirm New Password", "Display Name", "Claude Model") sitting beside buttons in both cases ("Mark all read" vs "Set Priority", "Add Repository"). The 11px uppercase micro-label is **not** an exception to this — it is a CSS `text-transform` treatment, so the source string stays sentence case and stays translatable. Never type an uppercase string into source.

**Dates — the biggest defect found in this sub-phase.** There are **31 bare `toLocaleDateString()` / `toLocaleString()` calls** across the four apps and exactly one that passes options. The same timestamp therefore renders `8/12/2026` for one user and `12/08/2026` for another, in tables where that changes the meaning.
- Relative up to 7 days (`2 hours ago`, `yesterday`), absolute after (`12 Aug`, `12 Aug 2025`).
- **The month is always a word.** Pin the options — `{ day:'numeric', month:'short', year:'numeric' }` — and let the locale choose the order. Never call `toLocaleDateString()` bare; never hard-code a locale.
- Every relative time carries the absolute one in its `title`. Relative stops at a week — "47 days ago" is arithmetic the reader has to undo.

**Numbers — one formatter, not twenty-three call sites.** The audit found 23 references to `1024` and four different `toFixed()` precisions (0, 1, 2, 4). Counts grouped with tabular figures; bytes base-1024 with KB/MB/GB and one decimal below 10; `184 ms` never `0.18 s`; percentages without decimals unless under 1%. Currency has no rule because no app handles money yet.

**Errors — what happened, why if we know, what to do next.** Never an internal identifier (`sender_device_id required for group decryption` reached a user), never blame the user, and always give the next action as a real control. `"Rate limit reached. Wait a moment and try again."` was already correct and is left alone.

**Empty states — heading, context, action.** `"No items"` is a status code, not an empty state. The rewrite also separates two situations the apps currently conflate: *nothing exists yet* and *nothing matched your filter* have different next steps.

**Buttons — verb first, object when not obvious.** A destructive confirmation names the object and the count (`Dismiss 3 items`, not `Confirm`) because the count is the last chance to notice the wrong rows are selected. **Cancel is always "Cancel"** — the one label that never gets rewritten, because someone scanning for the exit should not have to read.

**Banned words:** Oops/Whoops, "simply/just/easy", "please" in errors and labels, "Are you sure?", "Invalid", "Error occurred", and `Loading…` as a lone state.

**Deferred to Phase 5 by the no-code-before-5 rule:** the shared `formatDate` / `formatBytes` / `formatDuration` / `formatCount` / `formatPercent` module. Signatures are fixed in `content.json`; the implementation ships with the components.

---

### D-028 · Component inventory and the v1 scope
**Date:** 2026-09-03
**Method:** 38 component concepts matched against the source of all four apps and counted by instance and by app — **1,456 measured instances**. Written to `explorations/04a-inventory.html`.

**Caveat recorded up front:** this measures what *exists*, not what is *needed*. Toast scores two uses while App A alone has 107 error-surface call sites rendering as inline alerts. Demand data prices today's duplication; it cannot see a gap. Both were used in the scoping.

**The scoping principle: v1 is everything inside the content area. v2 is the frame.**
Buttons, fields, cards, badges, modals, tooltips and empty states appear *within* a page, are near-identical across all four apps, and are cheap to get wrong. The shell, drawer, auth screens and settings layout are the page *frame* — they carry routing, auth state and per-app navigation, and unifying them first would make the system's first act its riskiest.

**v1 — 20 components, 1,197 of 1,456 instances (82%).** The brief asked for ~60%; the distribution is top-heavy enough that twenty components buy far more. Button alone is 345 instances — 24% of everything, in one component.
- **T0 (12):** Button, IconButton, Input, Textarea, Select, Checkbox, Label, Link, Badge, Avatar, Spinner, Skeleton
- **T1 (6):** FormField, Card, Modal, Tooltip, Alert, Tabs
- **T2 (2):** EmptyState, PageHeader

**Cut — 18 concepts.** Highlights: **Divider** (a 1px border token; wrapping a CSS property in a component is ceremony), **Breadcrumb** (zero uses in four apps), **Command palette** (the most complex item on the list with exactly one consumer), **Wizard**, **Data table**, **Pagination** (App A-only), **App shell** (the largest duplication in the audit and the riskiest thing to unify first — deferred by design, not neglect).

**Two cuts are deferrals with a date:** **Toast** and **Dropdown menu** are the first two components of v2 — Toast because 107 inline error alerts is a real gap Alert only half-covers, Dropdown menu because App C maintains three of them internally.

**Findings that change the specs:**
- **All four App B dialogs are inaccessible** — `AddMemberDialog`, `NewDMDialog`, `SafetyNumberDialog`, `ProfileModal` have no `role="dialog"`, no `aria-modal`, no Escape handler, no focus management. Bindery's `Modal.tsx` does all four correctly; App A gets them free from MUI. This is D-009 (Radix) justifying itself before a line is written.
- **Bindery has 42 bare `title=` attributes doing a tooltip's job** — invisible on keyboard focus, unstyleable, invisible to touch.
- **App C duplicates within itself**: five badge families and three dropdown families in one 1,469-line stylesheet.

---

### D-029 · Storybook is the first thing built in Phase 5, not Phase 4
**Date:** 2026-09-03
**Question:** Should the component workbench be set up now?
**Chosen:** No — Phase 4 is inventory and specs, and there is nothing to put in it. **Storybook (or a lighter equivalent) is step one of Phase 5, before the first component**, so every component is born with a story rather than having one retrofitted.
**Open for Phase 5, to be decided then:**
- **Where the library lives** — a new `d3-ui` package, versioned and consumed by four repos. Not decided.
- **Storybook proper vs something lighter.** This workspace is Vite-heavy (Bindery, App B and App A are all Vite); Storybook is a large install with its own build. Ladle or a plain Vite kitchen-sink app are real alternatives. To be put as a choice with tradeoffs.

---

### D-030 · Batch 1 component specs
**Date:** 2026-09-03
**Specified:** Button, IconButton, Link, Badge, Spinner, Skeleton, Avatar. Written to `explorations/04b-batch1-specs.html`, rendered live from the Phase 3 tokens.

**Decisions inside the specs that go beyond describing what exists:**

- **Button has five variants and a one-per-view limit on `primary`.** `danger` is only ever the confirming button inside a destructive dialog; `danger-ghost` is the trigger that opens it. The label never changes while loading — swapping it for "Saving…" resizes the button and shifts everything beside it, so the spinner takes the icon slot instead.
- **A disabled button may never be the only explanation.** A disabled control is not focusable, so a keyboard or screen-reader user cannot discover why it is unavailable. Either say why beside it, or keep it enabled and explain on submit.
- **IconButton has no `danger` variant, deliberately.** Phase 3f ruled icon-only forbidden for destructive actions; the way to make that hold is to remove the affordance rather than document it. It is also a separate component from Button rather than a prop, because it carries obligations Button does not — a mandatory `aria-label` and a mandatory tooltip on hover *and* focus.
- **Link defends the line the apps blur most:** a link goes somewhere, a button does something. An element without `href` is not a link. **Visited is deliberately unstyled inside the apps** — a visited colour leaks which records a user has opened, which in Bindery is which documents were read and in App A which complaints were seen.
- **Badge takes `tone`, not `color`** — `neutral | attention | danger`, with no `success` or `info`. This is D-016 turned into an API; App C proved the failure mode by growing five badge families. Mapping status to tone is one decision per app, not per call site.
- **Spinner is the fallback, not the default.** Skeleton is preferred for anything whose shape is knowable; Spinner is for actions in flight. "Loading…" as a lone state is banned (3g), and beyond ~10s neither is right — that wants progress or a job record.
- **Avatar ships a single neutral treatment in v1 — no per-user colour.** Hashing an id into a hue would generate twenty-odd unmeasured colour pairs in a system whose premise is that every pair is measured. Doing it properly needs a validated tint ramp. **Flagged as a genuine loss**: App B has twelve avatars in a message list and colour is how you scan those. v2, with a ramp or not at all.

**Cross-cutting rules written once:** semantic tokens only; one focus treatment with no component overrides; refs forwarded and props spread so Radix can compose in later batches; `sm`/`md`/`lg` with `md` always the default; **no component ships a margin** — spacing belongs to the parent; both colour modes proved by the story, not a later pass.

**Verification note:** the preview pane refused newly-created files for a stretch of this task (a 99-byte test file failed identically), so this page was first verified structurally only — 7 specs, 7 accessibility contracts, 3 state grids, 5 do/don't pairs, balanced markup, zero unresolved icons. **The fault cleared during batch 2 and the page has since been verified visually**: Inter loads, all five Button variants, three sizes and six states render as specified. The structural check turned out to be accurate; recorded here because the gap was real at the time it was reported.

---

### D-031 · Deferred: a signature spinner (new Phase 7)
**Date:** 2026-09-03
**Requested by the user**, to be picked up after the existing phases complete.
**Scope:** replace the default border-rotation spinner from D-030 with a custom, distinctive loading animation — something with character rather than the generic ring every product ships.
**Why it is deferred rather than done now:** Batch 1's spinner is a placeholder that unblocks specs and code; swapping the animation later touches one component and no API. Doing it now would mean designing a signature element before the components it appears inside exist.
**When it runs:** a new **Phase 7 · Signature spinner**, after Phase 6. It should produce several live candidates to react to, the way Phase 1a and 3e did, since motion cannot be judged from a description.
**Constraints it must respect:** the accessibility contract in D-030 (`role="status"`, `aria-hidden` inside a button, completion announced in a live region), the reduced-motion rule (slow to ~1.6s rather than freezing — a stopped spinner reads as a hung request), and the four spinner sizes 14/16/20/24 including the on-accent variant that sits inside a primary button.

---

### D-032 · Batch 2 component specs
**Date:** 2026-09-03
**Specified:** Label, Input, Textarea, Select, Checkbox, FormField. Written to `explorations/04b-batch2-specs.html`, verified visually.

**The two defects this batch exists to fix:**
- **App B has 18 `<label>` elements and zero `htmlFor`.** None of its labels are associated with a control, so clicking one does not focus the field and a screen reader never reads it. Bindery associates only 18 of its 42.
- **`aria-invalid` and `aria-describedby` appear only in Bindery, ten times each. App A, App B and App C use them zero times** — every error message in three apps is visible on screen and invisible to assistive technology.

**Decisions inside the specs:**
- **Optional is marked; required is the default.** Never an asterisk — a symbol with no accessible meaning unless a legend explains it, and legends get separated from their forms. The audit found no convention at all: three asterisks, three "(optional)", four "Required", four "Optional". If a form is mostly optional, invert it and mark required with the word — decided per form, once.
- **Input, Select and Button share one height scale (28/34/40)** because they sit on the same row in every filter bar in every app. An input at 36px beside a button at 34px is exactly the one-off misalignment the audit catalogued.
- **A placeholder is never a label, and is only ever a format example.** It disappears on first keystroke and leaves a half-filled form unidentifiable.
- **Read-only and disabled are different states and the apps conflate them.** Disabled is unreachable by keyboard and unsubmitted; read-only is focusable, selectable, copyable and submitted. Making a reference ID disabled means a keyboard user cannot copy it.
- **Textarea resizes vertically only.** `resize: both` lets a user break the layout; `resize: none` removes a genuinely useful control.
- **Checkbox must support indeterminate** — App A's inbox header already needs it (`InboxPage.jsx:246`). A select-all showing unchecked while three rows are selected lies about the table.
- **Select is Radix, and the spec says when *not* to use it**: two or three options want a segmented control; more than ~15 want a filtering combobox; an action-on-choose is a DropdownMenu (v2); multiple selection is checkboxes.
- **FormField owns the wiring.** It generates `id`, `{id}-help`, `{id}-error`, sets `htmlFor`, `aria-describedby` and `aria-invalid`, makes the error a polite live region, and moves focus to the first invalid control on failed submit. **There is no way to render a FormField label without association** — which is the whole point.
- **Errors appear on blur or submit, never per keystroke**, and the error never replaces the help text, because the help text is usually the fix.

**FormField's usage count (5, one app) is the lowest in v1 and its value is among the highest.** The count measures how often the wiring is done today, which is the problem, not the demand — the clearest case in the project where demand data alone would have scoped wrongly.

---

### D-033 · Batch 3 component specs
**Date:** 2026-09-04
**Specified:** Card, Modal, Tooltip, Tabs, Alert. Written to `explorations/04b-batch3-specs.html`, verified visually — and verified programmatically to contain **zero computed box-shadows**, which is the batch where D-023 was most at risk.

**Decisions inside the specs:**

- **Card: wholly clickable, or containing actions — never both.** A clickable card with a button inside produces a control nested inside a control: the inner button is unreachable in some screen-reader modes, the outer target swallows clicks meant for the inner, and the outer's accessible name becomes the card's entire text. If a card has internal actions, the card is a plain `div` and the *title* is the link. **Bindery's archive rows and App C's kanban cards are both currently the forbidden shape.**
- **Card selection is a fill (`accent-muted`), not a ring** — a 2px selected border would be the only 2px border in the system (D-023).
- **Modal never auto-focuses a destructive button.** Focus goes to the first focusable element, or to the panel itself when the first control is destructive.
- **Escape closes the topmost layer only**, and a modal holding unsaved work asks rather than discarding. A dialog that ignores Escape without a reason is a trap.
- **Tooltip: the tooltip text and the `aria-label` are the same string on an IconButton** — there the tooltip *is* the visible label. Elsewhere it is `aria-describedby`, clarifying something already named. Delay is 400ms on hover, **0ms on focus**, because a keyboard user asked for it deliberately.
- **Nothing essential may live only in a tooltip** — tooltips do not exist on touch.
- **Tabs activation mode is a real fork, decided per app.** Automatic (arrow switches the panel) is the WAI-ARIA default and correct when panels are in memory. **Manual is required when switching fires a network request** — App A's six view tabs each refetch, so arrowing from Inbox to All under automatic activation would fire five requests nobody asked for and announce five loading states. App A is manual; App C's local-state section tabs are automatic.
- **Tabs scroll horizontally when they overflow.** Never wrap to a second row (row position stops meaning anything), never collapse into a Select (which hides where you are).
- **Alert is where `success`, `warning` and `info` are allowed to be colours.** D-016 took hue from *status* because seven statuses exceed what colour can carry; messaging is the opposite case — one alert, on screen, where the tone is the point. The tokens were kept for exactly this.
- **Alert roles are conditional, and this is commonly got wrong.** A static alert present at page load needs **no role** — `role="alert"` would make a screen reader interrupt to announce something already there. A dynamic error gets `role="alert"` (assertive); dynamic success and info get `role="status"` (polite). An alert is never focused on appearance, because that steals focus from the control being operated.

**App A's `ErrorAlert` breaks two 3g rules in eleven lines:** it renders `<AlertTitle>Error</AlertTitle>` — a title saying only that an error happened, which the icon and colour already said — and falls back to **"An unexpected error occurred"**, banned because every error occurred and "unexpected" describes the developer's surprise, not the user's situation.

---

### D-034 · Batch 4 component specs, and Phase 4 closed
**Date:** 2026-09-04
**Specified:** EmptyState, PageHeader. Written to `explorations/04b-batch4-specs.html`, verified visually.

**EmptyState takes a `kind`, because the apps render three different situations with the same string.** "No items", "No feedback items found" and "No users found" are currently used for all of:
- **first-run** — nothing exists yet and the user has never made one
- **no-results** — things exist, but this filter or search matched none
- **error** — we could not find out whether anything exists
- (plus **no-access** — it exists and is not theirs to see)

These need different words and completely different actions. Offering "Create your first item" to someone whose search failed is useless; offering "Clear search" on someone's first day is confusing. The `kind` determines the action, so the mismatch becomes impossible rather than discouraged.

Also specified: the heading is a real heading, not a styled paragraph; when an empty state replaces a skeleton the container drops `aria-busy` and announces politely, or the loading→empty transition is silent; the error kind uses `role="status"`, not `role="alert"`, because it is rendered as part of the region rather than fired at the user mid-task. **No exclamation marks** — the audit found "No messages yet. Start the conversation!", which is the interface being cheerful at someone who wanted a message.

**PageHeader is mostly the other three apps adopting Bindery's**, which already exists and is used 57 times.
- The title is the page's `<h1>`, and there is exactly one per page.
- **On route change the `h1` receives programmatic focus so a screen reader announces the new page. None of the four apps does this today** — every client-side navigation is currently silent to assistive technology.
- The count is part of the accessible name ("Inbox, 48 items"), not a bare number after a title.
- **Actions wrap on narrow screens; they do not collapse into a menu.** If more than two exist, the *secondary* ones collapse and the primary stays visible — never the reverse. Hiding a page's primary action behind an overflow menu on a phone is how a feature stops existing.
- The title matches the nav item that led there. On a detail page the title is the object itself, not its type.
- Breadcrumbs stay cut (D-028); a detail page gets a single named back link — "Back to inbox", not "Back".

---

## Phase 4 complete

**38 concepts inventoried · 20 specified · 18 refused · 0 lines of code.**

| Batch | Components | Principally fixes |
|---|---|---|
| 1 | Button, IconButton, Link, Badge, Spinner, Skeleton, Avatar | 345 button instances; destructive icon-only removed from the API |
| 2 | Label, Input, Textarea, Select, Checkbox, FormField | 18 unassociated labels; three apps with zero `aria-invalid`; a 1.35:1 field border |
| 3 | Card, Modal, Tooltip, Tabs, Alert | four inaccessible dialogs; 42 bare `title=`; 243 card recipes |
| 4 | EmptyState, PageHeader | "No items" as a complete empty state; three page-title implementations |

**Still open, for Phase 5 to decide first:** where the library lives (a `d3-ui` package consumed by four repos), and Storybook versus something lighter given this workspace is Vite-heavy. Both are D-029.

---

### D-035 · The library ships as its own repo, installed by git tag
**Date:** 2026-09-04
**Grounded in:** four separate git repos, all npm, no monorepo, no shared workspace. React **18.2** (App A), **18.3.1** (App C) and **19** (Bindery, App B). Builds are Vite 5/6/7 in three apps and **Next.js 14** in App C. App A has **no TypeScript at all** — no `tsconfig` anywhere, 58 `.jsx` files.
**Chosen:** a new `d3-ui` repo publishing `@d3cloud/ui`, installed as `"@d3cloud/ui": "github:<owner>/d3-ui#v0.1.0"`. No registry, no auth tokens in four repos and CI, and tags give real versioning. Upgrades to a private registry later without changing the import path.
**Rejected:** a private registry (real infrastructure for a solo maintainer, now); a monorepo (merging four git histories and rewiring four deploy pipelines is a bigger project than the design system); copy-in (already rejected as D-009 — copies drift, which is the failure the audit documented).
**Consequences:**
- **React is a peer dependency at `^18.2.0 || ^19.0.0`.** Two copies of React in one tree breaks hooks, so it is externalised in the build.
- App A's TypeScript question is deferred to Phase 6 (D-010). A JavaScript app consumes a TypeScript library fine — types reach the editor without being enforced.

---

### D-036 · The library does not depend on Tailwind, and every class is prefixed
**Date:** 2026-09-04
**Two findings from scaffolding, both of which would have broken a consumer:**

**App C uses no Tailwind at all** — it is 1,469 lines of hand-written CSS. A component library styled with Tailwind utilities could not ship there without forcing Tailwind into the app. So the components are styled in **plain CSS consuming the semantic custom properties**, and the package exports two stylesheets:
- `@d3cloud/ui/tokens.css` — **required**, plain custom properties and `@font-face`, no build step asked of the consumer
- `@d3cloud/ui/theme.css` — **optional**, the Tailwind v4 preset, for Bindery and App B which do use it

**App C already ships `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.btn-sm`, `.badge`, `.alert`, `.panel` and `.skeleton`** — exact collisions with an unprefixed library. During migration both stylesheets are loaded at once, so an unprefixed library would silently restyle the app it is replacing. **Every class the library emits is prefixed `d3-`.**

---

### D-037 · Theme selectors are element-scoped, not `:root`-scoped
**Date:** 2026-09-04
**Found by the a11y addon on the first component.** Storybook's axe run reported a real failure — `.d3-btn--ghost` at **1.67:1**, foreground `#b9bdcb` (dark's `text-muted`) on `#f0f2f7` (light's `bg`). Half the tokens had switched and half had not.

**The tokens were correct**; the decorator was wrong. It mutated `document.documentElement` as a side effect during render, and that is not guaranteed to be flushed before the addon measures — so axe caught a half-applied theme.

**Fixed at the token layer rather than in the story**, because the root cause was that switching modes *required* mutating the document at all:
- `:root, [data-theme="dark"]` and `[data-theme="light"]` replace the previous `:root`-anchored selectors.
- The OS fallback is now `:root:not([data-theme])` — follow the system only when no explicit theme has been set.
- A subtree can carry its own mode: `<div data-theme="light">` inside a dark app is a light island, and custom properties inherit into it correctly.

The Storybook decorator now renders the theme as a wrapper element, so the mode is part of the render and there is no race. **This is a better library**, not just a fixed story — scoped theming is a capability consumers get for free.

**Verified:** Button and Spinner, all stories, **0 axe violations in both modes** — 11 passes dark, 6 light.

---

### D-038 · Phase 5 scaffold complete
**Date:** 2026-09-04
**Built, before the first component (D-029):** `d3-ui/` — package manifest with React peer range, Vite library build with `vite-plugin-dts`, strict TypeScript, Storybook 8.6 with `addon-a11y` set to **fail rather than warn**, the Phase 3 tokens vendored in, a `d3-` prefixed component stylesheet, and a launch config so the workbench runs from the preview pane rather than a stray shell.
**First two components shipped end to end:** `Spinner` and `Button` — implementation, exported types, a story per variant *and per state*, autodocs, and an axe check per story. Typecheck clean, library build clean, Storybook build clean.
**Not done, deliberately:** no commit and no tag. The repo is initialised and untracked; the first commit and `v0.1.0` are the user's to make.

---

### D-039 · Batch 1 built
**Date:** 2026-09-04
**Shipped:** Button, IconButton, Link, Badge (+ CountBadge), Spinner, Skeleton, Avatar — implementation, exported types, stories per variant *and* per state, autodocs, and an axe check per story.

**Verification: 39 stories × 2 colour modes = 78 axe runs, zero violations.** Run by driving the live Storybook and executing axe-core against each story's iframe in both themes, against `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` and `wcag22aa`. Typecheck clean, library build clean, Storybook build clean.

**Rules the API enforces rather than documents:**
- **`IconButton` has no `danger` variant and no way to omit `label`.** Phase 3f forbids icon-only for destructive actions; removing the affordance is what makes that hold. The `label` is the accessible name *and* the future Tooltip string, so visible and programmatic labels cannot drift.
- **`Badge` takes `tone`, not `color`** — `neutral | attention | danger`, no `success`, no `info`. A `color` prop is how App C ended up with five badge families.
- **`Link` requires `href`.** An element without one is not a link. `:visited` is unstyled in-app because a visited colour leaks which records a user has opened.
- **`Skeleton` is always `aria-hidden`** and cannot be made otherwise; the container owns `aria-busy`.
- **`Avatar` is decorative by default**, because the common case is a name sitting beside it, and announcing the name twice is the usual bug.
- **No component ships a margin.** Enforced by `margin: 0` in every component's root rule.

**Carried forward as specified:** Avatar has a single neutral treatment, no per-user colour (D-030). The story says so in its docs, so the omission is visible to whoever reads it next rather than looking like an oversight.

**CI note:** `npm run test:a11y` is wired to `@storybook/test-runner` but needs `npx playwright install` once before it runs. The 78-run verification above was done through the browser instead, which needs no extra download.

---

### D-040 · Batch 2 built, and a real test layer
**Date:** 2026-09-04

**Shipped:** Label, FormField, Input, Textarea, Checkbox (Radix), Select (Radix) — 13 components total, 69 stories.

**Tests — `npm run verify` runs typecheck, 183 tests and the build in about 3 seconds.**
- **`src/test/stories.test.tsx` composes every story** through the real preview decorators and asserts two things per story: that it renders, and that axe reports no violations. **A discovery guard fails the suite if the glob ever matches nothing**, so it cannot pass silently — which is the usual way a story-sweep test rots.
- **`color-contrast` is disabled in jsdom, and not for convenience.** jsdom has no layout or paint, so axe would return *incomplete* for every pair, which is worse than silence. Contrast is covered twice elsewhere: 106 measured pairs at the token layer (D-014, D-018) and a browser sweep over every story in both modes (D-039).
- **Contract tests per component** assert the specific promises in each Phase 4 spec rather than just "it renders": that a FormField label is genuinely associated, that `indeterminate` is `aria-checked="mixed"`, that a loading Button keeps focus and blocks activation, that read-only stays copyable while disabled does not, that an external Link says "opens in a new tab" in its accessible name.
- `@storybook/test-runner` remains wired for a browser-based CI pass but needs `npx playwright install`; the vitest layer needs nothing extra and is the one to run by default.

**A real bug the tests caught, which axe did not.** In the "every control, wired" story the Checkbox read as **"Confirmation I have written the passphrase down"**. The Checkbox was consuming FormField's control id, so two `<label>` elements pointed at one control and their text concatenated into its accessible name. axe permits this — two labels is legal — so only an explicit assertion about the *name* found it.

Fixed across three components rather than patched in the story:
- **Checkbox no longer consumes `field.id`.** It labels itself, so it generates its own id and takes only `describedBy` and `invalid` from the field.
- **FormField gained `as="group"`** — `role="group"` with `aria-labelledby` instead of `htmlFor`, for controls that label themselves.
- **Label can render as a `span`**, so a group label does not attach itself to a control that already has one.

**This amends the Batch 2 spec (D-032),** which said controls are never rendered bare outside a FormField. That rule missed self-labelling controls: a Checkbox inside a `field`-mode FormField is *worse* than a bare one. The corrected rule is that self-labelling controls use `as="group"`.

**Also renamed during build:** Input's `prefix`/`suffix` became `leading`/`trailing` — `prefix` collides with a native HTML attribute and would not typecheck.

---

### D-041 · Two layout defects found by looking, not by testing
**Date:** 2026-09-04
**Both reported from screenshots.** Worth recording because the test suite passed through both of them — 183 green tests, and the component still looked wrong on screen.

**1. The FormField label collided with a Checkbox.** "Confirmation" rendered *on top of* "I have written the passphrase down". `.d3-ff` was `display: block`, `.d3-lb` is `inline-flex` (it carries the "optional" suffix on its own baseline), and a Checkbox root is an inline `<span>` — so label and control were two inline siblings sharing a line.
**Fixed:** `.d3-ff` is a flex column, and the label is `align-self: flex-start` so it cannot stretch or share a row. A group of self-labelling controls gets its own vertical rhythm.
**Regression test added** asserting the field is `display: flex; flex-direction: column`, since that is the property the collision depended on.

**2. Every story rendered as a narrow dark strip on Storybook's white canvas.** The decorator forced `min-height: 100vh` inside a shrink-wrapped `layout: 'centered'` container, so the themed background became a tall column instead of a surface.
**Fixed, on the second attempt.** The first fix switched to `layout: 'fullscreen'`, which traded a narrow strip for an acre of empty canvas around a 32px avatar — reported again from a screenshot, correctly. **The actual defect was the forced `100vh`, not `centered`.** The decorator now hugs its content: `centered` layout, 32px padding, a `--radius-lg` corner and a 160px floor so a small component still reads as sitting on a surface rather than floating in a swatch. The nine per-story `layout: 'centered'` overrides stay removed, since the global value is now the same.

**Recorded because it took two goes:** the instinct on seeing a layout bug was to change the container, when the wrong value was the height. Changing the surrounding strategy fixed the symptom and created a new one.

**The lesson, recorded rather than glossed:** the suite asserts *semantics* — roles, names, wiring, state — and axe checks *rules*. Neither can see overlap, and neither can see a story rendered in a 300px column. Rendering and looking is still a distinct check, and the a11y addon reporting "0 violations" on a visibly broken screen is exactly how that gets missed.

---

### D-042 · The library shipped no box-sizing rule, and every sized control was wrong
**Date:** 2026-09-04
**Reported from a screenshot**, then measured: an Input rendered **36px** beside a **34px** Button. Select was wrong the same way.

**Cause.** The library relied on UA defaults for `box-sizing`, and browsers do not agree: `<button>` defaults to `border-box`, a `<div>` to `content-box`. `.d3-btn` is a button, `.d3-inp` is a div — so the Input's 1px border was added *outside* its declared 34px height while the Button's was not. Every control with an explicit height and a border was 2px too tall.

**This broke the exact rule the Batch 2 spec was written to protect:** *"Input, Select and Button share one height scale because they sit on the same row in every filter bar in every app."* The spec was right and the implementation silently disagreed with it.

**Fixed:** `src/styles/components.css` now sets `box-sizing: border-box` on every `d3-`-prefixed element, and is imported by `src/index.ts` so it **ships with the library** rather than existing only for Storybook. Heights in this system are outer heights.

**Verified by measurement, not declaration:** Input 34, Select 34, Button 34, all three tops identical in a rendered filter bar.

**On the test that guards it.** `src/test/sizing.test.tsx` asserts border-box across every `d3-` element and height parity at all three sizes. I reverted the fix to check the test actually catches the defect: **only the box-sizing assertion fails.** The six height-parity tests pass either way, because both declarations always said 34px — the bug lived in the box model, not the declaration. That is written into the test file so the six are not mistaken for the ones holding the defect shut.

**Third layout defect in a row found by looking rather than by testing** (with D-041). The pattern is consistent enough to name: this suite is good at semantics and blind to geometry. Every remaining batch gets rendered and measured, not just run.

---

### D-043 · Batch 3 built
**Date:** 2026-09-04
**Shipped:** Card, Modal, Tooltip, Tabs, Alert — **18 components, 87 stories, 247 tests.**

**Rendered and measured, not just run** (the commitment made after D-041 and D-042):
- **Alert** — four tones, identical widths, icon and title baselines 1px apart (the deliberate optical offset), no overflow. The untitled variant is correctly shorter: the title is optional.
- **Modal** — centred to the pixel, scrim covering the viewport, `box-shadow: none`, a 3:1 border, `role="dialog"`, `aria-modal="true"`, focus inside on open.
- **Tabs** — six tabs on one row, `scrollWidth` 477 against `clientWidth` 300, `overflow-x: auto`. Scrolls, never wraps.
- **Card** — a `div` when it holds actions, 20px padding, no shadow, no border, 14px radius, sm buttons at 28px, no overflow.
- **Tooltip** — absent before focus, present after, text matching the trigger's `aria-label`, and **no native `title` attribute** anywhere near it.

**A defect the measurement pass caught.** The `OpenByDefault` Modal story rendered with the focus ring **on the destructive button**. The story had no `destructive` prop, so Radix auto-focused the only control in it — meaning Enter on a freshly opened dialog would have destroyed three items. The spec forbids this, and my implementation only honoured it when the author remembered a prop.
**Fixed unconditionally:** the Modal now looks for a `.d3-btn--danger` inside itself on open and, finding one, sends focus to the panel instead — whether or not `destructive` was passed. Same principle as removing IconButton's `danger` variant: make the rule structural rather than remembered. Regression test added, and the story corrected.

**A spec claim that needed amending rather than forcing.** D-033 promised `aria-modal="true"`. Radix does not set it — it delivers modality by marking everything *outside* the dialog `aria-hidden`, which is more reliably supported. Verified that this genuinely happens, then set `aria-modal` as well since it costs nothing, and rewrote the test to assert the mechanism that actually works rather than only the attribute.

**Card enforces the nested-interactive rule at runtime.** An `interactive` Card that contains a control warns in development, naming the fix. Bindery's archive rows and App C's kanban cards are both currently that shape, so the warning will fire during migration — which is the point.

---

### D-044 · Batch 4 built — v1 is complete
**Date:** 2026-09-04
**Shipped:** EmptyState, PageHeader. **20 components · 97 stories · 282 tests**, with typecheck, library build and Storybook build all clean.

**EmptyState's `kind` is a required prop, and that is the whole design.** The apps render three different situations with one string — "No items" stands in for *nothing exists yet*, *this filter matched nothing* and *we could not find out*. Those need different words and different actions, so the component will not let the distinction be skipped. The `error` kind is `role="status"`, never `role="alert"`: it is rendered as part of the region, not fired at the user mid-task.

**PageHeader takes focus on mount**, which for a component that mounts once per route *is* the route change. None of the four apps does this today, so every client-side navigation is currently silent to assistive technology. `tabIndex={-1}` makes the `h1` programmatically focusable without adding it to the tab order, and the ring is `:focus-visible` only so it does not flash on a mouse click.

**Measured, not just tested:**
- EmptyState at all three sizes — page 40/24, inline 24/20, row 16/20 with the action pushed right; real `h3` headings; no overflow.
- PageHeader wide — title and actions on one row, actions flush right, buttons 34px, accessible name "Inbox, 48 items".
- PageHeader narrow — **actions wrap to full width with the primary still visible and no overflow menu**, which was the specific rule: hiding a page's primary action behind a menu on a phone is how a feature stops existing.

---

## v1 complete

| | |
|---|---|
| Components | **20** (12 T0 · 6 T1 · 2 T2) |
| Stories | **97** |
| Tests | **282** — every story rendered and axe-checked, plus contract tests per component |
| Verify | typecheck + tests + build, ~4 seconds |

**Defects in the four apps that the library now makes structurally impossible:**
- App B's four dialogs with no role, focus trap, Escape or focus return → Radix Dialog, plus unconditional protection against auto-focusing a destructive button
- 18 labels with no `htmlFor`, and three apps using `aria-invalid`/`aria-describedby` zero times → FormField owns the wiring and cannot render an unassociated label
- 42 bare `title=` attributes → a real Tooltip that appears on keyboard focus
- Five badge families and seven status hues → `tone`, with no `color` prop
- 243 card recipes → one Card, which warns when it is given the nested-interactive shape
- A 1.35:1 field border → `border-field` at 3:1
- "No items" as an empty state → a required `kind`
- Silent client-side navigation → an `h1` that takes focus

**Still open, carried forward:** Avatar has no per-user colour (D-030) — deferred to v2 with a validated tint ramp; Toast and DropdownMenu are the first two components of v2 (D-028); App A's TypeScript question is a Phase 6 decision (D-010).

---

### D-045 · Motion audit before migration
**Date:** 2026-09-04
**Asked for:** confirmation that the animations actually work across every Storybook item, before any app migrates.

**Three real gaps found, all now closed:**

1. **The Tabs pill did not travel.** D-024 specified *"the tab pill travels between tabs, 280ms spring"* and the implementation was a background-colour cross-fade. `--motion-tab-glide` was defined and consumed by nothing. Now implemented properly: the component writes the active tab's offset and width as custom properties and the movement is a pure CSS transition — so it inherits `prefers-reduced-motion` from the global rule rather than needing its own handling. First paint is placed without transition so the pill never slides in from the left edge.
2. **Nothing animated out.** Modal and Select appeared with an animation and then vanished instantly. `--motion-modal-exit` and `--motion-menu-exit` were unused. Both now animate on `[data-state='closed']`, and Radix's presence handling waits for them.
3. **The Select chevron did not rotate.** 3f named the disclosure chevron as one of exactly three animated icons in the system, and `.icon-disclosure` existed unused. It now rotates 180° over 200ms on open.

Also wired `--motion-hover`, which five components were duplicating as a hard-coded `var(--dur-1) var(--ease-out)`.

**Verified in a real browser, not just declared:** the pill transitions `transform` and `width` at 280ms with the spring easing, animates rather than jumping, and lands exactly aligned to the active tab. Modal enters at 420ms and exits at 200ms with the element removed only after the exit completes. Select content enters at 200ms, exits at 140ms, chevron rotates. A 13-story sweep confirmed every component that should animate does, and **Alert, Badge, Avatar, PageHeader and EmptyState are all completely static** — which D-024 requires just as strictly.

**Guarded by `src/test/motion.test.tsx` (15 tests).** It reads the **CSSOM**, not `getComputedStyle`: jsdom does not implement computed animation or transition properties and returns `''` for every one, so a computed-style assertion would have passed on an empty string and guarded nothing. Longhand accessors are also `undefined` there, so the assertions use `getPropertyValue`. The test covers both halves of the spec — what must move, and what must not.

**Correctly still unused:** `--motion-drawer`, `--motion-list-enter`, `--motion-popover-enter`, `--motion-row-exit`, `--motion-toast-enter`, `--motion-toast-exit`. All belong to v2 components that do not exist yet.

---

### D-046 · Bindery migrated onto the system — the token bridge
**Date:** 2026-09-04
**Approach:** a token bridge first, not a component rewrite. Bindery's seven `@theme` colours now map onto the system's semantic tokens, so **1,268 existing utility usages keep working unchanged** and the whole app reskins in one commit. The 151 button call sites and 308 raw-palette utilities are migrated afterwards, at leisure, against an app that already looks right.

**The mapping.** `surface` and `accent` already matched the system's names and are deliberately *not* redeclared — the system's own theme entry provides them. Four needed a compat entry: `ink → bg`, `edge → border`, `muted → text-muted`, `field → border-field`. That layer is temporary and gets deleted when the call sites move.

**`--color-mark` survives as a Bindery-local token, and should.** It is the search highlight, and the one colour in the app that must work on two grounds — a snippet on a dark surface, and a box drawn over a matched word on the white of a scanned page. Re-measured against the system's palette: **4.06:1 on `surface`, 4.23:1 on white**, still the two-ground property it was chosen for. It stays teal rather than becoming the accent, because "this is a button" and "this is your match" being one signal is how the evidence that retrieval worked got lost among the controls. **This is the precedent for app-level tokens:** an app may add one the system does not have, but only for genuinely app-specific semantics, and it must be measured.

**Contrast checked before committing to the reskin:** the button label goes from 8.80:1 on amber to **6.74:1** on violet — still comfortably AA.

**Four defects found by doing it, all fixed:**
1. **`lucide-react` was a runtime dependency and should never have been.** No component imports it — icons are injected as props precisely so consumers bring their own set — but the manifest pinned `^0.469.0` while Bindery runs `^1.35.0`. Installing would have pulled a second, older lucide into Bindery for nothing. Moved to devDependencies; the built bundle imports only Radix, clsx and React.
2. **`color.css` had shipped a broken comment since Phase 3a.** The header read `GENERATED from tokens/*.json` — the `*/` inside that glob **terminates the comment**, spilling the rest into the stylesheet. `theme.layout.css` had the same bug via `p-*/m-*`. Browsers silently drop the fragment, which is why it survived six sub-phases and every Storybook build; Tailwind rejects it outright, so Bindery's build was the first thing to catch it. Both fixed, and `src/test/tokens.test.ts` now fails on any unbalanced or self-terminating comment in generated CSS.
3. **The system would have flipped Bindery to light mode.** Its OS fallback is `:root:not([data-theme])`, and Bindery — dark-only — set no attribute. Anyone with a light system preference would have opened the archive in light. Fixed with `data-theme="dark"` on `<html>`.
4. **The fonts 403'd in dev and nobody would have noticed.** Vite refuses to serve outside the project root, and `@d3cloud/ui` is a symlink to a sibling during local development, so both Inter files failed and the app fell back to a system face — a filesystem problem that presents as a styling one. Fixed with `server.fs.allow`, which a real git-tag install will not need.

**Verified running against the live stack** (the api was already up; reached via the socat proxy Bindery's own `vite.config.ts` documents). Painted values are the system's exact tokens — bg `#101117`, surface `#191b23`, accent `#978cff`, field border `#747888` — Inter loads and renders, and the search highlight still paints at 20%/15% with a solid ring.

**Bindery's own checks all pass unchanged:** typecheck clean, 73 tests, lint clean, production build clean.

**Left for the next pass:** 308 raw-palette utilities across 34 distinct classes — 93 `neutral-*` (→ `fg`/`fg-muted`), ~105 red (→ `danger`, and the tinted `bg-red-950/40` alert regions → the `Alert` component), ~33 amber (→ `warning`), 13 emerald (→ `success`). Then the 151 hand-written button recipes → `Button`.

---

### D-047 · Bindery: raw palette migrated, and the tint gap it exposed
**Date:** 2026-09-04
**Result: 308 raw Tailwind palette utilities across 53 distinct classes and 41 files → 0.** Typecheck, lint, 73 tests and the production build all pass unchanged.

**The migration exposed a real gap in the system.** Bindery had 60+ tinted semantic regions — `bg-red-950/40`, `bg-amber-950/20`, `bg-emerald-950/20` — and the system had a tint for the accent (`accent-muted`) and **nothing equivalent for danger, warning, success or info**. So four tokens were added, mirroring the existing pattern: `danger-muted`, `warning-muted`, `success-muted`, `info-muted`, derived from the same ramps at the same steps `accent-muted` uses.

Validated: every text-on-tint pair clears **6.0–17.0:1** in both modes. And the tints are *more* perceptible than what Bindery had — measured as OKLab ΔE from the surface, **0.06–0.10 against Bindery's previous 0.02–0.05**, all well above the ~0.02 just-noticeable step.

**A measurement that corrected me mid-flight.** My first check flagged all four tints as "too close to the surface" at 1.00–1.08:1 — but **a contrast ratio only measures luminance**, and these tints differ from the surface mainly in hue. A dark red and a blue-grey of the same lightness are obviously different and score 1.02:1. Contrast is the right test for text and UI boundaries; perceptual difference (ΔE) is the right test for "is this region visible as a region". Using the wrong one would have sent me rebuilding a set of tokens that were already correct.

**Mapping decisions worth recording:**
- **Three near-identical greys collapse to one.** `text-neutral-100`, `-200` and `-300` (95 uses) all became `text-fg`. `hover:text-neutral-300` sitting beside `text-muted` settled it — that is precisely the muted→bright hover the system's ghost Button already does.
- **Dark borders are not the bare semantic colour.** Mapping `border-red-900` to `border-danger` turns a subtle edge into a bright red line. The semantic colour at **40%** reproduces the current weight almost exactly — ΔE 0.208 against today's 0.210 — so the dark-border classes take a prescribed `/40` and drop their source opacity, which was fine-tuning on an already-dark colour. Bright `-500` borders keep their source opacity, being already close in brightness.
- One straggler was a genuine inconsistency rather than a mapping gap: `SettingsPage` rendered its success branch as `bg-emerald-500/5` while its failure branch already read `bg-danger/5`. The two branches now match.

**Done as a reviewable script**, not ad-hoc edits — dry-run first, longest-match-first ordering so `text-red-300/90` rewrites before `text-red-300`, and opacity suffixes carried or prescribed explicitly.

**Still Bindery's own:** `--color-mark`, unchanged. It is still teal against a violet accent, so "this is your match" and "this is a button" remain different signals.

**Next:** the 151 hand-written button recipes → `Button`, and the tinted regions → `Alert` / `Badge`. Those regions are three different components in disguise — inline messaging, status pills, and one full-width page banner — so that pass is a component migration, not a token one.

---

### D-048 · The library shipped every class name and none of its CSS
**Date:** 2026-09-04
**This is the most serious defect the project has produced, and it survived 20 components and 326 passing tests.**

The first migrated Bindery button rendered as a **25px transparent square with no radius**, carrying `class="d3-btn d3-btn--primary d3-btn--md"` — correct markup, zero styling. The cause is in the library, not in Bindery: Vite's library build **extracts** every component's `import './Button.css'` into a single `dist/index.css`, and then leaves the entry chunk with no reference to it. `package.json` exported `.` and `./theme.css` and never exported the stylesheet at all.

**Why nothing caught it.** Every test and every story runs against `src`, where the per-component CSS imports are honoured by the dev server. The only artifact where the defect was observable was `dist/index.js` — a file nothing in the repository read. The suite was not wrong; it was pointed at the wrong object.

**Fix — the entry re-imports its own stylesheet** (`importOwnStyles()` in `vite.config.ts`, a `generateBundle` hook that prepends `import "./index.css"` to the entry chunk). `./styles.css` is *also* exported for consumers that need to control ordering, but it is not the mechanism. Requiring every app to remember `import '@d3cloud/ui/styles.css'` is the same defect with an extra step, and it fails in the way that is hardest to attribute — the component renders, so the import is not the first thing anyone suspects.

**Guard — `scripts/check-dist.mjs`, wired into `build`, so `verify` cannot pass without it.** It asserts the entry imports the stylesheet, that the stylesheet contains a rule for **every root selector found in `src/components/*/*.css`** (derived, not listed, so a new component is covered the day it has a stylesheet), that the 34px control height survived, and that the file does not open with a malformed comment — the Phase 3a `*/`-inside-a-comment bug, which also shipped silently once.

**Confirmed the guard fails without the fix**, by stripping the import line from the built file and re-running it. This is now the third time a green suite proved nothing: box-sizing, the motion tests reading `''` from jsdom, and now this. The pattern is consistent — **the tests examine `src`, and the defects live in what `src` becomes.**

---

### D-049 · Bindery: 91 of 151 buttons become `Button`; the other 60 are not buttons
**Date:** 2026-09-04
A mechanical sweep of all 151 would have been wrong. 106 distinct `className` strings hid at least four different components, and one of the most frequent recipes — `group w-full overflow-hidden rounded-xl border border-field bg-surface text-left` — is an **archive row**, not a button.

**Migrated: 91**, by a reviewable script with a strict eligibility filter — literal `className`, real box padding, no conditional class expression, no structural utility. Every class it drops is one `Button` supplies; every class it keeps is layout the *parent* owns (`mt-*`, `w-full`, `flex-1`, `ml-auto`). Anything it did not recognise aborted that call site rather than guessing.

| | |
|---|---|
| primary / md | 30 |
| secondary / sm | 29 |
| secondary / md | 25 |
| primary / sm, ghost / md | 2 each |
| danger-ghost / sm, ghost / sm | 2, 1 |

**Deliberately not migrated: 60**, each with a reason rather than a backlog entry:
- **20 structural** — list rows, the Shell scrim, underlined links. These are interactive `Card`s, a scrim, and `Link`s.
- **18 toggle/segmented** — `${active ? … : …}` filter and view pickers. These want `Tabs` or a segmented control the system does not have yet; forcing them into `Button` would encode the wrong semantics in markup that currently reads correctly.
- **13 bare text buttons** with no box, **5 unstyled**, **3 with a computed className**, and **1 accent-bordered filter chip** that is a selected state, not a button.

**Two consequences worth stating plainly:**
1. **29 buttons got taller.** `px-2 py-0.5 text-xs` was about 22px; `size="sm"` is 28px. That is the intended direction — WCAG 2.5.8 asks for 24px — but it is a real density change in table rows, not a no-op.
2. **Four buttons gained a spinner they did not have.** The icon-and-label submits in Import, vault Setup and vault Unlock now pass `icon={…} loading={busy}`, so the icon is `aria-hidden`, the button reports `aria-busy`, and the spinner replaces the icon instead of the label moving.

**Verified by rendering, not by the suite.** Typecheck, lint, 73 tests and the production build all pass — and all of them passed while the button was an unstyled 25px square. What actually established correctness was measuring the rendered element: **34px tall, 10px radius, violet accent, 13px/600, `w-full` preserved.**

**One Bindery test was re-floored, not deleted.** `theme.controls.test.ts` guards that no control draws its outline with the 1.23:1 divider token, and its sentinel required >100 raw `<button>`/`<select>` tags. 91 left the raw pool, so the floor moved to 60/20 with a comment saying the count is *expected* to fall and that the file should be **deleted outright** when it reaches zero — at which point the rule lives in the library, enforced once.

---

### D-050 · `Alert`'s body is a `div`, and gains a `flush` placement
**Date:** 2026-09-04
Two changes to `Alert`, both forced by real call sites rather than anticipated.

**The message is a `div`, not a `p`.** Bindery's warning boxes contain a list of recovery codes, a copyable block with a control beside it, and a link — none of which may legally sit inside a `p`. The browser does not error on that; it closes the paragraph early and reflows the alert, so the failure looks like a styling bug with no cause. A component whose body is a `p` is a component that can only hold a sentence, and messages that matter rarely are. Guarded by a test asserting the tag and that a `ul` survives inside it.

**`flush` is a placement, not a new component.** Two screens put a message edge-to-edge under a panel header — the log's "still being written" strip, the Why panel's "no text was read". A boxed alert with a radius floating inside a flush panel fights the header's rhythm, and the alternative was two more bespoke recipes in the system that exists because Bindery had 170 button recipes. `flush` keeps the raised ground — **elevation is tone** — and trades the radius for a boundary at the edge it meets, because a strip spanning the panel is *not detached*. That is the existing rule applied, not a new idea.

Two uses is thin justification on its own. It holds because the shape recurs — every app in the audit has a banner — and because the prop is three lines of CSS on a component that already exists, not a fifth thing to learn.

---

### D-051 · Bindery: 24 tinted boxes become `Alert`; the pills sort into three kinds
**Date:** 2026-09-04
**The visual change is real and worth stating: Bindery drew every message as a tinted box — coloured ground, coloured border, coloured body text — and the system draws one as a raised surface with a coloured title.** Colour is spent on the word carrying the meaning rather than on the whole region. See `explorations/05a-alert-before-after.html`.

The tinted version is louder, and on a screen holding one message that is not a fault. It stops working when a screen holds several — Trust and Admin each show three or four at once — because a wall of coloured grounds has no hierarchy left to spend.

**Migrated: 24 of 38 tinted regions.** 17 single-message boxes by script (each printed for review before applying), 7 multi-part boxes by hand. `role="alert"` is no longer written at the call site — `dynamic` decides it, and gets it right in both directions: `{error && …}` is assertive, a standing warning present at page load gets no role at all. Element `id`s feeding `aria-describedby` were preserved.

Two judgements inside the script worth recording:
- **`font-mono` is kept.** `PipelineFlow` renders a machine error string, and monospace is how you tell a stack trace from a sentence. My first keep-list dropped it as decoration.
- **`PipelineFlow`'s per-file error is static, not dynamic.** It appears in a list, under live updates. An assertive role firing once per broken file is worse than no announcement.

**Not migrated: 14, each for a reason.** Selection states (`bg-accent/15` on a chosen facet or tab) are not messages. The accent status bars on Import and the vault are the *brand* colour reporting a mode, and `Alert`'s tones are info/success/warning/danger — mapping accent to `info` would say something false. `HelpPage`'s doc callouts and the conditional status cards on Trust and Pipeline have a neutral branch `Alert` has no tone for.

**Pills sorted into three kinds, and only two are Badges.**
- **`Badge`** — the "vital" tag and the pipeline's duplicate/failed summaries. The amber "vital" pill becomes `attention` (accent): `Badge` has three tones by design (D-016) and no warning.
- **`CountBadge`** — the per-stage count pip, which previously had **no accessible name at all** and now announces "3 at Classify".
- **Neither** — `Shell`'s nav pill is deliberately `aria-hidden` with its meaning in a sibling, and renders `!` as often as a number; `CountBadge` would either double-announce or lose the `!`. `EditPanel`'s removable tag chip is a *chip*, which the system does not have. Both left alone.

**Also corrected: an audit of mine that was wrong.** I reported 4 buttons opening with an icon child; the real number was **15**. The regex used `[^>]*` to cross the opening tag, and `onClick={() => …}` contains a `>`. Re-run with the brace-aware scanner the button migration already used. All 15 now pass `icon={…}`, so the icon is `aria-hidden` and swaps for the spinner. Two icon-only copy buttons became `IconButton`.

**Totals: raw `<button>` 151 → 58 · tinted regions 38 → 23 · 123 `@d3cloud/ui` elements in Bindery.** Typecheck, lint, 73 Bindery tests and the production build pass; the library is at 330 tests.

---

### D-052 · `SegmentedControl` — a radiogroup, and the fork that stops arrow keys firing requests
**Date:** 2026-09-04
**Choices (yours): treatment A — recessed track with a travelling thumb; content-width segments; `pressed` as a prop on Button rather than a separate ToggleButton.** Candidates in `explorations/06-segmented.html`.

**First: the count was wrong, and correcting it is most of the design.** I had reported "18 toggle/segmented buttons" in Bindery. They are four different components. **Five** are segmented controls. Two are underline tabs that already belong to `Tabs`. Four are sidebar nav lists. Six are single on/off toggles. Building one component for eighteen call sites would have produced a component that fits none of them.

**It is a radiogroup, not a `Tabs` variant.** `Tabs` is Radix-backed, owns `tabpanel`s and exists to switch between them. These five change what one region renders and have no panel to own — and a `tablist` with no tabpanel is a promise to a screen reader that nothing keeps. Organise's Unify control was doing exactly that: `role="tablist"`, `role="tab"`, `aria-selected`, and no tabpanel anywhere in the file. So: `role="radiogroup"`, `aria-checked`, **one tab stop for the whole group**, arrow keys that wrap and skip disabled options.

**`activationMode`, and why the migration forced it.** Archive's grouping calls `api.tree(groupBy)` on every change. Under the WAI-ARIA default — selection follows focus — arrowing across four options fires three requests nobody asked for. This is the same fork `Tabs` documents for App A, and the APG permits it for a radio group whose selection causes a significant change of context. Under `manual`, focus and selection come apart, so the roving tab stop needs its own state, and leaving the group returns it to the chosen option. **Three of the four migrated sites needed `manual`** — Archive (fetches), Organise's view (mounts components that fetch), Organise's Unify (discards the proposals you have already applied). Only Import's state filter narrows a list already in memory.

**Content width means the thumb is measured, not computed — and that exposed a latent bug in `Tabs`.** `offsetLeft` is reported here from the *padding* edge, so `offsetLeft - clientLeft` over-corrects by exactly the border width and leaves the thumb one pixel left of its segment. `Tabs` has carried that arithmetic since Batch 3 and got away with it because its list has no border, so `clientLeft` is 0. Both now measure from rects, with `scrollLeft` added back so a scrolled group stays aligned — verified at `scrollLeft` 177 and 156 on the overflowing Tabs story, and at every position in both directions on the segmented control.

**`pressed` on Button and IconButton — and the obvious tone was wrong twice.** My first version used the raised ground, "matching a chosen segment". But `secondary` *rests* on `surface-raised`, so pressed was byte-identical to unpressed; and `ghost` uses `surface-raised` for hover, so pressed was indistinguishable from a pointer passing over. The held state is the accent tint with an accent ring — 6.37:1 dark, 7.22:1 light. It differs from a chosen segment deliberately: inside a segmented control *one option is always chosen*, so accent would be permanently lit and stop meaning anything, while a standalone toggle being on is the exception — which is when D-016 says a hue is earned. The ring is an inset shadow because `.d3-btn` sets `border: 0`, so the `border-color` in my first version styled a border that does not exist.

**Not migrated, deliberately:** Photos' and the vault's underline tabs (they are `Tabs`, a separate pass), the four sidebar nav lists (a list nav, which the system does not have and five sites do not yet justify), and Rules' enable/disable — which is not a toggle at all but an action whose *emphasis* flips, so it became a `Button` with a conditional `variant`.

**Verified by measurement, not by the suite.** 357 library tests and 73 Bindery tests pass, and they passed while pressed-secondary was invisible and the thumb was a pixel off. What established correctness was reading geometry and computed colour out of the running browser.

**Totals: raw `<button>` 151 → 49 · 131 `@d3cloud/ui` elements in Bindery.**

> [!note] Amended 2026-10-01 by D-084
> The thumb on `surface-raised` (treatment A) keeps its fill and gains a 1px `border-field` edge, and the chosen label is semibold: on tone alone the thumb was 1.12:1 light / 1.43:1 dark against the track (PST-DA-048). Secondary Button now has a real border, so its pressed ring is that border turning accent; ghost keeps the inset ring.

---

### D-053 · The two underline tabs become `Tabs` — and the linked package was shipping a second React
**Date:** 2026-09-04
Photos and the vault each hand-rolled a tablist. Both had a real `tabpanel` with `aria-controls` and `aria-labelledby`, so unlike Organise's Unify strip they were not lying about their semantics — **but neither had any keyboard handling at all.** `role="tab"` on two or three buttons, no arrow keys, and every one of them in the tab order. A tablist a keyboard cannot drive is the strongest argument for owning the contract once.

**Visually they move from a full-width underline to the system's pill**, because the system decided that in Batch 3 and a second way to draw tabs is the fragmentation this project exists to remove.

**Activation differs, and the call sites decide it.** Photos takes `manual`: `kind` is a dependency of `load`, so arrowing across would fetch the wall you were only passing. The vault takes automatic: its three lists are already in memory.

**`icon` added to `TabItem`**, mirroring `SegmentedItem` — both sites pair an icon with each label, and dropping them to fit the component would have been the component deciding the design.

**The count label was wrong in both components, and is now in one place.** `${label}, ${count} items` produces "Videos, 1 items" — invisible while reading, audible every time. `lib/countLabel.ts` is now the single definition, used by `Tabs` and `SegmentedControl`, so the two cannot drift.

**Two accessible names improved, and Bindery's own tests recorded the old ones.** The vault's tabs were lowercase text wearing a `capitalize` class — CSS styles pixels and never reaches the accessible name, so the screen read out "documents 12" while showing "Documents 12". Photos' count sat in a loose span, and its test even said so: *"the count sits in its own span beside the label, so the accessible name is the two run together."* Both tests were updated to the new names, with the reason written into them.

**The real find: `@d3cloud/ui` was resolving its own copy of React.** The moment Bindery used its first Radix-backed component, five tests died on `Cannot read properties of null (reading 'useContext')`. The trace was unambiguous — `react` from `d3-ui/node_modules`, `react-dom` from Bindery's. The library is symlinked (`file:../../d3-ui`), so Radix resolves React relative to *its own* directory. Button and Alert are plain React and never noticed; **Modal, Select, Checkbox and Tooltip would all have hit this the moment they were adopted.**

`resolve.dedupe` fixes the dev server and the build. It does not reach vitest, which resolves linked packages itself — that needed `test.server.deps.inline` for `@d3cloud/ui` and `@radix-ui`, which pulls them through Vite's transform where dedupe applies.

**I checked the build rather than assuming it.** A `--sourcemap` build lists every `react` and `react-dom` module as coming from Bindery's own `node_modules`; the single d3-ui match was `@floating-ui/react-dom`, a Radix dependency whose name merely contains "react". One copy of React ships. (My first two attempts — an alias to the package directories, then a vitest-specific alias — did nothing, and I only stopped guessing when I read the stack trace. The trace named the answer immediately.)

**One false alarm worth recording**, because it is the kind of thing that turns into a wasted afternoon: every tab reported `tabindex="-1"`, which reads as an unreachable tablist. It is not — Radix puts the tab stop on the **list** (`role="tablist"`, `tabindex="0"`) and delegates to the active tab. I was measuring the wrong element.

**Totals: raw `<button>` 151 → 47 · 138 `@d3cloud/ui` elements in Bindery · library at 359 tests.** Bindery's boundary sentinel re-floored again, 60/20 → 40/15, as its own comment predicted it would need to be.

---

### D-054 · Phase 7 · The spinner is a graph, not a wheel
**Date:** 2026-09-04
**Choice (yours): Relay × Mesh, "Alive" balance — the graph leads.** Three nodes still resolving, with a signal relaying around their edges. `explorations/07-spinner.html`, `07b-spinner-network.html`, `07c-spinner-relaymesh.html`.

**Round one was wrong and you said so.** I offered four ways to spin a ring — comet tail, breathing arc, orbiting dots, tumbling chip — and your answer was that nothing stood out, and that you were hoping for something *networking*, related to D3 Cloud. That is a better brief than any of mine: **D3 draws force-directed graphs and the cloud is the link**, so waiting should be drawn as a small network with something moving through it, not as a wheel going round. Round two was built on that, and the answer was a combination of two of them — the graph as substrate, the relay as what happens on it.

**The balance was the only real remaining decision**, so round three varied that and nothing else: same nodes, same relay, same timing, three amounts of substrate movement. "Alive" is 120° of rotation and a third of its size.

**The two periods are 1200ms and 2400ms — exactly 2:1**, so the relay and the settle never drift into a beat against each other. That ratio is now asserted in `motion.test.tsx`, because it is the kind of thing a later retiming breaks silently.

**It shipped invisible for an afternoon, and measuring caught it.** Ported straight from the exploration, the edges rested at 0.16 opacity and the nodes at 0.3. On a card at exploration scale that looked fine; as a 14px spinner it was **1.29:1 against the surface** — present in the DOM and not on the screen. A spinner is a status indicator, so its resting form is held to the same **3:1** the system asks of any control boundary.

The fix is a split rather than a uniform lift, because lifting everything to 3:1 would have flattened the relay into invisibility:
- **Nodes carry the shape** and rest at 0.75 — **4.03:1 on surface, 3.32:1 on raised, 4.39:1 in light**. The graph is always legible.
- **Edges carry the signal** and rest at 0.35, lighting to 1.0 — a **3.3× step**, which is what makes the hop read as movement.
- Node arrival is mostly a **1.0 → 1.3 scale**, because 0.75 → 1.0 is too small a change to see and would have read as a wobble.

**Verified by looking, at every size, on every ground:** 14/16/20/24px exact, `role="status"` with the label on the wrapper and the drawing `aria-hidden` so it never speaks, the on-accent variant legible inside a 34px primary button, and light mode correct. Reduced motion keeps the 2:1 ratio at 2600/5200ms — it slows, it never freezes (D-024).

**One gap this exposed, for Phase 6.** The settle wanted an `ease-in-out`, and the system has no such token — `easing.out`, `.in`, `.spring`, `.linear` only. Adding one means hand-editing a file whose own header says *"GENERATED from tokens/motion.json — do not edit by hand"*, because **the generator that produced it was never committed**. I used `--ease-spring` instead, which is defensible on its own terms — a spring is the curve a settling simulation actually follows — but the missing build script is a real hole in the token layer and should be written before anyone needs a token that does not already exist.

---

### D-055 · Phase 6 · The rules become gates
**Date:** 2026-09-04
Phase 6 was listed as documentation. Most of it turned out to be code, because the audit's finding was never that people did not know the rules — it was that **nothing stopped them**. 176 colour values, 19 type sizes and 170 button recipes are not carelessness; they are what happens when the only thing between a developer and a raw hex is a convention.

**`check-tokens.mjs` closes the hole D-054 found.** Every built stylesheet claimed *"GENERATED … do not edit by hand"* and **the generator was never committed**, so the instruction was unenforceable for eleven phases. Regenerating them is not the fix: their comments carry the reasoning behind the numbers, which is most of their value and which no generator reproduces. So the check enforces the half that matters — **values cannot drift** — and the headers now say what is true: hand-maintained, checked against the JSON.

It compares **values, not names**, which is what makes it possible at all: the naming rule is per-group and bespoke (`duration.1` → `--dur-1`, `pattern.modal-enter` → `--motion-modal-enter`) while the values are literal on both sides. It also checks the copy of the tokens vendored into `d3-ui`, because there are two and nothing noticed when they parted company.

Nine tokens legitimately reach no stylesheet — breakpoints, a package name, prose stating the elevation rule, values only ever composed into a shorthand. Those are marked `$extensions.d3.emit: false` **with a required reason**, in the source, so silencing one is a decision somebody wrote down rather than a line in the script. Two genuine source bugs fell out: `font.family.*` was a stringified list where DTCG wants an array, and the scrim differed only in whitespace.

**`check-usage.mjs` bans the five habits that produced the audit** — raw hex, raw palette classes, off-scale values, primitive `--p-*` tokens, shadows — across `.ts/.tsx/.css`, in any app.

**Its first version was wrong in the way the Phase 2 contrast matrix was wrong.** It flagged every arbitrary Tailwind value, which meant `grid-cols-[1fr_22rem]` and `max-h-[80vh]` — a layout template and a viewport height, neither of which the system has an opinion about. 73 findings where 42 were real. A gate that reports noise is a gate people learn to skip, so it was narrowed to the scales the system actually owns and now ignores anything measured in `vh`, `%`, `calc` or `fr`.

**What it found in supposedly-migrated Bindery:** 38 `text-[11px]`/`[10px]` that should have been `text-11` and now pick up the paired line-height; `accent-amber-400`, a palette class the migration missed because `accent-` was not in my prefix list; `shadow-2xl` on the command palette, violating D-015 outright — now surface-raised plus a boundary; and Ask's 15px prose, moved to the 16 the scale actually has.

**13 exemptions remain, each naming something the system does not cover:** a PIN field spaced so digits can be counted, a highlight sized to a word rather than a control, a brand lockup, offsets that align to another element's width. `tracking` was *not* added as a scale — four uses across two patterns is not enough evidence to invent one, which is the same discipline that kept the component list short.

**Two bugs in my own gate, found by using it.** The exemption lookback matched line prefixes, so it silently stopped applying the moment a reason wrapped onto a second line — it now detects comment regions properly. And `box-shadow\s*:\s*(?!none)` backtracked `\s*` to zero and flagged the four `box-shadow: none` declarations that are the *rule being enforced*; the whitespace had to move inside the lookahead. **The library now passes its own gate with zero exemptions.**

**Written, and deliberately short:** `d3-ui/CONTRIBUTING.md` (the gates, adding a component, semver, deprecation, a quarterly checklist where every line exists because something went wrong once) and `design-system/MIGRATING.md` (the order that worked, the numbers to expect, the four things that will bite, and a recipe→component mapping table). Plus six do/don't pairs as stories in `Guides/Using the system` — visual, and swept by axe like everything else.

**Still open, and both cheap now and expensive later:** App A is JavaScript, where the library's guardrails (`kind`, `tone`, the required `label`) become runtime surprises rather than build errors; and D-017's `fg` vs `text` split, which works and is inconsistent, and gets harder to reverse with every app that adopts it.

---

### D-056 · Published: one repo, and Storybook on GitHub Pages
**Date:** 2026-09-04
`d3-ui` and `design-system` now share one repository — **matdemers1/d3-design-system**, public — because the library's gates run from `design-system/scripts/`, so splitting them breaks `npm run verify` for anyone who clones either half. Bindery's `file:` link and `fs.allow` moved with them.

Storybook is at **https://matdemers1.github.io/d3-design-system**, built by Actions with `npm run verify` as a required step before the deploy job. A broken token value or a raw hex stops the publish rather than shipping a Storybook that disagrees with the system it documents.

**Names.** Bindery stays named — it is the app the system was migrated into and the notes are specific to it. The other four in-scope apps are **App A–E**, with a legend at the top of `AUDIT.md`, and the out-of-scope ones are described rather than named. The reason is one I raised too late: my first question about going public said "publishes the audit", which understated it — the audit names and critiques an unreleased commercial product.

**The anonymisation then broke the build, and CI caught it.** Replacing the lowercase substring `murmur` everywhere hit **`imurmurhash`**, a real transitive dependency, inside `package-lock.json` — `npm ci` 404'd on `iapp-ahash`, a package that has never existed. Blind substring replacement across a whole tree does this; generated files should not have been in scope. Repaired and proved with a real `npm ci`.

**Fonts needed their licence before this could be public at all.** Inter and JetBrains Mono are SIL OFL 1.1, which requires the licence travel with the files, and neither had one. JetBrains' text was recoverable locally; Inter's copyright line was fetched from the canonical source rather than reconstructed, because a licence file is not a place to work from memory.

**The published Storybook was broken three times, and only the third fix was the cause.**
1. *Relative base.* Pages serves from `/d3-design-system/`, so a nested asset resolved to `assets/assets/…`. Setting an explicit base did not fix it.
2. *CSS code-splitting.* Removing it made the tokens and fonts load — and the story still rendered nothing.
3. **The actual cause: Storybook was inheriting the package's own `vite.config.ts`, which is a *library* build** — `build.lib`, React and Radix externalised, `vite-plugin-dts`. Asset references came out relative to the emitted module rather than to the base, so the preview requested `assets/assets/style.css`, the story module failed, and `#storybook-root` stayed empty.

The tell was in the build output the whole time: `[vite:dts] Declaration files built` during `storybook:build`, which has no business generating type declarations. I read past it twice. **`viteFinal` now starts from that config and takes the library parts back out**, which is a fix for the class rather than the instance.

Verified on the live site rather than assumed: zero doubled requests, Inter actually loaded (`document.fonts` reports `loaded`, not merely declared), `--color-accent` resolving, and Button measuring 34px — the same measurement discipline the components were built under.

---

### D-057 · v0.1.0, and two things the tag exposed
**Date:** 2026-09-04
Tagged `v0.1.0` at `939619c`, with a `CHANGELOG.md` the contribution guide's deprecation policy had been referring to for a document that did not exist.

**The published tarball shipped the fonts without their licences.** `files` lists `dist` and `src/tokens`, and the OFL texts were added under `design-system/tokens/fonts/` — outside the package. So the repository was compliant and **the artifact people would actually install was not**. Found by unpacking the tarball rather than by reading the config.

**"Apps install from the tag" was never true, and both documents said it.** The package lives in `d3-ui/`, and npm has no subdirectory support for git dependencies: `npm i github:matdemers1/d3-design-system#v0.1.0` fails with ENOENT on a `package.json` it looks for at the repo root. Nobody had run it. Corrected in `CONTRIBUTING.md` and `MIGRATING.md`, and the working path — the tarball attached to the release — is now the documented one, tested by installing from the public URL exactly as written.

**The tag was moved once, deliberately.** Its first position shipped the licence defect. It was minutes old with no consumers and no release attached, so re-pointing it was better than leaving an artifact that violates the OFL reachable by version number. That is the only circumstance in which a published tag should move, and it will not happen again for a tag anybody could have installed.

Verified end to end from the release URL: `@d3cloud/ui@0.1.0`, the entry importing its own stylesheet, `.d3-btn` present in the CSS, types emitted, and both OFL files packed.

---

### D-058 · The road to 1.0, and four decisions that shape it
**Date:** 2026-09-15
**Plan:** `D3 Cloud Vault/Design System/v1 Readiness Plan.md`

The v1 *scope* from D-028 is built. v1.0.0 is not earned: 15 of 23 exports have never run in a real app, and every fix so far came from a real call site rather than the suite. So 1.0 now gates on seven phases — naming, runtime checks, browser checks in CI, finishing Bindery, adopting d3-qr, an API freeze, and the release.

**D-017 is closed as `fg` everywhere.** `--color-text*` becomes `--color-fg*` in the tokens, both stylesheet copies and the Tailwind theme. It costs 45 references inside the library and two lines of Bindery's bridge; no call site changes, because Bindery already writes `text-fg`. The smell D-017 wrote down — three tokens called two things — does not survive into a frozen API.

**The second consumer is d3-qr, not App B or App C.** It is the only other app that needs the library. It is also a better test than either of the offered options on the axis that matters most: it has a **light theme and a theme toggle**, and the light theme has never rendered in a real app because Bindery is dark-only. The consequence is that Next.js server components stay untested, so v1 **states** it supports client-rendered React rather than implying support it has never exercised. The library ships no `'use client'` directives; RSC support is a 1.x minor when a consumer needs it.

**App A's JavaScript is resolved by dev-mode runtime checks**, not a conversion. Contract props warn in development when omitted or misused, and the checks are stripped from production. That protects any JS consumer, and it takes App A off the list of things 1.0 waits for.

**Bindery work builds on `deps/2026-09-15`**, which already carries Vite 8, Vitest 4, React Router 8 and the fix for the e2e test SegmentedControl broke.

**Distribution waits for V1-7, and one fact is recorded now:** `github.com/d3cloud` is an organisation belonging to an unrelated company ("D3Cloud It Services", 2023). Publishing `@d3cloud/*` to GitHub Packages is therefore impossible, and publishing it to npm would look like their name. The package name is part of the API, so if it changes, it changes before 1.0.

---

### D-059 · V1-2 · Runtime contracts, and the crashes they exposed
**Date:** 2026-09-15
JavaScript consumers now get the library's contracts as development warnings: missing accessible names, enum values that silently fall back, props borrowed from other libraries, and self-contradicting props. Every check sits inside `process.env.NODE_ENV !== 'production'`, so an app's bundler deletes the check and its message strings. The package leaves `process.env.NODE_ENV` for the app to replace, as React does; loading it without a bundler is not supported.

**Writing the tests for the checks found three defects the suite had never exercised.**

**Six components crashed on the exact mistake the checks exist to catch.** Omitting a required prop printed a helpful warning and then threw: Avatar on `name`, CountBadge on `count`, Tabs and SegmentedControl on `items`, Select on `options`. A warning followed by a blank page helps nobody, so all of them now degrade, and a test renders **every export with no props at all**, which covers new components the day they are exported.

**Tooltip threw unless a `TooltipProvider` sat above it** — a Radix requirement that nothing surfaced, because every Tooltip story wrapped itself in one. Bindery was about to replace 68 `title=` attributes with Tooltip and would have met this on the first. A Tooltip now supplies its own provider when none is present; wrapping the app once still shares delays.

**The Tooltip story put a tooltip on a Badge — a `<span>` that cannot take focus** — so the tooltip only ever appeared on hover, the one failure the component's own documentation says it exists to fix. About half of Bindery's `title=` attributes are status explanations of exactly that shape. Tooltip now warns in development when its trigger cannot receive focus, and the story gives the badge `tabIndex={0}`.

Smaller finds: PageHeader built its own count label and still read "1 items", and `<Badge color="green">` type-checks in TypeScript too — React allows `color` on every HTML element — so the `color` warning helps TS callers as well as JS ones.

**The stripping guard caught a leak on its first run.** esbuild dropped every call site but kept the shell of `devWarn`, with its `[d3-ui]` template inside. The guard now bundles the package twice, once for development to prove it can see the strings at all and once for production to prove they are gone, and it was shown to fail by planting an unguarded warning in the build.

**Why one Tooltip test takes five seconds.** Opening a tooltip makes floating-ui call `getComputedStyle` up every ancestor, and jsdom with the real stylesheets loaded takes about five seconds to do that, long enough to look like a hang. The test carries an explicit timeout and the reason, and the same path was checked with a real keyboard Tab in Storybook, where it opens in one frame.

---

### D-060 · V1-3 · The measuring moves into CI, and finds five things
**Date:** 2026-09-15
Three defects shipped past a green unit suite, and each was found by somebody measuring the rendered page by hand. That measuring is now a Playwright suite against the built Storybook: every story, both themes, in a real browser, required before Storybook publishes.

**What it checks, and every check was proven to fail by reintroducing its defect:** control heights on the ramp (the ramp was *measured* from the build first, not recalled), the `box-sizing` reset (removing it fails 194 of 230 with "Input is 36px; d3-inp--md is 34px" — the historical bug, reproduced), label overlap in FormField, visible checkbox glyphs, every colour token resolving (a planted cycle is caught), both fonts reporting `loaded`, axe with real colour contrast, and pixel baselines for nine compositions in both themes.

**What it found:**

1. **The Tabs count failed contrast** — 3.69:1 on the active pill in dark, 3.72:1 in light, 4.29:1 on an inactive tab. This was the first time axe's contrast rule had ever evaluated a component: the unit suite runs axe in jsdom, which cannot compute a colour. The count was dimmed with `opacity: 0.7`; SegmentedControl used the same pattern and passed by luck. Both now use weight, not opacity.
2. **A checked Checkbox with no `checkIcon` showed no tick** — a violet square and nothing else, so "checked" was colour alone (WCAG 1.4.1). Found by *looking* at the first light-theme baseline rather than committing it. The library has no icon dependency, so icons are props — right for decoration, wrong for an affordance. Checkbox now has a built-in tick and Link a built-in external cue, both drawn here and both overridable.
3. **An uncontrolled `defaultChecked="indeterminate"` showed a tick**, because the dash was chosen from the `checked` prop. State is now read from Radix's `data-state`.
4. **The pixel comparison let the missing tick through, twice.** A ratio of 0.2% is ~350 pixels on a story this size. An absolute budget of 12 still passed, because 20 of the tick's 25 changed pixels are antialiased coverage below the default per-pixel threshold of 0.2. Inside the pinned image the rendering is identical run to run, so the per-pixel threshold is 0.05 and the pixel budget is **zero**, verified over three consecutive runs.
5. **One comment of mine overclaimed.** I wrote that the token check would catch the Tailwind layer fragility — colour tokens work only because literal values are unlayered while Tailwind's self-references sit in `@layer theme`. It cannot: Storybook loads the plain tokens, not the Tailwind theme. The invariant is now checked statically in `check-tokens.mjs`, where it holds for every consumer, and a planted `@layer` fails it.

**A false positive worth keeping in mind.** The first survey reported a 34px Button measuring 32px. It was inside a Modal, measured mid-entrance at 94% scale. Heights now come from `offsetHeight` (layout, not paint), and anything rectangle-based waits for finite animations to finish first.

`@storybook/test-runner` was removed — 388 packages, including the deprecated jest-playwright stack — because the new suite supersedes it, and two accessibility runners with different coverage is how people end up trusting the weaker one.

---

### D-061 · V1-4 · Component CSS moves into a cascade layer
**Date:** 2026-09-15
**Found by Bindery, twice over.** Moving Trust's cards onto Card meant `<CardBody className="mb-3">`, and the inputs next in line carry widths like `w-72`. Measured in Chromium against Bindery's production build, both lost: 0px margin and a 1280px-wide input. Component CSS was unlayered; Tailwind v4 puts every utility in `@layer utilities`; unlayered beats layered whatever the specificity. Every class an app puts on a component was silently dropped for any property the component also sets. The peer session building Bindery's sign-in screens found the same thing independently from margins on Button and FormField, and suggested it might be the intended "spacing belongs to the parent" rule. The width case settles it: that is not a spacing rule, it is a component that cannot be sized.

**Decision.** Component rules ship inside `@layer d3-ui`, with the order `theme, base, d3-ui, components, utilities` stated at the top of every component stylesheet and ahead of `@import "tailwindcss"` in theme.css. Layer order is fixed by first mention, so if Tailwind's statement came first and ours named `d3-ui` later, `d3-ui` would be appended after `utilities` and win again. Above `base`, so preflight cannot reset a component. Tokens stay unlayered (check-tokens rule 0): the Tailwind theme's self-references depend on it.

**Rejected.** `:where()` selectors lower specificity, but an unlayered rule still beats a layered one, so it does not help. Documenting "use `style` for overrides" leaves the silent failure in place.

**Consequence.** An app's unlayered global rules for bare elements now override components where they overlap. Checked in both apps: d3-qr's element rules are all in `@layer base`. Bindery has one unlayered rule, `button, [role="button"], select { min-height: 1.75rem }`, and it overlaps no component declaration, since no component button sets `min-height`, so layering changes nothing there. It does already apply to every library button, which matters for Checkbox (see V1-4). The README says to layer such rules.

**Proven.** The dist check fails on any rule outside the layer or a missing order statement, shown with a planted rule. A browser spec injects stand-ins for Tailwind's `base` and `utilities` layers into a real story: it fails against an unlayered Storybook and passes on the layered one, and the full 502-test suite, pixel baselines included, is unchanged. In Bindery's rebuilt app, with the stylesheets in either order: `mb-3` is 12px, `w-72` is 288px, heights stay 34px, and preflight does not strip a button's padding. Tailwind's compiler rewrote our order statement as `@layer d3-ui,components;` placed directly after `base`, which is the order intended.

**Two smaller V1-4 finds landed with it.** CardTitle was always a `<p>`: Trust's nine checks are titled regions, and moving them onto Card would have taken every h2 out of the page outline. Card now takes `as` (section, article, li) and CardTitle `as` (h2 to h4). And Select had no `id`, so the log filter's `<label htmlFor>` would have stopped naming it.


---

### D-062 · V1-4 · The global focus ring is a base-layer default, and focus is swept in the browser
**Date:** 2026-09-15
**Found by looking.** Bindery's first capture on rc.1 had a violet box around every page heading and two rings on the focused search field. D-061 caused both, and nothing had caught them: the global `:focus-visible` ring was unlayered in the token stylesheet, so once components moved into `@layer d3-ui` it beat every component rule that turns the ring off to draw it somewhere else. The published Storybook had shown the double ring on 28 stories, but no check had ever put a story into a keyboard-focused state, and nobody had looked at one.

**Decision.** The global ring sits in `@layer base`, above Tailwind's preflight in document order but below components and app utilities. The token-value invariant (D-058/rule 0) is restated precisely: no custom property may be declared inside a layer, and layered *rules* are allowed. PageHeader's title, `tabindex="-1"` and focused only programmatically, draws no ring. After any keypress browsers treat programmatic focus as `:focus-visible`, so a ring there appeared on every keyboard navigation, around something that is not a control. The Input frame rings only for its own text control.

**Proven.** `browser/focus.spec.ts` Tabs through every story and requires exactly one outlined element at each stop. On rc.1 it failed 28 stories plus the heading. With the first fix in, it caught a third defect: PasswordInput's show/hide toggle lit the frame's ring as well as its own. The full suite passes (711, pixels included). Rule 0 still fails a planted layered token.

**Consequence for apps.** A Tailwind `outline-none` now really removes the ring from an app's own elements. Before, the unlayered global ring silently overrode it. Bindery dropped `outline-none` from native fields that used the ring as their only strong focus cue.

**Lesson recorded for V1-6.** Two consecutive cascade defects, D-061 and this one, were invisible to 500 unit tests and 500 browser checks, and obvious in the first screenshot of a real app. The API freeze includes a rendered review of both consumers in both themes and in a keyboard-focused state, not only the Storybook sweep.

---

### D-063 · V1-6 · The API freeze: what changed, and what was kept on purpose
**Date:** 2026-09-15
A review of every export, prop, default, token and package entry point, checked against both apps' real imports, including the peer's unmerged front-door branch. After 1.0 a rename is a major version, so this is where names settle.

**Changed** (details in CHANGELOG): the internals are no longer exported; the package has four entry points; Tooltip loses its per-instance delay and `className`, and `content` narrows to `string`; Checkbox, TooltipProvider, TabPanel and ModalClose own their prop types instead of passing Radix's through; text containers that accept ReactNode render `div`; `SegmentedItem` is renamed `SegmentedControlItem`. None of it touched app code.

**Two bugs surfaced in the review and are proven fixed.** A `TooltipProvider`'s delay never applied, because each Tooltip set its own. `Link asChild` dropped refs on React 18 and warned on React 19. Each has a test that fails on the old code.

**Kept on purpose.**
- *`ModalClose` stays public.* The review called it internal. It is the only way for a footer button to close an uncontrolled Modal, and the stories teach it. It keeps a narrow type of its own.
- *Plain token names stay as they are* (`--dur-*`, `--weight-*`, `--leading-*`, `--icon-*`). The Tailwind-side names are utility namespaces declared through `@theme inline`, which emits no custom properties, so at runtime each concept already has one variable. Renaming the runtime names to match Tailwind's would be churn, not the one-name rule D-017 set. The weights did repeat their numbers instead of referencing the variables, and now reference them.
- *CodeInput defaults to `lg`,* an exception to D-030's "`md` is the default". A code field is the only task on its screen, entered character by character from another device, and every call site in both apps is that case.
- *Button's `icon` and `iconAfter`* are not renamed to match Input's `leading` and `trailing`. A Button slot takes an icon; an Input affix takes a unit, a glyph or a count. Different things, different names.
- *Unused props with a recorded need stay:* Avatar (D-028), Modal `trigger`/`description`/`size`/`destructive` (D-033), PageHeader `count`/`back`/`actions`/`focusOnMount`, and CodeInput `groups`/`masked`/`mode`/`status`.

**Additive, so left for 1.x:** `forwardRef` on FormField, Modal, PageHeader, SegmentedControl, Tabs and the Card parts; wider attribute types on Select, SegmentedControl and Tabs; exported `SelectSize`, `SegmentedControlSize` and `ActivationMode`; `href` implying `interactive` on Card.

---

### D-064 · V1-7 · Releases ship as tarballs attached to GitHub releases
**Date:** 2026-09-15
**Supersedes the install form in D-035.** D-035 chose "installed by git tag" as `github:<owner>/d3-ui#tag`. That form never worked once the package lived in a `d3-ui/` subdirectory of `d3-design-system`: npm installs a git dependency from the repository root. Both apps have been installing from tarballs attached to GitHub releases since v0.1.1, so this records what is already true.

**Chosen:** every release attaches `d3cloud-ui-<version>.tgz`, packed from the tagged commit after CI passes (build, browser checks). Apps install it by URL. The asset is immutable and the lockfile pins its integrity hash. Before each publish, the downloaded asset is compared byte for byte with the local pack.

**Rejected.**
- *Public npm under a scope the maintainer owns.* It needs a registry account, and both apps would change their import path.
- *GitHub Packages.* Every install would need an auth token, even for a public package, including in both apps' CI.

The package name `@d3cloud/ui` stays. It is never published to a registry, so the unrelated `github.com/d3cloud` organisation does not matter.

**Consequence.** Semver ranges and `npm outdated` do not work. An upgrade is a URL edit, which suits two consumers upgraded deliberately. Moving to a registry later changes the install line, not the import path.

---

### D-065 · v1.1 L1 · The frame arrives: shell, navigation, menu, account menu
**Date:** 2026-09-16
**Why now.** D-028 left the frame for v2 because unifying it first would make the system's first act its riskiest. v1 has shipped and two apps run on it, and the risk moved: every internal app now improvises its own frame. The D3 Auth console shows the result, measured in the v1.1 plan: a wrapping pill nav with *Sign out* on its own line, no `data-theme` anywhere, and a shell width read from a token that does not exist. D-021 specified the shell in September and nothing implemented it. BRIEF's rule is that anything in two apps becomes a component, and the shell is in Bindery, the console and every planned internal tool.

**Shipped (additive, 1.1.0).**
- **`AppShell`** with `brand`, `nav`, `footer` and `children`. At `lg` and above it is a 240px sidebar, collapsible to a 64px rail. The choice is stored in `localStorage` under `storageKey` (default `d3.sidebar.collapsed`, `'1'`/`'0'` as in Bindery). Below `lg` there is a top bar with a menu button and the brand, and the sidebar becomes a drawer. The page has a skip link and one `<main>`. `useAppShell()` returns `{ collapsed, drawer }`, so the brand can swap a wordmark for a mark.
- **`SideNav`, `SideNavGroup`, `SideNavItem`.** One `<nav>` landmark, named "Main" by default. A group is a `role="group"` labelled by its visible title, and the title stays as the name when it is hidden. An item takes `href` or `asChild`: the router's own empty link element is filled with the icon, label and count, and a NavLink-style `className` function is merged rather than replaced. `current` sets `aria-current="page"`. `count` joins the name ("Review, 3 items") and renders as a `CountBadge`.
- **`Menu`, `MenuTrigger`, `MenuContent`, `MenuItem` (`tone="danger"`, `icon`, `asChild`), `MenuSeparator`, `MenuLabel`**, over Radix DropdownMenu (`@radix-ui/react-dropdown-menu` ^2.1.24, deduped against the Radix packages already installed). D-028 named it the first v2 component. It is a floating layer: `surface-raised`, 1px `border-float`, `radius-lg`, no shadow (D-023), on the Confident motion tier (D-024).
- **`AccountMenu`** (`name`, `detail`, `avatarSrc`, `children`). The trigger is Avatar, name and a second line. On the rail it is the avatar alone, with the name in a tooltip and still in the button's name. It opens upward, or beside the rail.

**Choices, and why.**
- *The drawer is a Radix Dialog, and the column and drawer are chosen by `matchMedia`, not CSS.* D-009 applies: focus trap, inert page, Escape, scrim and focus return are not ours to hand-roll. A CSS-only switch would keep a hidden second copy of the navigation in the DOM, with duplicate ids from whatever the app puts in its slots. The drawer is portalled into the shell rather than `<body>`, so a subtree theme (D-037) reaches it.
- *The drawer closes on any click on an `a[href]` inside it.* That covers every router: a router Link has already called `preventDefault` when the click bubbles up, so that is deliberately not checked. It also covers choosing the page you are on. Modified clicks leave it open.
- *The collapse is not animated.* D-024 rules out animating layout that reflows content, and a sidebar changing width reflows the whole page on every frame. The drawer slides on `--motion-drawer`, the token D-024 already reserved, and fades only under reduced motion.
- *Tones follow D-023 literally.* The sidebar and top bar are resting surfaces (`surface`, no border). The drawer floats over a scrim, so it is `surface-raised` with a `border-float` edge, like a modal.
- *`Menu` defaults to `modal={false}`, unlike Radix.* A modal menu marks the whole page `aria-hidden` while it is still full of focusable controls. axe reported `aria-hidden-focus` on the open account menu at 1280px, and the APG menu button pattern does not ask for a modal. Radix still keeps Tab inside the menu and closes it on Escape and on an outside click.
- *Menu items draw the focus ring on `:focus-visible`, inset.* Highlight tone alone is how most libraries show it. But the system's rule is one designed ring on keyboard focus (D-023, D-062), and the browser sweep requires exactly one ring at every Tab stop.
- *Collapsed counts are a dot.* A 20px badge does not fit a 40px rail target without covering the icon, and the count stays in the link's name.
- *Parts used outside their parent render nothing and warn.* Radix throws there, and the contract test renders every export with no props.

**Out, on purpose.** Bindery's upload drop zone, live badge polling, command palette and version badge are app features, not frame. Migrating Bindery onto `AppShell` is a later, separate change (plan). The shell has no controlled `collapsed` prop yet: nobody needs one, and adding one later is additive. A named group of menu radios exists internally for `ThemeSwitch` only, and stay unexported until a second consumer shows their shape. There are no sub-menus.

**Verified.** Unit: 40 new tests (shell landmarks, skip link, collapse persistence, drawer focus, Escape, link and resize closing; nav naming, `aria-current`, counts, `asChild`; menu parts outside a menu). Browser (`browser/shell.spec.ts`, 20 checks): 240 → 64px and back after a reload; the sidebar has no border or shadow and its background is `--color-surface`; the skip link is the first stop and lands in `main`. At 390 and 768 the drawer is 240px, 16 Tabs never leave it, Escape returns focus to the menu button, and the scrim and a link both close it. The open account menu has no shadow, a 1px border and a `surface-raised` background, and is operable from the keyboard. axe is clean closed and open, in both themes, at 390, 768 and 1280. The existing sweeps (axe, geometry, one focus ring, tokens) pass on all 15 new stories.

---

### D-066 · v1.1 L1 · Theme switching: System, Light, Dark
**Date:** 2026-09-16
**Found by the console.** Nothing in any app sets `data-theme`, so a light OS gets the light theme on a dark-first system (D-011), and nobody can choose. The owner decided in the v1.1 plan that the theme follows the OS, with a System / Light / Dark switch in the account menu, remembered per browser.

**Shipped.** `ThemeProvider` (`storageKey` default `d3.theme`, `defaultPreference` default `system`), `useTheme()` → `{ preference, resolved, setPreference }`, `ThemeSwitch` (`label` default "Theme", `size`), and `themeBootScript(storageKey?)`.

**Decisions.**
- *The provider always writes the resolved mode, `light` or `dark`, to `<html>`, and never removes the attribute.* An absent attribute means "follow the OS" to the token CSS, so an explicit Dark on a light OS would have rendered light. Writing the resolved value also gives portalled layers, which sit outside any subtree theme, the same answer as the page. `color.css` already honoured `[data-theme="dark"]` (D-037), so no token change was needed. `system` is followed live through a `matchMedia` listener, and the choice is followed across tabs through the `storage` event.
- *Storage is wrapped everywhere.* Private modes and blocked policies throw on read or write. The choice then holds for the visit and is not remembered. An unrecognised stored value is ignored.
- *No flash comes from a boot script, not from React.* React runs after the first paint, so the export is an inline script string for `<head>` that sets the same attribute from the same key. The key is JSON-encoded and `<` escaped, so no key can close its `<script>`. The output is deterministic for a given key, so a CSP can allow it by hash (the console's plan).
- *`ThemeSwitch` picks its control from where it is rendered.* On a page it is a `SegmentedControl`, the system's radiogroup (D-052). Inside a `MenuContent` it is a group of `menuitemradio`s labelled by a visible "Theme" label. **A `SegmentedControl` inside the menu was rejected on accessibility grounds.** `role="menu"` may only own menu items and groups of them, so a `radiogroup` there is invalid markup (axe reports it as `aria-required-children`). And Radix's roving focus and typeahead own the arrow keys in a menu, so the radios' own arrow handling would never run: a keyboard user could reach the group but not move within it. Menu radios are the pattern screen readers already announce inside a menu ("Light, radio menu item, not checked, 2 of 3"), and they are reached with the same arrows as every other item. Choosing one keeps the menu open, so the change is seen where it was made. Detecting the menu by context means an app writes `<ThemeSwitch />` in either place and gets the right one.
- *Outside a provider, `useTheme` reports the OS and cannot change anything.* It warns in development instead of throwing, the same "degrade, never crash" rule as D-059.

**Verified.** Unit: 13 tests. System follows the OS live. Explicit Dark on a light OS writes `dark`. The key is honoured and read back, garbage is ignored, and throwing storage works. A change in another tab is followed. The boot script covers stored, system, garbage, custom key, throwing storage and `</script>` escaping. Browser: Dark chosen on a light OS survives a reload with the dark `--color-bg`. System follows an emulated OS change. For four stored/OS combinations the boot script sets the right `data-theme` while `document.body` does not yet exist. In the open account menu, keyboard arrows reach Light, Enter selects it, the menu stays open, and `<html>` changes.

---

### D-067 · v1.1 · List rows are not tables
**Date:** 2026-09-17
**Found in the D3 Auth console.** Every list — people, apps, sessions, grants, the audit trail, pending invites — was a hand-built `ul.rows > li.row` in four variants, with row actions that landed wherever the wrap put them. The obvious component for that is a table, and D-028 already cut the data table to v2.

**Chosen:** `DataList` and `DataListRow`. A real `ul` of `li`s with slots for `leading` (Avatar or icon), `title`, `description`, `meta` (badges, a timestamp — tabular figures) and `actions`. Rows are at least `--row-height` (48px), padded `--cell-pad-y`/`--cell-pad-x`, divided by the decorative `border` role (D-023). Title and description truncate to one line (D-019); `truncate={false}` is for a log line whose detail is the point.

**Why not a table.** A person with a name, two badges and a Suspend button is an item, not a record of cells. `role="table"` promises column headers, cell-by-cell navigation and, to a sighted user, sortable columns; none exist here, and a table with no headers is worse for a screen-reader user than a list. The console has no question a column answers ("sort people by last sign-in"). When an app does, that is the v2 data table, still out of scope by name.

**Alignment without columns.** From `sm` the list is a four-track grid and each row a CSS subgrid, so meta and actions line up down the list and actions share one trailing edge. Spacing between tracks is a margin on the slot rather than a grid gap, so a list with no leading slot has no empty gap. Below `sm` meta and actions move under the text and stay in the tab order. An app with more actions than fit a phone passes one Menu as the row's action. The row does not build its own overflow menu: that would couple it to `Menu`, and decide for the app which actions are secondary (D-034: only secondary actions collapse).

**The interactivity rule is Card's.** A row is either one link or it holds actions, never both. `href` makes the whole row an `<a>` and renders no `actions` (typed `never`, and dropped with a development warning for JavaScript callers); a linked row that contains a control warns, as Card does. A row with actions stays inert and its `title` is the `Link`. Inside a Card the list bleeds by `--cell-pad-x`, so row text lines up with the card's title. `href` is a plain anchor; whole-row links under a client router are additive later if an app needs them, and until then the title-as-Link form takes `<Link asChild>`.

**Empty.** `empty` renders in place of the list when there are no rows: an `EmptyState` with the `kind` that fits.

**Proven.** Unit tests for the semantics (a list, no table or row roles), the slots, the link-or-actions rule both ways, and the empty swap. In the browser: rows ≥ 48px padded 12/16; action right edges and meta left edges identical across rows; truncation with an ellipsis and no page overflow; actions under the text at 390px; every row control reached by Tab at 390 and 1440px.

---

### D-068 · v1.1 · Page primitives: token names in, nothing arbitrary out
**Date:** 2026-09-17
**The inside of the frame, after D-065's shell.** `Page`, `Stack`, `Cluster`, `Grid`, `Section` and `AuthLayout`. Each replaces local CSS that every app has written for itself with a different number: the console's `.shell` at 72rem and 28rem (neither a token), `.stack`, `.row-meta`, `.tiles` on a 16px gutter, and `Card` + `h2.section-title`.

**Props take token names, never values.** `Stack gap="16"` is `var(--space-16)`. The type is the union of D-021's twelve steps, so `gap="15"` is a type error (and, for JavaScript, a development warning and the default step). `Page width` is `wide | narrow | form | prose`, the four `--container-*` tokens. There is no `style` escape and no arbitrary length. The plan named the risk of primitives growing into a CSS-in-props framework; the types are the answer. A gap the scale lacks is a scale change, and a width the containers lack is a container change.

**`Page`.** The container width is the width of the *content*: `max-width` is the container plus twice `--page-pad`, so a wide page's rows are 1280px on any monitor (D-021). Padding is `--page-pad` (24px, 32px from `lg`), and regions are 24px apart. It renders a `div` by default, **because the app shell owns the page's one `<main>`**; `as="main"` is for a page with no shell. Loading skeletons, errors and denied states go inside it, so they sit where the content will.

**`Grid` takes a minimum tile width, not a column count.** `minItemWidth` is `sm | md | lg` (16, 20, 24rem), producing `repeat(auto-fit, minmax(min(100%, …), 1fr))` on `--grid-gutter`, and one column below `md`.
- *Why not D-021's literal 12 columns with spans:* a span API needs per-breakpoint spans to honour "one column below `md`", which is the props-as-CSS framework ruled out above. And no screen in the console or Bindery places tiles asymmetrically: the dashboard is equal tiles.
- *Why this keeps "columns drop, they do not shrink":* a tile never goes below its minimum. When a row cannot fit another, a column drops.
- *What it costs:* an asymmetric layout (2/3 + 1/3) composes Stacks or stays local CSS. If two apps need one, that is the evidence for a `columns` prop, added in a minor.

**`Section` makes the card-or-not choice explicit.** A `<section>` named by its heading through `aria-labelledby`: `h2` by default, `h3` for a section inside a section. It takes a `description`, trailing `actions` that wrap under the title, and `surface="card" | "plain"`. `card` is the default, since the pattern it replaces was a Card, and renders Card itself, so padding and tone cannot drift from it. The title is D-019's section step, 20px/600 (`h3`: 16px/600), from runtime tokens only. The console's section titles rendered at 400 because they read Tailwind names that do not exist without Tailwind (D-070). The body is a column on the 16px step, so an Alert, a DescriptionList and a FormActions row compose inside it without a Stack.

**`AuthLayout`.** Form width (480px of content), centred, 40px from the top below `md` and 64px from `md`. A product mark slot, then `PageHeader` for the title, so the single `<h1>` and the focus that announces a new step are handled once; then the task, then a footnote slot. It renders `main` by default, because a sign-in page has no shell.

**Recorded so it is not re-asked:** no `typography.css` of text-style classes. Text styles go through components (Section titles, DescriptionList terms), and apps use tokens directly.

**Proven.** In the browser, on a page composed only of these exports: content 1280px at a 1440px viewport with 32px padding and 24px between every region; 24px padding below `lg`; `narrow` 672px and `form` 480px; Grid tiles 24px apart, and one column at 390px; a Section title computed at 20px/600 in both themes, and a card body 16px under its head; AuthLayout 480px and centred on a desktop, with no horizontal overflow at 390px. Pixel baselines for the composed page and the DataList, in both themes.

---

### D-069 · v1.1 · Form action order, filter bars and key/value lists
**Date:** 2026-09-17
**Found in the D3 Auth console:** every form's buttons were full width and stacked, because forms were a flex column with no action-row pattern. Audit's filters were a card of stacked fields with the export button last. Detail pages set key/value pairs as the same rows as entity lists.

**`FormActions`: primary last in the DOM, primary on top on a phone.** From `sm` the buttons are a row on the aligned edge (`end` by default), with the primary last and so nearest that edge. An optional `leading` action, destructive or an escape, sits on the opposite edge. Below `sm` they are full width and stacked, primary on top.
- *How:* below `sm` both the group and the row around it become `column-reverse`. The phone order is the DOM order **mirrored**, not reshuffled with `order`: `[Delete, Cancel, Save]` reads Save, Cancel, Delete from the top.
- *Why that is acceptable from the keyboard:* the source order is the desktop reading order, where most forms are filled in. On a phone the focus order is the visual order exactly reversed, so it still moves in one direction through two or three adjacent peers rather than jumping around. WCAG 2.4.3 asks that focus order preserve meaning and operability, and a reversed stack of peers does. The alternative, primary first in the DOM, puts the primary first in the tab sequence and leftmost on a desktop, against platform convention and the console's own forms.
- *One exception, stated:* with `align="start"` the leading action renders after the group, so desktop DOM order still matches left to right. On a phone `order` moves it back to the bottom, so that one case is not a pure mirror.
- Development warnings for a second primary, and for a primary that is not last.

**`FilterBar`.** From `md`, controls in one row that wraps, bottom-aligned so the visible labels share a line. Each control is 12 to 20rem wide; a SegmentedControl keeps its natural width. `trailing` (a result count, an export) takes the far edge. Below `md`, a full-width column. Labels stay visible: a FormField, or a SegmentedControl's own name. With an `aria-label` the bar is a named `role="group"`; without one it has no role, because an unnamed group announces nothing useful.

**`DescriptionList` and `DescriptionItem`.** A real `<dl>`, each pair in a `div`, which a `dl` allows. From `sm`, two columns, the term column a third of the width up to 14rem so a long term wraps inside it; stacked below `sm`. `numeric` gives a value tabular figures (D-019). Values wrap anywhere, because redirect URIs and client IDs have no spaces.

**Proven.** Unit tests for DOM order at both alignments, and the Tab sequence. In the browser: from `sm` one row reading Delete, Cancel, Save left to right; at 390px Save, Cancel, Delete from the top, each button the full width of the row; filter controls on one baseline with the trailing slot flush to the far edge, and full width at 390px; term beside value from `sm`, above it at 390px.

**Found on the way, not fixed here.** In Chromium a native `<Input type="date">` has an internal calendar-picker tab stop, and at that stop the Input frame draws no focus ring (its ring is `:has(> .d3-inp__control:focus-visible)`). The focus sweep caught it on the first FilterBar story. The stories use a Select for "Since" instead; the fix belongs with Input, and the console's Audit filter uses a date input.

*Fixed in 1.1.0-rc.2:* for date and time types the Input frame also rings on `:focus-within`. At the picker stop the `<input>` matches neither `:focus` nor `:focus-visible` but is still the active element, and those fields hold nothing else focusable. A `Date` story puts the case in the focus sweep, and `browser/focus.spec.ts` checks every internal stop. Both failed before the rule.

---

### D-070 · v1.1 · The usage gate knows which token names exist at runtime
**Date:** 2026-09-17
**Found in the D3 Auth console.** Card and section headings rendered at weight 400. `styles.css` read `var(--font-weight-title)`, `var(--font-weight-semibold)` and `var(--text-24--line-height)`. Those names are declared only inside the `@theme inline` blocks of `theme.type.css`, which instruct Tailwind's compiler and emit no custom property. The console does not use Tailwind, so every one was undefined, and `d3-check-usage` passed: it built its list of known tokens from every declaration in every build stylesheet, theme files included.

**Chosen.** The gate separates declarations inside an `@theme` block (found by brace depth, with comments stripped) from runtime declarations. By default only runtime names are known, and a Tailwind-only name fails as its own rule, `tailwind-only-token`, which points at the runtime name. `--tailwind` admits the theme names, for an app whose CSS Tailwind v4 compiles with `theme.css`. A name declared nowhere is still `unknown-token`, with or without the flag.

**Rejected.** *Filtering by file name* (`theme*.css`): it misclassifies silently the day a theme file gains a runtime rule or a runtime file gains an `@theme` block. *Runtime aliases for the Tailwind names:* two names for one concept is what D-017 and D-063 refused.

**Proven.** Against the console's `src`, the 1.0 gate reports nothing. The new one reports 7: `--text-24--line-height` and `--font-weight-title` (the sign-in title), `--font-weight-medium` three times, `--font-weight-regular` and `--font-weight-semibold`. With `--tailwind` it passes. The library's own `src` passes. A test runs the script as a process against fixtures for runtime names, Tailwind-only names with and without the flag, and an undeclared name.


---

### D-071 · v1.1 · Owner review of the page patterns
**Date:** 2026-09-17

The nine patterns (L4) were reviewed as screenshots — dark and light, phone and desktop — before the D3 Auth console was rebuilt on them. The direction was accepted, with three changes:

- **Pages sit on the start edge.** `Page` gains `align: 'start' | 'center'`, default `start`. A narrow detail or settings page centred beside a 240px sidebar left a column of empty space on its left and moved the title every time a person went from a wide list to a narrow page. `center` remains for a page with no shell. `AuthLayout` is unchanged: a single task with nothing around it is still centred.
- **A settings page has no primary.** Each Section's save is a secondary button, still last and still named for what it saves. Several independent forms on one screen each claiming primary is the "one primary per view" rule broken three times; the order and the name carry the meaning instead.
- **Single-task forms stack their actions.** `FormActions` gains `layout: 'row' | 'stack'`, default `row`. `stack` is the phone layout at every width: the primary full width, the `leading` alternative (*Use a passkey*) beneath it. Sign-in and code steps use it; everything inside an app keeps the row.

All three are additive and part of 1.1.0; `Page` and `FormActions` have not been released, so the `Page` default is not a breaking change.

---

### D-072 · v1.1 · Strict CSP: the library takes the page's style nonce
**Date:** 2026-09-17
**Found by the D3 Auth console on 1.1.0-rc.1.** The console serves `style-src 'self'` with no `'unsafe-inline'`, as an identity provider should. Opening a `Modal` or the `AppShell` drawer logged a CSP violation and the page behind still scrolled. Both are Radix Dialogs, which lock scroll through `react-remove-scroll` → `react-remove-scroll-bar` → `react-style-singleton`, and the singleton injects a `<style>` element while a layer is open. `Select` and a modal `Menu` go through the same path, and Radix `Select` also renders its own `<style>` to hide the list's scrollbar.

**Chosen: `setStyleNonce(nonce: string): void` and `readStyleNonce(): string | undefined`.** The singleton reads its nonce from the `get-nonce` package on every injection, so `setStyleNonce` calls `get-nonce`'s `setNonce`. `readStyleNonce` reads `<meta name="d3-style-nonce" content="…">`. The pattern: the server makes a nonce per response, sends it in `style-src 'nonce-…'` and in that meta, and the app calls `setStyleNonce(readStyleNonce())` before the first render. `Select` passes the same nonce to Radix's `Viewport`, which takes it as a prop.

**The hazard is a second copy.** `get-nonce` keeps the nonce in a module-level variable. If `setStyleNonce` set one copy and the singleton read another, every strict-CSP page would silently keep the defect. So:
- `get-nonce` is a direct dependency at `^1.0.1`, the version `react-style-singleton` already resolved in the lockfile (its own range is `^1.0.0`), so npm dedupes to one copy in an app.
- It is external in the library build, like React and Radix. `check-dist.mjs` fails if `dist/index.js` stops importing it by name or carries a copy of its body, and if the name resolves to a different file from this package than from `react-style-singleton` (reached through `@radix-ui/react-dialog`). Both halves were proven by building with it bundled.

**Rejected.**
- *A `nonce` prop on `Modal`, `AppShell` and `Select`.* The nonce is per page, not per component, and the scroll lock is a singleton shared by every open layer. A prop would have to be threaded through every layer, and a missed one would still break the lock.
- *A provider component.* A context cannot reach `get-nonce`, which is a module variable. A provider would call the same function during render, which is later than the first layer might open.
- *Reading the nonce from an existing `<script nonce>` or `<style nonce>`.* Browsers hide a parsed `nonce` attribute from `getAttribute`, and a page need not have such an element. A meta is explicit, and the server already knows the value.
- *Shipping the lock's CSS in `index.css`.* The injected rules carry the measured scrollbar width, so they cannot be static.

**Not covered.** An app's own inline `style="…"` attributes in server-rendered HTML are the app's to solve. The components set styles through the CSSOM (React's `style` prop, Radix's popper positioning), which `style-src` does not govern.

**Proven.** Unit: the nonce set through the package's entry lands on the `<style>` the Modal scroll lock injects, and no nonce is set when none was given; `readStyleNonce` reads the meta and ignores an empty one. Browser (`browser/csp.spec.ts`): a fixture app built from `dist/` (`browser/csp-fixture/`, served at `/csp/`) under a meta `Content-Security-Policy: style-src 'self' 'nonce-TEST'`. The built bundle contains exactly one copy of `get-nonce`. `securitypolicyviolation` is recorded from before the first script runs. Opening the Modal, the Select and, at 390px, the AppShell drawer records no violation, the lock's `<style>` carries `nonce="TEST"`, and `body` computes `overflow: hidden`, with a wheel over the scrim leaving `scrollY` at 0. The control is the same page with `?nononce`, which skips the call: it records `style-src` violations and the page is not locked. Without the control, none of the passing checks would show the policy was in force.

---

### D-073 · v1.3 · Foundations for calm apps: Toast, a recessed shell, a filled field, and a faster high-frequency tier
**Date:** 2026-09-29
**Prompted by:** Postroom's design audit (PST-ADR-011). The operator: the UI is "overly complicated… the sidebar and inbox render at the same color, which is just weird… the input boxes just look off", and "I feel like animations and motion really bring a web application alive." Four apps consume this library, so **everything here is additive and opt-in**; no default, no existing token meaning and no existing assertion changes, except the four motion values in the amendment, which were unused or used only by Tabs and SegmentedControl.

**`AppShell navTone="recessed"`.** The default (`raised`) is unchanged: sidebar on `surface`, page on `bg`. `recessed` inverts it: sidebar and the top bar below `lg` on `bg`, `<main>` on `surface`. It exists for an app whose content is one working surface — a list beside a reading pane — where raised chrome makes the content look sunk. Two tokens stop working on `bg` and are moved up a step **inside the recessed sidebar only**: in light `surface-hover` *is* `bg` (1.00:1) and `accent-muted` is 1.01:1 against it, so hover and the current item would vanish. Hover lifts to `surface` (1.07:1 light, 1.10:1 dark against `bg`); the current item to `surface-raised` (1.12:1 light, 1.43:1 dark) and keeps its accent text (8.15:1 / 4.71:1 on it) and semibold weight, which are the signals that do not depend on the fill. A quiet count on the current item drops to `bg` so it stays visible.

> [!note] Amended 2026-10-01 by D-084
> The recessed current item's 1.12:1 / 1.43:1 fill was not enough on its own (PST-DA-049). Every current SideNav item, recessed or not, now also carries a 3px `--color-accent` leading bar (≥4.71:1 against the fill and the ground in both themes).

**`appearance="filled"` on Input, Textarea and Select, and `SearchField`.** 36px, 14px text, filled with `bg` one tonal step below the `surface` it sits on, the same 1px `border-field` edge (D-013), and at focus **one** 2px outline laid over that edge (offset −1px) with no border-colour change — the outlined field draws an accent border *and* an offset ring. Measured in the browser against the fill: **3.92:1 light, 4.29:1 dark.** `surface-raised` was rejected as the fill: the edge falls to 3.00:1 in dark. Inside a recessed sidebar (a `bg` container) the fill moves to `surface` (4.21:1 / 3.91:1). Filled has one size and carries no size class, so it sits off the Button ramp by design; beside a Button, use outlined. Invalid keeps its danger edge and the covering ring takes the danger colour. `SearchField` is the filled Input with `type="search"`, a search glyph and an optional key hint that sets `aria-keyshortcuts` and hides once there is text; the app binds the key.

**`Toast`, `ToastRegion`, `useToast`.** The first v2 component D-028 deferred. A floating layer (`surface-raised`, 1px `border-float`, no shadow — D-023) fixed at the bottom centre so nothing reflows. **One at a time:** a newer toast replaces the one on screen with a hover-speed cross-fade rather than stacking. **Never takes focus.** Six seconds by default, paused while the pointer or focus is inside it, resuming with what was left (WCAG 2.2.1); `duration: 0` stays until closed. At most one action; its shortcut is drawn as a key hint and announced through `aria-keyshortcuts`, and the app binds the key, because only the app knows whether it is free. Escape inside it closes it and returns focus to where it came from. The region is a polite live region that exists before any toast, because a live region inserted with its content is not announced.

**The motion retune (amends D-024).** Postroom's operator put high-frequency motion at 150–250ms; the library's toast and row tokens sat at 420ms on a spring and were unused.

| Token | Was | Now | Why |
|---|---|---|---|
| `--motion-toast-enter` | 420ms spring, 26px, scale .94 | **200ms spring, 16px, no scale** | it answers an action; it should land before the eye moves on. Overshoot is under 2px at 16px |
| `--motion-toast-exit` | 280ms ease-in | **140ms ease-in** | leaves without ceremony |
| `--motion-row-exit` | 420ms spring | **180ms ease-in** | a spring on something *leaving* reads as a bounce |
| `--motion-tab-glide` | 280ms spring | **160ms ease-out** | on a 30px control the overshoot is visible jitter. Affects Tabs and SegmentedControl in every app |

`.enter-toast` now uses a new `rise-near` keyframe (16px, no scale). **Unchanged on purpose:** `--motion-modal-enter` (occasional, so it keeps its theatre), `--motion-list-enter`, `--motion-drawer`, the menu family, and every `--dur-*` and easing. No new token names, no new colours (D-016).

**Rejected.** *Changing `Input size="md"` in place* — four apps' forms would move 2px and change focus treatment in one minor release. *A borderless search field*, as the audit mockup drew it — it breaks D-013's findable boundary. *A `--field-fill` custom property* to follow any container — a semi-public knob for one case; the recessed sidebar is handled by a scoped rule. *Binding a toast's shortcut inside the library* — it would fight the app's own key handling.

**Proven.** Unit: Toast (14 — live region before content, no focus theft, action/close/timeout/replace/dismiss reasons, pause on hover and focus with the remainder kept, Escape returns focus, axe), SearchField (4), appearance on Input, Textarea and Select, `navTone` default adding no class, and the four retuned tokens plus the unchanged modal token read from the CSSOM. Browser (`browser/calm.spec.ts`, and a new recessed case in `browser/shell.spec.ts` — no existing assertion changed): filled fields 36px/14px on a `bg` fill with the edge at 3.92:1 and 4.29:1, one 2px outline at −1px with the edge colour unchanged, the filled Select the same; the toast enters as `d3-toast-in` at 0.2s backwards, sits on `surface-raised` with no shadow and no retained transform, leaves at 0.14s, and focus stays on the button that raised it; the tab glide at 0.16s ease-out; recessed sidebar on `bg`, main on `surface`, hover on `surface`, current on `surface-raised`, in both themes, with axe clean. Every new story passes the axe, geometry and focus sweeps in both themes.

### D-074 · v1.3 · RecipientField: a hand-written APG combobox, and a borderless header row that keeps its label
**Date:** 2026-09-29
**Prompted by:** Postroom's composer rebuild (PST-ADR-011). The operator: composing "just has too many fields all at once… the input boxes just look off." The new composer shows To and Subject as labelled rows with hairline dividers, To takes recipient chips with contact autocomplete, and "Cc Bcc" on the right reveal those rows. Foreman task DS-T-002.

**Chosen: `RecipientField`** — `value: { name?, address }[]`, a caller-supplied async `loadSuggestions(query, { signal })`, and two variants: `field` (a boxed form control) and `row` (the composer header).

**A combobox written here, against D-009.** D-009 chose Radix for "anything with real accessibility complexity (… combobox …)" and ruled out hand-rolled comboboxes. Radix has no combobox primitive — `@radix-ui/react-select` is a listbox button whose trigger cannot take text, and `react-popover` would still leave every ARIA and keyboard decision to us while adding a dependency and a portal. So this is the **WAI-ARIA APG "editable combobox with list autocomplete"** pattern, implemented to the letter and covered by its own tests rather than trusted:
- the text input is `role="combobox"` with `aria-expanded`, `aria-controls` → a `role="listbox"`, `aria-autocomplete="list"`; the first suggestion is active on open (automatic selection);
- **focus never leaves the input**: ↓/↑ move `aria-activedescendant`, Enter or Tab adds the active option, Esc closes without clearing;
- options contain nothing focusable, and chips sit outside the combobox in a labelled `list`, so there is no nested-interactive structure. Each chip's remove button is `tabIndex=-1` — for the pointer. From the keyboard a chip is *selected*, not focused: Backspace on an empty field selects the last chip and a second Backspace removes it; ← and → move the selection. So the field is one tab stop, and Tab with nothing typed leaves it (no trap);
- a polite `status` region says what happened ("Added Dana Okafor.", "Elena Park selected. Backspace removes it.", "2 suggestions.").

D-009's reason — "we own none of the focus-management or ARIA plumbing" — still holds for dialog, menu, select, tabs and tooltip. If Radix ships a combobox, this should move onto it.

**Parsing is deliberately small.** Comma, semicolon and newline separate recipients outside `"…"` and `<…>`; `Name <addr>`, `"Last, First" <addr>` and bare addresses parse. A separator commits from the input's *value*, not the key, so mobile keyboards and IMEs behave the same. Paste commits at once when it holds a separator or an `@`; a pasted surname stays as search text. Validation never refuses input — it only draws the chip in the danger tone, with a "!" in place of the initials and "not a valid address" in its accessible text, so it is not carried by colour (WCAG 1.4.1). The server checks every address again.

**The borderless row — amending D-013 for header rows.** D-013 says fields carry a 3:1 `border-field` boundary and rules out borderless fields, because WCAG 1.4.11 requires the visual information *needed to identify* a control to reach 3:1. A composer header is the case where the boundary is not what identifies it:
- The row has a **visible text label in the row** ("To", "Cc", "Subject"), at text contrast (`fg-faint`, ≥4.5:1 on every surface) — stronger than 3:1 — and it names the control (`<label for>`). 1.4.11's understanding document accepts a control identified by its label and position; a boundary is one way to meet it, not the only one.
- The row **keeps one side of D-013's boundary**: a 1px divider under it in `--color-border-field`, the same 3:1 value the boxed fields use, so the rows read as a form and each row's extent — its hit area — is findable. `--color-border` was tried first, as the mockup drew it, and **vanished in dark**: it is the same step as `surface-raised`, which is the composer pane (Menu.css hit the same thing). The row is 44px tall, and a click anywhere in it puts the caret in the field.
- Focus is unmistakable: the system ring (D-023) around the row and the label turning accent.
- So the amendment is narrow: **a header row may drop three sides of the box only because it keeps a visible label and the 3:1 bottom edge.** It warns in development when `label` is missing, and a browser test asserts both the label and the divider are rendered. A borderless field with only a placeholder remains ruled out everywhere; `field` keeps D-013's boundary unchanged.

**Motion.** A chip that arrives scales in on `--dur-2` (140ms) with `--ease-spring` — within the composer's "fast" band — with backwards fill only; chips present on first render do not animate (entrances belong to things that arrive, D-024). Under reduced motion it is an opacity fade. The suggestion list uses `--motion-popover-enter`, the Confident tier: it opens on nearly every keystroke and must not perform (D-024's menu carve-out). No token was added or retuned.

**Rejected.**
- *Chips as focusable buttons in the tab order.* N tab stops before the text, and Tab is already the "add" key.
- *A portal for the suggestion list.* Positioning without a popper dependency is simplest inside the field. The cost: a scroll container with `overflow: hidden` around the field can clip the list. The composer's header rows are not inside one.
- *A `row` variant of `Input`.* Subject in the composer is a plain text row; that belongs with `Input`'s own variants, not here.

**Proven.** Unit: parsing (split, quotes, `Name <addr>`, round-trip, validity), keyboard (↓↑ wrap, Enter/Tab/comma/semicolon/paste commit, Esc, Backspace select-then-remove, ←/→/Delete, Tab not trapped), a stale loader answer never shown, axe with the list open and with a chip selected. Browser (`browser/recipientfield.spec.ts`): the composer driven by keyboard only in both themes, axe on the open list and the selected chip with contrast computed, a real `ClipboardEvent` paste, the row's label and divider measured, and the chip's animation read from the computed style with and without reduced motion. Every story is swept by the existing axe, geometry and one-ring focus checks.

---

### D-075 · v1.4 · Two shadows: a sheet and a float, and nothing else
**Date:** 2026-09-29
**Prompted by:** Postroom's redesign canvas (PST-ADR-011) and DS-ADR-001. Every floating layer drawn with a 1px `border-float` at 3:1 read as outlined with a pen, and the recessed shell's content (D-073) sat on `bg` as a stripe of colour rather than a surface. **Amends D-015 and D-023.**

**Question:** Can the system take a shadow without reopening a shadow ramp, and without giving up the one-mechanism-in-both-modes argument D-023 made for the boundary?

**Chosen:** exactly two shadow tokens, each named for the one job it does, both switching with the theme on the same selectors as the colour tokens.

| Token | Light | Dark | Used by |
|---|---|---|---|
| `--shadow-sheet` | `0 1px 2px rgba(16,17,23,.05), 0 4px 16px rgba(16,17,23,.05)` | `0 1px 2px rgba(0,0,0,.35)` | AppShell `navTone="recessed"` `<main>` **only** — a sheet inset 8px from the page on `radius-lg` |
| `--shadow-float` | `0 0 0 1px var(--color-border), 0 8px 24px rgba(16,17,23,.12), 0 2px 6px rgba(16,17,23,.06)` | `0 12px 32px rgba(0,0,0,.5), 0 2px 6px rgba(0,0,0,.3)` | Menu (so AccountMenu's panel), Tooltip, Toast, Modal, RecipientField's suggestion list — all still on `surface-raised` |

- The light and dark values are emitted as `--shadow-{sheet,float}-{light,dark}` sources, declared on every theme root because the light float names `var(--color-border)`, which a custom property resolves where it is declared. Components read only the two mode-following names; the guard refuses the sources in a `box-shadow`.
- **`border-float` stays.** The floating layers keep a 1px border, transparent, so no box changes size. Under `forced-colors: active` (where the UA drops every shadow and repaints a transparent border in a system colour) and `prefers-contrast: more`, the shadow goes and the 1px `border-float` edge returns.
- **Focus is never a shadow.** It stays a 2px outline at a 2px offset (D-023, D-062).
- **Everything else stays tone-only:** resting surfaces, Card, the sidebar, the drawer, Select's list and the skip link are unchanged.
- **No Tailwind utilities** for either token. Tailwind's seven default `--shadow-*` keys stay `initial`; a `shadow-float` class would be an invitation to put it anywhere, and the guard rejects every `shadow-*` class regardless.

**Why:** In light, the ladder still ends at white — D-023's reason for a boundary — so the float opens with a 1px ring in the *divider* colour, and that ring, not the blur, is what finds a white menu on a white card. The blur carries depth rather than findability, so dropping it under forced colours or more contrast loses nothing a user needs, and the 3:1 edge those modes ask for is the one D-023 already verified. In dark, `surface-raised` is already a step above every ground, so the float is only depth and carries no ring. The sheet is the one resting surface with a shadow because it is the one place a surface meets the page ground with nothing at its edge. Two named tokens keep "reaching for a shadow" a build-visible act: the guard admits exactly `box-shadow: var(--shadow-sheet)` and `box-shadow: var(--shadow-float)` as the whole value, and nothing else.

**Rules out:** a shadow ramp (`sm`/`md`/`lg`) or any third shadow; a shadow on a resting surface other than the recessed `<main>`; either token composed with another layer or given a fallback; a shadow as a focus ring; Tailwind shadow utilities; dropping `border-float` from the token set.

**Verification:** `npm run check:tokens` holds `tokens/shape.json` and both copies of `build/shape.css` to the values above. `src/test/check-usage.test.ts` feeds the guard the two admitted forms, `none`, an inset ring and a custom property naming the token (all pass), and a raw shadow, the source tokens, an invented token, a fallback, a second layer, a shadow focus ring, an app-local shadow token and `shadow-*` utilities including `shadow-float` (all fail, citing D-075). `browser/elevation.spec.ts` sweeps every story in both themes and requires no computed `box-shadow` (on an element or its `::before`/`::after`) outside the list, and that each listed element's shadow equals its token; opens each floating layer in both themes (surface-raised, the float token, a transparent 1px border, the light ring in `--color-border`); reopens each under `forced-colors: active` and `prefers-contrast: more` (no shadow, 1px solid edge, `border-float` under more contrast); measures the recessed `<main>` (sheet token, 14px radius, inset) at and below `lg` and the default shell's `<main>` (no shadow); and checks a focused control draws an outline and no shadow. D-023's verification line is amended to match.


**Amended in 1.4.1:** below `md` (768px) the sheet runs edge to edge — no inset, no radius, no `--shadow-sheet`. At phone width there is no ground left beside it, so the inset only took width from the content (Postroom's phone inbox, 342px usable of 390). `browser/elevation.spec.ts` measures it at 390px.
---

### D-076 · v1.4 · Switch: an immediate-effect toggle as a real `role="switch"` button
**Date:** 2026-09-29
**Prompted by:** the Postroom redesign canvas (`.pr-toggle`) and DS-REQ-001, which asks for an on/off switch that is keyboard-operable, axe-clean in both themes and honours reduced motion. Foreman task DS-T-0.2.

**Chosen: `Switch`** — `checked` / `defaultChecked` / `onCheckedChange(checked: boolean)`, `disabled`, and a name from `children`, `aria-label` or `aria-labelledby`. It renders `<button type="button" role="switch" aria-checked>`; `ref` and every other prop go to the button, `className` to the wrapper. Children render as a `<label htmlFor>` beside it, so the label is part of the click target, the same wiring Checkbox uses. With none of the three names, `devWarn` says so.

**Geometry and tone.** A 36x20 track with a 16px knob inset 2px, travelling 16px. Off: the track is filled with `border-field` (3.91:1 against dark `surface`, 4.21:1 against light `surface`; 4.39:1 against light `surface-raised`, and 3.00:1 against dark `surface-raised`, which is the floor) and the knob is `bg` (4.29:1 dark, 3.92:1 light against the track). On: `accent` track, `accent-contrast` knob (7.17:1 dark, 8.15:1 light). The state does not rest on colour: the knob is at the left or the right. The Postroom canvas's 34px track and white knob with a shadow were not taken; elevation is tone here (D-023) and the knob is not lifted.

**Motion.** The knob and track use `--motion-hover` (90ms ease-out). `prefers-reduced-motion: reduce` sets `transition: none` on both, so the knob jumps; the global reduced-motion rule already zeroes durations and this states it locally so the guarantee does not depend on it. Focus is the global 2px `--color-focus` outline (D-062), not overridden.

**Keyboard.** A native button fires click on Space and on Enter, so both toggle; there is no key handler to drift out of step. Tests cover both, the label click, disabled, controlled vs uncontrolled, and a consumer `onClick` that calls `preventDefault`.

**Disabled** copies Checkbox: 0.42 opacity and `not-allowed`, applied once on the wrapper rather than again on the button, so the knob and track are not dimmed twice.

**Switch or Checkbox.** A Switch is a setting that takes effect the moment it is flipped; a Checkbox is a choice submitted later with a form, or one of several selected together. A Switch has no indeterminate state.

**Rejected.**
- *Radix Switch.* It would add a dependency for a `<button>` with one attribute, and its `asChild` would let a consumer replace the element that carries the role. Written by hand, against the same reasoning as Checkbox owning its props.
- *A hidden `<input type=checkbox>` styled as a switch.* It announces as a checkbox, not a switch, and its Enter key submits a form rather than toggling.
- *A shadow on the knob.* D-023: no shadows anywhere in the system.
- *Text "On" / "Off" inside the track.* It does not fit in 36px and the knob position already carries the state.

---

### D-077 · v1.4 · SplitButton: two Buttons in one pill, and a menu that opens from the chevron only
**Date:** 2026-09-29
**Prompted by:** Postroom's composer (PST-ADR-011): Send with Send later and Schedule behind it. Foreman requirement DS-REQ-001, task DS-T-0.3.

**Chosen: `SplitButton`** with `label`, `menuLabel` (required), `variant` (`primary` | `secondary`), `size` (`sm` | `md` | `lg`), `onClick`, `icon`, `loading`, `disabled`, and `children` as the menu's items. It is two `Button`s inside one inline-flex wrapper, with no gap: the main half runs the action, the chevron half is a `MenuTrigger` and does nothing else. The `ref` goes to the main button.

- **Geometry is Button's by construction.** Both halves are the real `Button`, so height per size, radius `md`, type, colour, hover, `loading` and the focus ring are not restated. The wrapper only squares the inner corners, drops the chevron's padding to a fixed width equal to its height (28, 34, 40px), and puts a 1px `border-left` on the chevron as the divider.
- **The divider reads on the fill, token-only.** On `primary` it is `color-mix(in srgb, var(--color-accent-contrast) 35%, transparent)`, which follows the text colour on the accent in both themes. On `secondary` it is `--color-border-field`, because `--color-border` is the same step as `surface-raised` in dark and vanishes there (the same finding as Menu's separator and RecipientField's row). It is decorative, so it carries no contrast floor; the halves are separated by shape and by the focus and hover states as well.
- **The chevron has its own name.** `menuLabel` is required and set as `aria-label` ("More send options"). The glyph is `aria-hidden`. A missing `menuLabel` warns in development, as `IconButton` does for `label`.
- **`children` as `MenuItem`s, not an `items` array.** Menu's idiom is composition: `MenuItem` already takes `icon`, `tone`, `disabled`, `onSelect` and `asChild` (a real link), and `MenuSeparator` and `MenuLabel` sit between items. An `items` array would have to re-declare every one of those props and would still not cover separators or links. The main button's label is therefore the `label` prop, not children.
- **The menu opens from the chevron only, aligned to the end edge** (`MenuContent align="end"`), so it hangs from the pill's right edge. Enter, Space and ArrowDown on the chevron, Escape, arrow keys, typeahead, focus return and the enter and exit motion are Menu's. The main half never opens it.
- **Disabled disables both halves.** `loading` blocks only the main action, as Button does; the chevron stays available.
- **Focus.** The halves touch, so the focused half is lifted with `position: relative; z-index: 1` and its whole ring shows instead of being painted over by its neighbour. An open menu keeps the chevron on its hover tone.
- **The chevron glyph is drawn inside the component**, because `lib/glyphs` has no down chevron and the library ships no icon set. If a second consumer needs one, it moves there.

**Rejected.**
- *Other Button variants.* A split ghost has no fill for a divider to read on, and a split danger would put a destructive action beside a menu of alternatives. An unsupported variant warns in development and renders as `primary`.
- *One button with a chevron region and a click position test.* Two hit areas in one focus target cannot be separately named or focused, so the chevron would have no accessible name of its own and no keyboard path.
- *A `SplitButton`-specific menu.* A second menu would restate Menu's roving focus, focus return and motion.
- *A shadow or a raised divider for the seam.* D-023: no shadows; a 1px border does the job.

**Proven.** Unit (`SplitButton.test.tsx`, 13): two buttons with the chevron named by the caller and `aria-haspopup="menu"`; the main half fires `onClick` and never opens the menu; both halves share Button's classes for variant and size, and the wrapper carries them; defaults; ref goes to the main button; icon; disabled disables both; loading blocks the main half; the development warnings and the fallback to `primary`; axe clean closed; click on the chevron opens the menu, lists the items, an item's `onSelect` fires and `onClick` does not; Enter opens it and Escape closes it with focus back on the chevron; ArrowDown opens it with the first item focused and the arrows move through the items. Stories (`Actions/SplitButton`: Primary, Secondary, Sizes, Disabled, Loading) are swept by axe in both themes by the existing story sweep.

---

### D-078 · v1.4 · CommandPalette: a ⌘K dialog whose input is an APG combobox over grouped results, and no global key listener
**Date:** 2026-09-29
**Prompted by:** the Postroom redesign canvas's search palette (PST-ADR-011) and DS-REQ-001, which asks for a command palette that is keyboard-operable, axe-clean in both themes and honours reduced motion. Foreman task DS-T-0.4.

**Chosen: `CommandPalette`** — `open` / `onOpenChange`, `query` / `onQueryChange` (uncontrolled when `query` is omitted), `groups: { id, label, items: { id, label, description?, leading?, shortcut?: string | string[], disabled?, onSelect }[] }[]`, `label` (the accessible name of the dialog and its input, not drawn), `placeholder`, `filters` (a slot, drawn in a group named "Filters"), `footer` (default hints; `null` removes it), `loading`, `emptyMessage`. Two small companions: `CommandPaletteChip` (a real `<button>`, a pill fill, `aria-pressed` when it toggles) for the filter slot, and `CommandPaletteHint` (key caps and a word, `aria-hidden` like every key hint) for a custom footer.

- **Radix Dialog, composed the way Modal composes it — not Modal itself.** Modal's panel is a centred 380–560px card with a visible title, padding and a scrolling body; the palette needs a 640px column with no visible title, pinned at `top: 12vh` so it does not jump as results come and go, with the input and footer fixed and only the results scrolling. Reusing Modal would have meant overriding every one of those from outside. So it uses the same primitives (Overlay, Content, a visually hidden Title for the name) and the same values: the `--scrim` scrim at z 40, the panel at z 50, `surface-raised` + `--shadow-float` over a transparent 1px border with the `border-float` edge back under `forced-colors` and `prefers-contrast: more` (D-075), `radius-lg`, and the modal motion tier. Focus trap, scroll lock, Escape, the page behind marked `aria-hidden` and `aria-modal` are Radix's, unchanged.
- **Focus returns to where it was.** Radix returns focus only to a `Dialog.Trigger`, and a palette opened by the app's ⌘K has none — so the palette notes the focused element as it opens and hands focus back to it on close.
- **The input is the APG combobox; the results are a listbox (D-074's model).** `role="combobox"`, `aria-autocomplete="list"`, `aria-controls` → the listbox, `aria-expanded` true while there are results, and `aria-activedescendant` naming the active option. Focus never leaves the input. The first enabled result is active on open and after every new query. ↓/↑ move through every group as one list and wrap; Home/End jump to the first and last result (the caret still moves with ←/→); disabled results are skipped. Enter runs `onSelect` and then calls `onOpenChange(false)` — unless `onSelect` returns `false`, for a result that opens a second step in place. Esc is Radix's close. Pointer hover sets the active result and a click selects it without taking focus from the input.
- **Groups follow the APG listbox grouping:** each is `role="group"` with `aria-labelledby` its heading, and the heading is `role="presentation"` — so headings are not options and the arrows never stop on them. An empty group is not drawn.
- **No listbox without options.** With no results (or while loading with none yet), the list is replaced by a message — "No results for “acadia”", or `emptyMessage` — or by three skeleton rows under `aria-busy`, and `aria-expanded` is false. The element keeps the listbox's id so `aria-controls` still resolves. A visually hidden polite `status` says "5 results.", "No results for acadia." or "Searching.". Loading over stale results keeps them and puts a small spinner in the input row.
- **The palette does not search.** The app passes `groups` already filtered for `query` (it is usually a server search); the palette marks the match and moves through what it is given.
- **The query, marked.** Every case-insensitive occurrence of the query in an item's `label` is a `<mark>`: `--color-accent-muted` fill, text in the row's own colour (≥15.9:1 in both themes), and a semibold weight — so it is not carried by the fill alone, which is faint against a white panel in light (1.13:1).
- **The active result: `--color-accent-muted`, plus a 2px accent bar at its start edge.** `accent-muted` is the canvas's choice and is a stronger "Enter goes here" than the hover grey, but it is a whisper on a white panel in light — so the bar carries the indication: accent on `accent-muted` is 6.37:1 dark and 7.22:1 light. `surface-hover` was the alternative; in light it is the same step as `accent-muted` (#f0f2f7 vs #f0f0ff), so it would not have kept the mark visible either. On the active row, the mark steps to `color-mix(in srgb, var(--color-accent) 20%, transparent)` so it stays distinct from the row's own fill; `fg` on it is 11.8:1 dark and 12.1:1 light. Descriptions stay `fg-faint` (≥6.58:1 on the active fill). Under forced colours the active row gets a `Highlight` outline and the mark uses `Mark`/`MarkText`.
- **One ring.** The query row draws the focus ring, inset 8px, and the `<input>` inside never does — the hand-off Input and RecipientField make to their frames. Tab to a filter chip and the ring moves to the chip.
- **Motion.** The panel enters on `--motion-modal-enter` (rises 12px and settles from 0.96) and leaves on `--motion-modal-exit`; the scrim fades as Modal's does. Under `prefers-reduced-motion: reduce` both are `animation: none` — explicitly, beside the global rule — so it appears and goes, and Radix unmounts at once.
  > [!note] Amended 2026-10-01 by D-084
  > The palette now enters on `--motion-popover-enter` (200ms ease-out, a 6px drop from 0.98) and leaves on `--motion-menu-exit` (140ms), scrim included — the Confident tier, not the 420ms modal spring (PST-DA-068). Reduced motion is unchanged.
- **The app owns the keyboard shortcut.** The library registers no `keydown` listener on `document` or `window` to open itself. The app binds ⌘K / Ctrl+K where it wants it, sets `open`, and puts `aria-keyshortcuts` on the button that opens it — the *App owns the shortcut* story shows the wiring. (While the palette is open, Radix's own Escape listener is live, as for every dialog.)

**Rejected.**
- *`cmdk` or another palette dependency.* It brings its own filtering, its own item registry and its own markup; D-074 already owns a combobox model to the letter, and the palette is that model with groups.
- *A global ⌘K listener in the library.* Which key, and where it applies (not inside an editor, not on the login page), is the app's decision; two libraries each binding ⌘K is how shortcuts collide.
- *Filtering inside the palette.* A mail search is a server query; a client filter would be wrong for the case the component exists for.
- *Group headings as disabled options.* They would be announced as options and counted in "n of m".
- *A visible title.* The input's placeholder and the dialog's name say what it is; the canvas has none.

**Verification.** Unit (`CommandPalette.test.tsx`, 26): the dialog is `aria-modal` and named by `label`; the combobox controls the listbox and has focus on open; groups are labelled groups with headings that are not options, and empty groups are not drawn; description, hidden leading and key caps render; every case-insensitive occurrence is marked, only in the label; axe clean open with a filter chip, and while loading; ↓/↑ move across groups, skip disabled and wrap both ways with exactly one `aria-selected`; Home/End; Enter runs and closes; an `onSelect` returning `false` keeps it open; Escape closes and returns focus to the opener; typing calls `onQueryChange` and resets the active result; hover sets the active result and a click selects; a disabled result does nothing; a closed palette adds no `keydown` listener to `document` or `window` and ⌘K / Ctrl+K do nothing; the empty state (no listbox, collapsed combobox, resolvable `aria-controls`, the status message), a custom empty message, loading with and without stale results, the result count; default, removed and custom footers; the Filters group and `aria-pressed`; the development warnings; and the CSSOM — modal enter and exit tokens, `animation: none` under reduced motion, surface-raised, `--shadow-float`, and the `border-float` edge under forced colours. Stories (`Layers/CommandPalette`: Mail Search, With Filter Chips, Empty, Loading, App Owns The Shortcut) render open, so the browser suite's axe, geometry and one-ring sweeps see the panel in both themes, and `browser/elevation.spec.ts` admits `.d3-cmd` to the float list and opens it with the other floating layers.

---

### D-079 · v1.4 · SettingsRow: a row divided by hairlines, and a render-prop for naming its control
**Date:** 2026-09-29
**Prompted by:** DS-REQ-001, the Postroom redesign canvas's settings screen: a title and a line of description on the left, a switch, a button, a value with a chevron or a status on the right, rows divided by hairlines inside one card. The console apps hand-roll this as a flex row with a `<span>` for the label and a control that no `<label>` reaches.

**Chosen: `SettingsRow` with `title`, `description?`, `control`, `htmlFor?` and `id?`.** The title is 14/500 `fg`, the description 13 `fg-muted`, the control right-aligned and vertically centred. From `md` (768px) it is two columns, `1fr auto`; below it one column with the control under the text, left-aligned (mobile-first, so the edge is the one FilterBar's `max-width: 767.98px` block draws). A long description wraps inside its column and the control never shrinks.

**The control is named by a render-prop, not by cloning.** The row generates ids from `useId` (or from `id`): the title, the description and one for the control. `control` is a node, or a function `(ids) => node` receiving `{ id, titleId, descriptionId, labelledBy, describedBy }`. `htmlFor` (an id, or `true` for `ids.id`) makes the title a real `<label>`, so clicking the title reaches the control and the name needs no ARIA; without it the title is a `div` and a control takes `aria-labelledby={ids.labelledBy}`. A plain node is rendered as it is, for a Button named by its own text ("Change\u2026") and for a value.
- *Why not clone the element to add `aria-labelledby`/`aria-describedby`:* cloning reaches only a direct child that forwards ARIA props. Wrap the control in a Tooltip or a helper and the wiring is dropped without a sound; `Checkbox` does not even type `aria-labelledby`. A function is typed, readable at the call site and works for any control, including one that needs the id on an inner element.
- *Development check:* after mount, every interactive element in the control slot is checked in the DOM (a label, `aria-label`, `aria-labelledby`, or a button's own text) and an unnamed one is reported with the fix. A missing `control`, and a missing `title`, are reported too. Inferring from props would miss a label that arrives through `htmlFor` or a wrapper.

**Hairlines: between rows, inset with the card's padding, no outer border.** `.d3-setrow + .d3-setrow` takes a 1px `border` top and the row has no horizontal padding, so the hairline runs the card's content box and lines up with the text, as DescriptionList's dividers do (D-069). Running them to the card's edge would need negative margins tied to Card's 20px. The first and last row take no padding on the outer side, so the card's own padding is the space above and below. Section's body is a 16px-gap column, which would put a 16px band on each side of every hairline; a rule scoped to `.d3-sec__body > .d3-setrow + .d3-setrow` takes the gap back with a negative margin of the same step. Section is not touched, and the rule is the one place SettingsRow knows Section's gap.

**Rules out.** *Cloning the control* (above). *Boxed rows or a border around the group*, which the canvas does not draw and D-013's rule on decorative borders does not want. *A dependency on Switch*: the row takes any control, and its stories use Checkbox, Button, Select and Badge until the Switch replaces the toggle. *A `SettingsGroup` wrapper*: a second export to carry a rule that a sibling selector already carries. *Container queries*: every other component reads the viewport, and one idiom is easier to reason about; the narrow story therefore follows the viewport, as FormActions' does.

**Proven.** Unit: a control named by the title through `aria-labelledby` and described by the description; the title a real label with `htmlFor` and a click on it reaching the control; an explicit `htmlFor` id; stable ids from `id` and distinct ones without; no description element and no `describedBy` without a description; warnings for no control and for an unnamed control, and none when the title names it; axe clean on a toggle, a button, a chevron value and a status in a Section. Stories under Layout/SettingsRow (in a Section, controls, without a description, below md), swept by axe in both themes by the story sweeps.

---

### D-080 · v1.4 · StatusDot and Stat: a status as a dot and a word, and a number-forward tile
**Date:** 2026-09-29
**Prompted by:** Postroom's redesign canvas (DS-REQ-001): a services list where each row is a dot and a word, and an admin health strip of four tiles split by hairlines. Both are additive; Badge is untouched.

**Chosen: `StatusDot`.** `tone` is `neutral | attention | danger | idle`, `size` is `sm | md`, `children` is the status in words. It is Badge's vocabulary (D-016) with one addition, `idle`. `neutral` is the default and is what a healthy or running state uses: a muted dot in `fg-muted`, not green. `attention` spends the accent and `danger` the danger colour, on the dot and the text, exactly as Badge does. `idle` is a dimmer neutral for something parked or switched off: the dot drops to `fg-faint`, the text stays `fg-muted`. The dot is an 8px circle, `aria-hidden`; **the text carries the meaning**, so a status is never colour alone (WCAG 1.4.1). Text contrast on `surface` and `surface-raised`, light / dark: `fg-muted` 12.6-13.2 / 7.0-9.2, `accent` 7.8-8.2 / 4.7-6.1, `danger` 7.9-8.2 / 4.5-5.9. An unknown tone warns in development and renders neutral, like Badge.

**Chosen: `Stat` and `StatGroup`.** `Stat` takes `label`, `value`, optional `unit`, `footnote` and `status` (a `StatusDot` element). The value is 24px at `weight-title` with `font-variant-numeric: tabular-nums` (D-019), so a polled number does not jitter; label and footnote are 12px `fg-muted`; the unit follows the value, 14px and muted. `StatGroup` lays tiles in one row, equal widths (`grid-auto-columns: minmax(0, 1fr)`), separated by 1px `--color-border` vertical hairlines, and wraps to two columns below `md` (768px) with a hairline between the rows. It draws no surface of its own; the caller puts it in a Card or on a raised surface.

**Where the status sits.** Under the value, not beside the label. DOM order is label, value, unit, status, footnote, so a screen reader says "Inbound queue, 0, waiting, Healthy" with no ARIA, the status reads after the thing it qualifies, and a long label cannot squeeze it out of a narrow tile (the mockup's label-row placement needed a visually-hidden word to make sense in reading order).

**Semantics.** `StatGroup` is a plain `div`, and `Stat` a `div` of `span`s. A `ul` would announce "list, 4 items" for what is one strip read left to right, and a `dl` would need every `Stat` to live inside one, which breaks a lone tile. The group takes `role="group"` and `aria-label` from the caller when it needs a name. Reading order comes from the DOM, which is already label then value.

**Rules out.**
- *A `pulse` on attention.* The calm rule; a pulsing dot is motion that asks for attention, which Badge's attention tone already does by hue.
- *A `success` or green tone.* D-016. Healthy is neutral.
- *A `Stat.Group` static.* One more export shape to document for no gain over `StatGroup`.
- *A per-tile trend arrow or sparkline.* Not in the canvas; a `footnote` carries "up 4 since yesterday" in words.

**Proven.** Unit: dot is `aria-hidden` and the text present, neutral by default, each tone maps to its class, a bad tone warns, Stat reads label then value then unit, status reads after the value, `0` renders, and the stylesheet sets tabular figures on the value. Stories for all four tones, a services list, and a four-tile `StatGroup` are swept by axe in both themes by the Storybook suite.

---

### D-081 · v1.4 · Avatar tints: six name-derived identity fills, measured, opt-in
**Date:** 2026-09-29
**Prompted by:** the Postroom redesign canvas (DS-REQ-001), where a message list is scanned by the colour of each sender's avatar. D-030 shipped Avatar as a single neutral treatment and flagged that as a genuine loss: App B has twelve avatars in a message list and colour is how you scan those. The condition D-030 set for revisiting it was "a validated tint ramp, or not at all". This is the ramp.
**Chosen:** `Avatar tint="auto" | "none" | 1-6`, default `none`. Six semantic token pairs, `--color-avatar-1` ... `--color-avatar-6` (fill) and `--color-avatar-N-fg` (ink), in light and dark. Each aliases the existing ramps: violet, red, green, a new pink, blue and amber. Light is fill 200 with ink 600 (5.41:1 to 6.04:1); dark is fill 800 with ink 300 (7.83:1 to 8.26:1). Every pair was measured before it was written, so the premise of the system, that every colour pair is measured, still holds: six pairs per theme, not one per user. `auto` hashes the trimmed, lower-cased name with FNV-1a 32-bit over its UTF-8 bytes, modulo six, so the same name is the same tint on every render, in every app and in every release. `avatarTintFor(name)` is exported and a unit test pins eleven names to their tints, because changing the hash recolours every avatar in every app. An empty name stays neutral. Images are unaffected; a tint only shows behind initials.
**A new primitive ramp, `pink` (h=335).** The library had five hues and a neutral, and six tints need six distinguishable hues. Pink took the largest gap on the wheel (violet 286 to red 22) and was generated the way D-018 generated the others: the same lightness ladder, the chroma profile of red, chroma clamped to sRGB and never lightness or hue. It exists for the avatars; no semantic token outside them uses it.
**This does not break D-008 (one accent).** D-008 is about *brand* colour: which hue means "this is the product, and this is what you act on". The tints carry no meaning. They are identity, the way a name is, and they attach to a person, never to a state or an action. The accent stays the only colour that says "press this", and D-016 stands: status stays neutral unless it needs the user, and no tint may be used to show status. Red and amber appear among the tints only because they are the ramps' hue families, not because they warn; two people sharing the red tint are not in danger. The token descriptions say so ("identity, never status").
**Opt-in, so nothing moves.** The default is `none`, byte-identical to today's markup; no existing story, snapshot or app changes until it passes `tint`. Six new tokens per theme are additive and resolve in every theme scope, the OS-preference block included.
**Rules out:** per-user hue from an id or an email (unmeasured pairs, unbounded palette); a tint that varies by theme or app for the same name; a seventh tint or a caller-supplied colour (`style` is still there, and outside the system); using the avatar tints for tags, labels, series in a chart or any status. Collisions are expected: 12 people share six colours, and a tint is a scanning aid, never an identifier. The initials and the name beside them remain the identity.

---

### D-082 · v1.4 · PasswordStrength: a meter the caller scores, a verdict in words, and no estimator
**Date:** 2026-09-29
**Prompted by:** Postroom's redesign canvas (PST-ADR-011; DS-REQ-001) — the new-password field carries a four-bar meter with a sentence under it ("Strong · 22 characters, not in known breaches"). `PasswordInput` already draws bars through its `strength` prop, but only inside itself; the canvas puts the meter under any field, including a confirm field or a settings row, and wants its verdict to carry more than one word.
**Question:** How does the library draw a strength meter without deciding what strong means?
**Chosen: `PasswordStrength`** — `score: 0|1|2|3|4`, `label: ReactNode`, `id?`. Four 4px segments, `--radius-full`, `--space-4` apart; the filled count *is* the score (0 fills none) and each segment widens from the left over `--dur-2` `--ease-out`, with no transition under reduced motion. The hue follows the score: **1 danger, 2 warning, 3 and 4 accent.** Unfilled segments sit on `--color-bg-sunken`: `--color-border` is the same step as `surface-raised` in dark and vanished there. The verdict is `--text-12` text, `--color-fg-muted`, and is the only thing announced; the segments are `aria-hidden`. Non-interactive.
**Why:**
- **The library does not score passwords.** Strength is a judgement — length, a breached-password list, the account's own email, a house policy — and every one of those belongs to the app; an estimator would be a runtime dependency four apps did not choose. `score` and `label` are supplied by the caller, and out-of-range scores are clamped with a development warning.
- **Colour is never the only signal (WCAG 1.4.1).** The verdict is real text, visible, and linked to the field: inside `FormField`'s `help` slot the control is already `aria-describedby` its help, so the meter is read with no wiring at all; anywhere else the caller passes `id` and lists it in the input's `aria-describedby` (a `PasswordInput` given its own `aria-describedby` uses it in place of FormField's help and error ids, so those must be listed too). No `FormField` or `PasswordInput` change was needed.
- **A polite, atomic live region** (`role="status"`, `aria-live="polite"`, `aria-atomic`): a change is spoken once the user pauses, never cutting across a keystroke. It must be mounted before it changes — a live region inserted with its words is not reliably announced — so the component is meant to stay on screen, showing score 0 and a prompt, rather than appear on the first keystroke.
- **Accent, not success, for 3 and 4.** D-016 keeps `success` green out of routine status: a strong password asks nothing of the user, so it has no claim on a hue. Danger and warning are spent where the user should do something (lengthen it); a full accent bar reads as "done" without a fourth colour, and the word "Strong" is what says so. Accent also avoids a second green-only-in-one-place rule for the canvas's `--ok`.
- **Beside `PasswordInput`'s own meter, not replacing it.** `PasswordInput strength` is unchanged (bars with its spring, success at 3–4). Moving it onto this component would change four apps' sign-up forms in a minor release; a later major can.
- **A type and a component with one name.** `PasswordInput` has exported a `PasswordStrength` *type* (`{ score, label: string }`) since 1.0. The new component takes the name the canvas gives it, and its module also declares `type PasswordStrength` as an alias of the old one, so the export stays whole. The root barrel must export the component by name; `export *` from both modules is a TS2308 ambiguity.
**Rules out:** computing the score in the library (a `zxcvbn` dependency, or a `password` prop that the meter reads); a colour prop; `success` for strong (D-016); segments as the accessible signal; an assertive live region; a meter that mounts only after the first keystroke; a native `<meter>` or `role="meter"` (it would announce a number the app did not choose to say, and the verdict already is the value in words); a `size` prop (one meter, one height).
**Proven.** Unit (16): filled count for each score 0–4 and left-first order, the hue class by score, `aria-hidden` segments with visible verdict text, `status` region polite and atomic, text changed inside the same region, non-interactive, `id` given and generated, the input's accessible description equal to the verdict by `id` and through FormField's `help`, development warnings for a bad score (clamped) and an empty label, axe at every score. Stories: a story per score, All scores, and two composed (FormField `help` and explicit `id`) with a toy scorer that lives only in the story — every one swept by the axe, geometry and focus checks in both themes.

---

### D-083 · v1.4 · ActionBar: a phone bottom bar of labelled icon actions
**Date:** 2026-09-29
**Prompted by:** DS-REQ-001 and the Postroom redesign canvas's phone thread, which ends in a row of five actions (Archive, Delete, Move, Reply, More) under the message. Additive and opt-in; nothing existing changes.

**Chosen.** `ActionBar` and `ActionBar.Item` (also exported as `ActionBarItem`). Each item is an icon (22px, `aria-hidden`) over a visible `--text-11` medium label, a `<button type="button">` or, with `href`, an `<a>`; `tone="accent"` colours it `--color-accent`, `disabled` follows the Button idiom (0.42 opacity, not-allowed). Items are `flex: 1 1 0` so they share the width equally, with a 44 x 44px minimum. Hover and pressed fill with `--color-surface-hover` at radius `md`. The bar sits on `surface` with a 1px `--color-border` top hairline and pads its bottom by `max(var(--space-8), env(safe-area-inset-bottom))`. It is hidden from `lg` (1024px, AppShell's breakpoint) upward unless `forceVisible`. Forwards its ref.

**Semantics: a labelled `role="group"` of plain controls in tab order.** Not `role="toolbar"`: APG makes a toolbar a single tab stop with arrow-key roving, which suits a dense desktop row and is worse for five thumb targets, and it obliges the component to own roving focus and Home/End. Not `<nav>`: the items are actions, and a landmark that is mostly not navigation dilutes the landmark list. `aria-label` is required by the type, because an unnamed group is announced as nothing. Link items remain links inside the group.

**Visibility is CSS, not a matchMedia hook.** The query is AppShell's `(min-width: 1024px)`, but AppShell must know the breakpoint to choose between two component trees; a bar only has to disappear. A `display: none` rule has no server-render mismatch and no flash on a phone, and takes the bar out of the accessibility tree, so hidden is not a second copy of the actions.

**A disabled link drops its `href`** and is `aria-disabled`, since an anchor cannot be disabled; it leaves the tab order rather than looking dead and still navigating.

**Rules out.** *`position="static|fixed"`*: fixed positioning also needs the content above to reserve the bar's height, which only the caller knows, and a prop would make the wrong half of that look handled. The docs give the two correct recipes (a `100dvh` flex column, or `position: sticky; bottom: 0`). *A roving-tabindex toolbar*, above. *Rendering `null` above `lg` from JS*, above. *Wrapping long labels*: one line with an ellipsis keeps item heights equal; labels are single short words. *A `danger` tone*: the same reasoning as IconButton, since a destructive action carries a confirmation, and a red icon under a thumb is not one.

**Proven.** Unit (9): labelled group, `ActionBar.Item` is `ActionBarItem`, ref forwarded, forced class only when asked, buttons named by their visible label with the icon hidden, keyboard tab and Enter, `href` renders a link, disabled button not clickable, disabled link loses its href, axe clean. Browser (`browser/actionbar.spec.ts`), in both themes at 390px on all four stories: every item at least 44 x 44, 22px icons, label below icon, equal widths, 1px top hairline, axe with contrast clean; and hidden at 1280px unless forced. The stories join the general axe, geometry and focus sweeps.

---

### D-084 · v1.4.2 · Four upstream fixes from Postroom's design audit: a current-item bar, a findable thumb, an edged secondary button, and a palette that moves like a popover
**Date:** 2026-10-01
**Prompted by:** Postroom's design audit (PST-DA-048, PST-DA-049, PST-DA-057, PST-DA-068) and DS-REQ-001. Each finding is a place where the library's own rule — elevation is tone (D-023), fields carry the boundary (D-013), the modal earns theatre (D-024) — produced something a user could not find or had to wait for. Foreman task DS-T-003. **Amends D-013, D-052, D-073 and D-078**, each of which carries a note pointing here. No export, prop, default or token changes; no token was added.

**Measured** with the token values in `src/tokens/build/color.css` (WCAG 2.x relative luminance), light / dark:

| Pair | Light | Dark |
|---|---|---|
| SideNav current fill `accent-muted` vs the `surface` sidebar | 1.08:1 | 1.04:1 |
| Recessed current fill `surface-raised` vs the `bg` sidebar | 1.12:1 | 1.43:1 |
| **Bar** `accent` vs `accent-muted` (default current fill) | **7.22:1** | **6.37:1** |
| **Bar** `accent` vs `surface-raised` (recessed current fill) | **8.15:1** | **4.71:1** |
| **Bar** `accent` vs `surface` / `bg` (the sidebar grounds) | 7.81 / 7.28:1 | 6.14 / 6.74:1 |
| Thumb `surface-raised` vs track `bg` (before) | 1.12:1 | 1.43:1 |
| **Thumb edge** `border-field` vs track `bg` | **3.92:1** | **4.29:1** |
| Thumb `accent-muted` vs track `bg` (rejected) | 1.01:1 | 1.06:1 |
| Secondary fill `surface-raised` vs `surface` / `bg` (before) | 1.04 / 1.12:1 | 1.30 / 1.43:1 |
| **Secondary edge** `border-field` vs `surface` | **4.21:1** | **3.91:1** |
| **Secondary edge** `border-field` vs `surface-raised` / `bg` | **4.39 / 3.92:1** | **3.00 / 4.29:1** |
| Secondary edge `border-field` vs `surface-hover` (its hover fill) | 3.92:1 | 3.39:1 |

**1 · SideNav: the current item carries a 3px accent leading bar (PST-DA-049).** `.d3-snav__item[aria-current=page]::before` — 3px wide, `--color-accent`, `radius-full`, inset `--space-8` from the item's top and bottom, at its leading edge; `Highlight` under forced colours. It is the same mark as CommandPalette's active result (2px there, inside a 640px panel row; 3px here, where the nav is the frame). It applies in both shell tones, so the recessed shell's `surface-raised` fill (D-073) keeps its job of separating the item from hover, and the bar does the finding. The tint, the accent text and semibold stay: the state is never carried by colour alone. The bar is a mark, not a border, so D-023's one-border-weight rule is untouched.

**2 · SegmentedControl: the thumb has the field edge and the chosen label is semibold (PST-DA-048).** The thumb keeps `surface-raised` and gains `border: var(--border-width) solid var(--color-border-field)` — 3.92:1 light / 4.29:1 dark against the track, the same edge a filled field draws on the same `bg`. The thumb is border-box (`components.css`), so the measured width is still the segment's and the travel is unchanged. An `accent-muted` fill was the alternative the audit offered and was rejected: 1.01:1 / 1.06:1 against the track, and D-052's reason still holds — in a group where one option is always chosen, accent would be permanently lit. The checked label is `--weight-semibold`. Because semibold is wider than medium, every label reserves its semibold width with a hidden `::after` copy (`content: attr(data-label)`, zero height, `visibility: hidden`, so it is not in the accessibility tree), so choosing an option never nudges its neighbours or the thumb travelling to it. That adds one `<span class="d3-seg__label">` around the label text; counts stay regular weight.

**3 · Button: `secondary` has a 1px `border-field` border (PST-DA-057).** Its fill alone was 1.04:1 against a light `surface`; the edge is 4.21:1 there, 4.39:1 on `surface-raised` and 3.92:1 on `bg` in light, and 3.00–4.29:1 in dark, where `surface-raised` is the floor exactly as it is for Switch (D-076). Border-box, so 28/34/40px heights do not move; the button is 2px wider. A pressed secondary now turns that border accent instead of drawing D-052's inset ring inside it (which would have read grey-then-violet); ghost has no border and keeps the inset ring. The other four variants stay borderless: primary and danger are solid hues, and the ghosts are text until hovered.

**4 · CommandPalette: enters on `--motion-popover-enter`, not the modal spring (PST-DA-068).** 200ms ease-out, dropping 6px from 0.98 with no overshoot; leaves on `--motion-menu-exit` (140ms ease-in); the scrim follows both. D-078 put the palette on the modal tier because it is built like a modal, but D-024 assigns tiers by how often a thing is opened, and a ⌘K palette is opened dozens of times an hour — the menu family's reason for the Confident tier. Under `prefers-reduced-motion: reduce` it is still `animation: none` on the panel and the scrim. There is no `--motion-popover-exit`; the menu family's exit is the one Select and Menu use, so no token was invented.

**Rejected.** *A thicker (2px) current-item outline* — D-023 has one border weight, and a ring around a nav item reads as focus. *An `accent-muted` segmented thumb* — measured above. *A border on every Button variant* — only secondary had no findable extent. *A new `--motion-popover-exit` token* — the menu exit already is that token in all but name.

**Proven.** Unit: `SideNav.test.tsx` reads the bar rule from the CSSOM (empty content, absolute at `left: 0` in a relative item, 3px, `--color-accent`), the `Highlight` bar under forced colours, and the semibold accent current item; `SegmentedControl.test.tsx` the thumb's `border-field` edge on a `bg` track, the semibold checked label, the reserved `::after` copy, every label's `data-label` equal to its text, and options still named once; `Button.test.tsx` the secondary border, no border on the other variants, the pressed secondary's accent border with no inset ring and the ghost's inset ring kept; `CommandPalette.test.tsx` enter on `--motion-popover-enter` and exit on `--motion-menu-exit` for panel and scrim with no modal token, both tokens ≤200ms, reduced motion unchanged, and the 2px active-result bar the SideNav bar matches. Stories (toolbar theme for both modes): *Frame/SideNav · Current Item* (expanded and rail), *Layers/SegmentedControl · Chosen Option* (both sizes, and on `surface-raised`), *Primitives/Button · Secondary On Every Ground* (`bg`, `surface`, `surface-raised`, with a pressed secondary), *Layers/CommandPalette · Opens Like A Popover*. All join the axe, geometry and focus sweeps in both themes. The pixel baselines in `browser/__screenshots__` that show a secondary Button or a SegmentedControl (14 files, both themes) were regenerated in the Playwright image (`npm run test:browser:update`) and reviewed. **SplitButton:** a secondary SplitButton's main half now drops its right edge, so the divider beside the chevron is that half's border and stays one hairline (the SplitButton decision's divider is unchanged for primary).
