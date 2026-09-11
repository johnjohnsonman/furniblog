const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { load: html } = require('cheerio');
function load(file, imports = {}) {
  const js = ts.transpileModule(readFileSync(resolve(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', js)(id => {
    assert.ok(Object.hasOwn(imports, id), id); return imports[id];
  }, mod, mod.exports);
  return mod.exports;
}
const { PRIORITY_COMPARISONS, orderComparisonCards } = load('lib/comparisons/editorial-order.ts');
const rest = Array.from({ length: 115 }, (_, i) => ({ slug: `existing-${i}`, title: `Existing ${i}` }));
const selected = PRIORITY_COMPARISONS.map(slug => ({ slug, title: slug }));
const input = [...rest.slice(0, 30), ...selected.slice().reverse(), ...rest.slice(30)];
const snapshot = [...input];
const ordered = orderComparisonCards(input);
assert.deepEqual(input, snapshot);
assert.deepEqual(ordered.slice(0, 5), selected);
assert.deepEqual(ordered.slice(5), rest);
assert.equal(new Set(ordered.map(c => c.slug)).size, 120);
assert.deepEqual(orderComparisonCards([]), []);
assert.deepEqual(orderComparisonCards(rest), rest);
assert.equal(orderComparisonCards(input.filter(c => c.slug !== PRIORITY_COMPARISONS[0])).length, 119);
assert.deepEqual(orderComparisonCards(ordered), ordered);
const { ComparisonsIndex } = load('components/compare/comparisons-index.tsx', {
  react: React, 'react/jsx-runtime': require('react/jsx-runtime'),
  'next/link': ({ children, ...props }) => React.createElement('a', props, children),
  'lucide-react': { Search: () => null, X: () => null },
  '@/lib/utils': { cn: (...items) => items.filter(Boolean).join(' ') },
});
const found = [];
for (let page = 1; page <= 10; page++) {
  const $ = html(renderToStaticMarkup(React.createElement(ComparisonsIndex, { cards: ordered, initialPage: page })));
  const links = $('a[href^="/compare/"]').map((_, el) => $(el).attr('href')).get();
  assert.equal(links.length, 12);
  if (page === 1) assert.deepEqual(links.slice(0, 5), PRIORITY_COMPARISONS.map(slug => `/compare/${slug}`));
  assert.equal($('a[rel="next"]').attr('href'), page < 10 ? `/compare?page=${page + 1}` : undefined);
  found.push(...links);
}
assert.equal(new Set(found).size, 120);
console.log('PASS: five selections first, stable remaining order, unchanged input, missing rows not recreated, 120 unique SSR cards over ten pages.');
