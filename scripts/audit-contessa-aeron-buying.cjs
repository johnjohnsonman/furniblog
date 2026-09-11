const assert = require('node:assert/strict');
const { load } = require('cheerio');
const { comparisonSlug, guideSlug, faq } = require('./repair-contessa-aeron-buying.cjs');
const base = 'https://www.furniblog.com';
async function get(path) {
  const response = await fetch(base + path, { signal: AbortSignal.timeout(60000) });
  assert.equal(response.status, 200, path);
  assert.doesNotMatch(response.headers.get('x-robots-tag') || '', /noindex/i);
  const $ = load(await response.text());
  assert.equal($('link[rel="canonical"]').attr('href'), base + path);
  assert.doesNotMatch($('meta[name="robots"]').attr('content') || '', /noindex/i);
  return $;
}
async function main() {
  const comparison = await get(`/compare/${comparisonSlug}`);
  assert.equal(comparison('#comparison-answer').length, 1);
  assert.match(comparison('main').text(), /not a hands-on test/);
  assert.doesNotMatch(comparison('main').text(), /\$2,040|\$1,521|\$519|3\.8 \/ 5|198 cm|blood circulation/);
  const schema = comparison('script[type="application/ld+json"]').toArray().map(el => JSON.parse(comparison(el).text())).find(item => item['@type'] === 'FAQPage');
  assert.equal(schema.mainEntity.length, faq.length);
  faq.forEach(item => {
    assert.ok(schema.mainEntity.some(q => q.name === item.q && q.acceptedAnswer.text === item.a));
    assert.ok(comparison('dl').text().includes(item.a));
  });
  const affiliate = comparison('a[rel~="sponsored"]').toArray().filter(el => (comparison(el).attr('href') || '').includes('amazon.com/'));
  assert.ok(affiliate.length >= 2);
  affiliate.forEach(el => assert.ok(new URL(comparison(el).attr('href')).searchParams.get('tag')));
  const guide = await get(`/chairpedia/${guideSlug}`);
  assert.equal(guide(`#contessa-aeron-comparison a[href="/compare/${comparisonSlug}"]`).length, 1);
  assert.equal(guide('#model-answers').length, 1);
  await get('/products/herman-miller-aeron');
  console.log('PASS: live guide -> comparison -> product path, canonical/indexability, revised visible FAQ/schema and tagged affiliate links. No purchase clicks sent.');
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
