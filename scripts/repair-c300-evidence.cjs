const assert = require('node:assert/strict');
const { readFileSync, mkdirSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { load } = require('cheerio');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: resolve(__dirname, '../.env.local'), quiet: true });
const slug = 'sihoo-doro-c300-advanced-ergonomic-office-chair-review';
const sections = JSON.parse(readFileSync(resolve(__dirname, '../content/seo/c300-evidence-sections.json'), 'utf8'));
const sources = ['https://www.sihoo.com/products/sihoo-doro-c300-ergonomic-office-chair', 'https://www.amazon.com/dp/B0C3T865C2'];

async function main() {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: row, error } = await s.from('chairpedia').select('*').eq('slug', slug).single();
  if (error) throw error;
  assert.equal(row.id, '993f56db-2afe-41d1-8f16-1b3a2ddc1cda');
  assert.equal(row.status, 'published');
  const $ = load(row.content_html, null, false);
  const images = $('img').toArray().map(e => $.html(e));
  const comparison = $('#priority-chair-comparisons').toString();
  assert.equal(images.length, 8, 'Recheck manually if the image inventory changed');
  assert.ok(comparison.includes('/compare/sihoo-m18-vs-sihoo-doro-c300'));
  for (const section of sections) {
    const heading = $.root().children('h2,h3').filter((_, e) => $(e).text().startsWith(section.match) || $(e).text() === section.title);
    assert.equal(heading.length, 1, `Section mismatch: ${section.match}`);
    // Existing images remain at their original section positions, unchanged.
    heading.nextUntil('h2,h3').filter('p').remove();
    heading.text(section.title).after(section.html);
  }
  assert.deepEqual($('img').toArray().map(e => $.html(e)), images);
  assert.equal($('#priority-chair-comparisons').toString(), comparison);
  for (const phrase of ['ensuring everyone', 'leaves nothing to be desired', 'sliding seat adjustment is especially helpful', 'at Sihoo, innovation', 'Fortune 500', '5-year warranty']) {
    assert.ok(!$.text().includes(phrase), `Unsupported text remains: ${phrase}`);
  }
  const patch = { content_html: $.html(), gen_sources: sources };
  const dir = resolve(__dirname, '../data/seo-audit');
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'c300-evidence-preview.html'), patch.content_html);
  console.log(JSON.stringify({ mode: process.argv.includes('--apply') ? 'apply' : 'dry-run', slug, sections: sections.length, imagesPreserved: images.length, comparisonPreserved: true, sourceCount: sources.length }));
  if (!process.argv.includes('--apply')) return;
  if (patch.content_html === row.content_html && JSON.stringify(sources) === JSON.stringify(row.gen_sources)) {
    console.log('Already applied; no update timestamp changed.'); return;
  }
  const backupDir = resolve(__dirname, 'backups');
  mkdirSync(backupDir, { recursive: true });
  const backup = resolve(backupDir, `c300-evidence-${Date.now()}.json`);
  writeFileSync(backup, JSON.stringify(row, null, 2), { flag: 'wx' });
  console.log(`Backup: ${backup}`);
  const result = await s.from('chairpedia').update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', row.id).eq('updated_at', row.updated_at).select('*').single();
  if (result.error) throw result.error;
  for (const key of Object.keys(row)) {
    if (key === 'updated_at') continue;
    assert.deepEqual(result.data[key], Object.hasOwn(patch, key) ? patch[key] : row[key], `Unexpected saved value: ${key}`);
  }
  console.log('PASS: C300 evidence repaired; URL, metadata, product mapping and all images preserved.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
