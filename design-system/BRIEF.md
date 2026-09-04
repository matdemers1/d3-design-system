# The brief

*Written after the Phase 0 audit and the Phase 1 reaction test. This is what I want, in my own words.*

---

## What this is for

Four apps — **Bindery**, **App A**, **App B**, **App C** — that I built one at a time and that look like four companies' software. One design language, then one component library, in that order. App D is out; it has its own language and it's right to.

I want a system with a point of view. Not untouched Tailwind, not Material, not "Radix with a coat of paint."

## What it should feel like

**Filled, rounded, quiet, with one confident colour doing the work.**

Every aesthetic I rejected leaned on strokes, rules or hairlines. Everything I picked builds its controls out of tinted fills — a chip is a soft block, a badge is a tinted pill, a button is a solid shape. Nothing in this system should be defined by its outline. Corners are always rounded; every square-cornered option I saw, I disliked.

Type stays out of the way. No serif, no display sizes, no typography as decoration. Emphasis comes from **weight, not scale** — the gap between a title and its metadata should be about 1.4×, not 2×. Monospace is for timestamps, IDs and file paths, never for interface text.

Character is welcome in one element at a time. It is not the system's baseline posture.

## Where I landed

```
serious      ────●──────    playful      Competent and calm. Warm enough not to be austere,
                                         but I rejected the one genuinely playful option
                                         as a system-wide language.

corporate    ──────●────    indie        I rejected the enterprise look outright, and the
                                         Swiss/institutional one too. This should read like
                                         a good small product, not a procurement decision.

warm         ─────●─────    cool         Genuinely split — two of my four picks were warm,
                                         two were cool. Read it as: warmth lives in the
                                         neutrals, the accent is free to be cool.

restrained   ──●────●──     expressive   Split, deliberately. Restrained in the static
                                         picture — no gradients as decoration, no glass,
                                         no shadow as personality. Expressive in motion:
                                         amended 3 Sept when I said I wanted to lean into
                                         animation. See D-024. The one exception inside
                                         the exception is the menu family, which stays calm
                                         because it is opened dozens of times an hour.

soft         ─●────────     sharp        Strongly soft. Rounded, filled, low-contrast
                                         separation. This is the least negotiable one.
```

## The decisions I've made

**One accent for all four apps.** Not a per-product accent. Bindery's amber, App A's indigo, App C's teal and App B's blue all retire. The four apps should read as one product line.

**Comfortable spacing everywhere. No compact density mode.** One set of numbers to maintain. I know this costs me rows — Bindery's list rows are 32px today and comfortable lands nearer 44px, about a third fewer rows on screen, and App A's inbox currently uses MUI's `size="small"` on every control. I'd rather have one honest spacing scale than a density switch to maintain.

**Radix primitives underneath, my styling on top.** I'm not hand-rolling focus traps, typeahead or ARIA for a combobox. Another app here already runs Radix, so it's proven in this workspace. I own every visual decision and none of the accessibility plumbing.

**App A comes off MUI.** It's the biggest migration in the project — 58 components, 76 Buttons, 55 TextFields — and it's the only version where all four apps actually converge. It also stops being the one app whose type scale nobody chose.

**Dark is the primary mode.** All four apps are dark-first or dark-only today; App A's light theme is MUI's default rather than a designed one. But light is a real second mode built from the first commit, not bolted on — half of what I picked was light, and I want that to still be true at the end.

**WCAG AA is a floor, not a target.** App A has paying customers. Every colour pair ships with a measured ratio, the focus ring is designed rather than inherited, and everything works from the keyboard. The audit found App B running muted text at 3.67:1 across 38 call sites and App C drawing form-field borders at 1.35:1 — those don't survive this.

## What I'm not deciding yet

**Which hue the single accent is.** My reactions favoured violet, mint, coral and sage, and pointedly not blue — but d3cloud.io and App B both already run `#3b82f6`, so blue has the only existing claim. There's a real constraint here I want the three directions to test: **mint, sage and coral all collide with a standard semantic palette.** If the accent is green, it argues with "success"; if it's coral, it argues with "warning" and "danger". Violet and blue are the only two of my four that don't fight the status colours. I want to see that trade-off rendered before I choose.

**How opinionated the system is per surface.** Draft position, for me to correct: the system is absolute about colour, type, spacing, radius, focus and motion — apps get no freedom there. Apps stay free to compose layout and to own their own domain-specific views (Bindery's page viewer, App B's message list, PM's kanban board). Anything appearing in two apps becomes a component and stops being a local decision.

## How I read the density decision

"No compact mode" means **no user-facing density switch and no second set of spacing tokens.** It does not mean a table row and a marketing card get identical padding. A list row, a table row and a message row each get an appropriate vertical rhythm as part of their own component spec — decided once, by me, in the spec, not exposed as a global toggle. If that's not what I meant, this is the line to change.

## Non-goals

- A system that looks like default Tailwind, Material, or unstyled Radix
- Serif type, anywhere
- A border-and-hairline design language — surfaces are fills
- Square corners
- Glassmorphism, decorative gradients, shadow-as-personality
- Animating anything that repaints on a poll, a route change inside a data view, the focus
  ring, validation errors appearing, or table layout — expressive motion does not mean
  motion everywhere (D-024)
- The dense enterprise look
- Monospace as an interface voice
- A user-facing density toggle
- Per-product accent colours
- Marketing-page components — hero, pricing table, testimonial, feature grid
- Mobile or native targets; no token bridge to the Swift apps
- Dark mode as a late-stage addition
- Any component the audit didn't find at least twice
- Documentation written before I've seen it working

---

*Sources: `AUDIT.md` (Phase 0), `explorations/01-reaction-test.html` (Phase 1a), `DECISIONS.md` D-001 to D-010.*
