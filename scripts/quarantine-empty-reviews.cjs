const assert = require('node:assert/strict');
const { mkdirSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: resolve(__dirname, '../.env.local'), quiet: true });

// Exact audit-confirmed candidates, not a bulk missing-source/word-count filter.
const ids = [
  'c41be132-9503-4ff4-8c16-c9b42379db83',
  'e8375879-e8ae-43dc-99d3-a9b858d329e9',
  '7bd32f77-c622-4ee5-a498-ef5cf0e2c702',
];
const placeholders = new Set(['\ub514\uc2dc\uc778\uc0ac\uc774\ub4dc', '\ub514\uc2dc\uc778\uc0ac\uc774\ub4dc \uac24\ub7ec\ub9ac']);
const reason = 'Confirmed collection failure: site-name-only summary and homepage source, no review pros/cons. SEO quality audit 2026-09-10.';

async function main() {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: rows, error } = await s.from('reviews').select('*').in('id', ids);
  if (error) throw error;
  assert.equal(rows.length, ids.length);
  for (const row of rows) {
    assert.ok(placeholders.has(row.summary_ko?.trim()), `Summary changed: ${row.id}`);
    const source = new URL(row.source_url);
    assert.ok(source.hostname === 'dcinside.com' || source.hostname.endsWith('.dcinside.com'));
    assert.equal(source.pathname, '/');
    assert.equal((row.pros || []).length, 0, `Review has pros: ${row.id}`);
    assert.equal((row.cons || []).length, 0, `Review has cons: ${row.id}`);
  }
  const pending = rows.filter(r => !r.excluded);
  console.log(JSON.stringify({ mode: process.argv.includes('--apply') ? 'apply' : 'dry-run', candidates: rows.map(r => ({ id: r.id, productId: r.product_id, summary: r.summary_ko, source: r.source_url, excluded: r.excluded })), pending: pending.length }));
  if (!process.argv.includes('--apply') || !pending.length) return;
  const dir = resolve(__dirname, 'backups');
  mkdirSync(dir, { recursive: true });
  const file = resolve(dir, `empty-reviews-${Date.now()}.json`);
  writeFileSync(file, JSON.stringify({ reason, rows }, null, 2), { flag: 'wx' });
  console.log(`Backup: ${file}`);
  for (const row of pending) {
    const result = await s.from('reviews').update({ excluded: true, exclude_reason: reason, excluded_at: new Date().toISOString() })
      .eq('id', row.id).eq('excluded', false).eq('summary_ko', row.summary_ko).eq('source_url', row.source_url)
      .select('*').single();
    if (result.error) throw result.error;
    assert.equal(result.data.excluded, true);
    for (const key of Object.keys(row).filter(k => !['excluded', 'exclude_reason', 'excluded_at', 'updated_at'].includes(k))) {
      assert.deepEqual(result.data[key], row[key], `Unexpected change to ${key}`);
    }
  }
  const check = await s.from('reviews').select('id').in('id', ids).eq('excluded', false);
  if (check.error) throw check.error;
  assert.equal(check.data.length, 0);
  console.log(`PASS: ${pending.length} collection failures quarantined, original records preserved.`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
