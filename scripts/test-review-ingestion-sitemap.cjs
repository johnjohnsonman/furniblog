const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const ts = require('typescript');
function load(file) {
  const code = ts.transpileModule(readFileSync(resolve(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = { exports: {} };
  new Function('exports', code)(mod.exports);
  return mod.exports;
}
const { matchScreenshotProduct } = load('lib/reviews/screenshot-match.ts');
const products = [
  { id: '1', name: 'Eames Executive', slug: 'herman-miller-eames-executive' },
  { id: '2', name: 'Eames Lounge', slug: 'herman-miller-eames-lounge' },
];
assert.equal(matchScreenshotProduct('Herman Miller Eames Executive', products)?.id, '1');
assert.equal(matchScreenshotProduct('eames lounge', products)?.id, '2');
for (const name of ['', null, 'this chair', 'Herman Miller', 'Eames', 'Eames Soft Pad Executive', 1]) {
  assert.equal(matchScreenshotProduct(name, products), null);
}
assert.equal(matchScreenshotProduct('Eames Executive', [...products, { ...products[0], id: '3' }]), null);
const { loadReviewSitemapPages } = load('lib/reviews/sitemap-pages.ts');
async function main() {
  for (const count of [0, 1, 500, 1000, 3547]) {
    const expected = Array.from({ length: count }, (_, i) => ({ id: String(i).padStart(8, '0'), created_at: null }));
    // Simulate an API cap below the requested size; short pages are not EOF.
    const actual = await loadReviewSitemapPages(async after => ({ data: expected.filter(r => after === null || r.id > after).slice(0, 137), error: null }));
    assert.deepEqual(actual, expected);
  }
  await assert.rejects(loadReviewSitemapPages(async () => ({ data: null, error: { message: 'DB error' } })), /DB error/);
  await assert.rejects(loadReviewSitemapPages(async () => ({ data: null, error: null })), /Missing/);
  await assert.rejects(loadReviewSitemapPages(async () => ({ data: [{ id: '1', created_at: null }], error: null })), /cursor/);
  console.log('PASS: 10 product matching and 8 sitemap pagination/error cases.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
