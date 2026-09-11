const assert = require('node:assert/strict');
const { mkdirSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { load } = require('cheerio');
const base = 'https://www.furniblog.com';
const slugs = [
  'herman-miller-aeron-vs-herman-miller-mirra-2-which-should-you-buy-ms9sbrcj',
  'steelcase-leap-v2-vs-steelcase-karman-which-should-you-buy-mtdsokvd',
  'okamura-contessa-ii-vs-herman-miller-aeron-which-should-you-buy-ms5i1068',
  'sihoo-m18-vs-sihoo-doro-c300', 'ticova-ergonomic-vs-sihoo-m18',
];
async function get(path) {
  const response = await fetch(base + path, { signal: AbortSignal.timeout(60000) });
  assert.equal(response.status, 200, path);
  return { text: await response.text(), headers: response.headers };
}
async function main() {
  const report = { generatedAt: new Date().toISOString(), robots: (await get('/robots.txt')).text, pages: [], hubPages: [] };
  const sitemap = load((await get('/sitemap.xml')).text, { xmlMode: true });
  const entries = new Map(sitemap('url').toArray().map(el => [sitemap(el).find('loc').text(), sitemap(el).find('lastmod').text()]));
  for (const slug of slugs) {
    const path = `/compare/${slug}`;
    const response = await get(path);
    const $ = load(response.text);
    const canonical = $('link[rel="canonical"]').attr('href');
    const robots = (response.headers.get('x-robots-tag') || '') + ' ' + ($('meta[name="robots"]').attr('content') || '');
    assert.equal(canonical, base + path);
    assert.doesNotMatch(robots, /noindex/i);
    assert.equal($('h1').length, 1);
    assert.ok($('article').text().trim().length > 200, 'Missing server-rendered article');
    assert.ok(entries.has(base + path), `Missing sitemap: ${path}`);
    report.pages.push({ path, http: 200, canonical, robots: robots.trim(), sitemapLastmod: entries.get(base + path) });
    console.log(JSON.stringify(report.pages.at(-1)));
  }
  let path = '/compare';
  const seen = new Set();
  const incoming = new Map(slugs.map(slug => [`/compare/${slug}`, []]));
  while (path) {
    assert.ok(!seen.has(path) && seen.size < 30, 'Unexpected pagination loop');
    seen.add(path);
    const response = await get(path);
    const $ = load(response.text);
    assert.equal($('link[rel="canonical"]').attr('href'), base + path);
    const hrefs = $('a[href]').toArray().map(el => $(el).attr('href'));
    for (const [target, sources] of incoming) if (hrefs.includes(target)) sources.push(path);
    const next = $('nav[aria-label="Comparison pages"] a[rel="next"]').attr('href') || null;
    if (next) assert.match(next, /^\/compare\?page=[1-9]\d*$/);
    report.hubPages.push({ path, cardLinks: hrefs.filter(href => /^\/compare\//.test(href)).length, next });
    console.log(JSON.stringify(report.hubPages.at(-1)));
    path = next;
  }
  report.incomingLinks = Object.fromEntries(incoming);
  report.missingHubLinks = [...incoming].filter(([, sources]) => !sources.length).map(([target]) => target);
  const dir = resolve(__dirname, '../data/seo-audit');
  mkdirSync(dir, { recursive: true });
  const file = resolve(dir, `comparison-crawl-paths-${Date.now()}.json`);
  writeFileSync(file, JSON.stringify(report, null, 2), { flag: 'wx' });
  console.log(JSON.stringify({ file, robots: report.robots, incomingLinks: report.incomingLinks, missingHubLinks: report.missingHubLinks }));
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
