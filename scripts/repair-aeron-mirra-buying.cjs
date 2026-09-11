const assert = require('node:assert/strict');
const { readFileSync, mkdirSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { isDeepStrictEqual } = require('node:util');
const { load } = require('cheerio');
const slug = 'herman-miller-aeron-vs-herman-miller-mirra-2-which-should-you-buy-ms9sbrcj';
const body = readFileSync(resolve(__dirname, '../content/seo/aeron-mirra-buying.html'), 'utf8');
const faq = [
  {
    "q": "Is Mirra 2 better than Aeron for taller users?",
    "a": "Height alone does not establish a winner. Aeron has three sizes; compare the actual chair dimensions, your seated measurements and a trial of the selected configuration."
  },
  {
    "q": "Does every Mirra 2 have adjustable seat depth?",
    "a": "No. Herman Miller lists fixed-depth and FlexFront adjustable-depth options. Confirm which one is included in the seller's quote."
  },
  {
    "q": "Which chair is better value?",
    "a": "We have not verified live like-for-like prices or established a value winner. Compare the exact configurations, condition, delivered cost, returns and warranty eligibility."
  }
];
function revise(row) {
  const $ = load(row.content_html, null, false);
  assert.equal($('video,iframe,picture,source').length, 0, 'Review additional media first');
  const images = $('img').toArray().map(el => $.html(el)).join('');
  return { content_html: body + (images ? `<section id="original-images">${images}</section>` : ''), faq,
    subtitle: 'Compare chair sizes, back constructions and seat-depth options using manufacturer sources.',
    excerpt: 'Aeron or Mirra 2? Compare sizes, back options, seat-depth adjustment and purchase terms without unsupported price or comfort rankings.',
    seo_title: 'Aeron vs Mirra 2: Sizes, Options and Buying Checks',
    seo_description: 'Compare Aeron and Mirra 2 sizes, back types, seat-depth options and seller checks with manufacturer sources. Research-based, not hands-on tested.' };
}
async function main() {
  require('dotenv').config({ path: resolve(__dirname, '../.env.local'), quiet: true });
  const apply = process.argv.includes('--apply');
  const s = require('@supabase/supabase-js').createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, apply ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data: row, error } = await s.from('comparisons').select('*').eq('slug', slug).eq('status', 'published').single();
  if (error) throw error;
  assert.equal(row.product_a_id, '58820425-adb6-43d7-8bda-d427b34c22aa');
  assert.equal(row.product_b_id, 'b9c5f939-3b08-48a4-ab7a-72d953fee026');
  const patch = revise(row);
  const changed = Object.keys(patch).some(key => !isDeepStrictEqual(patch[key], row[key]));
  console.log(JSON.stringify({ slug, changed, mode: apply ? 'apply' : 'dry-run' }));
  if (!apply || !changed) return;
  const dir = resolve(__dirname, 'backups');
  mkdirSync(dir, { recursive: true });
  const backup = resolve(dir, `aeron-mirra-buying-${Date.now()}.json`);
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
