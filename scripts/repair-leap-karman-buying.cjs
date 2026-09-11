const assert = require('node:assert/strict');
const { readFileSync, mkdirSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { isDeepStrictEqual } = require('node:util');
const { load } = require('cheerio');
const slug = 'steelcase-leap-v2-vs-steelcase-karman-which-should-you-buy-mtdsokvd';
const body = readFileSync(resolve(__dirname, '../content/seo/leap-karman-buying.html'), 'utf8');
const faq = [
  { q: 'Is Karman more comfortable than Leap V2?', a: 'We have not hands-on tested these chairs or established a comfort winner. Try the selected configuration and compare the seat feel, fit and recline controls.' },
  { q: 'Does Karman weigh 5 kg?', a: 'No. Steelcase publishes 29 lb, approximately 13.2 kg. Confirm the selected variant with the seller rather than assuming every configuration has the same weight.' },
  { q: 'Are neck-support options available?', a: 'The current Steelcase range lists Leap with a headrest and a separate Karman high-back version with a neck-support pillow. These are not proof that a standard or older listing includes neck support.' },
];
function revise(row) {
  const $ = load(row.content_html, null, false);
  assert.equal($('video,iframe,picture,source').length, 0, 'Review additional media first');
  const images = $('img').toArray().map(el => $.html(el)).join('');
  return { content_html: body + (images ? `<section id="original-images">${images}</section>` : ''), faq,
    subtitle: 'Compare seating, adjustment controls and configuration choices using manufacturer sources.',
    excerpt: 'Leap V2 or Karman? Compare seat construction, recline controls, neck-support options and seller checks without unverified price or rating winners.',
    seo_title: 'Leap V2 vs Karman: Features, Fit and Buying Checks',
    seo_description: 'Research-based Leap V2 and Karman comparison: seat construction, adjustment controls, weight and configuration checks before buying.' };
}
async function main() {
  require('dotenv').config({ path: resolve(__dirname, '../.env.local'), quiet: true });
  const apply = process.argv.includes('--apply');
  const s = require('@supabase/supabase-js').createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, apply ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data: row, error } = await s.from('comparisons').select('*').eq('slug', slug).eq('status', 'published').single();
  if (error) throw error;
  assert.equal(row.product_a_id, 'fa7a9bfa-c3ed-475e-b194-c8542217e857');
  assert.equal(row.product_b_id, '83505c8e-39e5-4a87-858f-ab67e9edbfd0');
  const patch = revise(row);
  const changed = Object.keys(patch).some(key => !isDeepStrictEqual(patch[key], row[key]));
  console.log(JSON.stringify({ slug, changed, mode: apply ? 'apply' : 'dry-run' }));
  if (!apply || !changed) return;
  const dir = resolve(__dirname, 'backups');
  mkdirSync(dir, { recursive: true });
  const backup = resolve(dir, `leap-karman-buying-${Date.now()}.json`);
  writeFileSync(backup, JSON.stringify(row, null, 2), { flag: 'wx' });
  console.log(`Backup: ${backup}`);
  let q = s.from('comparisons').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', row.id).eq('status', 'published');
  q = row.updated_at === null ? q.is('updated_at', null) : q.eq('updated_at', row.updated_at);
  const result = await q.select('*').single();
  if (result.error) throw result.error;
  for (const key of Object.keys(row)) if (key !== 'updated_at') assert.deepEqual(result.data[key], Object.hasOwn(patch, key) ? patch[key] : row[key], key);
  console.log('PASS: one comparison updated; unrelated fields preserved.');
}
module.exports = { revise, slug, faq };
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
