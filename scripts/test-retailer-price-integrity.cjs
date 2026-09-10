const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
function load(file, imports = {}) {
  const code = ts.transpileModule(readFileSync(resolve(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', code)((id) => {
    assert.ok(Object.hasOwn(imports, id), `Unexpected dependency: ${id}`);
    return imports[id];
  }, mod, mod.exports);
  return mod.exports;
}
const { buildPriceRowsFromCatalog } = load('lib/affiliate/catalog-price-rows.ts');
const { PriceCompareTable } = load('components/affiliate/PriceCompareTable.tsx', {
  'react/jsx-runtime': require('react/jsx-runtime'),
  './BuyButton': { BuyButton: ({ baseUrl }) => React.createElement('a', { href: baseUrl }, 'Buy') },
});
const links = [
  { retailer: 'Amazon', url: 'https://www.amazon.com/s?k=chair&tag=example-20', isOfficial: false, priceUsd: 199 },
  { retailer: 'Official', url: 'https://example.com/chair', isOfficial: true, priceUsd: 179 },
  { retailer: 'Rakuten', url: 'https://example.jp/chair', isOfficial: false, priceKrw: 99000 },
];
const rows = buildPriceRowsFromCatalog(links);
rows.forEach((row, i) => {
  assert.equal(row.priceDisplay, 'Check at retailer');
  assert.equal(row.shipping, 'Check at checkout');
  assert.equal(row.url, links[i].url);
  assert.equal(row.retailer, links[i].retailer);
});
for (const data of [rows, rows.slice(0, 1), rows.map(row => ({ ...row, priceDisplay: 'Check price' })), []]) {
  const html = renderToStaticMarkup(React.createElement(PriceCompareTable, { rows: data, productId: 'chair' }));
  assert.doesNotMatch(html, /Best Price|Free shipping|Free \(brand policy\)|Rocket delivery|bg-emerald/);
  if (data.length) {
    assert.match(html, /amazon\.com\/s\?k=chair&amp;tag=example-20/);
    assert.match(html, /Confirm the model, seller, price and delivery terms/);
  } else assert.match(html, /No retailers listed/);
}
console.log('PASS: unverified prices and shipping withheld; no unsupported best-price badge; retailer destinations preserved.');
