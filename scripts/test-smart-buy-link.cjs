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
const sea = load('lib/affiliate/sea.ts');
const keys = ['NEXT_PUBLIC_INVOLVE_SHOPEE_DEEPLINK', 'NEXT_PUBLIC_INVOLVE_LAZADA_DEEPLINK'];
const saved = keys.map(key => process.env[key]);
let country = 'US';
const clicks = [];
const { SmartBuyLink } = load('components/affiliate/SmartBuyLink.tsx', {
  'react/jsx-runtime': require('react/jsx-runtime'),
  react: { useState: () => [country, () => {}], useEffect: () => {} },
  'lucide-react': { ExternalLink: () => null },
  '@/lib/utils': { cn: (...values) => values.filter(Boolean).join(' ') },
  '@/lib/affiliate/links': { trackAffiliateClick: (...args) => { clicks.push(args); return Promise.resolve(); } },
  '@/lib/affiliate/sea': sea,
});
function anchors(node) {
  if (!node || typeof node !== 'object') return [];
  if (Array.isArray(node)) return node.flatMap(anchors);
  return [...(node.type === 'a' ? [node] : []), ...anchors(node.props?.children)];
}
try {
  for (const configured of [false, true]) {
    keys.forEach(key => configured ? process.env[key] = 'https://affiliate.example/?url={url}' : delete process.env[key]);
    for (country of ['US', 'KR', 'JP', ...sea.SEA_COUNTRIES]) {
      for (const variant of ['inline', 'block']) {
        for (const direct of [false, true]) {
          const url = 'https://www.amazon.com/dp/B0C3T865C2?tag=furniblog0e-20';
          const tree = SmartBuyLink({ name: 'SIHOO Doro C300', productId: 'sihoo-doro-c300', amazonUrl: direct ? url : null, variant, showDisclaimer: true });
          const links = anchors(tree);
          assert.equal(links.length, sea.isSeaCountry(country) ? 3 : 1);
          const amazon = new URL(links[0].props.href);
          assert.equal(amazon.hostname, 'www.amazon.com');
          assert.ok(amazon.searchParams.get('tag'));
          if (direct) assert.equal(links[0].props.href, url);
          else assert.equal(amazon.searchParams.get('k'), 'SIHOO Doro C300');
          const html = renderToStaticMarkup(tree);
          assert.match(html, direct ? /View on Amazon/ : /Search on Amazon/);
          assert.match(html, /we may earn a commission/);
          for (const link of links) {
            assert.match(link.props.rel, /sponsored/);
            assert.equal(link.props.target, '_blank');
            link.props.onClick();
            assert.equal(clicks.at(-1)[0], 'sihoo-doro-c300');
          }
          assert.equal(clicks.at(-links.length)[1], 'amazon');
          if (sea.isSeaCountry(country)) {
            assert.match(html, /Search Shopee/);
            assert.match(html, /Search Lazada/);
            const expected = sea.resolveSeaLinks('SIHOO Doro C300', country);
            expected.forEach((link, index) => {
              assert.equal(links[index + 1].props.href, link.url);
              assert.equal(clicks.at(-2 + index)[1], link.retailer);
              assert.equal(new URL(link.url).hostname === 'affiliate.example', configured);
            });
          }
        }
      }
    }
  }
} finally {
  keys.forEach((key, index) => saved[index] === undefined ? delete process.env[key] : process.env[key] = saved[index]);
}
console.log('PASS: 72 country/variant/destination/configuration cases; Amazon retained, local searches labeled, mocked tracking preserved.');
