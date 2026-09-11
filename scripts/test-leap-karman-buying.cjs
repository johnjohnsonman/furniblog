const assert = require('node:assert/strict');
const { load } = require('cheerio');
const { revise, slug, faq } = require('./repair-leap-karman-buying.cjs');
const patch = revise({ content_html: '<p>Old claims</p><img src="a.jpg"><img src="b.jpg">' });
const $ = load(patch.content_html);
assert.deepEqual($('img').map((_, el) => $(el).attr('src')).get(), ['a.jpg', 'b.jpg']);
assert.deepEqual(revise(patch), patch);
assert.throws(() => revise({ content_html: '<iframe></iframe>' }), /media/);
assert.equal($('table caption').length, 1);
assert.equal($('a[href^="https://www.steelcase.com/"]').length, 2);
assert.match($.text(), /29 lb/);
assert.match($.text(), /not hands-on tested/);
assert.doesNotMatch($.text() + JSON.stringify(faq), /\$1,399|\$1,070|\$329|2\.2\/5|3\.6\/5|highest-rated|neither chair offers one/);
console.log('PASS: evidence, media preservation, source links and idempotence.');
async function main() {
  if (!process.argv.includes('--live')) return;
  for (const path of [`/compare/${slug}`, '/products/steelcase-leap-v2', '/products/steelcase-karman']) {
    const r = await fetch(`https://www.furniblog.com${path}`, { signal: AbortSignal.timeout(60000) });
    assert.equal(r.status, 200);
    const c = load(await r.text());
    assert.equal(c('link[rel="canonical"]').attr('href'), `https://www.furniblog.com${path}`);
    assert.doesNotMatch((r.headers.get('x-robots-tag') || '') + (c('meta[name="robots"]').attr('content') || ''), /noindex/i);
    if (!path.startsWith('/compare/')) continue;
    assert.equal(c('#leap-karman-answer').length, 1);
    assert.doesNotMatch(c('main').text(), /\$1,399|\$1,070|\$329|troubling 2\.2|weighing under 5/);
    const schema = c('script[type="application/ld+json"]').toArray().map(el => JSON.parse(c(el).text())).find(item => item['@type'] === 'FAQPage');
    assert.equal(schema.mainEntity.length, faq.length);
    faq.forEach(item => {
      assert.ok(c('dl').text().includes(item.a));
      assert.ok(schema.mainEntity.some(q => q.name === item.q && q.acceptedAnswer.text === item.a));
    });
    const links = c('a[rel~="sponsored"]').toArray().filter(el => (c(el).attr('href') || '').includes('amazon.com/'));
    assert.ok(links.length >= 2);
    links.forEach(el => assert.ok(new URL(c(el).attr('href')).searchParams.get('tag')));
  }
  console.log('PASS: live comparison and product paths, FAQ/schema, canonicals, indexability and affiliate tags. No click events sent.');
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
