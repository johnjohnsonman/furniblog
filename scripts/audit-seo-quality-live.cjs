const assert = require('node:assert/strict');
const { load } = require('cheerio');
const { createClient } = require('@supabase/supabase-js');
const { resolve } = require('node:path');
require('dotenv').config({ path: resolve(__dirname, '../.env.local'), quiet: true });
const base = process.env.AUDIT_BASE_URL || 'https://www.furniblog.com';
const ids = ['c41be132-9503-4ff4-8c16-c9b42379db83', 'e8375879-e8ae-43dc-99d3-a9b858d329e9', '7bd32f77-c622-4ee5-a498-ef5cf0e2c702'];

async function page(path) {
  const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(45000) });
  const html = await response.text();
  return { response, html, $: load(html) };
}
function schemas($) {
  return $('script[type="application/ld+json"]').toArray().flatMap(e => {
    const value = JSON.parse($(e).text());
    return Array.isArray(value) ? value : [value];
  });
}
async function main() {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const hidden = await s.from('reviews').select('id').in('id', ids).eq('excluded', false);
  if (hidden.error) throw hidden.error;
  assert.equal(hidden.data.length, 0);
  for (const id of ids) {
    const { response, $ } = await page(`/reviews/${id}`);
    const noindex = /noindex/i.test($('meta[name="robots"]').map((_, e) => $(e).attr('content')).get().join(','));
    assert.ok(response.status === 404 || (response.status === 200 && noindex), `Excluded review still indexable: ${id}`);
    assert.ok(!schemas($).some(schema => schema['@type'] === 'Article'));
    console.log(JSON.stringify({ review: id, status: response.status, noindex }));
  }
  for (const slug of ['kokuyo-ing-cloud', 'knoll-pollock-executive']) {
    const { response, $ } = await page(`/products/${slug}`);
    assert.equal(response.status, 200);
    const product = schemas($).find(schema => schema['@type'] === 'Product');
    assert.ok(product);
    assert.equal(Object.hasOwn(product, 'offers'), false);
    assert.equal(Object.hasOwn(product, 'aggregateRating'), false);
    assert.equal($('link[rel="canonical"]').attr('href'), `https://www.furniblog.com/products/${slug}`);
    assert.ok($('a[href*="amazon."]').length > 0, 'Purchase links must remain');
    console.log(JSON.stringify({ product: slug, status: 200, unsupportedOffers: false, purchaseLinksPreserved: true }));
  }
  const response = await fetch(`${base}/sitemap.xml`, { signal: AbortSignal.timeout(45000) });
  assert.equal(response.status, 200);
  const xml = await response.text();
  const $ = load(xml, { xmlMode: true });
  for (const id of ids) assert.ok(!xml.includes(`/reviews/${id}`));
  for (const path of ['/', '/products', '/about', '/brands/kokuyo']) {
    const entry = $('url').toArray().find(e => new URL($(e).find('loc').text()).pathname === path);
    assert.ok(entry, `Missing sitemap entry ${path}`);
    assert.equal($(entry).find('lastmod').length, 0, `Invented date for ${path}`);
  }
  const { data: product, error } = await s.from('products').select('updated_at').eq('slug', 'kokuyo-ing-cloud').single();
  if (error) throw error;
  const entry = $('url').toArray().find(e => $(e).find('loc').text().endsWith('/products/kokuyo-ing-cloud'));
  assert.ok(entry);
  assert.equal(new Date($(entry).find('lastmod').text()).toISOString(), new Date(product.updated_at).toISOString());
  console.log('PASS: production exclusions, purchase links, Product schema and sitemap modification dates.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
