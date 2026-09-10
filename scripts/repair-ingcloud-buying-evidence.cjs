const assert = require('node:assert/strict');
const { readFileSync, mkdirSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { load } = require('cheerio');
const sections = JSON.parse(readFileSync(resolve(__dirname, '../content/seo/ingcloud-buying-evidence.json'), 'utf8'));
const slug = 'kokuyo-ingcloud';
const sources = [
  'https://www.kokuyo.com/en/furniture/seating/task/ing-cloud/',
  'https://www.kokuyo.com/en/insights/20260610/',
  'https://www.kokuyo.com/sites/default/files/shared_contents/furniture/en/seating/task/ingcloud/files/ingCloud.pdf',
  'https://www.kokuyo.com/sites/default/files/shared_contents/furniture/en/seating/task/ingcloud/files/GREENGUARDCertification_ingCloud.pdf',
  'https://www.kokuyo.com/news/release/20251203fn/',
];
function revise(html) {
  const $ = load(html, null, false);
  const images = $('img').toArray().map(el => $.html(el));
  const intro = $('#model-answers').toString();
  assert.equal($('#model-answers').length, 1);
  assert.equal($('video,iframe,picture,source').length, 0, 'Additional media needs manual review');
  assert.equal($.root().children('h2').length, sections.length, 'Unexpected section inventory');
  for (const section of sections) {
    const heading = $.root().children('h2').filter((_, el) => $(el).text().startsWith(section.match) || $(el).text() === section.title);
    assert.equal(heading.length, 1, `Section mismatch: ${section.match}`);
    const nodes = heading.nextUntil('h2');
    const media = nodes.filter('img').add(nodes.find('img')).toArray().map(el => $.html(el)).join('');
    nodes.remove();
    heading.text(section.title).after(section.html + media);
  }
  assert.deepEqual($('img').toArray().map(el => $.html(el)), images, 'Images and order must be unchanged');
  assert.equal($('#model-answers').toString(), intro, 'Preserve the indexed answer section');
  assert.equal($('h1').length, 0);
  for (const phrase of ['4D arms', '75 per cent', '50–90 kg', 'no squeaks', 'sold exclusively', 'has not undergone', 'no PVC', 'US$1,500']) {
    assert.ok(!$.text().includes(phrase), `Unsupported claim remains: ${phrase}`);
  }
  return { html: $.html(), images: images.length };
}
async function main() {
  require('dotenv').config({ path: resolve(__dirname, '../.env.local'), quiet: true });
  const s = require('@supabase/supabase-js').createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: row, error } = await s.from('chairpedia').select('*').eq('slug', slug).single();
  if (error) throw error;
  assert.equal(row.id, '1689dbd9-37f8-4d9a-90ac-9323aa919540');
  assert.equal(row.status, 'published');
  const revised = revise(row.content_html);
  assert.ok(revised.images > 0);
  const patch = { content_html: revised.html, gen_sources: sources };
  const dir = resolve(__dirname, '../data/seo-audit');
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'ingcloud-buying-preview.html'), patch.content_html);
  console.log(JSON.stringify({ mode: process.argv.includes('--apply') ? 'apply' : 'dry-run', slug, sections: sections.length, images: revised.images, sources: sources.length }));
  if (!process.argv.includes('--apply')) return;
  if (row.content_html === patch.content_html && JSON.stringify(row.gen_sources) === JSON.stringify(sources)) {
    console.log('Already applied; no timestamp changed.'); return;
  }
  const backupDir = resolve(__dirname, 'backups');
  mkdirSync(backupDir, { recursive: true });
  const backup = resolve(backupDir, `ingcloud-buying-evidence-${Date.now()}.json`);
  writeFileSync(backup, JSON.stringify(row, null, 2), { flag: 'wx' });
  console.log(`Backup: ${backup}`);
  const result = await s.from('chairpedia').update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', row.id).eq('updated_at', row.updated_at).select('*').single();
  if (result.error) throw result.error;
  for (const key of Object.keys(row)) {
    if (key !== 'updated_at') assert.deepEqual(result.data[key], Object.hasOwn(patch, key) ? patch[key] : row[key], `Unexpected change: ${key}`);
  }
  console.log('PASS: one guide updated; metadata, product mapping, images and indexed intro preserved.');
}
module.exports = { revise, sections, sources };
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
