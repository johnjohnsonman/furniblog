const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const ts = require('typescript');
const source = readFileSync(resolve(__dirname, '../lib/affiliate/links.ts'), 'utf8');
function build(env) {
  const module = { exports: {} };
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  new Function('require', 'module', 'exports', 'process', js)(() => ({}), module, module.exports, { env });
  return module.exports.buildAffiliateUrl;
}
let cases = 0;
for (const env of [{}, { NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG: '' }, { NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG: '   ' }, { NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG: ' custom-20 ' }]) {
  for (const path of ['/s?k=Steelcase+Karman', '/dp/B07GNDDNMW', '/dp/B0C3T865C2?tag=old-20&th=1']) {
    for (const country of ['US', 'KR', 'JP', 'SG', 'MY', 'ID', 'TH', 'PH', 'VN']) {
      const input = new URL('https://www.amazon.com' + path);
      const output = new URL(build(env)(input.href, 'Amazon', country));
      assert.equal(output.searchParams.get('tag'), env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG?.trim() || 'furniblog0e-20');
      assert.equal(output.origin, input.origin);
      assert.equal(output.pathname, input.pathname);
      for (const [key, value] of input.searchParams) if (key !== 'tag') assert.equal(output.searchParams.get(key), value);
      cases++;
    }
  }
}
assert.equal(new URL(build({ NEXT_PUBLIC_AMAZON_JP_TAG: ' japan-22 ' })('https://www.amazon.co.jp/dp/B07GNDDNMW', 'amazon', 'JP')).searchParams.get('tag'), 'japan-22');
assert.equal(build({})('invalid', 'amazon'), 'invalid');
assert.equal(new URL(build({})('https://example.com/', 'official')).searchParams.get('tag'), null);
console.log(`PASS: ${cases} Amazon cases plus JP, invalid URL and non-Amazon regressions; no tracking events sent`);
