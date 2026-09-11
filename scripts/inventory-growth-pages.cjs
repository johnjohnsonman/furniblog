const { createHash } = require('node:crypto');
const { mkdirSync, writeFileSync, readFileSync, readdirSync } = require('node:fs');
const { resolve } = require('node:path');
const { load } = require('cheerio');
const { parseStringPromise } = require('xml2js');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: resolve(__dirname, '../.env.local'), quiet: true });
const base = 'https://www.furniblog.com';
const text = html => load(html || '').text().replace(/\s+/g, ' ').trim();
async function main() {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const specs = [
    ['products', 'products', 'id,slug,name,description_en', 'published', true],
    ['chairpedia', 'chairpedia', 'id,slug,title,content_html', 'status', 'published'],
    ['comparisons', 'compare', 'id,slug,content_html,product_a_id,product_b_id', 'status', 'published'],
    ['blog_posts', 'blog', 'id,slug,title,content_html', 'status', 'published'],
    ['reviews', 'reviews', 'id,source_url,summary_ko', 'excluded', false],
    ['news', 'news', 'id,slug,title,summary,why_it_matters,url', 'status', 'published'],
    ['best_lists', 'best', 'id,slug,title,intro', 'status', 'published'],
  ];
  const pages = new Map();
  const groups = new Map();
  function group(key, path) { if (key) groups.set(key, [...(groups.get(key) || []), path]); }
  for (const [table, type, columns, field, value] of specs) {
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await db.from(table).select(columns).eq(field, value).order('id').range(offset, offset + 999);
      if (error) throw new Error(`${table}: ${error.message}`);
      for (const row of data) {
        const path = `/${type}/${row.slug || row.id}`;
        const body = text(row.content_html || row.description_en || row.summary_ko || row.summary || row.intro);
        const dom = load(row.content_html || '');
        const reasons = [];
        if (row.content_html && !dom('a[href^="http"]').length) reasons.push('no-inline-external-reference');
        if (/tested|pain.free|cure|guarantee|world.s first/i.test(body)) reasons.push('claims-need-evidence-review');
        if (type === 'reviews' && !row.source_url) reasons.push('missing-review-source');
        const rowInfo = { path, type, title: row.title || row.name || null, words: body.split(/\s+/).filter(Boolean).length, inSitemap: false, reasons, action: 'keep' };
        if (type === 'blog' && dom('a[href^="/products/"]').length) reasons.push('product-context-buying-path-review');
        if (type === 'best') reasons.push('shared-template-review');
        pages.set(path, rowInfo);
        if (row.title?.trim()) group('title:' + row.title.trim().toLowerCase(), path);
        if (body) group('body:' + createHash('sha256').update(body).digest('hex'), path);
        if (type === 'compare' && row.product_a_id && row.product_b_id) group('pair:' + [row.product_a_id, row.product_b_id].sort().join(':'), path);
      }
      if (data.length < 1000) break;
    }
  }
  const response = await fetch(base + '/sitemap.xml', { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Sitemap HTTP ${response.status}`);
  const sitemap = await parseStringPromise(await response.text());
  if (!Array.isArray(sitemap.urlset?.url)) throw new Error('Expected URL sitemap');
  const seen = new Set();
  const duplicateSitemapUrls = [];
  for (const entry of sitemap.urlset.url) {
    const u = new URL(entry.loc[0]);
    if (u.origin !== base) throw new Error('Unexpected sitemap origin');
    const path = u.pathname;
    if (seen.has(path)) duplicateSitemapUrls.push(path);
    seen.add(path);
    if (!pages.has(path)) pages.set(path, { path, type: 'sitemap-only', title: null, inSitemap: true, reasons: [], action: 'keep' });
    pages.get(path).inSitemap = true;
  }
  const duplicates = [...groups].filter(([, paths]) => paths.length > 1).map(([key, paths]) => ({ key, paths }));
  for (const g of duplicates) for (const path of g.paths) pages.get(path).reasons.push('duplicate-' + g.key.split(':')[0] + '-review');
  let gsc = null;
  const gscDir = resolve(__dirname, '../data/gsc');
  const files = readdirSync(gscDir).filter(f => /^usa-\d+\.json$/.test(f)).sort();
  if (files.length) {
    gsc = JSON.parse(readFileSync(resolve(gscDir, files.at(-1)), 'utf8'));
    for (const row of gsc.page?.rows || []) {
      const p = pages.get(new URL(row.keys[0]).pathname);
      if (p) p.usSearch = { impressions: row.impressions, clicks: row.clicks, position: row.position };
    }
  }
  for (const p of pages.values()) {
    if (!p.inSitemap) p.reasons.push('not-in-sitemap-review');
    p.action = p.reasons.some(r => r.startsWith('duplicate-')) ? 'consolidation-review'
      : p.reasons.some(r => r !== 'product-context-buying-path-review') ? 'improve'
      : p.reasons.length ? 'buying-path-review' : 'keep';
  }
  const list = [...pages.values()].sort((a,b) => (b.usSearch?.impressions || 0) - (a.usSearch?.impressions || 0) || a.path.localeCompare(b.path));
  const counts = key => list.reduce((acc,p) => { acc[p[key]] = (acc[p[key]] || 0) + 1; return acc; }, {});
  const report = { generatedAt: new Date().toISOString(), note: 'Read-only screening of public database routes plus live sitemap, not a full crawl or index verdict. Source/claim/duplicate flags require manual review; keep does not certify quality. No deletion or redirect performed.', gscRange: gsc?.range || null, counts: { total: list.length, byType: counts('type'), byAction: counts('action') }, duplicateSitemapUrls, duplicateGroups: duplicates, pages: list };
  const dir = resolve(__dirname, '../data/seo-audit');
  mkdirSync(dir, { recursive: true });
  const file = resolve(dir, `growth-inventory-${Date.now()}.json`);
  writeFileSync(file, JSON.stringify(report, null, 2), { flag: 'wx' });
  console.log(JSON.stringify({ file, counts: report.counts, duplicateGroups: duplicates.length, duplicateSitemapUrls, gscRange: report.gscRange }));
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
