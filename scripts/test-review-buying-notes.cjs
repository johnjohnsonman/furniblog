const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const ts = require('typescript');
const code = ts.transpileModule(readFileSync(resolve(__dirname, '../lib/reviews/buying-notes.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const mod = { exports: {} };
new Function('exports', code)(mod.exports);
const { getReviewBuyingNotes } = mod.exports;
const cases = [
  ['2409644e-ce86-4b4e-9e28-d31f09d9e691', 'herman-miller-sayl', 'https://reddit.com/r/UninfluencedReviews/comments/1sq1nub/comparing_herman_miller_aeron_embody_cosm_and/'],
  ['2bbad15d-6f56-4d90-8b8b-c2ae857bd4c1', 'vitra-panton-chair', 'https://www.youtube.com/watch?v=yjiRZmpuN7w'],
  ['1bf8e255-9465-4eb8-8edc-c1fadf363dd9', 'hay-soft-edge', 'https://www.youtube.com/watch?v=32lAGmUwcXU'],
];
for (const [id, slug, source] of cases) {
  const notes = getReviewBuyingNotes(id, slug, source);
  assert.ok(notes);
  assert.ok(notes.title.length <= 65);
  assert.ok(notes.description.length <= 160);
  assert.match(notes.description, /\.$/);
  assert.match(notes.sourceNote, /not a hands-on Furniblog test/);
  assert.equal(notes.checks.length, 3);
  for (const ref of notes.references) assert.equal(new URL(ref.url).protocol, 'https:');
  assert.equal(getReviewBuyingNotes(id, 'other-product', source), null);
  assert.equal(getReviewBuyingNotes(id, slug, null), null);
  assert.equal(getReviewBuyingNotes(id, slug, 'https://example.com'), null);
}
assert.equal(getReviewBuyingNotes('unrelated-review', cases[0][1], cases[0][2]), null);
console.log('PASS: three scoped reviews, complete metadata, source/product guards and unchanged fallback.');
