const assert = require('node:assert/strict');
const { mkdirSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: resolve(__dirname, '../.env.local'), quiet: true });
const base = 'https://www.furniblog.com';
const oldSlug = 'sihoo-m18';
const targetSlug = 'sihoo-m18-ergonomic-office-chair';
async function main() {
  const response = await fetch(`${base}/chairpedia/${oldSlug}`, { redirect: 'manual', signal: AbortSignal.timeout(30000) });
  assert.ok([301, 308].includes(response.status), 'Deploy permanent redirect before retiring the old entry');
  assert.equal(new URL(response.headers.get('location'), base).href, `${base}/chairpedia/${targetSlug}`);
  const target = await fetch(`${base}/chairpedia/${targetSlug}`, { redirect: 'manual', signal: AbortSignal.timeout(30000) });
  assert.equal(target.status, 200);
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: rows, error } = await s.from('chairpedia').select('*').in('slug', [oldSlug, targetSlug]);
  if (error) throw error;
  assert.equal(rows.length, 2);
  const old = rows.find(row => row.slug === oldSlug);
  const current = rows.find(row => row.slug === targetSlug);
  assert.equal(old.id, 'd78e216d-bc20-48e0-ab87-d65a50a4a515');
  assert.equal(current.status, 'published');
  assert.ok(current.product_id && current.content_html);
  assert.ok(['published', 'draft'].includes(old.status));
  assert.ok(old.content_html);
  if (!process.argv.includes('--apply')) {
    console.log(JSON.stringify({ mode: 'dry-run', oldStatus: old.status, redirect: response.status, target: 200 }));
    return;
  }
  if (old.status === 'published') {
    const dir = resolve(__dirname, 'backups');
    mkdirSync(dir, { recursive: true });
    const backup = resolve(dir, `retire-m18-${Date.now()}.json`);
    writeFileSync(backup, JSON.stringify(rows, null, 2), { flag: 'wx' });
    console.log(`Backup: ${backup}`);
    const result = await s.from('chairpedia').update({ status: 'draft', updated_at: new Date().toISOString() })
      .eq('id', old.id).eq('status', 'published').eq('updated_at', old.updated_at).select('id').single();
    if (result.error) throw result.error;
  }
  const saved = await s.from('chairpedia').select('*').eq('id', old.id).single();
  if (saved.error) throw saved.error;
  assert.equal(saved.data.status, 'draft');
  for (const key of Object.keys(old).filter(key => !['status', 'updated_at'].includes(key))) {
    assert.deepEqual(saved.data[key], old[key], `Unexpected change: ${key}`);
  }
  console.log('PASS: retired entry is draft; original content and metadata preserved.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
