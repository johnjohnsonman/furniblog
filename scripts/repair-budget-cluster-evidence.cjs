const assert = require('node:assert/strict');
const { readFileSync, mkdirSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { load } = require('cheerio');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: resolve(__dirname, '../.env.local'), quiet: true });
const config = JSON.parse(readFileSync(resolve(__dirname, '../content/seo/budget-cluster-evidence.json'), 'utf8'));
async function main() {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: rows, error } = await s.from('chairpedia').select('*').in('slug', Object.keys(config));
  if (error) throw error;
  assert.equal(rows.length, 2);
  const patches = rows.map(row => {
    const spec = config[row.slug];
    assert.equal(row.id, spec.id);
    assert.equal(row.status, 'published');
    const $ = load(row.content_html, null, false);
    assert.equal($('img,video,iframe').length, 0, 'Media added since audit; recheck manually');
    assert.equal($('#priority-chair-comparisons').length, 1);
    const comparison = $('#priority-chair-comparisons').toString();
    const content = load(spec.html + comparison, null, false);
    assert.equal(content('#priority-chair-comparisons').toString(), comparison);
    assert.equal(content('h1').length, 0);
    return { row, patch: { content_html: content.html(), gen_sources: spec.sources } };
  });
  console.log(JSON.stringify({ mode: process.argv.includes('--apply') ? 'apply' : 'dry-run', slugs: rows.map(r => r.slug), comparisonBlocksPreserved: 2 }));
  if (!process.argv.includes('--apply')) return;
  const pending = patches.filter(({ row, patch }) => row.content_html !== patch.content_html || JSON.stringify(row.gen_sources) !== JSON.stringify(patch.gen_sources));
  if (!pending.length) { console.log('Already applied; timestamps unchanged.'); return; }
  const dir = resolve(__dirname, 'backups'); mkdirSync(dir, { recursive: true });
  const backup = resolve(dir, `budget-cluster-evidence-${Date.now()}.json`);
  writeFileSync(backup, JSON.stringify(rows, null, 2), { flag: 'wx' });
  console.log(`Backup: ${backup}`);
  for (const { row, patch } of pending) {
    const saved = await s.from('chairpedia').update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', row.id).eq('updated_at', row.updated_at).select('*').single();
    if (saved.error) throw saved.error;
    for (const key of Object.keys(row).filter(k => k !== 'updated_at')) {
      assert.deepEqual(saved.data[key], Object.hasOwn(patch, key) ? patch[key] : row[key], `Changed field: ${key}`);
    }
    console.log(`PASS: ${row.slug}; URL, metadata, hero and product mapping preserved.`);
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
