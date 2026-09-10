const { resolve } = require('node:path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: resolve(__dirname, '../.env.local'), quiet: true });
async function main() {
  const days = Number(process.argv[2] || 30);
  if (!Number.isInteger(days) || days < 1 || days > 365) throw new Error('Days must be 1-365');
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const counts = new Map([
    ['/compare/sihoo-m18-vs-sihoo-doro-c300', 0],
    ['/compare/ticova-ergonomic-vs-sihoo-m18', 0],
  ]);
  let total = 0;
  let unattributed = 0;
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await s.from('affiliate_clicks').select('referrer')
      .gte('clicked_at', since).order('clicked_at').order('id').range(offset, offset + 999);
    if (error) throw error;
    for (const row of data) {
      total++;
      let url;
      try { url = new URL(row.referrer); } catch { unattributed++; continue; }
      if (!['www.furniblog.com', 'furniblog.com'].includes(url.hostname)) continue;
      if (url.pathname.startsWith('/compare/')) counts.set(url.pathname, (counts.get(url.pathname) || 0) + 1);
    }
    if (data.length < 1000) break;
  }
  console.log(JSON.stringify({ since, days, recordedClicks: total, unattributed, comparisons: Object.fromEntries(counts), note: 'Recorded events, not unique visitors, verified purchases or revenue. No test clicks inserted.' }, null, 2));
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
