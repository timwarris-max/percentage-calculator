# Percentage Calculator

A single-page web app with 15 common percentage calculators. Open `index.html`
in any browser — no install, no build, no server.

## Calculators

- **Everyday:** what % is X of Y, % of a number, % increase, % decrease, add a %, subtract a %.
- **Reverse & compare:** original before increase/decrease, % difference, percentage points.
- **Finance & weighted:** compound growth, weighted percentages.
- **Progress & ranking:** % remaining, % completion, percentile ranking.

Results update live as you type. Invalid or incomplete inputs simply show no result.

## Development

All formula math lives in `index.html` between the `// ===CALC START===` and
`// ===CALC END===` comments — the single source of truth. Run the formula
tests (no dependencies, Node only) with:

    node run-selftest.mjs

The page also self-tests on load and reports the result in its footer.
