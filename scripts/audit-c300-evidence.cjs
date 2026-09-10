const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const ts = require('typescript');
const { load } = require('cheerio');
const slug = 'sihoo-doro-c300-advanced-ergonomic-office-chair-review';
const source = readFileSync(resolve(__dirname, '../lib/chairpedia/rich-data/sihoo-doro-c300.ts'), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const moduleValue = { exports: {} };
new Function('module', 'exports', js)(moduleValue, moduleValue.exports);
const rich = moduleValue.exports.SIHOO_DORO_C300;
const sections = JSON.parse(readFileSync(resolve(__dirname, '../content/seo/c300-evidence-sections.json'), 'utf8'));
const banned = ['leaves nothing to be desired', 'ensuring everyone can enjoy', 'sliding seat adjustment is especially helpful', 'breathes beautifully', 'Footrest included', 'at Sihoo, innovation', 'Fortune 500'];
for (const phrase of banned) assert.ok(!JSON.stringify({ rich, sections }).includes(phrase));
assert.equal(rich.asin, 'B0C3T865C2');
assert.ok(rich.faqs.some(f => f.q === 'Does the base C300 have seat-depth adjustment?'));
assert.ok(rich.rivals.some(r => r.href === '/compare/sihoo-m18-vs-sihoo-doro-c300'));
assert.equal(rich.sources.filter(s => s.url).length, 2);
assert.ok(rich.verdict.join(' ').includes('have not hands-on tested'));
console.log('PASS: C300 local evidence, disclaimer, sources and comparison fixtures.');

async function main() {
  if (!process.argv.includes('--live')) return;
  require('dotenv').config({ path: resolve(__dirname, '../.env.local'), quiet: true });
  const { createClient } = require('@supabase/supabase-js');
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data: row, error } = await s.from('chairpedia').select('content_html,gen_sources').eq('slug', slug).single();
  if (error) throw error;
  const url = `https://www.furniblog.com/chairpedia/${slug}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
  assert.equal(response.status, 200);
  const $ = load(await response.text());
  const text = $('main').text();
  assert.equal($('h1').length, 1);
  assert.equal($('link[rel="canonical"]').attr('href'), url);
  assert.ok(!/noindex/.test($('meta[name="robots"]').attr('content') || ''));
  for (const phrase of banned) assert.ok(!text.includes(phrase), `Legacy claim remains: ${phrase}`);
  assert.ok(text.includes(rich.verdictPullQuote), 'Updated rich template not deployed');
  for (const section of sections) assert.ok(text.includes(section.title), `Missing section ${section.title}`);
  assert.ok(text.includes('Does the base C300 have seat-depth adjustment?'));
  const buyLinks = $('a').toArray().filter(e => ($(e).attr('href') || '').includes('/dp/B0C3T865C2'));
  assert.ok(buyLinks.some(e => {
    const target = new URL($(e).attr('href'));
    return target.searchParams.get('tag') && /sponsored/.test($(e).attr('rel') || '');
  }), 'Tagged sponsored purchase CTA missing');
  assert.ok($('a[href="/compare/sihoo-m18-vs-sihoo-doro-c300"]').length > 0);
  assert.deepEqual(row.gen_sources, rich.sources.filter(s => s.url).map(s => s.url).reverse());
  const body = load(row.content_html);
  const images = body('img').toArray().map(e => body(e).attr('src'));
  assert.equal(images.length, 8);
  for (const imageUrl of images) {
    assert.ok($('img').toArray().some(e => $(e).attr('src') === imageUrl), 'Existing body image absent');
    const imageResponse = await fetch(imageUrl, { method: 'HEAD', signal: AbortSignal.timeout(30000) });
    assert.equal(imageResponse.status, 200, imageUrl);
    assert.ok((imageResponse.headers.get('content-type') || '').startsWith('image/'));
  }
  console.log('PASS: live C300 claims, 11 sections, canonical, sponsored purchase CTA, comparison and 8 image URLs.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
