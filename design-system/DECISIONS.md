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

**Verification:** the 3d page was checked programmatically — zero elements in any rendered component have a computed `box-shadow`.

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
