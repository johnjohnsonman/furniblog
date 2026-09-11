const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const ts = require('typescript');
const { renderToStaticMarkup } = require('react-dom/server');
function load(file, imports = {}) {
  const code = ts.transpileModule(readFileSync(resolve(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', code)(id => {
    assert.ok(Object.hasOwn(imports, id), `Unexpected import ${id}`);
    return imports[id];
  }, mod, mod.exports);
  return mod.exports;
}
const catalog = load('lib/data/affiliate-links-data.ts');
const resolver = load('lib/affiliate/resolve-amazon-link.ts', { '@/lib/data/affiliate-links-data': catalog });
const region = load('lib/affiliate/amazon-region.ts');
const affiliate = load('lib/affiliate/links.ts', {
  '@/lib/supabase/admin': { createAdminClient: () => { throw Error('Unexpected DB access'); } },
  '@/lib/pipeline/queue-mapper': { isUuid: () => false },
});
let country = 'US';
const clicks = [];
const { RegionalAmazonLink } = load('components/affiliate/RegionalAmazonLink.tsx', {
  'react/jsx-runtime': require('react/jsx-runtime'),
  react: { useState: () => [country, () => {}], useEffect: () => {} },
  'lucide-react': { ExternalLink: () => null },
  '@/lib/affiliate/amazon-region': region,
  '@/lib/affiliate/links': { buildAffiliateUrl: affiliate.buildAffiliateUrl, trackAffiliateClick: (...args) => { clicks.push(args); return Promise.resolve(); } },
});
const products = [
  ['steelcase-leap-v2', 'Steelcase Leap V2', '/dp/B073G1K465'],
  ['herman-miller-aeron', 'Herman Miller Aeron', '/s'],
  ['sihoo-m18', 'SIHOO M18', '/dp/B07GNDDNMW'],
  ['sihoo-doro-c300', 'SIHOO Doro C300', '/dp/B0C3T865C2'],
];
for (country of ['US', 'SG', 'JP', 'KR', 'GB']) {
  for (const [productId, name, path] of products) {
    const href = resolver.resolveAmazonAffiliateLink(productId, name).url;
    const node = RegionalAmazonLink({ href, name, productId });
    const url = new URL(node.props.href);
    assert.equal(url.pathname, country === 'SG' ? '/s' : path);
    assert.equal(url.searchParams.get('tag'), country === 'SG' ? 'furniblog-22' : 'furniblog0e-20');
    assert.match(node.props.rel, /sponsored/);
    const html = renderToStaticMarkup(node);
    assert.match(html, country === 'SG' ? /Search on Amazon.sg/ : path === '/s' ? /Search on Amazon/ : /View on Amazon/);
    const before = clicks.length;
    node.props.onClick();
    assert.equal(clicks.length, before + 1);
    assert.equal(clicks.at(-1)[0], productId);
    assert.equal(clicks.at(-1)[1], 'amazon');
  }
}
console.log('PASS: 20 product/country cases, shared destinations, accurate labels and one mocked click each.');
