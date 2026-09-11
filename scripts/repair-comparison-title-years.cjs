const assert = require('node:assert/strict');
const { mkdirSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
function cleanTitle(title) {
  if (typeof title !== 'string') return title;
  return title.replace(/: 202[45] (Comparison|Compare|Guide)$/, ': $1')
    .replace(/ \(202[45]\)$/, '').replace(/ 202[45]$/, '');
}
async function main() {
  assert.equal(cleanTitle('Ahrend 2020 vs Allsteel Acuity: Which Chair Wins?'), 'Ahrend 2020 vs Allsteel Acuity: Which Chair Wins?');
  for (const title of ['A vs B: 2024 Comparison', 'A vs B (2024)', 'A vs B 2025', 'A vs B: 2024 Guide']) {
    assert.ok(!/202[45]/.test(cleanTitle(title)));
    assert.equal(cleanTitle(cleanTitle(title)), cleanTitle(title));
  }
  require('dotenv').config({ path: resolve(__dirname, '../.env.local'), quiet: true });
  const apply = process.argv.includes('--apply');
  const db = require('@supabase/supabase-js').createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, apply ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const rows = [];
  for (let from = 0; ; from += 500) {
    const result = await db.from('comparisons').select('*').eq('status', 'published').order('id').range(from, from + 499);
    if (result.error) throw result.error;
    rows.push(...result.data);
    if (result.data.length < 500) break;
  }
  const plans = rows.filter(row => row.seo_title !== cleanTitle(row.seo_title));
  console.log(JSON.stringify({ total: rows.length, changes: plans.map(row => ({ slug: row.slug, before: row.seo_title, after: cleanTitle(row.seo_title) })), apply }));
  if (!apply || !plans.length) return;
  const dir = resolve(__dirname, 'backups');
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, `comparison-title-years-${Date.now()}.json`), JSON.stringify(plans, null, 2), { flag: 'wx' });
  for (const row of plans) {
    // Metadata-only cleanup must not make the article appear freshly researched.
    let q = db.from('comparisons').update({ seo_title: cleanTitle(row.seo_title) }).eq('id', row.id).eq('seo_title', row.seo_title).eq('status', 'published');
    q = row.updated_at === null ? q.is('updated_at', null) : q.eq('updated_at', row.updated_at);
    const result = await q.select('*').single();
    if (result.error) throw result.error;
    for (const key of Object.keys(row)) assert.deepEqual(result.data[key], key === 'seo_title' ? cleanTitle(row.seo_title) : row[key], key);
    console.log('Verified ' + row.slug);
  }
}
module.exports = { cleanTitle };
if (require.main === module) main().catch(e => { console.error(e.message); process.exitCode = 1; });
