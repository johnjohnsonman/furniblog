const assert = require('node:assert/strict');
const { load } = require('cheerio');
const base = process.argv[2] || 'https://www.furniblog.com';
const old = '/chairpedia/sihoo-m18';
const target = '/chairpedia/sihoo-m18-ergonomic-office-chair';
async function get(path) {
  const r = await fetch(`${base}${path}`, { redirect: 'manual', signal: AbortSignal.timeout(30000) });
  assert.equal(r.status, 200, path);
  return load(await r.text());
}
async function main() {
  const r = await fetch(`${base}${old}`, { redirect: 'manual', signal: AbortSignal.timeout(30000) });
  assert.ok([301, 308].includes(r.status));
  assert.equal(new URL(r.headers.get('location'), base).pathname, target);
  const $ = await get(target);
  assert.equal(new URL($('link[rel="canonical"]').attr('href')).pathname, target);
  assert.equal($('h1').length, 1);
  assert.ok(!/noindex/.test($('meta[name="robots"]').attr('content') || ''));
  const buys = $('a[rel~="sponsored"]').map((_, e) => $(e).attr('href')).get();
  assert.ok(buys.some(href => href.includes('/dp/B07GNDDNMW') && new URL(href).searchParams.get('tag') === 'furniblog0e-20'));
  for (const slug of ['sihoo-m18-vs-sihoo-doro-c300', 'ticova-ergonomic-vs-sihoo-m18']) {
    assert.equal($(`#priority-chair-comparisons a[href="/compare/${slug}"]`).length, 1);
    const comparison = await get(`/compare/${slug}`);
    assert.ok(comparison(`a[href="${target}"]`).length);
    assert.equal(comparison(`a[href="${old}"]`).length, 0);
  }
  const sitemap = await get('/sitemap.xml');
  const locs = sitemap('loc').map((_, e) => new URL(sitemap(e).text()).pathname).get();
  assert.ok(!locs.includes(old));
  assert.equal(locs.filter(path => path === target).length, 1);
  const listing = await get('/chairpedia');
  assert.equal(listing(`a[href="${old}"]`).length, 0);
  const payload = listing('script').toArray().map(e => listing(e).text().replace(/\\"/g, '"')).join('\n');
  assert.ok(!payload.includes('"slug":"sihoo-m18"'));
  assert.ok(payload.includes('"slug":"sihoo-m18-ergonomic-office-chair"') || listing(`a[href="${target}"]`).length);
  console.log(JSON.stringify({ result: 'PASS', permanentRedirect: r.status, target: 200, canonical: 'pass', affiliate: 'pass', comparisons: 2, sitemap: 'target only', listing: 'target only' }));
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
