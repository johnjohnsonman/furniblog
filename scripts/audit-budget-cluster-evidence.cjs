const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const ts = require('typescript');
const { load } = require('cheerio');
const config = JSON.parse(readFileSync(resolve(__dirname, '../content/seo/budget-cluster-evidence.json'), 'utf8'));
const specs = [
  { slug: 'sihoo-m18-ergonomic-office-chair', file: 'sihoo-m18', symbol: 'SIHOO_M18', asin: 'B07GNDDNMW', banned: ['2D (height and width)', 'Height + width per listing', 'do not slide forward/back or pivot', '17.32'] },
  { slug: 'ticova-ergonomic-office-chair', file: 'ticova-ergonomic', symbol: 'TICOVA_ERGONOMIC', asin: 'B08LBJXVSP', banned: ["5'4", '20.5 in', '1–2 years', 'year or two', '40° rotation'] },
];
for (const spec of specs) {
  const source = readFileSync(resolve(__dirname, `../lib/chairpedia/rich-data/${spec.file}.ts`), 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const result = { exports: {} };
  new Function('exports', js)(result.exports);
  spec.rich = result.exports[spec.symbol];
  assert.equal(spec.rich.asin, spec.asin);
  const text = JSON.stringify({ rich: spec.rich, body: config[spec.slug].html });
  for (const phrase of spec.banned) assert.ok(!text.includes(phrase), `Unsupported claim: ${phrase}`);
  assert.ok(spec.rich.rivals.some(r => r.href === '/compare/ticova-ergonomic-vs-sihoo-m18'));
  assert.ok(spec.rich.verdict.join(' ').includes('has not hands-on tested'));
}
console.log('PASS: M18/Ticova evidence, uncertainty labels, unchanged ASINs and comparison links.');

async function main() {
  if (!process.argv.includes('--live')) return;
  const base = 'https://www.furniblog.com';
  for (const spec of specs) {
    const url = `${base}/chairpedia/${spec.slug}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
    assert.equal(response.status, 200);
    const $ = load(await response.text());
    const text = $('main').text();
    assert.equal($('h1').length, 1);
    assert.equal($('link[rel="canonical"]').attr('href'), url);
    assert.ok(!/noindex/.test($('meta[name="robots"]').attr('content') || ''));
    for (const phrase of spec.banned) assert.ok(!text.includes(phrase), `Live claim remains: ${phrase}`);
    assert.ok(text.includes(spec.rich.verdict[1]), 'Rich template not updated');
    const body = load(config[spec.slug].html);
    for (const e of body('h2').toArray()) assert.ok(text.includes(body(e).text()));
    const links = $('a').toArray();
    assert.ok(links.some(e => {
      const href = $(e).attr('href') || '';
      if (!href.includes(`/dp/${spec.asin}`)) return false;
      return new URL(href).searchParams.has('tag') && /sponsored/.test($(e).attr('rel') || '');
    }), 'Sponsored purchase link missing');
    assert.ok($('a[href="/compare/ticova-ergonomic-vs-sihoo-m18"]').length > 0);
    assert.ok($('main img').length > 0, 'Product imagery missing');
    console.log(JSON.stringify({ slug: spec.slug, status: 200, canonical: 'pass', evidence: 'pass', purchaseLink: 'pass', imagery: 'present' }));
  }
  require('dotenv').config({ path: resolve(__dirname, '../.env.local'), quiet: true });
  const { createClient } = require('@supabase/supabase-js');
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const comparisonHashes = {
    'ticova-ergonomic-vs-sihoo-m18': '1529360fdf9ef782eb4d0437cde25eabdd0d801941ff60f5e1cad93912d8cf06',
    'sihoo-m18-vs-sihoo-doro-c300': '48cc38359d9b3c66ac44f8fd82bf66b4674105c0be0ccfd42485eefc1af94a5a',
  };
  for (const [slug, expected] of Object.entries(comparisonHashes)) {
    const { data: row, error } = await s.from('comparisons').select('content_html').eq('slug', slug).single();
    if (error) throw error;
    const normalize = html => load(html).text().replace(/\s+/g, ' ').trim();
    assert.equal(createHash('sha256').update(normalize(row.content_html)).digest('hex'), expected, `Comparison body changed since source review: ${slug}`);
  }
  console.log('PASS: both comparison bodies remain consistent with the reviewed source files.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
