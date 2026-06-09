# Percentage Calculator — Design Spec

**Date:** 2026-06-08
**Status:** Approved

## Summary

A single-page web app that performs the 15 most common percentage
calculations. One self-contained `index.html` (inline CSS + vanilla
JavaScript). No build step, no server, no dependencies — open by
double-clicking the file.

## Goals

- Cover all 15 calculation types (listed below) on one page.
- Live results that update as the user types — no per-card buttons.
- Trivially runnable and shareable: one file, double-click to open.
- Formulas verifiable without a build system (built-in console self-test).

## Non-goals

- No saving, history, or persistence.
- No currency/locale formatting.
- No dark mode or theming.
- No mobile-specific responsive work beyond "layout doesn't break."

## Layout

- **Header** with title.
- **Sticky jump-link bar** with 4 links: Everyday · Reverse & compare ·
  Finance & weighted · Progress & ranking.
- **Four `<section>`s**, one per category, each containing its calculators
  as "cards." A card = title, inputs, and a live result line.

## The 15 calculators

Inputs → output. Each row is one card.

### Everyday core
1. **What % is X of Y** — part, whole → `part / whole * 100`
2. **% of a number** — number, percent → `number * percent / 100`
3. **% increase** — old, new → `(new - old) / old * 100`
4. **% decrease** — old, new → `(old - new) / old * 100`
5. **Add a %** — original, percent → `original * (1 + percent/100)`
6. **Subtract a %** — original, percent → `original * (1 - percent/100)`

### Reverse & compare
7. **Original before increase** — final, percent → `final / (1 + percent/100)`
8. **Original before decrease** — final, percent → `final / (1 - percent/100)`
9. **% difference** — A, B → `abs(A - B) / ((A + B) / 2) * 100`
10. **Percentage points** — old %, new % → shows `(new - old)` points AND
    relative change `(new - old) / old * 100`%

### Finance & weighted
11. **Compound growth** — initial, rate %, periods → `initial * (1 + rate/100)^periods`
12. **Weighted percentages** — dynamic rows of (weight %, score) →
    `sum(weight_i * score_i) / sum(weight_i)`. Add/remove row controls.

### Progress & ranking
13. **% remaining** — remaining, original → `remaining / original * 100`
14. **% completion** — completed, total → `completed / total * 100`
15. **Percentile ranking** — value, comma-separated list of numbers →
    percent of list values below `value`. Caption clarifies percentile ≠ percent.

## Behavior & design choices

- **Live calculation:** results recompute on every input change. No buttons.
- **Rounding:** show up to 2 decimals, trim trailing zeros (`12.5%`, not
  `12.50%`; `30`, not `30.00`).
- **Invalid/empty input:** result line goes blank. No red error states.
  Division by zero (e.g. whole = 0) → blank.
- **Special shapes:** #12 (weighted) has add/remove rows starting with 2 rows;
  #15 (percentile) parses a comma-separated list. The other 13 are 2- or
  3-input forms.

## Architecture

- Math lives in **small named pure functions** (one per calculation), e.g.
  `pctOf(num, pct)`, `pctChange(old, nw)`, `compound(init, rate, n)`.
  These take numbers, return numbers — no DOM access.
- A thin **wiring layer** reads inputs, calls the pure function, formats the
  result into the card's output element.
- A **formatter** helper does the round-and-trim display logic.

## Testing

A built-in `runSelfTest()` runs on page load, executing a handful of known
cases against the pure functions and logging pass/fail to the browser
console. Examples:

- `pctIsXofY(25, 200)` → `12.5`
- `pctOf(80, 15)` → `12`
- `pctIncrease(100, 125)` → `25`
- `pctDecrease(100, 80)` → `20`
- `originalBeforeIncrease(120, 20)` → `100`
- `compound(1000, 5, 10)` → `≈1628.89`
- `weighted([[40, 90], [60, 80]])` → `84`

No build tooling required — verification is reading the console output.
