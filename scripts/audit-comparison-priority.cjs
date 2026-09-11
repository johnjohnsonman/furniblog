const { readFileSync, mkdirSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { load } = require('cheerio');
const rules = [
  ['price', /\$\s?[\d,]+(?:\.\d+)?/g],
  ['rating', /\d(?:\.\d+)?\s*(?:\/\s*5|out of 5)|aggregate rating/gi],
  ['dimensions_or_weight', /\d+(?:\.\d+)?\s*(?:kg|lbs?|cm|mm|degrees|°)\b/gi],
  ['warranty', /\d+[- ]year\s+warrant/gi],
  ['winner', /wins (?:this|the) matchup|better value|highest[- ]rated|smarter (?:financial|premium) choice/gi],
  ['health', /blood circulation|chronic (?:back|neck)|posture correction|pain relief/gi],
  ['option_absolute', /neither chair offers|includes? (?:one|a headrest) as standard|no headrest (?:option|available)/gi],
];
function inspect(row) {
  const $ = load(row.content_html || '');
  $('script,style').remove();
  const text = [$.text(), row.subtitle, row.excerpt, row.seo_title, row.seo_description,
    ...(Array.isArray(row.faq) ? row.faq.flatMap(f => [f.q, f.a]) : [])].filter(Boolean).join(' ').replace(/\s+/g, ' ');
  const flags = [];
  for (const [kind, pattern] of rules) {
    pattern.lastIndex = 0;
    const match = pattern.exec(text);
    if (match) flags.push({ kind, sample: text.slice(Math.max(0, match.index - 55), match.index + match[0].length + 80) });
  }
  const sources = $('a[href]').toArray().map(el => $(el).attr('href')).filter(href => /^https?:\/\//i.test(href || ''));
  if (!sources.length) flags.push({ kind: 'no_external_body_sources', sample: 'No external source links in authored comparison body.' });
  return { flags, sources };
}
function comparisonSlug(url) {
  try {
    const u = new URL(url);
    if (!['furniblog.com', 'www.furniblog.com'].includes(u.hostname)) return null;
    return u.pathname.match(/^\/compare\/([^/]+)\/?$/)?.[1] || null;
  } catch { return null; }
}
function prioritize(a, b) {
  return b.affiliateEvents - a.affiliateEvents || b.searchClicks - a.searchClicks ||
    b.impressions - a.impressions || b.flags.length - a.flags.length || a.slug.localeCompare(b.slug);
}
async function main() {
  require('dotenv').config({ path: resolve(__dirname, '../.env.local'), quiet: true });
  const s = require('@supabase/supabase-js').createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const gsc = JSON.parse(readFileSync(resolve(__dirname, '../data/gsc/comparison-pages-latest.json'), 'utf8'));
  const comparisons = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await s.from('comparisons').select('id,slug,title,content_html,faq,subtitle,excerpt,seo_title,seo_description,updated_at')
      .eq('status', 'published').order('id').range(offset, offset + 999);
    if (error) throw error;
    comparisons.push(...data);
    if (data.length < 1000) break;
  }
  const end = new Date();
  const start = new Date(end.getTime() - 30 * 86400000);
  const events = new Map();
  let totalEvents = 0, matchedEvents = 0;
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await s.from('affiliate_clicks').select('id,referrer,clicked_at').gte('clicked_at', start.toISOString())
      .lt('clicked_at', end.toISOString()).order('clicked_at').order('id').range(offset, offset + 999);
    if (error) throw error;
    totalEvents += data.length;
    for (const event of data) {
      const slug = comparisonSlug(event.referrer);
      if (slug) { events.set(slug, (events.get(slug) || 0) + 1); matchedEvents++; }
    }
    if (data.length < 1000) break;
  }
  const search = new Map();
  for (const row of gsc.rows) {
    const slug = comparisonSlug(row.keys[0]);
    if (!slug) continue;
    const old = search.get(slug) || { searchClicks: 0, impressions: 0 };
    old.searchClicks += row.clicks; old.impressions += row.impressions;
    search.set(slug, old);
  }
  const rows = comparisons.map(row => ({ slug: row.slug, title: row.title, updatedAt: row.updated_at,
    ...inspect(row), affiliateEvents: events.get(row.slug) || 0, ...(search.get(row.slug) || { searchClicks: 0, impressions: 0 }) })).sort(prioritize);
  const report = { generatedAt: end.toISOString(), inventory: comparisons.length,
    searchRange: gsc.range, searchGeneratedAt: gsc.generatedAt, searchCountry: gsc.country,
    affiliateRange: { start: start.toISOString(), end: end.toISOString(), country: 'all; historical geography unreliable' },
    totalEvents, matchedComparisonEvents: matchedEvents,
    cautions: ['Flags are review candidates, not verified errors.', 'Events are not unique humans, orders or commission.',
      'Search and event windows differ; do not derive a conversion rate.', 'Zero reported search rows do not establish zero demand.'], rows };
  const dir = resolve(__dirname, '../data/seo-audit');
  mkdirSync(dir, { recursive: true });
  const file = resolve(dir, `comparison-priority-${Date.now()}.json`);
  writeFileSync(file, JSON.stringify(report, null, 2), { flag: 'wx' });
  console.log(JSON.stringify({ file, inventory: report.inventory, totalEvents, matchedComparisonEvents: matchedEvents,
    flagged: rows.filter(row => row.flags.length).length, flagCounts: Object.fromEntries([...rules.map(([kind]) => kind), 'no_external_body_sources'].map(kind => [kind, rows.filter(row => row.flags.some(flag => flag.kind === kind)).length])),
    top: rows.slice(0, 12).map(row => ({ ...row, flags: row.flags.map(flag => flag.kind) })) }, null, 2));
}
module.exports = { inspect, comparisonSlug, prioritize };
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
