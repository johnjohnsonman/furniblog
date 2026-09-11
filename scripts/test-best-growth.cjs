const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const ts = require('typescript');
function moduleOf(path, requires = {}) {
  const code = ts.transpileModule(readFileSync(resolve(__dirname, '..', path), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} };
  new Function('exports', 'require', code)(mod.exports, name => {
    if (!(name in requires)) throw Error('Unexpected import: ' + name);
    return requires[name];
  });
  return mod.exports;
}
async function main() {
  const { amazonListingSlugs } = moduleOf('lib/best/amazon-listings.ts');
  const entry = url => [{ retailer: 'Amazon', url }];
  assert.deepEqual(amazonListingSlugs({
    us: entry('https://www.amazon.com/dp/B073G1K465'),
    usBare: entry('https://amazon.com/dp/B073G1K465/ref=x'),
    jp: entry('https://www.amazon.co.jp/dp/B073G1K465'),
    search: entry('https://www.amazon.com/s?k=chair'),
    spoof: entry('https://amazon.com.example.com/dp/B073G1K465'),
    http: entry('http://www.amazon.com/dp/B073G1K465'),
    invalid: entry('not a url'),
    short: entry('https://www.amazon.com/dp/B073G1'),
    suffix: entry('https://www.amazon.com/dp/B073G1K465extra'),
  }), ['us', 'usBare']);
  const { getResolvedBestList } = moduleOf('lib/best/resolve.ts', {
    '@/lib/supabase/public-server': { createPublicServerClient: () => { throw Error('offline fixture'); } },
    '@/lib/affiliate/resolve-amazon-link': { resolveAmazonAffiliateLink: (id, name) => ({ url: `https://www.amazon.com/s?k=${encodeURIComponent(name)}&tag=test` }) },
    '@/lib/data/affiliate-links-data': { AFFILIATE_LINKS_DATA: {} },
    '@/lib/data': { products: [{ id: 'chair', name: 'Fixture Chair', amazonUrl: 'https://example.com/stale', price: '$499' }], bestLists: [{ id: 'best-office-chairs', title: 'Fixture List' }], listProductMap: { 'best-office-chairs': ['chair'] } },
  });
  const fallback = await getResolvedBestList('best-office-chairs');
  assert.equal(fallback.items[0].amazonUrl, 'https://www.amazon.com/s?k=Fixture%20Chair&tag=test');
  assert.equal(await getResolvedBestList('missing'), null);
  for (const file of ['app/best/page.tsx', 'app/best/[slug]/page.tsx', 'app/best/best-chairs-to-buy/page.tsx']) {
    const source = readFileSync(resolve(__dirname, '..', file), 'utf8');
    assert.doesNotMatch(source, /new Date\(|Expert-tested|tested and reviewed|actually buy today|sold direct only/);
  }
  console.log('PASS: US listing selection (9 fixtures), shared fallback resolver, missing list and freshness/claim regressions.');
}
main().catch(e => { console.error(e); process.exitCode = 1; });
