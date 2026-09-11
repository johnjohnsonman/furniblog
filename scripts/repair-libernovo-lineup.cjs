const assert = require('node:assert/strict');
const { mkdirSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { load } = require('cheerio');
const lineup = 'libernovo-lineup-explained-omni-omni-se-omni-pro-maxis-compared';
const buying = 'libernovo-complete-lineup-guide-omni-omni-se-omni-pro-maxis-compared';
const source = 'https://libernovo.com/pages/faqs';
const marker = 'libernovo-source-check-20260911';
function revise(row) {
  const dom = load(row.content_html, null, false);
  assert.equal(dom('iframe,video').length, 0, 'Complex media needs review');
  const images = dom('img').toArray().map(el => dom.html(el));
  const media = images.map(html => `<figure>${html}<figcaption>Illustration retained from the earlier article; confirm specifications on the current product listing.</figcaption></figure>`);
  const common = `<p id="${marker}">This is an editorial buying reference, not a hands-on test. Model information was checked against <a href="${source}">LiberNovo's manufacturer FAQ</a>. Regional listings and configurations may differ; no Amazon stock or seller authorization is confirmed here.</p>`;
  let patch;
  if (row.slug === lineup) {
    patch = {
      title: 'LiberNovo Omni, SE, Gen, Pro and Maxis: Model Differences',
      subtitle: 'Manual adjustment, powered support and ventilation compared',
      excerpt: 'Compare the original Omni with SE, Gen, Pro and the Maxis family, then check the exact configuration offered in your region.',
      seo_title: 'LiberNovo Omni vs SE vs Gen vs Pro vs Maxis',
      seo_description: 'Understand LiberNovo model differences, including Omni Gen, manual versus powered lumbar adjustment, and ventilation. Check the exact listing before buying.',
      content_html: `${common}<h2>Which Omni model is which?</h2><p>The manufacturer now distinguishes the original Omni from Omni Gen. Do not treat an offer labelled simply "Omni" as confirmation of the newer generation.</p>
<ul><li><strong>Omni SE:</strong> manual lumbar adjustment, no battery; five recline positions.</li><li><strong>Original Omni:</strong> electric lumbar adjustment; four recline positions.</li><li><strong>Omni Gen:</strong> electric lumbar adjustment; five recline positions.</li><li><strong>Omni Pro:</strong> five recline positions, seat ventilation, aluminum base and Gabriel Atlantic fabric.</li></ul>${media[0] || ''}
<h2>Where Maxis fits</h2><p>Maxis is a separate larger-chair family with Manual, Electric and Airflow variants. The manufacturer describes a deeper 52 cm seat. A larger specification does not automatically mean a better fit.</p>${media[1] || ''}
<h2>Choose a feature requirement, not a winner</h2><p>Write down which adjustments you actually need. Decide whether manual lumbar adjustment is sufficient or whether powered adjustment is worth the added charging requirement. Compare ventilation only when the exact listing specifies it. We have not independently tested cooling performance, comfort or battery endurance.</p>${media[2] || ''}
<h2>Questions that the model name does not answer</h2><ul><li>Which generation and seat configuration will be shipped?</li><li>What is included in the selected bundle?</li><li>Who handles a return, warranty claim or replacement part?</li><li>Does the delivered price include every required item?</li></ul><p>Use our <a href="/blog/${buying}">LiberNovo purchase checklist</a> before comparing sellers. For the catalog entry associated with our Amazon search, see <a href="/products/libernovo-omni">the original Omni</a>. That search is not a verified offer for SE, Gen, Pro or Maxis.</p>${media.slice(3).join('')}`,
    };
  } else {
    assert.equal(row.slug, buying);
    patch = {
      title: 'Buying a LiberNovo Chair: Model, Fit and Seller Checklist',
      subtitle: 'What to verify before ordering an Omni or Maxis',
      excerpt: 'Check the exact LiberNovo model, configuration, delivered price, seller and return terms before ordering. Avoid confusing the original Omni with Omni Gen.',
      seo_title: 'LiberNovo Buying Checklist: Model, Fit and Seller',
      seo_description: 'Buying a LiberNovo chair? Check model generation, seat configuration, seller, delivery, returns and warranty before comparing Amazon or manufacturer offers.',
      content_html: `${common}<h2>1. Identify the exact chair</h2><p>Record the full model name and generation from the selected offer, not just a search-result title. Ask the seller to clarify an ambiguous name. Our <a href="/blog/${lineup}">LiberNovo model comparison</a> explains the feature differences; this page focuses on the purchase itself.</p>${media[0] || ''}
<h2>2. Check the seat configuration</h2><p>The <a href="https://eu.libernovo.com/pages/faqs">manufacturer's regional FAQ</a> describes 45 cm and 48 cm Omni seat-depth options. Confirm the dimensions for the exact item being shipped. Do not select a chair solely from a general height range: compare seat depth, seated dimensions and adjustment reach, and check whether the return policy lets you assess fit.</p>${media[1] || ''}
<h2>3. Compare like-for-like totals</h2><ul><li>Same model, generation, seat configuration and condition.</li><li>Included battery, footrest and any other bundle items.</li><li>Delivery charges, taxes and expected dispatch date.</li><li>Any limitations attached to a preorder or promotional offer.</li></ul><p>We do not use the previous early-bird prices as current prices. Read the selected offer before making a price comparison.</p>${media[2] || ''}
<h2>4. Record seller and after-sales terms</h2><p>Check who sells and ships the chair, who handles warranty claims, the return window and any return shipping or restocking charges. A marketplace listing does not by itself establish manufacturer authorization. Keep the order description and the applicable terms for reference.</p>${media[3] || ''}
<h2>5. Use Amazon search as a starting point</h2><p>The buying link below searches for the original LiberNovo Omni. Search results can include accessories, other models or unavailable offers. Verify the destination listing before ordering; do not assume it is an Omni Gen, Pro or Maxis offer. If no matching chair is available, return to the model comparison instead of substituting a different product unintentionally.</p><p><a href="/products/libernovo-omni">View the original Omni catalog entry</a></p>${media.slice(4).join('')}`,
    };
  }
  assert.deepEqual(load(patch.content_html)('img').toArray().map(el => load(patch.content_html).html(el)), images);
  return patch;
}
async function main() {
  require('dotenv').config({ path: resolve(__dirname, '../.env.local'), quiet: true });
  const apply = process.argv.includes('--apply');
  const db = require('@supabase/supabase-js').createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, apply ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data: rows, error } = await db.from('blog_posts').select('*').in('slug', [lineup, buying]).eq('status', 'published');
  if (error) throw error;
  assert.equal(rows.length, 2);
  const changes = rows.map(row => ({ row, patch: revise(row) }));
  for (const { row, patch } of changes) assert.deepEqual(revise({ ...row, ...patch }), patch);
  console.log(JSON.stringify({ apply, changes: changes.map(({ row, patch }) => ({ slug: row.slug, changed: row.content_html !== patch.content_html })) }));
  if (!apply) return;
  mkdirSync(resolve(__dirname, 'backups'), { recursive: true });
  writeFileSync(resolve(__dirname, 'backups', `libernovo-lineup-${Date.now()}.json`), JSON.stringify(rows, null, 2), { flag: 'wx' });
  for (const { row, patch } of changes) {
    if (row.content_html === patch.content_html) continue;
    const result = await db.from('blog_posts').update(patch).eq('id', row.id).eq('updated_at', row.updated_at).eq('content_html', row.content_html).select('*').single();
    if (result.error) throw result.error;
    for (const key of Object.keys(row)) if (key !== 'updated_at') assert.deepEqual(result.data[key], Object.hasOwn(patch, key) ? patch[key] : row[key], key);
    console.log('Verified: ' + row.slug);
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
