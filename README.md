# D3 Cloud Design System

One visual language and one component library for the D3 Cloud apps.

**Storybook:** https://matdemers1.github.io/d3-design-system

## Why it exists

An audit of five apps found **176 distinct colour values, 18 blues, 19 type
sizes, five CSS approaches, and 170 distinct button recipes — with no Button
component anywhere.** None of that was carelessness. It is what happens when the
only thing between a developer and a raw hex is a convention nobody enforces.

So the rules here are gates, not guidance.

## Layout

```
design-system/     the record — the audit, the brief, 87 decisions, tokens, explorations
d3-ui/             the library — @d3cloud/ui, 49 components, 1,297 tests (v1.5.0)
```

They share a repository because the library's checks run from
`design-system/scripts/`. Splitting them breaks the gates.

| | |
|---|---|
| [`design-system/AUDIT.md`](design-system/AUDIT.md) | What was actually there, counted. Apps other than Bindery appear as App A–E; the legend is at the top |
| [`design-system/BRIEF.md`](design-system/BRIEF.md) | What the system is for, in the owner's words |
| [`design-system/DECISIONS.md`](design-system/DECISIONS.md) | Every decision, dated, with what it rules out |
| [`design-system/MIGRATING.md`](design-system/MIGRATING.md) | Moving an app onto the library |
| [`d3-ui/CONTRIBUTING.md`](d3-ui/CONTRIBUTING.md) | The gates, versioning, deprecation, health check |
| [`design-system/explorations/`](design-system/explorations) | Throwaway HTML from every decision round — open them |

## The system in one paragraph

Dark-first, OKLCH-derived colour with one violet accent. A 7-step type scale on
Inter, self-hosted because no app previously loaded the face it declared.
**Elevation is tone, not a shadow ramp: there are exactly two shadow tokens,
`--shadow-sheet` (the recessed shell's content sheet) and `--shadow-float`
(floating layers), each named for its one job, and the usage guard admits no
others** (D-075, DS-ADR-001). Colour is spent on meaning rather than decoration: three badge
tones, not seven. Motion is expressive and tokenised, and under
`prefers-reduced-motion` it slows rather than freezing, because a frozen spinner
reads as a hung request.

## Working on it

```bash
cd d3-ui
npm install
npm run dev        # Storybook on :6006
npm run verify     # tokens → usage → typecheck → tests → build → dist check
```

Two gates run on every verify:

- **`check-tokens.mjs`** — the JSON sources and the built stylesheets must agree,
  and the copy vendored into the library must match the original.
- **`check-usage.mjs`** — bans raw hex, raw Tailwind palette classes, off-scale
  values, primitive tokens and any shadow other than the two. Run it against any app:
  `npx d3-check-usage src`

## Status

**v1.5.0** is the current release (2026-10-01). Releases are git tags with a
GitHub release carrying the packed tarball — `v1.1.0` through `v1.5.0` so far —
and that tarball URL is how apps install it; the package is not on npm. The
[CHANGELOG](CHANGELOG.md) records each one.

Consumed by **Bindery**, **D3 Auth** (console), **Foreman**, **Postroom**,
**Shipyard**, **D3 Floorspec**, **d3cloud.io** and **D3 QR**. Planned work is
tracked as project `DS` in [Foreman](https://foreman.d3cloud.io).

## Licence

[Apache-2.0](LICENSE), like the other public D3 Cloud repositories. The fonts in
`design-system/tokens/fonts/` are Inter and JetBrains Mono under the SIL Open Font
License 1.1, and their licence texts travel with them.
