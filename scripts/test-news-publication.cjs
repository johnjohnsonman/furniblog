const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const ts = require('typescript');
function load(file, imports = {}) {
  const js = ts.transpileModule(readFileSync(resolve(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', js)((id) => {
    assert.ok(Object.hasOwn(imports, id), id);
    return imports[id];
  }, mod, mod.exports);
  return mod.exports;
}
async function main() {
  const publication = load('lib/news/publication.ts');
  const valid = { reviewed: true, url: 'https://example.com/article', title: 'Chair launch', summary: 'A new chair was announced.', whyItMatters: 'Availability remains unconfirmed for US buyers.' };
  assert.equal(publication.newsPublicationError(valid), null);
  for (const patch of [{ reviewed: false }, { reviewed: 'true' }, { url: 'javascript:alert(1)' }, { title: '' }, { summary: null }, { whyItMatters: valid.summary }]) {
    assert.ok(publication.newsPublicationError({ ...valid, ...patch }));
  }
  let allowed = true;
  let writes = [];
  const { PATCH } = load('app/api/admin/news/feature/route.ts', {
    'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } },
    '@/lib/admin/api-auth': { requireAdmin: () => allowed ? null : { status: 401 } },
    '@/lib/news/publication': publication,
    '@/lib/supabase/admin': { createAdminClient: () => ({ from: () => ({
      select() { return this; }, eq() { return this; },
      update(value) { writes.push(value); return this; },
      async maybeSingle() { return { data: { id: 'news', url: valid.url }, error: null }; },
    }) }) },
  });
  const request = (body) => ({ json: async () => body });
  assert.equal((await PATCH(request({ id: 'news', status: 'published' }))).status, 422);
  assert.equal(writes.length, 0);
  assert.equal((await PATCH(request({ id: 'news', ...valid, status: 'published' }))).status, 200);
  assert.equal(writes.at(-1).status, 'published');
  assert.equal((await PATCH(request({ id: 'news', ...valid }))).status, 200);
  assert.equal(writes.at(-1).status, 'hidden');
  assert.equal((await PATCH(request(null))).status, 400);
  allowed = false;
  assert.equal((await PATCH(request({ id: 'news', ...valid, status: 'published' }))).status, 401);
  const { collectNewsForBrand } = load('lib/news/collect.ts', {
    '@/lib/news/sources/google-news': { fetchGoogleNews: async () => ({ query: 'chair', items: [{ url: valid.url, title: valid.title }] }) },
    '@/lib/news/relevance': { checkNewsRelevance: async () => ({ relevant: true, summary: valid.summary, whyItMatters: valid.whyItMatters }) },
    '@/lib/news/slug': { newsSlug: () => 'chair-launch' },
    '@/lib/news/brand-images': { pickBrandImage: () => null },
  });
  for (const concurrent of [false, true]) {
    let inserted = false;
    const supabase = { from: () => ({
      select() { return this; },
      async in() { return { data: [], error: null }; },
      upsert(rows, options) {
        assert.equal(rows[0].status, 'hidden');
        assert.deepEqual(options, { onConflict: 'url', ignoreDuplicates: true });
        inserted = true;
        return { select: async () => ({ data: concurrent ? [] : [{ id: 'new' }], error: null }) };
      },
    }) };
    const result = await collectNewsForBrand({ supabase, brand: 'Example', knownBrands: ['Example'], brandImages: {} });
    assert.ok(inserted);
    assert.equal(result.inserted, concurrent ? 0 : 1);
    assert.equal(result.skippedDuplicates, concurrent ? 1 : 0);
  }
  console.log('PASS: publication validation, approval gate, private saves, auth, collection quarantine and concurrent duplicate preservation');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
