const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const ts = require('typescript');
const code = ts.transpileModule(readFileSync(resolve(__dirname, '../lib/blog/buying-notes.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const mod = { exports: {} };
new Function('exports', code)(mod.exports);
const { getBlogBuyingNotes: get } = mod.exports;
const cases = [
  ['herman-miller-aeron-size-guide-how-to-choose-between-a-b-and-c', 'herman-miller-aeron'],
  ['how-to-use-the-herman-miller-aeron-a-complete-control-guide', 'herman-miller-aeron'],
  ['steelcase-leap-v2-review-the-chair-that-hugs-your-body', 'steelcase-leap-v2'],
  ['steelcase-leap-vs-gesture-which-high-end-ergonomic-chair-is-right-for-you', 'steelcase-leap-v2'],
  ['herman-miller-x-logitech-g-embody-gaming-chair-materials-and-features-explained', 'herman-miller-embody-gaming'],
  ['libernovo-lineup-explained-omni-omni-se-omni-pro-maxis-compared', 'libernovo-omni'],
];
for (const [slug, product] of cases) {
  const note = get(slug);
  assert.equal(note.productId, product);
  assert.ok(note.name && note.heading && note.description);
  assert.ok(note.related.length);
  for (const link of note.related) assert.match(link.href, /^\/(blog|products)\/[a-z0-9-]+$/);
}
assert.match(get(cases[1][0]).heading, /replacement/);
assert.deepEqual(get(cases[3][0]).additionalProducts, [{ productId: 'steelcase-gesture', name: 'Steelcase Gesture' }]);
assert.match(get(cases[4][0]).name, /Logitech G/);
assert.match(get(cases[5][0]).description, /not a confirmed offer for every model/);
assert.equal(get('libernovo-complete-lineup-guide-omni-omni-se-omni-pro-maxis-compared'), null);
for (const slug of ['other-post', '', '__proto__', 'constructor']) assert.equal(get(slug), null);
console.log('PASS: six scoped blog buying sections, comparison offers, exact editions and safe fallback.');
