// Weekly money-page scoreboard: first-party affiliate clicks (by referrer page
// and product) joined with GSC search clicks. SubTag order data lives in the
// Associates report UI — read the ascsubtag values there against the page
// column printed here (subtag = pathname with "/"→"_").
// Usage: node scripts/revenue-scoreboard.cjs [--days 28]
const { createPrivateKey, sign } = require('node:crypto');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
require('dotenv').config({ path: resolve(__dirname, '../.env.gsc.local'), quiet: true });
require('dotenv').config({ path: resolve(__dirname, '../.env.local'), quiet: true });
const { createClient } = require('@supabase/supabase-js');

async function gscPages(days) {
  try {
    const credentials = process.env.GSC_CREDENTIALS_FILE ? JSON.parse(readFileSync(process.env.GSC_CREDENTIALS_FILE, 'utf8')) : null;
    const email = credentials?.client_email || process.env.GSC_CLIENT_EMAIL;
    const key = createPrivateKey(credentials?.private_key || process.env.GSC_PRIVATE_KEY?.replace(/\\n/g, '\n'));
    const site = process.env.GSC_SITE_URL;
    const enc = x => Buffer.from(JSON.stringify(x)).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const unsigned = `${enc({ alg: 'RS256', typ: 'JWT' })}.${enc({ iss: email, scope: 'https://www.googleapis.com/auth/webmasters.readonly', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 600 })}`;
    const auth = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${sign('RSA-SHA256', Buffer.from(unsigned), key).toString('base64url')}` }) });
    const token = await auth.json();
    const end = new Date(Date.now() - 2 * 864e5).toISOString().slice(0, 10);
    const start = new Date(Date.now() - (days + 2) * 864e5).toISOString().slice(0, 10);
    const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, { method: 'POST', headers: { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ startDate: start, endDate: end, type: 'web', dimensions: ['page'], rowLimit: 25000 }) });
    const rows = (await res.json()).rows || [];
    const map = new Map();
    for (const r of rows) { try { map.set(decodeURI(new URL(r.keys[0]).pathname), { sClicks: r.clicks, sImpr: r.impressions }); } catch {} }
    return map;
  } catch (e) { console.error('GSC unavailable:', e.message); return new Map(); }
}

async function main() {
  const idx = process.argv.indexOf('--days');
  const days = idx !== -1 ? Number(process.argv[idx + 1]) || 28 : 28;
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const since = new Date(Date.now() - days * 864e5).toISOString();
  const { data: clicks, error } = await s.from('affiliate_clicks')
    .select('product_id, retailer_name, referrer, country, clicked_at')
    .gte('clicked_at', since).limit(10000);
  if (error) throw new Error(error.message);
  const { data: prods } = await s.from('products').select('id,slug,name').limit(500);
  const nameById = new Map(prods.map(p => [p.id, p.name]));

  const byPage = new Map();
  const byProduct = new Map();
  for (const c of clicks) {
    let page = '(unknown)';
    try { if (c.referrer) page = new URL(c.referrer).pathname; } catch {}
    byPage.set(page, (byPage.get(page) || 0) + 1);
    const n = nameById.get(c.product_id) || c.product_id;
    byProduct.set(n, (byProduct.get(n) || 0) + 1);
  }
  const gsc = await gscPages(days);

  console.log(`\n=== Affiliate clicks by page (last ${days}d, ${clicks.length} clicks) ===`);
  console.log('page | aff.clicks | search clicks | impressions | subtag');
  for (const [page, n] of [...byPage].sort((a, b) => b[1] - a[1]).slice(0, 25)) {
    const g = gsc.get(page) || { sClicks: 0, sImpr: 0 };
    const subtag = page === '(unknown)' ? '-' : (page.replace(/^\/+|\/+$/g, '').replace(/\//g, '_').replace(/[^A-Za-z0-9_-]+/g, '-') || 'home').slice(0, 90);
    console.log(`${page} | ${n} | ${g.sClicks} | ${g.sImpr} | ${subtag}`);
  }
  console.log(`\n=== Affiliate clicks by product ===`);
  for (const [name, n] of [...byProduct].sort((a, b) => b[1] - a[1]).slice(0, 20)) console.log(`${name} | ${n}`);
  console.log('\nOrders/commissions per subtag: Associates Central report (manual read).');
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
