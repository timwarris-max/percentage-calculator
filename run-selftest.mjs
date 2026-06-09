import { readFileSync } from 'node:fs';

// Extract the fenced math block from index.html — single source of truth.
const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const m = html.match(/\/\/ ===CALC START===([\s\S]*?)\/\/ ===CALC END===/);
if (!m) { console.error('FAIL: could not find CALC block in index.html'); process.exit(1); }

// Evaluate the block and expose its functions in this scope.
const fns = {};
new Function('exports', m[1] + '\nObject.assign(exports, {' +
  'fmt, pctIsXofY, pctOf, pctIncrease, pctDecrease, addPct, subPct,' +
  'originalBeforeIncrease, originalBeforeDecrease, pctDifference, pctPoints, pctPointsRelative,' +
  'compound, weighted, pctRemaining, pctCompletion, percentileRank' +
'});')(fns);

let pass = 0, fail = 0;
function eq(label, got, want) {
  if (got === want) { pass++; console.log(`PASS ${label}`); }
  else { fail++; console.error(`FAIL ${label}: got ${got}, want ${want}`); }
}

// formatter
eq('fmt(12.5)', fns.fmt(12.5), '12.5');
eq('fmt(30)', fns.fmt(30), '30');
eq('fmt(NaN)', fns.fmt(NaN), '');

// everyday core (1-6)
eq('pctIsXofY(25,200)', fns.pctIsXofY(25, 200), 12.5);
eq('pctOf(80,15)', fns.pctOf(80, 15), 12);
eq('pctIncrease(100,125)', fns.pctIncrease(100, 125), 25);
eq('pctDecrease(100,80)', fns.pctDecrease(100, 80), 20);
eq('addPct(200,15)', fns.fmt(fns.addPct(200, 15)), '230');
eq('subPct(200,15)', fns.fmt(fns.subPct(200, 15)), '170');

// reverse & compare (7-10)
eq('originalBeforeIncrease(120,20)', fns.originalBeforeIncrease(120, 20), 100);
eq('originalBeforeDecrease(80,20)', fns.originalBeforeDecrease(80, 20), 100);
eq('pctDifference(90,100)', fns.fmt(fns.pctDifference(90, 100)), '10.53');
eq('pctPoints(4,6)', fns.pctPoints(4, 6), 2);
eq('pctPointsRelative(4,6)', fns.pctPointsRelative(4, 6), 50);

// finance & weighted (11-12)
eq('compound(1000,5,10)', fns.fmt(fns.compound(1000, 5, 10)), '1628.89');
eq('weighted([[40,90],[60,80]])', fns.weighted([[40, 90], [60, 80]]), 84);

// progress & ranking (13-15)
eq('pctRemaining(35,50)', fns.pctRemaining(35, 50), 70);
eq('pctCompletion(75,120)', fns.fmt(fns.pctCompletion(75, 120)), '62.5');
eq('percentileRank(90,[10,20,30,40,90])', fns.percentileRank(90, [10, 20, 30, 40, 90]), 80);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
