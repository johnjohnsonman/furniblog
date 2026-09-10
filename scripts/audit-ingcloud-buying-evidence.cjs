const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { load } = require('cheerio');
const { sections, sources } = require('./repair-ingcloud-buying-evidence.cjs');
async function main() {
  const url = 'https://www.furniblog.com/chairpedia/kokuyo-ingcloud';
  const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
  assert.equal(response.status, 200);
  const $ = load(await response.text());
  assert.equal($('h1').length, 1);
  assert.equal($('link[rel="canonical"]').attr('href'), url);
  assert.doesNotMatch(($('meta[name="robots"]').attr('content') || '') + (response.headers.get('x-robots-tag') || ''), /noindex/i);
  const body = $('.chairpedia-body');
  assert.equal(body.length, 1);
  const preview = load(readFileSync(resolve(__dirname, '../data/seo-audit/ingcloud-buying-preview.html'), 'utf8'));
  assert.deepEqual(body.find('img').map((_, el) => $(el).attr('src')).get(), preview('img').map((_, el) => preview(el).attr('src')).get());
  for (const section of sections) assert.ok(body.find('h2').toArray().some(el => $(el).text() === section.title), section.title);
  for (const source of sources) assert.ok(body.find('a').toArray().some(el => $(el).attr('href') === source), source);
  assert.match(body.text(), /headrest cannot be retrofitted/);
  assert.match(body.text(), /432862-410/);
  assert.match(body.text(), /not confirmation that ingCloud is listed or available/);
  assert.doesNotMatch(body.text(), /75 per cent|4D arms|has not undergone|no squeaks|sold exclusively/);
  const amazon = $('a[rel~="sponsored"]').toArray().map(el => $(el).attr('href')).filter(href => href?.includes('amazon.com/'));
  assert.ok(amazon.length > 0);
  for (const href of amazon) assert.ok(new URL(href).searchParams.get('tag'));
  for (const path of ['/chairpedia/okamura-contessa-ii-contessa-seconda', '/compare/sihoo-m18-vs-sihoo-doro-c300']) {
    assert.equal(body.find(`a[href="${path}"]`).length, 1);
    const target = await fetch(`https://www.furniblog.com${path}`, { signal: AbortSignal.timeout(60000) });
    await target.arrayBuffer();
    assert.equal(target.status, 200, path);
  }
  console.log(JSON.stringify({ status: 200, canonical: 'pass', noindex: false, sections: sections.length, preservedImages: body.find('img').length, sources: sources.length, taggedAmazonLinks: amazon.length, newInternalLinks: 2 }));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
