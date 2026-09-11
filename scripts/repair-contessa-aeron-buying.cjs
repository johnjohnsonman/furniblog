const assert = require('node:assert/strict');
const { readFileSync, mkdirSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { isDeepStrictEqual } = require('node:util');
const { load } = require('cheerio');
const comparisonSlug = 'okamura-contessa-ii-vs-herman-miller-aeron-which-should-you-buy-ms5i1068';
const guideSlug = 'okamura-contessa-ii-contessa-seconda';
const body = readFileSync(resolve(__dirname, '../content/seo/contessa-aeron-buying.html'), 'utf8');
const faq = [
  { q: 'Does every Contessa II include a headrest?', a: 'No. Okamura lists fixed and adjustable headrests as options. Confirm the configuration in the seller quote.' },
  { q: 'Which chair is better for taller users?', a: 'This comparison does not assign a height-based winner. Aeron has sizes A, B and C; compare the exact chair dimensions, your desk and your own measurements before ordering.' },
  { q: 'Which chair costs less?', a: 'We have not verified live, like-for-like prices. Compare quotes for the selected configurations, including delivery, taxes and return costs.' },
];
function comparisonPatch(row) {
  const old = load(row.content_html, null, false);
  assert.equal(old('video,iframe,picture,source').length, 0, 'Review additional media before replacing prose');
  const images = old('img').toArray().map(el => old.html(el)).join('');
  return {
    content_html: body + (images ? `<section id="comparison-original-images">${images}</section>` : ''),
    faq,
    subtitle: 'Compare configurations, fit checks and purchase terms using manufacturer documentation.',
    excerpt: 'Contessa II or Aeron? Compare headrest and upholstery options, sizing and seller checks without unsupported price or comfort rankings.',
    seo_title: 'Contessa II vs Aeron: Options, Fit and Buying Checks',
    seo_description: 'Compare Contessa II and Aeron configurations, headrest options, sizing and purchase terms. Research-based guidance with manufacturer sources.',
  };
}
function guidePatch(row) {
  const $ = load(row.content_html, null, false);
  const href = `/compare/${comparisonSlug}`;
  if ($('a').toArray().some(el => $(el).attr('href') === href)) return {};
  assert.equal($('#contessa-aeron-comparison').length, 0, 'Unexpected existing section');
  return { content_html: row.content_html + `\n<section id="contessa-aeron-comparison"><h2>Considering an Aeron too?</h2><p><a href="${href}">Compare Contessa II and Aeron configurations, fit checks and purchase terms</a> before choosing a seller. The comparison distinguishes optional equipment from standard features and does not assume a universal comfort or price winner.</p></section>` };
}
async function main() {
  require('dotenv').config({ path: resolve(__dirname, '../.env.local'), quiet: true });
  const apply = process.argv.includes('--apply');
  const s = require('@supabase/supabase-js').createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,
    apply ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const jobs = [];
  for (const [table, slug, revise] of [['comparisons', comparisonSlug, comparisonPatch], ['chairpedia', guideSlug, guidePatch]]) {
    const { data: row, error } = await s.from(table).select('*').eq('slug', slug).eq('status', 'published').single();
    if (error) throw error;
    if (table === 'comparisons') {
      assert.equal(row.product_a_id, 'f4496f87-007d-47a2-a634-7dd64492630b');
      assert.equal(row.product_b_id, '58820425-adb6-43d7-8bda-d427b34c22aa');
    } else assert.equal(row.product_id, 'f4496f87-007d-47a2-a634-7dd64492630b');
    const patch = revise(row);
    const changed = Object.keys(patch).some(key => !isDeepStrictEqual(patch[key], row[key]));
    jobs.push({ table, row, patch, changed });
    console.log(JSON.stringify({ table, slug, changed, fields: Object.keys(patch), mode: apply ? 'apply' : 'dry-run' }));
  }
  if (!apply) return;
  const dir = resolve(__dirname, 'backups');
  mkdirSync(dir, { recursive: true });
  if (jobs.some(job => job.changed)) {
    const path = resolve(dir, `contessa-aeron-buying-${Date.now()}.json`);
    writeFileSync(path, JSON.stringify(jobs.map(({ table, row }) => ({ table, row })), null, 2), { flag: 'wx' });
    console.log(`Backup: ${path}`);
  }
  // Update and verify the comparison before adding its incoming guide link.
  for (const { table, row, patch, changed } of jobs) {
    if (!changed) continue;
    let query = s.from(table).update({ ...patch, updated_at: new Date().toISOString() }).eq('id', row.id).eq('status', 'published');
    query = row.updated_at === null ? query.is('updated_at', null) : query.eq('updated_at', row.updated_at);
    const { data, error } = await query.select('*').single();
    if (error) throw error;
    for (const key of Object.keys(row)) {
      if (key !== 'updated_at') assert.deepEqual(data[key], Object.hasOwn(patch, key) ? patch[key] : row[key], `Unexpected change: ${table}.${key}`);
    }
    console.log(`PASS: ${table} updated; unrelated fields preserved.`);
  }
}
module.exports = { comparisonPatch, guidePatch, comparisonSlug, guideSlug, faq };
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
