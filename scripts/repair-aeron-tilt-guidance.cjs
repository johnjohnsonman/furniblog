const assert = require('node:assert/strict');
const { mkdirSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { load } = require('cheerio');
const slug = 'herman-miller-aeron-tilt-lock-why-your-chair-still-moves-and-why-that-s-normal';
const marker = 'aeron-tilt-evidence-20260911';
const guide = 'https://www.hermanmiller.com/content/dam/hermanmiller/documents/user_information/aeron_chairs_user_adjustment_guide.pdf';
function revise(row) {
  const $ = load(row.content_html, null, false);
  assert.equal($('iframe,video').length, 0, 'Review complex media manually');
  const images = $('img').toArray().map(el => $.html(el));
  assert.equal(images.length, 4, 'Unexpected media changed');
  return {
    title: 'Herman Miller Aeron Tilt Limiter: Adjustments and Troubleshooting',
    subtitle: 'Recline resistance, range limits and when to request an inspection',
    excerpt: 'Understand Aeron tilt tension and the tilt limiter, check your installed controls, and distinguish adjustment questions from a chair that needs inspection.',
    seo_title: 'Aeron Tilt Limiter: Adjustment and Troubleshooting Guide',
    seo_description: 'Aeron still moving? Learn how tilt tension differs from the tilt limiter, when to request inspection, and what to check before buying a replacement.',
    content_html: `<p id="${marker}">The Aeron's tilt limiter restricts recline range; tilt tension changes the resistance felt when leaning back. Movement alone does not establish whether a particular chair is working correctly. This guide is not an inspection or a repair diagnosis.</p>
<h2>Tilt tension and the tilt limiter do different jobs</h2><p>In <a href="${guide}" target="_blank" rel="noopener noreferrer">Herman Miller's Aeron adjustment guide</a>, the right-side tension control increases resistance toward + and decreases it toward -. The tilt limiter sets the permitted recline range. Match the illustrated controls to your chair; do not assume every version or configuration uses identical adjustments.</p>${images[0]}
<h2>Check your controls before considering replacement</h2><p>Identify your model and installed options, then follow its adjustment guide. Changing resistance is not evidence that looseness or a damaged mechanism has been repaired. Do not force controls or dismantle the mechanism based on this article.</p><p>For the other adjustments, see our <a href="/blog/how-to-use-the-herman-miller-aeron-a-complete-control-guide">Aeron control guide</a>.</p>${images[1]}
<h2>When to request an inspection</h2><p>If the chair feels unstable, a control releases unexpectedly, or you notice visible damage, stop using it and contact the seller or manufacturer for assessment. Describe the movement, identify the chair and provide photos or a video when requested. We cannot specify an acceptable amount of play from text alone or confirm that your chair is safe.</p>${images[2]}
<h2>What to compare if you decide to buy another Aeron</h2><p>Record the size, version and control options you need before comparing offers. Check whether the listed chair is new, used or refurbished, which seller supplies it, and the return and warranty terms. A product title alone does not establish configuration or seller authorization.</p><p>Use the <a href="/blog/herman-miller-aeron-size-guide-how-to-choose-between-a-b-and-c">Aeron size guide</a> and <a href="/products/herman-miller-aeron">Aeron product page</a> to continue your comparison. A replacement is not automatically necessary because you have a question about the tilt limiter.</p>${images[3]}`,
  };
}
async function main() {
  require('dotenv').config({ path: resolve(__dirname, '../.env.local'), quiet: true });
  const apply = process.argv.includes('--apply');
  const db = require('@supabase/supabase-js').createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, apply ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data: row, error } = await db.from('blog_posts').select('*').eq('slug', slug).eq('status', 'published').single();
  if (error) throw error;
  const patch = revise(row);
  assert.deepEqual(revise({ ...row, ...patch }), patch, 'Idempotence');
  const images = html => { const $ = load(html); return $('img').toArray().map(el => $.html(el)); };
  assert.deepEqual(images(patch.content_html), images(row.content_html));
  const changed = Object.keys(patch).filter(key => patch[key] !== row[key]);
  console.log(JSON.stringify({ apply, slug, changed }));
  if (!apply || !changed.length) return;
  mkdirSync(resolve(__dirname, 'backups'), { recursive: true });
  writeFileSync(resolve(__dirname, 'backups', `aeron-tilt-${Date.now()}.json`), JSON.stringify(row, null, 2), { flag: 'wx' });
  const result = await db.from('blog_posts').update(patch).eq('id', row.id).eq('content_html', row.content_html).eq('updated_at', row.updated_at).select('*').single();
  if (result.error) throw result.error;
  for (const key of Object.keys(row)) if (key !== 'updated_at') assert.deepEqual(result.data[key], Object.hasOwn(patch, key) ? patch[key] : row[key], key);
  console.log('PASS: article and metadata updated; original media, URL and other fields preserved.');
}
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
