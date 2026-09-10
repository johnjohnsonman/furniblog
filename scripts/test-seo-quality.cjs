const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const ts = require('typescript');

function loadTs(file, imports = {}) {
  const source = readFileSync(resolve(__dirname, '..', file), 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', js)((id) => {
    assert.ok(Object.hasOwn(imports, id), `Unexpected dependency ${id}`);
    return imports[id];
  }, module, module.exports);
  return module.exports;
}

async function main() {
  const { collectionFailureReason: reason } = loadTs('lib/reviews/collection-quality.ts');
  const article = 'https://gall.dcinside.com/mgallery/board/view/?id=chair&no=123';
  assert.ok(reason('\ub514\uc2dc\uc778\uc0ac\uc774\ub4dc', article));
  assert.ok(reason(' DC Inside ', article));
  assert.ok(reason('\ub514\uc2dc\uc778\uc0ac\uc774\ub4dc   \uac24\ub7ec\ub9ac', article));
  assert.ok(reason('A chair summary', 'https://gall.dcinside.com/'));
  assert.ok(reason('', article));
  assert.ok(reason('A chair summary', null));
  assert.ok(reason('A chair summary', 'javascript:alert(1)'));
  assert.equal(reason('Firm seat.', article), null);
  assert.equal(reason('\uc88b\uc544\uc694', article), null);
  assert.equal(reason('\u5ea7\u308a\u5fc3\u5730\u304c\u826f\u3044', article), null);
  assert.equal(reason('DC Inside users discuss the seat.', article), null);
  assert.equal(reason('An actual review', 'https://example.com/?review=123'), null);

  let queuedSummary = 'DC Inside';
  let inserts = 0;
  const approvalClient = { from(table) {
    const query = {
      select() { return this; }, eq() { return this; },
      insert() { inserts++; return this; },
      async single() {
        return { error: null, data: table === 'content_queue'
          ? { id: 'queue', status: 'processed', item_id: 'product', source_type: 'dcinside', source_url: article, ai_output: { summary: queuedSummary, scores: {} } }
          : { id: 'new-review' } };
      },
    };
    return query;
  } };
  const { POST } = loadTs('app/api/pipeline/approve/route.ts', {
    'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } },
    '@/lib/pipeline/auth': { verifyAdminSecret: () => true },
    '@/lib/supabase/admin': { createAdminClient: () => approvalClient },
    '@/lib/reviews/collection-quality': { collectionFailureReason: reason },
  });
  const request = { json: async () => ({ queueId: 'queue' }) };
  assert.equal((await POST(request)).status, 422);
  assert.equal(inserts, 0, 'Collection failures must not reach database insert');
  queuedSummary = 'Firm seat with adjustable lumbar support.';
  assert.equal((await POST(request)).status, 200);
  assert.equal(inserts, 1, 'Valid collected reviews must still be publishable');

  const { generateChairSchema } = loadTs('lib/seo/schemas.ts');
  const product = { name: 'Example Chair', slug: 'example', brand: 'Example', image: 'https://example.com/chair.jpg', priceUsd: 100, priceLabel: '$100', officialUrl: 'https://example.com/chair' };
  for (const links of [[], [{ url: 'https://amazon.com/s?k=chair', channel: 'amazon', label: 'Amazon' }], [{ url: 'https://amazon.com/dp/B012345678', channel: 'amazon', label: 'Amazon' }]]) {
    const schema = generateChairSchema(product, [{ scores: { overall: 5 } }], links);
    assert.equal(schema['@type'], 'Product');
    assert.equal(schema.name, product.name);
    for (const key of ['offers', 'aggregateRating', 'review', 'availability']) assert.equal(Object.hasOwn(schema, key), false);
  }

  const selected = {};
  const db = {
    products: [{ slug: 'example', updated_at: '2026-08-01T10:00:00Z' }, { slug: 'unknown-date', updated_at: null }],
    reviews: [{ id: 'review', created_at: 'invalid' }],
    brands: [{ slug: 'example' }], news: [],
    chairpedia: [{ slug: 'guide', updated_at: '2026-08-02T10:00:00Z' }],
    comparisons: [], blog_posts: [],
  };
  const client = { from(table) {
    const query = {
      select(fields) { selected[table] = fields; return this; },
      eq() { return this; }, limit() { return this; },
      then(done) { return Promise.resolve({ data: db[table], error: null }).then(done); },
    };
    return query;
  } };
  const sitemap = loadTs('app/sitemap.ts', {
    '@/lib/supabase/public-server': { createPublicServerClient: () => client },
    '@/lib/reviews/exclusion': { runPublicReviewQuery: run => run(true) },
    '@/lib/data': { bestLists: [{ id: 'test' }] },
  }).default;
  const saved = [process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY];
  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.com';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test';
    const entries = await sitemap();
    const entry = path => entries.find(r => new URL(r.url).pathname === path);
    for (const path of ['/', '/best/test', '/brands/example', '/reviews/review', '/products/unknown-date']) {
      assert.equal(Object.hasOwn(entry(path), 'lastModified'), false, path);
    }
    assert.equal(entry('/products/example').lastModified.toISOString(), '2026-08-01T10:00:00.000Z');
    assert.equal(entry('/chairpedia/guide').lastModified.toISOString(), '2026-08-02T10:00:00.000Z');
    assert.equal(selected.products, 'slug, updated_at');
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    assert.ok((await sitemap()).every(r => !Object.hasOwn(r, 'lastModified')));
  } finally {
    for (const [i, key] of ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'].entries()) {
      if (saved[i] === undefined) delete process.env[key]; else process.env[key] = saved[i];
    }
  }
  console.log('PASS: collection guards, Product schema without unverified offers/ratings, and truthful sitemap dates.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
