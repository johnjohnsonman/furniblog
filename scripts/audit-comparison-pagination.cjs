const assert = require('node:assert/strict');
const { load } = require('cheerio');
const base = process.argv[2] || 'https://www.furniblog.com';
async function main() {
  let path = '/compare';
  let page = 1;
  const seen = new Set();
  while (path) {
    assert.ok(page <= 100, 'Pagination loop');
    const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(60000) });
    assert.equal(response.status, 200);
    const $ = load(await response.text());
    const canonical = new URL($('link[rel="canonical"]').attr('href'));
    assert.equal(canonical.pathname + canonical.search, path);
    const links = $('main a').map((_, el) => $(el).attr('href')).get().filter(h => h.startsWith('/compare/'));
    assert.ok(links.length > 0 && links.length <= 12);
    for (const link of links) {
      assert.ok(!seen.has(link), `Repeated comparison ${link}`);
      seen.add(link);
    }
    const nav = $('nav[aria-label="Comparison pages"]');
    if (page > 1) assert.equal(nav.find('a[rel="prev"]').attr('href'), page === 2 ? '/compare' : `/compare?page=${page - 1}`);
    const next = nav.find('a[rel="next"]').attr('href');
    if (next) assert.equal(next, `/compare?page=${page + 1}`);
    console.log(JSON.stringify({ page, cards: links.length, next: next || null }));
    path = next;
    page++;
  }
  for (const slug of ['sihoo-m18-vs-sihoo-doro-c300', 'ticova-ergonomic-vs-sihoo-m18']) {
    assert.ok(seen.has(`/compare/${slug}`), `Unreachable ${slug}`);
  }
  for (const value of ['0', '-1', 'abc', String(page)]) {
    const response = await fetch(`${base}/compare?page=${value}`, { signal: AbortSignal.timeout(60000) });
    const $ = load(await response.text());
    // Next.js may stream a not-found boundary with HTTP 200; require noindex then.
    assert.ok(response.status === 404 || /noindex/.test($('meta[name="robots"]').attr('content') || ''), `Invalid page indexed: ${value}`);
  }
  console.log(JSON.stringify({ result: 'PASS', pages: page - 1, reachableComparisons: seen.size }));
}
main().catch(e => { console.error(e.stack); process.exitCode = 1; });
