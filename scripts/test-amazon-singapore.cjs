const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const mod = { exports: {} };
const code = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../lib/affiliate/amazon-region.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
new Function('module', 'exports', code)(mod, mod.exports);
const { singaporeAmazonUrl, readAmazonCountry } = mod.exports;
const saved = process.env.NEXT_PUBLIC_AMAZON_SG_TAG;
try {
  for (const configured of [undefined, '', '  ', 'custom-sg-22']) {
    if (configured === undefined) delete process.env.NEXT_PUBLIC_AMAZON_SG_TAG;
    else process.env.NEXT_PUBLIC_AMAZON_SG_TAG = configured;
    for (const base of ['https://www.amazon.com/dp/B07GNDDNMW?tag=us-20', 'https://www.amazon.co.jp/s?k=SIHOO+M18', 'https://www.amazon.com/s?k=SIHOO%20M18']) {
      const result = singaporeAmazonUrl(base, 'SIHOO M18', 'SG');
      const url = new URL(result);
      assert.equal(url.hostname, 'www.amazon.sg');
      assert.equal(url.pathname, '/s');
      assert.equal(url.searchParams.get('k'), 'SIHOO M18');
      assert.equal(url.searchParams.get('tag'), configured?.trim() || 'furniblog-22');
      assert.equal(singaporeAmazonUrl(result, 'SIHOO M18', 'SG'), result);
      for (const country of ['US', 'JP', 'KR', 'MY', 'UNKNOWN']) assert.equal(singaporeAmazonUrl(base, 'SIHOO M18', country), base);
    }
  }
  for (const base of ['not a URL', 'https://amazon.com.evil.test/dp/B07GNDDNMW', 'https://example.com', 'javascript:alert(1)', 'http://www.amazon.com/s?k=chair']) {
    assert.equal(singaporeAmazonUrl(base, 'SIHOO M18', 'SG'), base);
  }
  assert.equal(singaporeAmazonUrl('https://www.amazon.com/dp/B07GNDDNMW', '', 'SG'), 'https://www.amazon.com/dp/B07GNDDNMW');
  assert.equal(new URL(singaporeAmazonUrl('https://www.amazon.sg/dp/B07GNDDNMW?th=1', 'M18', 'SG')).pathname, '/dp/B07GNDDNMW');
  assert.equal(readAmazonCountry(), 'US');
  global.document = { cookie: 'other=1; x-country=SG' };
  assert.equal(readAmazonCountry(), 'SG');
  global.document.cookie = 'other=1';
  assert.equal(readAmazonCountry(), 'US');
} finally {
  delete global.document;
  if (saved === undefined) delete process.env.NEXT_PUBLIC_AMAZON_SG_TAG;
  else process.env.NEXT_PUBLIC_AMAZON_SG_TAG = saved;
}
console.log('PASS: Singapore host/tag/search, overseas preservation, invalid destinations, idempotence and country cookie.');
