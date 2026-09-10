const { load } = require('cheerio');

const base = process.argv[2] || 'https://www.furniblog.com';
const slugs = [
  'sihoo-doro-c300-advanced-ergonomic-office-chair-review',
  'sihoo-m18-ergonomic-office-chair',
  'ticova-ergonomic-office-chair',
  'sidiz-t50-office-chair',
  'flexispot-c7-office-chair',
];

async function inspect(slug) {
  const response = await fetch(`${base}/chairpedia/${slug}`, { signal: AbortSignal.timeout(60000) });
  const $ = load(await response.text());
  const schemas = $('script[type="application/ld+json"]').map((_, el) => JSON.parse($(el).text())).get();
  const buyLinks = $('article a[rel~="sponsored"][href*="amazon.com/"]').map((_, el) => $(el).attr('href')).get();
  const alternatives = $('#alternatives a').map((_, el) => $(el).attr('href')).get();
  const targets = [...new Set(alternatives)];
  const targetStatuses = [];
  for (const href of targets) {
    const target = await fetch(new URL(href, base), { signal: AbortSignal.timeout(60000) });
    await target.arrayBuffer();
    targetStatuses.push({ href, status: target.status });
  }
  const result = {
    slug, status: response.status, title: $('title').text(),
    canonical: $('link[rel="canonical"]').attr('href'),
    robots: $('meta[name="robots"]').attr('content') || null,
    h1Count: $('h1').length, articleCharacters: $('article').text().trim().length,
    schemaTypes: schemas.map(s => s['@type']),
    buyLinks: [...new Set(buyLinks)], alternatives: targetStatuses,
    sourceLinks: $('#sources a').length,
  };
  console.log(JSON.stringify(result));
  if (response.status !== 200 || result.h1Count !== 1 || !result.canonical ||
      result.articleCharacters < 1000 || !buyLinks.length ||
      buyLinks.some(url => !new URL(url).searchParams.get('tag')) ||
      /noindex/i.test(result.robots || '') || targetStatuses.some(t => t.status !== 200)) {
    process.exitCode = 1;
  }
}

(async () => {
  for (const slug of slugs) await inspect(slug);
})().catch(error => { console.error(error.message); process.exitCode = 1; });
