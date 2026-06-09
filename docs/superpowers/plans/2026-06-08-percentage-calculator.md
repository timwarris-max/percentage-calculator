# Percentage Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page web app (`index.html`) with 15 percentage calculators that compute live as the user types.

**Architecture:** All calculation math lives as pure functions inside `index.html`, fenced between `// ===CALC START===` and `// ===CALC END===` marker comments. A dev-only Node script (`run-selftest.mjs`) extracts that fenced block and runs assertions against it — giving real automated tests without a build step or duplicated code. The app itself stays a single double-clickable file; the test script is never loaded by the page. A thin data-driven wiring layer renders the 13 simple calculators from a config array, and the 2 special-shape calculators (weighted, percentile) are wired by hand.

**Tech Stack:** Vanilla JavaScript, inline CSS, HTML. Node.js (for running the self-test only). No dependencies, no bundler.

---

## File Structure

- `index.html` — the entire app: inline CSS, page markup, and one `<script>` holding the fenced pure math functions, the formatter, the wiring layer, and an in-page self-test footer.
- `run-selftest.mjs` — dev-only. Reads `index.html`, extracts the fenced math block, evaluates it, asserts known results. Run with `node run-selftest.mjs`.

The fenced math block is the single source of truth for formulas. Both the browser and the Node test consume it.

---

## Task 1: Test harness + formatter + first calculator function

**Files:**
- Create: `index.html`
- Create: `run-selftest.mjs`

- [ ] **Step 1: Write the failing test**

Create `run-selftest.mjs`:

```js
import { readFileSync } from 'node:fs';

// Extract the fenced math block from index.html — single source of truth.
const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const m = html.match(/\/\/ ===CALC START===([\s\S]*?)\/\/ ===CALC END===/);
if (!m) { console.error('FAIL: could not find CALC block in index.html'); process.exit(1); }

// Evaluate the block and expose its functions in this scope.
const fns = {};
new Function('exports', m[1] + '\nObject.assign(exports, {' +
  'pctIsXofY, fmt' +
'});')(fns);

let pass = 0, fail = 0;
function eq(label, got, want) {
  if (got === want) { pass++; console.log(`PASS ${label}`); }
  else { fail++; console.error(`FAIL ${label}: got ${got}, want ${want}`); }
}

eq('pctIsXofY(25,200)', fns.pctIsXofY(25, 200), 12.5);
eq('fmt(12.5)', fns.fmt(12.5), '12.5');
eq('fmt(30)', fns.fmt(30), '30');
eq('fmt(NaN)', fns.fmt(NaN), '');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node run-selftest.mjs`
Expected: FAIL — "could not find CALC block in index.html" (file does not exist / no block yet), exit code 1.

- [ ] **Step 3: Write minimal implementation**

