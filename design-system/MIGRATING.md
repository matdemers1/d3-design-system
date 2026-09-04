# Migrating an app onto `@d3cloud/ui`

Bindery is migrated. This is what that took, in the order it took it, so the next
app does not rediscover it.

### Installing it

The package is in a subdirectory, so a git-tag install does not work — npm looks
for `package.json` at the repo root and fails. Use the tarball from the release:

```bash
npm i https://github.com/matdemers1/d3-design-system/releases/download/v0.1.0/d3cloud-ui-0.1.0.tgz
```

For active development against both at once, a `file:` link is faster — read the
React note below before you do.

## The order that worked

1. **Token bridge first, components second.** One `index.css` that maps the app's
   existing utility names onto the system's tokens reskins everything at once —
   in Bindery, 1,268 utility usages in a single commit — and gives you a working
   app to migrate components *into*. Doing it the other way means every component
   lands in a page that still looks like the old app.
2. **Raw palette next.** `bg-red-950/40` and friends, by script, dry-run first.
   308 occurrences across 53 classes and 41 files → 0.
3. **Then components**, in this order: `Button` → `Alert`/`Badge` →
   `SegmentedControl`/`Tabs` → forms. Buttons are the biggest count and the
   lowest risk; forms are the fiddliest and benefit from everything learned first.
4. **Turn the gate on last**, once it passes: add
   `d3-check-usage src` to the app's `lint`. It ships in the package, so it
   works anywhere the package installs — including CI, which a path into a
   sibling directory does not.

## What to expect, by the numbers

| | Bindery, before | after |
|---|---|---|
| raw `<button>` | 151 | 47 |
| distinct button recipes | 106 | — |
| raw palette utilities | 308 | 0 |
| tinted message regions | 38 | 23 |
| off-scale / raw-hex / shadow violations | 54 | 0 (13 stated exemptions) |

**47 raw buttons remain on purpose.** They are sidebar nav lists, structural list
rows that are really interactive `Card`s, and bare text controls. Forcing them
into `Button` would have encoded the wrong semantics in markup that currently
reads correctly.

## The four things that will bite

**The linked package ships a second React.** `file:../../d3-ui` means Radix
resolves `react` from the *library's* `node_modules`, and every hook inside a
Radix component throws `Cannot read properties of null (reading 'useContext')`.
`resolve.dedupe: ['react','react-dom']` fixes the dev server and the build;
vitest needs `test.server.deps.inline` for `@d3cloud/ui` and `@radix-ui` as well.
It stays hidden until the first Radix-backed component — Button and Alert are
plain React and never notice.

**Fonts 403 in dev.** Vite refuses to serve outside the project root and the
package is symlinked, so Inter silently falls back to a system face and it looks
like a styling bug. `server.fs.allow: ['..', '../../d3-ui']`.

**`data-theme` is not optional.** The system falls back to `prefers-color-scheme`
when the attribute is absent, so a dark-only app renders light on a light machine.
Set `data-theme="dark"` on `<html>`.

**Accessible names change, and tests record the old ones.** Lowercase text under
a `capitalize` class reads out lowercase; a count in a loose span reads as
"Photos 3". Both improve on migration, and both will fail assertions that were
written against the old strings. That is the test doing its job — update it and
say why in the diff.

## Mapping table

| The app probably has | Use | Notes |
|---|---|---|
| `<button className="bg-accent px-3 py-1.5 …">` | `<Button variant="primary">` | One per view |
| `<button className="border border-field …">` | `<Button>` | `secondary` is the default |
| `<button className="text-accent underline">` | `<Link>` if it navigates, `<Button variant="ghost">` if it acts | |
| icon-only `<button aria-label>` | `<IconButton label>` | `label` is required; no `danger` variant |
| an on/off control | `<Button pressed>` / `<IconButton pressed>` | Sets `aria-pressed` |
| tinted message box | `<Alert tone dynamic>` | `dynamic` decides the role; a standing warning gets none |
| full-width strip under a header | `<Alert flush>` | |
| status pill | `<Badge tone>` | Three tones only — no success, no info |
| count pill | `<CountBadge count label>` | The count joins the accessible name |
| filter / view picker | `<SegmentedControl>` | `activationMode="manual"` if choosing fetches |
| tabs with real panels | `<Tabs>` + `<TabPanel>` | Same rule for `activationMode` |
| `w-full text-left` list row | `<Card interactive>` | Not a Button |
| a spinner over a blank region | `<Skeleton>` | If the shape is knowable, draw the shape |

## Still open

- **App A is JavaScript.** The library ships types and its API leans on them —
  `kind` on `EmptyState`, `tone` on `Alert`, the required `label` on
  `IconButton`. In JS those become runtime surprises rather than build errors.
  Decide before starting: convert App A to TypeScript, or accept that the
  guardrails are advisory there.
- **`fg` vs `text` (D-017).** The tokens are `--color-text*` but the Tailwind
  utilities are emitted as `fg` so they read `text-fg-muted` rather than
  `text-text-muted`. It works and it is inconsistent, and it is still open for
  reversal. Reversing it is cheap now and expensive after three more apps adopt.
