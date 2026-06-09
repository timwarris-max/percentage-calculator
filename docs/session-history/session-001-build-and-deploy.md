# Session 001: Build & Deploy the Percentage Calculator (with a 1990s twist)
- Date/Time: 2026-06-08 23:21
- Session Type(s): feature, infrastructure, documentation
- Primary Focus Area(s): whole project — greenfield build (`index.html`), tests, Vercel deployment

## Overview
Built a single-page percentage calculator from an empty directory: 15 calculation
types, live results, a zero-dependency Node formula test. Took it through brainstorm →
spec → plan → TDD implementation, then iterated heavily on styling at the operator's
request, and deployed it to Vercel (GitHub auto-deploy wired up). The session ended with
the site deliberately restyled as a "gloriously horrible" 1990s GeoCities page, complete
with a banner photo and an animated dancing-chicken GIF.

## Changes Made

### New Files Created
- `index.html`: The entire app — inline CSS, markup, and one `<script>`. All formula math
  lives between `// ===CALC START===` and `// ===CALC END===` markers (single source of
  truth). 13 simple calculators render from a `SIMPLE` config array; weighted (#12) and
  percentile (#15) are hand-built for their special input shapes. In-page self-test footer.
- `run-selftest.mjs`: Zero-dependency Node test. Reads `index.html`, extracts the CALC
  block via regex, evals it, asserts 19 known-value cases. Run: `node run-selftest.mjs`.
- `README.md`: Usage + the "math lives between the markers" dev note.
- `vercel.json`: Declares static, no-build, serve-from-root (`framework/buildCommand: null`).
- `banner.webp`: Branding banner image (operator-supplied, copied from their Snagit folder).
- `chicken.gif`: Animated dancing-chicken GIF (sunglasses chicken) downloaded from Tenor.
- `docs/superpowers/specs/2026-06-08-percentage-calculator-design.md`: Approved design spec.
- `docs/superpowers/plans/2026-06-08-percentage-calculator.md`: TDD implementation plan.

### Tasks Addressed
- Full brainstorming → writing-plans → executing-plans → finishing-a-development-branch cycle.
- All 10 plan tasks implemented and verified (19/19 formula self-test).

### New Functionality Added
- 15 percentage calculators (all live-updating, round-and-trim formatting via `fmt`,
  blank-on-invalid input). See the design spec for the full formula list.

### Problems & Bugs Fixed
- Floating-point test failure: `addPct(200,15)` = `229.999…99997`. The app always displays
  through `fmt` (→ "230"), so the *test* was wrong, not the formula. Fixed by asserting the
  formatted output, matching how `compound` was already tested.

### Git Commits
Key commits this session (newest first):
- `ea15833` - Give the site a gloriously horrible 1990s makeover
- `dd5f068` - Use animated dancing chicken GIF next to the title
- `7950c5f` - Replace chicken emoji with a hand-drawn SVG dancing chicken
- `2161f85` - Add a dancing chicken emoji next to the title
- `7fa3acb` - Simplify remaining section headings
- `ff8230c` - Rename "Everyday core" → "Everyday basics"
- `f5ade0e` - Simplify calculator names to plain everyday wording
- `9820c4e` - Add branding banner image
- `bd66df9` - Increase base font size
- `537aafb` - Hide number spinners and add an example to each calculator
- `95fec55` - Restyle UI to clean professional theme
- `7c5b935` - Restyle UI with modern glassmorphism
- `a4bf9d2` - Add vercel.json
- `7d9b97a` - Implement percentage calculator app and formula self-test

## Technical Decisions
- **Single self-contained `index.html`** (operator's choice) for double-click/no-build/no-server.
- **Testability without a build step:** math kept in the HTML behind marker comments; a
  dev-only Node script extracts and tests it. Real automated tests, no duplication, app stays
  one file. (`run-selftest.mjs` is dev-only, never loaded by the page.)
- **Styling went through three full themes** at operator request: glassmorphism (rejected —
  "hard on the eyes") → clean professional → **1990s GeoCities** (current). The clean
  professional theme is exactly one concept back if a revert is ever wanted (it's the commit
  `95fec55` styling, before the chicken/banner/90s commits).
- **GIF bundled locally**, not hot-linked from Tenor, so the site doesn't break if the link dies.

## API / Tooling Discoveries
- **Vercel auto-domain naming:** `<project>.vercel.app` is globally unique; when taken, Vercel
  appends a random word-pair → `percentage-calculator-two-orpin.vercel.app`. This is the public
  production domain and is exempt from Deployment Protection.
- **Vercel Deployment Protection ("Vercel Authentication") gotcha:** with it ON (default on this
  Pro account), ANY manually-added alias/domain returns **HTTP 401** — only the original
  auto-generated production domain stays public. `vercel alias set` to a clean name → 401.
- **`vercel project rename <old> <new>`** works via CLI, BUT does **not** move/re-assign the
  auto production domain — the old `*-two-orpin` URL persists and the clean `<newname>.vercel.app`
  is **not** auto-claimed (stayed 404 even after `vercel --prod`). Getting a clean public URL
  would require turning Deployment Protection OFF (a dashboard toggle) — operator declined.
- **Windows gotcha:** chaining `cmd.exe /c start index.html` before `git commit` in one Bash
  call caused the whole command to background/hang and the commit never ran. Fix: don't chain
  the browser-open with commits; run them separately.

## Current State
- App is **live and public** at **https://percentage-calculator-two-orpin.vercel.app**
  (operator-confirmed working; Vercel dashboard screenshot showed the rendered page).
- All 15 calculators compute correctly; 19/19 formula self-test passes.
- Current look: full 1990s theme (Comic Sans, teal tiled bg, beveled Win95 cards, marquee,
  blinking NEW! badges, rainbow `<hr>`, under-construction sign, fake visitor counter, WebRing),
  with the banner photo and dancing-chicken GIF retained.
- Vercel project is internally named `tims-percentage-calculator`; public URL still the
  `-two-orpin` one. GitHub repo `timwarris-max/percentage-calculator`, auto-deploys from `master`.

## Next Steps
### Immediate Tasks
- [ ] Nothing pending — operator was satisfied at session end.

### Known Issues
- **Funky URL:** still `...-two-orpin.vercel.app`. Clean URL blocked by Deployment Protection;
  fix is a one-toggle dashboard change (Settings → Deployment Protection → off) that only the
  operator can/should flip, after which the clean alias can be wired in ~1 min.

## Notes for Next Session
- **Standing operator preference (also saved to memory `auto-push-changes`):** push changes
  live automatically once made + self-test passes — do NOT wait for the operator to say
  "push it." Still show what changed.
- Deploy loop that works: edit `index.html` → `node run-selftest.mjs` → `git commit` →
  `git push origin master` → Vercel auto-deploys in ~seconds → confirm with
  `vercel ls tims-percentage-calculator`.
- The branch is `master` (not `main`).
- Operator's Snagit screenshots (used for the banner) live at
  `E:\My Drive\Fast Tracks\Non-Production\Fast Tracks Documents\Snagit Screenshots` (memory
  `snagit-screenshots-location`).
- If asked to "make it look normal again," revert the styling to the clean professional theme
  (commit `95fec55`), but keep the banner + chicken unless told otherwise.
