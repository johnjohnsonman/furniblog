const assert = require('node:assert/strict');
const { load } = require('cheerio');
const { revise, slug, faq } = require('./repair-aeron-mirra-buying.cjs');
const banned = /\$79|\$1521|\$1600|4\.3\s*(?:\/|out of)\s*5|3\.5\s*(?:\/|out of)\s*5|195 cm|180 cm|resolved back pain|===BODY===/;
const revised = revise({ content_html: '<p>Old content ===BODY===</p><img src="a.jpg" alt="A"><img src="b.jpg" alt="B">' });
const $ = load(revised.content_html);
assert.deepEqual($('img').map((_, el) => [$(el).attr('src'), $(el).attr('alt')]).get(), ['a.jpg', 'A', 'b.jpg', 'B']);
assert.deepEqual(revise(revised), revised);
assert.throws(() => revise({ content_html: '<picture><img src="a.jpg"></picture>' }), /media/);
assert.equal($('h1').length, 0);
assert.equal($('table caption').length, 1);
assert.equal($('a[href^="https://www.hermanmiller.com/"]').length, 2);
assert.match($.text(), /FlexFront/);
assert.match($.text(), /TriFlex/);
assert.match($.text(), /Butterfly/);
assert.match($.text(), /not a hands-on comfort test/);
assert.doesNotMatch(JSON.stringify(revised), banned);
console.log('PASS: evidence copy, source links, media preservation, FAQ, idempotence and unsafe-media guard.');
async function main() {
  if (!process.argv.includes('--live')) return;
  for (const path of [`/compare/${slug}`, '/products/herman-miller-aeron', '/products/herman-miller-mirra-2']) {
    const url = `https://www.furniblog.com${path}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
    assert.equal(response.status, 200, path);
    const c = load(await response.text());
    assert.equal(c('link[rel="canonical"]').attr('href'), url);
    assert.doesNotMatch((response.headers.get('x-robots-tag') || '') + (c('meta[name="robots"]').attr('content') || ''), /noindex/i);
    if (!path.startsWith('/compare/')) continue;
    assert.equal(c('#aeron-mirra-answer').length, 1);
    assert.doesNotMatch(c('main').text(), banned);
    const schema = c('script[type="application/ld+json"]').toArray().map(el => JSON.parse(c(el).text())).find(item => item['@type'] === 'FAQPage');
    assert.equal(schema.mainEntity.length, faq.length);
    for (const item of faq) {
      assert.ok(c('dl').text().includes(item.a));
      assert.ok(schema.mainEntity.some(q => q.name === item.q && q.acceptedAnswer.text === item.a));
    }
    for (const product of ['herman-miller-aeron', 'herman-miller-mirra-2']) assert.ok(c(`a[href="/products/${product}"]`).length);
    const affiliate = c('a[rel~="sponsored"]').toArray().filter(el => (c(el).attr('href') || '').includes('amazon.com/'));
    assert.ok(affiliate.length >= 2);
    for (const el of affiliate) assert.equal(new URL(c(el).attr('href')).searchParams.get('tag'), 'furniblog0e-20');
  }
  console.log('PASS: live comparison/product paths, canonicals, indexability, visible FAQ/schema and affiliate tags. No click events sent.');
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
