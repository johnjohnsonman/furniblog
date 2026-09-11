const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const ts = require('typescript');
const code = ts.transpileModule(readFileSync(resolve(__dirname, '../lib/reviews/collection-quality.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const mod = { exports: {} };
new Function('exports', code)(mod.exports);
const { collectedAnalysisFailure } = mod.exports;
const valid = { summary: 'The reviewer prefers the adjustable seat depth on the Leap.', confidence: 0.8, overall: 4, pros: ['Adjustable seat depth'], cons: [] };
assert.equal(collectedAnalysisFailure(valid, 'Leap review'), null);
assert.equal(collectedAnalysisFailure({ ...valid, confidence: 0.4 }, 'Leap review'), null);
const invalid = [null, [], {}, ...[undefined, null, '0.9', NaN, Infinity, -1, 0.3, 1.1].map(confidence => ({ ...valid, confidence })),
  ...[undefined, null, '', '  ', 42, ' Leap   review '].map(summary => ({ ...valid, summary })),
  ...[undefined, null, 0, 6, NaN, Infinity, '4'].map(overall => ({ ...valid, overall })),
  ...['pros', 'cons'].flatMap(field => [undefined, null, 'good', [4], [' ']].map(value => ({ ...valid, [field]: value })))];
for (const value of invalid) assert.ok(collectedAnalysisFailure(value, 'Leap review'));
console.log(`PASS: ${invalid.length + 2} collected analysis validation cases; no network or publication.`);
