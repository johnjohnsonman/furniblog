// Read-only triage of every indexable URL class: keep / improve / consolidate-review / noindex-review.
// Labels are review buckets for the boss's decision, not actions. Nothing is written to the site or DB.
const { createPrivateKey, sign } = require('node:crypto');
const { readFileSync, mkdirSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: resolve(__dirname, '../.env.gsc.local'), quiet: true });
require('dotenv').config({ path: resolve(__dirname, '../.env.local'), quiet: true });

const words = text => (text || '').trim().split(/\s+/).filter(Boolean).length;

async function gscToken() {
  const credentials = process.env.GSC_CREDENTIALS_FILE ? JSON.parse(readFileSync(process.env.GSC_CREDENTIALS_FILE, 'utf8')) : null;
  const email = credentials?.client_email || process.env.GSC_CLIENT_EMAIL;
  const key = createPrivateKey(credentials?.private_key || process.env.GSC_PRIVATE_KEY?.replace(/\\n/g, '\n'));
  const enc = x => Buffer.from(JSON.stringify(x)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${enc({ alg: 'RS256', typ: 'JWT' })}.${enc({ iss: email, scope: 'https://www.googleapis.com/auth/webmasters.readonly', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 600 })}`;
  const auth = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${sign('RSA-SHA256', Buffer.from(unsigned), key).toString('base64url')}` }), signal: AbortSignal.timeout(30000) });
  const token = await auth.json();
  if (!auth.ok || !token.access_token) throw new Error('Google authentication failed');
  return token.access_token;
}

async function fetchAll(s, table, select, filters = q => q) {
  const rows = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await filters(s.from(table).select(select)).order('id').range(offset, offset + 999);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 1000) break;
  }
  return rows;
}

function specificSource(sourceUrl) {
  try {
    const u = new URL(sourceUrl);
    if (u.pathname === '/' || /^\/r\/[^/]+\/?$/.test(u.pathname)) return false;
    return true;
  } catch { return false; }
}