Create `index.html` with the skeleton and the first function inside the marker block:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Percentage Calculator</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 900px; margin: 0 auto; padding: 1rem; color: #1a1a1a; }
</style>
</head>
<body>
<h1>Percentage Calculator</h1>
<script>
// ===CALC START===
function fmt(n) {
  if (n === null || n === undefined || !isFinite(n)) return '';
  return parseFloat(n.toFixed(2)).toString();
}
function pctIsXofY(part, whole) { return part / whole * 100; }
// ===CALC END===
</script>
</body>
</html>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node run-selftest.mjs`
Expected: PASS for all four assertions, "4 passed, 0 failed", exit code 0.

- [ ] **Step 5: Commit**

```bash
git add index.html run-selftest.mjs
git commit -m "feat: test harness, formatter, and first calculator function"
```

---

## Task 2: Everyday-core math functions (calculators 2-6)

**Files:**
- Modify: `index.html` (inside CALC block)
- Modify: `run-selftest.mjs`

- [ ] **Step 1: Write the failing tests**

In `run-selftest.mjs`, add these names to the `Object.assign(exports, {...})` list:
`pctOf, pctIncrease, pctDecrease, addPct, subPct` (append after `pctIsXofY, fmt`).

Then add assertions before the summary line:

```js
eq('pctOf(80,15)', fns.pctOf(80, 15), 12);
eq('pctIncrease(100,125)', fns.pctIncrease(100, 125), 25);
eq('pctDecrease(100,80)', fns.pctDecrease(100, 80), 20);
eq('addPct(200,15)', fns.addPct(200, 15), 230);
eq('subPct(200,15)', fns.subPct(200, 15), 170);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node run-selftest.mjs`
Expected: FAIL — `fns.pctOf is not a function`, exit code 1.

- [ ] **Step 3: Write minimal implementation**

Add inside the CALC block (after `pctIsXofY`):

```js
function pctOf(number, percent) { return number * percent / 100; }
function pctIncrease(oldV, newV) { return (newV - oldV) / oldV * 100; }
function pctDecrease(oldV, newV) { return (oldV - newV) / oldV * 100; }
function addPct(original, percent) { return original * (1 + percent / 100); }
function subPct(original, percent) { return original * (1 - percent / 100); }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node run-selftest.mjs`
Expected: all PASS, "9 passed, 0 failed".

- [ ] **Step 5: Commit**

```bash
git add index.html run-selftest.mjs
git commit -m "feat: everyday-core calculators (2-6)"
```

---

## Task 3: Reverse & compare math functions (calculators 7-10)

**Files:**
- Modify: `index.html` (inside CALC block)
- Modify: `run-selftest.mjs`

- [ ] **Step 1: Write the failing tests**

Add to the exports list: `originalBeforeIncrease, originalBeforeDecrease, pctDifference, pctPoints, pctPointsRelative`.

Add assertions:

```js
eq('originalBeforeIncrease(120,20)', fns.originalBeforeIncrease(120, 20), 100);
eq('originalBeforeDecrease(80,20)', fns.originalBeforeDecrease(80, 20), 100);
eq('pctDifference(90,100)', fns.fmt(fns.pctDifference(90, 100)), '10.53');
eq('pctPoints(4,6)', fns.pctPoints(4, 6), 2);
eq('pctPointsRelative(4,6)', fns.pctPointsRelative(4, 6), 50);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node run-selftest.mjs`
Expected: FAIL — `fns.originalBeforeIncrease is not a function`.

- [ ] **Step 3: Write minimal implementation**

Add inside the CALC block:

```js
function originalBeforeIncrease(final, percent) { return final / (1 + percent / 100); }
function originalBeforeDecrease(final, percent) { return final / (1 - percent / 100); }
function pctDifference(a, b) { return Math.abs(a - b) / ((a + b) / 2) * 100; }
function pctPoints(oldPct, newPct) { return newPct - oldPct; }
function pctPointsRelative(oldPct, newPct) { return (newPct - oldPct) / oldPct * 100; }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node run-selftest.mjs`
Expected: all PASS, "14 passed, 0 failed".

- [ ] **Step 5: Commit**

```bash
git add index.html run-selftest.mjs
git commit -m "feat: reverse & compare calculators (7-10)"
```

---

## Task 4: Finance & weighted math functions (calculators 11-12)

**Files:**
- Modify: `index.html` (inside CALC block)
- Modify: `run-selftest.mjs`

- [ ] **Step 1: Write the failing tests**

Add to the exports list: `compound, weighted`.

Add assertions:

```js
eq('compound(1000,5,10)', fns.fmt(fns.compound(1000, 5, 10)), '1628.89');
eq('weighted([[40,90],[60,80]])', fns.weighted([[40, 90], [60, 80]]), 84);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node run-selftest.mjs`
Expected: FAIL — `fns.compound is not a function`.

- [ ] **Step 3: Write minimal implementation**

Add inside the CALC block:

```js
function compound(initial, rate, periods) { return initial * Math.pow(1 + rate / 100, periods); }
function weighted(rows) {
  let weightSum = 0, weightedSum = 0;
  for (const [weight, score] of rows) { weightSum += weight; weightedSum += weight * score; }
  return weightedSum / weightSum;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node run-selftest.mjs`
Expected: all PASS, "16 passed, 0 failed".

- [ ] **Step 5: Commit**

```bash
git add index.html run-selftest.mjs
git commit -m "feat: finance & weighted calculators (11-12)"
```

---

## Task 5: Progress & ranking math functions (calculators 13-15)

**Files:**
- Modify: `index.html` (inside CALC block)
- Modify: `run-selftest.mjs`

- [ ] **Step 1: Write the failing tests**

Add to the exports list: `pctRemaining, pctCompletion, percentileRank`.

Add assertions:

```js
eq('pctRemaining(35,50)', fns.pctRemaining(35, 50), 70);
eq('pctCompletion(75,120)', fns.fmt(fns.pctCompletion(75, 120)), '62.5');
eq('percentileRank(90,[10,20,30,40,90])', fns.percentileRank(90, [10, 20, 30, 40, 90]), 80);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node run-selftest.mjs`
Expected: FAIL — `fns.pctRemaining is not a function`.

- [ ] **Step 3: Write minimal implementation**

Add inside the CALC block:

```js
function pctRemaining(remaining, original) { return remaining / original * 100; }
function pctCompletion(completed, total) { return completed / total * 100; }
function percentileRank(value, list) {
  if (list.length === 0) return NaN;
  const below = list.filter(x => x < value).length;
  return below / list.length * 100;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node run-selftest.mjs`
Expected: all PASS, "19 passed, 0 failed". All 15 calculators' math is now verified.

- [ ] **Step 5: Commit**

```bash
git add index.html run-selftest.mjs
git commit -m "feat: progress & ranking calculators (13-15)"
```

---

## Task 6: Page layout — header, jump links, four section shells

**Files:**
- Modify: `index.html` (markup + CSS)

This task is structural HTML/CSS; verification is visual plus keeping the self-test green.

- [ ] **Step 1: Add the CSS**

Replace the contents of the `<style>` element with:

```css
body { font-family: system-ui, sans-serif; max-width: 900px; margin: 0 auto; padding: 1rem; color: #1a1a1a; }
h1 { margin-bottom: 0.25rem; }
nav { position: sticky; top: 0; background: #fff; padding: 0.5rem 0; border-bottom: 1px solid #ddd; display: flex; gap: 1rem; flex-wrap: wrap; }
nav a { text-decoration: none; color: #0366d6; font-size: 0.9rem; }
section { margin-top: 1.5rem; }
section > h2 { border-bottom: 2px solid #0366d6; padding-bottom: 0.25rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
.card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; }
.card h3 { margin: 0 0 0.5rem; font-size: 1rem; }
.card label { display: block; font-size: 0.85rem; margin: 0.35rem 0 0.1rem; color: #555; }
.card input { width: 100%; box-sizing: border-box; padding: 0.35rem; border: 1px solid #ccc; border-radius: 4px; }
.result { margin-top: 0.6rem; font-weight: 600; min-height: 1.2em; color: #0a7d33; }
.caption { font-size: 0.75rem; color: #888; margin-top: 0.3rem; }
footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #ddd; font-size: 0.85rem; color: #888; }
```

- [ ] **Step 2: Add the markup**

Replace the `<h1>...</h1>` line with the header, nav, and four empty section shells (placed before the `<script>`):

```html
<h1>Percentage Calculator</h1>
<nav>
  <a href="#everyday">Everyday</a>
  <a href="#reverse">Reverse &amp; compare</a>
  <a href="#finance">Finance &amp; weighted</a>
  <a href="#progress">Progress &amp; ranking</a>
</nav>

<section id="everyday"><h2>Everyday core</h2><div class="grid"></div></section>
<section id="reverse"><h2>Reverse &amp; compare</h2><div class="grid"></div></section>
<section id="finance"><h2>Finance &amp; weighted</h2><div class="grid"></div></section>
<section id="progress"><h2>Progress &amp; ranking</h2><div class="grid"></div></section>

<footer id="selftest">Self-test: not yet run.</footer>
```

- [ ] **Step 3: Verify nothing broke**

Run: `node run-selftest.mjs`
Expected: still "19 passed, 0 failed" (markup changes don't touch the CALC block).
Also open `index.html` in a browser: four empty section headers and the jump-link bar are visible.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: page layout, jump links, and section shells"
```

---

## Task 7: Data-driven wiring for the 13 simple calculators

**Files:**
- Modify: `index.html` (`<script>`, after the CALC block)

The 13 single-result calculators share one shape: N number inputs → one number → formatted with an optional suffix. Define them as config and render generically. Calculator #10 (percentage points) shows two results, so it is included here with a custom render.

- [ ] **Step 1: Add the config + renderer**

After the CALC block's closing marker (still inside `<script>`), add:

```js
// Each calculator: id of target section, title, inputs [{key,label}], compute(values)->string of result HTML
const SIMPLE = [
  { sec: 'everyday', title: 'What % is X of Y', ins: [['part','Part'],['whole','Whole']],
    out: v => fmt(pctIsXofY(v.part, v.whole)) + '%' },
  { sec: 'everyday', title: '% of a number', ins: [['percent','Percent'],['number','Number']],
    out: v => fmt(pctOf(v.number, v.percent)) },
  { sec: 'everyday', title: '% increase', ins: [['oldV','Old'],['newV','New']],
    out: v => fmt(pctIncrease(v.oldV, v.newV)) + '%' },
  { sec: 'everyday', title: '% decrease', ins: [['oldV','Old'],['newV','New']],
    out: v => fmt(pctDecrease(v.oldV, v.newV)) + '%' },
  { sec: 'everyday', title: 'Add a %', ins: [['original','Original'],['percent','Percent']],
    out: v => fmt(addPct(v.original, v.percent)) },
  { sec: 'everyday', title: 'Subtract a %', ins: [['original','Original'],['percent','Percent']],
    out: v => fmt(subPct(v.original, v.percent)) },
  { sec: 'reverse', title: 'Original before increase', ins: [['final','Final value'],['percent','Percent']],
    out: v => fmt(originalBeforeIncrease(v.final, v.percent)) },
  { sec: 'reverse', title: 'Original before decrease', ins: [['final','Final value'],['percent','Percent']],
    out: v => fmt(originalBeforeDecrease(v.final, v.percent)) },
  { sec: 'reverse', title: '% difference', ins: [['a','A'],['b','B']],
    out: v => fmt(pctDifference(v.a, v.b)) + '%' },
  { sec: 'reverse', title: 'Percentage points', ins: [['oldPct','Old %'],['newPct','New %']],
    out: v => fmt(pctPoints(v.oldPct, v.newPct)) + ' pts (' + fmt(pctPointsRelative(v.oldPct, v.newPct)) + '% relative)' },
  { sec: 'finance', title: 'Compound growth', ins: [['initial','Initial'],['rate','Rate %'],['periods','Periods']],
    out: v => fmt(compound(v.initial, v.rate, v.periods)) },
  { sec: 'progress', title: '% remaining', ins: [['remaining','Remaining'],['original','Original']],
    out: v => fmt(pctRemaining(v.remaining, v.original)) + '%' },
  { sec: 'progress', title: '% completion', ins: [['completed','Completed'],['total','Total']],
    out: v => fmt(pctCompletion(v.completed, v.total)) + '%' },
];

function renderSimple(cfg) {
  const card = document.createElement('div');
  card.className = 'card';
  const h = document.createElement('h3'); h.textContent = cfg.title; card.appendChild(h);
  const inputs = {};
  for (const [key, label] of cfg.ins) {
    const l = document.createElement('label'); l.textContent = label;
    const i = document.createElement('input'); i.type = 'number'; i.inputMode = 'decimal';
    card.appendChild(l); card.appendChild(i);
    inputs[key] = i;
  }
  const res = document.createElement('div'); res.className = 'result'; card.appendChild(res);
  function recompute() {
    const v = {};
    let allFilled = true;
    for (const [key] of cfg.ins) {
      if (inputs[key].value === '') { allFilled = false; }
      v[key] = parseFloat(inputs[key].value);
    }
    res.textContent = allFilled ? cfg.out(v) : '';
  }
  for (const key in inputs) inputs[key].addEventListener('input', recompute);
  document.querySelector('#' + cfg.sec + ' .grid').appendChild(card);
}

SIMPLE.forEach(renderSimple);
```

- [ ] **Step 2: Verify in browser**

Open `index.html`. Check a few cards live-update:
- "What % is X of Y": Part 25, Whole 200 → `12.5%`
- "% of a number": Percent 15, Number 80 → `12`
- "Percentage points": Old 4, New 6 → `2 pts (50% relative)`
- Clear one input → result line goes blank.

Run: `node run-selftest.mjs`
Expected: still "19 passed, 0 failed".

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: render and wire the 13 simple calculators"
```

---

## Task 8: Weighted (12) and percentile (15) special-shape calculators

**Files:**
- Modify: `index.html` (`<script>`, after the SIMPLE block)

- [ ] **Step 1: Add the weighted calculator (dynamic rows)**

Append inside `<script>`:

```js
(function renderWeighted() {
  const card = document.createElement('div'); card.className = 'card';
  card.innerHTML = '<h3>Weighted percentages</h3>';
  const rows = document.createElement('div');
  const res = document.createElement('div'); res.className = 'result';
  const cap = document.createElement('div'); cap.className = 'caption';
  cap.textContent = 'Weighted average of scores (weights need not sum to 100).';

  function addRow(w, s) {
    const row = document.createElement('div');
    row.innerHTML = '<label>Weight % / Score</label>';
    const wi = document.createElement('input'); wi.type = 'number'; wi.placeholder = 'Weight'; wi.value = w ?? '';
    const si = document.createElement('input'); si.type = 'number'; si.placeholder = 'Score'; si.value = s ?? '';
    wi.style.width = '48%'; si.style.width = '48%';
    row.appendChild(wi); row.appendChild(si);
    rows.appendChild(row);
    wi.addEventListener('input', recompute); si.addEventListener('input', recompute);
  }
  function recompute() {
    const data = [];
    for (const row of rows.children) {
      const [wi, si] = row.querySelectorAll('input');
      if (wi.value === '' || si.value === '') continue;
      data.push([parseFloat(wi.value), parseFloat(si.value)]);
    }
    res.textContent = data.length ? fmt(weighted(data)) : '';
  }
  const add = document.createElement('button'); add.textContent = '+ Add row';
  add.addEventListener('click', () => addRow());
  card.appendChild(rows); card.appendChild(add); card.appendChild(res); card.appendChild(cap);
  document.querySelector('#finance .grid').appendChild(card);
  addRow(); addRow();
})();
```

- [ ] **Step 2: Add the percentile calculator (list input)**

Append inside `<script>`:

```js
(function renderPercentile() {
  const card = document.createElement('div'); card.className = 'card';
  card.innerHTML = '<h3>Percentile ranking</h3>';
  const vl = document.createElement('label'); vl.textContent = 'Your value';
  const vi = document.createElement('input'); vi.type = 'number';
  const ll = document.createElement('label'); ll.textContent = 'Comparison values (comma-separated)';
  const li = document.createElement('input'); li.type = 'text'; li.placeholder = 'e.g. 10, 20, 30, 40, 90';
  const res = document.createElement('div'); res.className = 'result';
  const cap = document.createElement('div'); cap.className = 'caption';
  cap.textContent = 'Percentile is how many you beat — not the same as a percentage score.';

  function recompute() {
    const list = li.value.split(',').map(s => parseFloat(s.trim())).filter(x => isFinite(x));
    if (vi.value === '' || list.length === 0) { res.textContent = ''; return; }
    res.textContent = fmt(percentileRank(parseFloat(vi.value), list)) + 'th percentile';
  }
  vi.addEventListener('input', recompute); li.addEventListener('input', recompute);
  card.appendChild(vl); card.appendChild(vi); card.appendChild(ll); card.appendChild(li);
  card.appendChild(res); card.appendChild(cap);
  document.querySelector('#progress .grid').appendChild(card);
})();
```

- [ ] **Step 3: Verify in browser**

Open `index.html`:
- Weighted: rows (40, 90) and (60, 80) → `84`. Click "+ Add row", add (0 weight blank) — blank rows ignored.
- Percentile: value 90, list `10, 20, 30, 40, 90` → `80th percentile`.

Run: `node run-selftest.mjs`
Expected: still "19 passed, 0 failed".

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: weighted and percentile special-shape calculators"
```

---

## Task 9: In-page self-test footer

**Files:**
- Modify: `index.html` (`<script>`, end)

Surface the same known-value checks on the page so anyone opening the file sees the formulas are sound, without a console.

- [ ] **Step 1: Add the in-page self-test**

Append inside `<script>` (after all rendering):

```js
(function inPageSelfTest() {
  const checks = [
    ['pctIsXofY(25,200)', fmt(pctIsXofY(25, 200)), '12.5'],
    ['pctOf(80,15)', fmt(pctOf(80, 15)), '12'],
    ['pctIncrease(100,125)', fmt(pctIncrease(100, 125)), '25'],
    ['compound(1000,5,10)', fmt(compound(1000, 5, 10)), '1628.89'],
    ['weighted([[40,90],[60,80]])', fmt(weighted([[40, 90], [60, 80]])), '84'],
    ['percentileRank(90,[10,20,30,40,90])', fmt(percentileRank(90, [10, 20, 30, 40, 90])), '80'],
  ];
  let failed = 0;
  for (const [label, got, want] of checks) {
    if (got !== want) { failed++; console.error(`SELFTEST FAIL ${label}: got ${got}, want ${want}`); }
  }
  const el = document.getElementById('selftest');
  el.textContent = failed
    ? `Self-test: ${failed} of ${checks.length} checks FAILED (see console).`
    : `Self-test: all ${checks.length} formula checks passed.`;
  el.style.color = failed ? '#c00' : '#888';
})();
```

- [ ] **Step 2: Verify in browser**

Open `index.html`. Footer reads "Self-test: all 6 formula checks passed." Console has no SELFTEST FAIL lines.

Run: `node run-selftest.mjs`
Expected: "19 passed, 0 failed".

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: in-page self-test footer"
```

---

## Task 10: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write the README**

```markdown
# Percentage Calculator

A single-page web app with 15 common percentage calculators. Open `index.html`
in any browser — no install, no build, no server.

## Calculators

Everyday: what % is X of Y, % of a number, % increase, % decrease, add a %, subtract a %.
Reverse & compare: original before increase/decrease, % difference, percentage points.
Finance & weighted: compound growth, weighted percentages.
Progress & ranking: % remaining, % completion, percentile ranking.

## Development

All formula math lives in `index.html` between the `// ===CALC START===` and
`// ===CALC END===` comments. Run the formula tests with:

    node run-selftest.mjs

The page also self-tests on load and reports the result in its footer.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README"
```

---

## Self-Review Notes

- **Spec coverage:** All 15 calculators are implemented and tested — 1 (Task 1), 2-6 (Task 2), 7-10 (Task 3), 11-12 (Task 4), 13-15 (Task 5); UI for all in Tasks 7-8. Live results, round-and-trim formatting, blank-on-invalid, jump links, two special shapes, console + in-page self-test: all present.
- **Type consistency:** Function names are identical across the CALC block, `run-selftest.mjs` exports, the SIMPLE config, and the in-page self-test. Formatter is `fmt` throughout. Section ids (`everyday`, `reverse`, `finance`, `progress`) match between markup and wiring.
- **Naming note:** `final` is used as a parameter name in two functions; it is not a reserved word in non-strict JS and the script is non-strict, so this is safe.
