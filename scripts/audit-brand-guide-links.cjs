const assert = require('node:assert/strict');
const { load } = require('cheerio');
const base = process.argv[2] || 'https://www.furniblog.com';
async function get(path) {
  const response = await fetch(base + path, { signal: AbortSignal.timeout(60000) });
  assert.equal(response.status, 200, path);
  const $ = load(await response.text());
  assert.doesNotMatch(($('meta[name="robots"]').attr('content') || '') + (response.headers.get('x-robots-tag') || ''), /noindex/i);
  assert.equal(new URL($('link[rel="canonical"]').attr('href')).pathname, path);
  return $;
}
async function main() {
  const brand = await get('/brands/sihoo');
  const list = brand('section[aria-labelledby="brand-guides-heading"]');
  assert.equal(list.length, 1);
  const links = list.find('a').map((_, el) => brand(el).attr('href')).get();
  assert.ok(links.length > 0 && links.length <= 6);
  assert.equal(new Set(links).size, links.length);
  const target = '/chairpedia/sihoo-doro-c300-advanced-ergonomic-office-chair-review';
  assert.ok(links.includes(target));
  for (const path of links) {
    assert.ok(path.startsWith('/chairpedia/'));
    await get(path);
  }
  assert.ok(brand('a[href="/products/sihoo-doro-c300"]').length > 0);
  const product = await get('/products/sihoo-doro-c300');
  assert.equal(product(`a[href="${target}"]`).length, 1);
  assert.ok(product('a[href="/compare/sihoo-m18-vs-sihoo-doro-c300"]').length > 0);
  const guide = await get(target);
  const buys = guide('a[rel~="sponsored"]').map((_, el) => guide(el).attr('href')).get();
  assert.ok(buys.some(href => href.includes('/dp/B0C3T865C2') && new URL(href).searchParams.get('tag')));
  console.log(JSON.stringify({ brand: 'sihoo', publishedGuideLinks: links.length, c300DirectLink: true, existingProductAndComparisonLinks: 'preserved', c300AffiliateDestination: 'preserved', canonicalAndIndexability: 'pass' }));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