async function main() {
  const site = process.env.GSC_SITE_URL;
  const token = await gscToken();
  // 90-day final page performance: protection signal. Same window family as the recovery plan.
  const perfRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ startDate: '2026-06-11', endDate: '2026-09-08', type: 'web', dataState: 'final', dimensions: ['page'], rowLimit: 25000 }),
    signal: AbortSignal.timeout(60000),
  });
  if (!perfRes.ok) throw new Error(`GSC HTTP ${perfRes.status}`);
  const perfRows = (await perfRes.json()).rows || [];
  if (perfRows.length === 25000) throw new Error('Pagination required');
  const perf = new Map();
  for (const row of perfRows) {
    try { perf.set(decodeURI(new URL(row.keys[0]).pathname), { clicks: row.clicks, impressions: row.impressions }); } catch {}
  }

  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const [products, reviews, news, chairpedia, comparisons, blog, brands] = await Promise.all([
    fetchAll(s, 'products', 'id,slug,published,track,brand_id,description_en,price_usd,thumbnail_url', q => q.eq('published', true).eq('track', 'chair')),
    fetchAll(s, 'reviews', 'id,product_id,source,source_url,summary_ko,excluded', q => q.eq('excluded', false)),
    fetchAll(s, 'news', 'id,slug,title,summary,why_it_matters,url', q => q.eq('status', 'published')),
    fetchAll(s, 'chairpedia', 'id,slug,title,status,gen_sources,product_id,content_html', q => q.eq('status', 'published')),
    fetchAll(s, 'comparisons', 'id,slug,status,product_a_id,product_b_id', q => q.eq('status', 'published')),
    fetchAll(s, 'blog_posts', 'id,slug,title,status', q => q.eq('status', 'published')),
    fetchAll(s, 'brands', 'id,slug,name'),
  ]);

  const reviewsPerProduct = new Map();
  for (const r of reviews) reviewsPerProduct.set(r.product_id, (reviewsPerProduct.get(r.product_id) || 0) + 1);
  const productsPerBrand = new Map();
  for (const p of products) if (p.brand_id) productsPerBrand.set(p.brand_id, (productsPerBrand.get(p.brand_id) || 0) + 1);
  const guideByProduct = new Set(chairpedia.map(c => c.product_id).filter(Boolean));

  const rows = [];
  const add = (path, section, bucket, reason) => {
    const p = perf.get(path) || { clicks: 0, impressions: 0 };
    // Protection overrides: real search performance always blocks exclusion.
    let finalBucket = bucket;
    let protectedBy = '';
    if (p.clicks >= 1 && (bucket === 'noindex-review' || bucket === 'consolidate-review')) { finalBucket = 'keep'; protectedBy = `clicks=${p.clicks}`; }
    else if (p.impressions >= 10 && bucket === 'noindex-review') { finalBucket = 'consolidate-review'; protectedBy = `impressions=${p.impressions}`; }
    rows.push({ path, section, bucket: finalBucket, initialBucket: bucket, reason, clicks: p.clicks, impressions: p.impressions, protectedBy });
  };

  // Static + best (from sitemap definition; best list ids read from lib/data is TS — enumerate via known routes file not needed: static set below mirrors app/sitemap.ts).
  const staticPaths = ['', '/products', '/chairpedia', '/blog', '/compare', '/chair', '/reviews', '/videos', '/news', '/brands', '/best', '/best/best-chairs-to-buy', '/designers', '/gallery', '/about', '/contact', '/editorial-policy', '/affiliate-disclosure', '/privacy', '/terms'];
  for (const p of staticPaths) add(p || '/', 'static', 'keep', 'static route');

  for (const p of products) {
    const rc = reviewsPerProduct.get(p.id) || 0;
    const descWords = words(p.description_en);
    if (rc === 0 && descWords < 120 && !guideByProduct.has(p.id)) add(`/products/${p.slug}`, 'products', 'improve', `0 reviews, ${descWords}w description, no guide`);
    else if (rc === 0) add(`/products/${p.slug}`, 'products', 'improve', `0 reviews (${descWords}w desc${guideByProduct.has(p.id) ? ', has guide' : ''})`);
    else add(`/products/${p.slug}`, 'products', 'keep', `${rc} reviews`);
  }

  for (const r of reviews) {
    if (!r.source_url) add(`/reviews/${r.id}`, 'reviews', 'noindex-review', `no source_url (source=${r.source})`);
    else if (!specificSource(r.source_url)) add(`/reviews/${r.id}`, 'reviews', 'consolidate-review', `non-specific source_url (source=${r.source})`);
    else if (words(r.summary_ko) < 40) add(`/reviews/${r.id}`, 'reviews', 'consolidate-review', `sourced but ${words(r.summary_ko)}w summary`);
    else add(`/reviews/${r.id}`, 'reviews', 'keep', `sourced, ${words(r.summary_ko)}w`);
  }

  for (const n of news) {
    const w = words(`${n.summary || ''} ${n.why_it_matters || ''}`);
    if (!n.url) add(`/news/${n.slug}`, 'news', 'noindex-review', `no original url, ${w}w`);
    else if (w < 80) add(`/news/${n.slug}`, 'news', 'noindex-review', `summary-only ${w}w, original exists`);
    else add(`/news/${n.slug}`, 'news', 'keep', `${w}w with original link`);
  }

  for (const c of chairpedia) {
    const sourced = (c.gen_sources || []).length > 0;
    const bodyWords = words((c.content_html || '').replace(/<[^>]+>/g, ' '));
    if (!sourced && bodyWords < 400) add(`/chairpedia/${c.slug}`, 'chairpedia', 'improve', `no recorded sources, ${bodyWords}w`);
    else if (!sourced) add(`/chairpedia/${c.slug}`, 'chairpedia', 'improve', `no recorded sources`);
    else add(`/chairpedia/${c.slug}`, 'chairpedia', 'keep', `${bodyWords}w, sources recorded`);
  }

  const seenPairs = new Map();
  for (const c of comparisons) {
    const pair = c.product_a_id && c.product_b_id ? [c.product_a_id, c.product_b_id].sort().join('|') : null;
    if (pair && seenPairs.has(pair)) add(`/compare/${c.slug}`, 'compare', 'consolidate-review', `duplicate pair of ${seenPairs.get(pair)}`);
    else { if (pair) seenPairs.set(pair, c.slug); add(`/compare/${c.slug}`, 'compare', 'keep', 'published comparison'); }
  }

  for (const b of blog) add(`/blog/${b.slug}`, 'blog', 'keep', 'published post');

  for (const b of brands) {
    const count = productsPerBrand.get(b.id) || 0;
    if (count === 0) add(`/brands/${b.slug}`, 'brands', 'noindex-review', '0 published chair products');
    else add(`/brands/${b.slug}`, 'brands', 'keep', `${count} products`);
  }

  const summary = {};
  for (const r of rows) {
    summary[r.section] ??= {};
    summary[r.section][r.bucket] = (summary[r.section][r.bucket] || 0) + 1;
  }
  const promoted = rows.filter(r => r.protectedBy);

  const report = {
    generatedAt: new Date().toISOString(),
    note: 'Read-only triage buckets for review. clicks/impressions = GSC web final 2026-06-11..2026-09-08 page rows. Buckets are proposals, not actions; protection rule promotes any URL with real search performance.',
    totals: { urls: rows.length, byBucket: rows.reduce((a, r) => (a[r.bucket] = (a[r.bucket] || 0) + 1, a), {}) },
    summary,
    protectedPromotions: promoted.map(r => ({ path: r.path, from: r.initialBucket, to: r.bucket, by: r.protectedBy })),
  };
  const dir = resolve(__dirname, '../data/seo-audit');
  mkdirSync(dir, { recursive: true });
  const stamp = Date.now();
  writeFileSync(resolve(dir, `url-triage-${stamp}.json`), JSON.stringify({ ...report, rows }, null, 1), { flag: 'wx' });
  const csv = ['path,section,bucket,clicks,impressions,protected_by,reason', ...rows.map(r => [r.path, r.section, r.bucket, r.clicks, r.impressions, r.protectedBy, `"${r.reason.replace(/"/g, '""')}"`].join(','))].join('\n');
  writeFileSync(resolve(dir, `url-triage-${stamp}.csv`), csv, { flag: 'wx' });
  console.log(JSON.stringify(report, null, 2));
  console.log(resolve(dir, `url-triage-${stamp}.csv`));
}
main().catch(e => { console.error(e.stack || e.message); process.exitCode = 1; });
