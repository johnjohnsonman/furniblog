// Read-only daily GSC timeline around the July 2026 impression drop, to pin the exact drop date(s)
// for cross-referencing against deploy/hosting history. No site or DB changes.
const { createPrivateKey, sign } = require('node:crypto');
const { readFileSync, mkdirSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
require('dotenv').config({ path: resolve(__dirname, '../.env.gsc.local'), quiet: true });
require('dotenv').config({ path: resolve(__dirname, '../.env.local'), quiet: true });

async function main() {
  const credentials = process.env.GSC_CREDENTIALS_FILE ? JSON.parse(readFileSync(process.env.GSC_CREDENTIALS_FILE, 'utf8')) : null;
  const email = credentials?.client_email || process.env.GSC_CLIENT_EMAIL;
  const key = createPrivateKey(credentials?.private_key || process.env.GSC_PRIVATE_KEY?.replace(/\\n/g, '\n'));
  const site = process.env.GSC_SITE_URL;
  const enc = x => Buffer.from(JSON.stringify(x)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${enc({ alg: 'RS256', typ: 'JWT' })}.${enc({ iss: email, scope: 'https://www.googleapis.com/auth/webmasters.readonly', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 600 })}`;
  const auth = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${sign('RSA-SHA256', Buffer.from(unsigned), key).toString('base64url')}` }), signal: AbortSignal.timeout(30000) });
  const token = await auth.json();
  if (!auth.ok || !token.access_token) throw new Error('Google authentication failed');

  const query = async body => {
    const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, { method: 'POST', headers: { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(60000) });
    if (!res.ok) throw new Error(`GSC HTTP ${res.status}: ${await res.text()}`);
    return (await res.json()).rows || [];
  };

  const startDate = '2026-06-15', endDate = '2026-08-15';
  const daily = await query({ startDate, endDate, type: 'web', dataState: 'final', dimensions: ['date'], rowLimit: 500 });
  const dailyUsa = await query({ startDate, endDate, type: 'web', dataState: 'final', dimensions: ['date'], dimensionFilterGroups: [{ filters: [{ dimension: 'country', operator: 'equals', expression: 'usa' }] }], rowLimit: 500 });
  const dailyReviews = await query({ startDate, endDate, type: 'web', dataState: 'final', dimensions: ['date'], dimensionFilterGroups: [{ filters: [{ dimension: 'page', operator: 'contains', expression: '/reviews/' }] }], rowLimit: 500 });

  const usaMap = new Map(dailyUsa.map(r => [r.keys[0], r]));
  const revMap = new Map(dailyReviews.map(r => [r.keys[0], r]));
  const table = daily.map(r => ({ date: r.keys[0], impressions: r.impressions, clicks: r.clicks, usaImpressions: usaMap.get(r.keys[0])?.impressions || 0, reviewImpressions: revMap.get(r.keys[0])?.impressions || 0 }));

  // Detect the steepest sustained fall: compare each 3-day mean to the prior 7-day mean.
  let worst = null;
  for (let i = 7; i < table.length - 2; i++) {
    const prior = table.slice(i - 7, i).reduce((a, r) => a + r.impressions, 0) / 7;
    const next = table.slice(i, i + 3).reduce((a, r) => a + r.impressions, 0) / 3;
    if (prior >= 20) {
      const ratio = next / prior;
      if (!worst || ratio < worst.ratio) worst = { date: table[i].date, prior7dAvg: +prior.toFixed(1), next3dAvg: +next.toFixed(1), ratio: +ratio.toFixed(3) };
    }
  }

  const report = { generatedAt: new Date().toISOString(), note: 'GSC web final daily data. Drop-point detection is descriptive (steepest 3d-vs-7d fall), not causal.', window: { startDate, endDate }, steepestDrop: worst, table };
  const dir = resolve(__dirname, '../data/gsc');
  mkdirSync(dir, { recursive: true });
  const file = resolve(dir, `drop-timeline-${Date.now()}.json`);
  writeFileSync(file, JSON.stringify(report, null, 1), { flag: 'wx' });
  for (const r of table) console.log(`${r.date} total=${r.impressions} usa=${r.usaImpressions} reviews=${r.reviewImpressions} clicks=${r.clicks}`);
  console.log('steepestDrop', JSON.stringify(worst));
  console.log(file);
}
main().catch(e => { console.error(e.stack || e.message); process.exitCode = 1; });
