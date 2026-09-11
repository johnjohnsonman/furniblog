const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const ts = require('typescript');
function load(file, imports) {
  const code = ts.transpileModule(readFileSync(resolve(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', code)(id => {
    assert.ok(Object.hasOwn(imports, id), `Unexpected import: ${id}`);
    return imports[id];
  }, mod, mod.exports);
  return mod.exports;
}
let row, denied = false, jobs, writes, generationCalls, mutateOnWrite, failWrite;
const html = '<p>' + 'Evidence-based comparison. '.repeat(8) + '</p><a href="https://manufacturer.example/specs">Specifications</a>';
function reset(extra = {}) {
  row = { id: 'entry', slug: 'pair', title: 'Pair', status: 'draft', updated_at: '2026-01-01T00:00:00Z',
    gen_status: null, published_at: null, product_a_id: 'a', product_b_id: 'b', content_html: html, faq: [], ...extra };
  jobs = []; writes = []; generationCalls = 0; denied = false; mutateOnWrite = null; failWrite = null;
}
function db() {
  return { from(table) {
    let payload, filters = [];
    const q = {
      select() { return q; }, eq(key, value) { filters.push([key, value]); return q; },
      is(key, value) { filters.push([key, value]); return q; }, in() { return q; },
      update(value) { payload = value; return q; },
      async run() {
        if (table === 'products') return { data: [{ id: 'a', slug: 'a' }, { id: 'b', slug: 'b' }], error: null };
        if (payload && mutateOnWrite) { mutateOnWrite(); mutateOnWrite = null; }
        if (payload && failWrite) return { data: null, error: failWrite };
        const match = row && filters.every(([key, value]) => row[key] === value);
        if (!match) return { data: null, error: null };
        if (payload) { row = { ...row, ...payload }; writes.push(payload); }
        return { data: structuredClone(row), error: null };
      },
      async maybeSingle() { return q.run(); }, async single() { return q.run(); },
      then(a, b) { return q.run().then(a, b); },
    };
    return q;
  } };
}
const imports = {
  'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) }, after: job => jobs.push(job) },
  '@/lib/admin/api-auth': { requireAdmin: () => denied ? { status: 401 } : null },
  '@/lib/admin/api-response': { jsonInternalError: error => ({ status: 500, body: { error: error.message } }) },
  '@/lib/supabase/admin': { createAdminClient: db },
  '@/lib/comparisons/resolve': { loadProductInput: async (_, id) => ({ id, name: id }) },
  '@/lib/comparisons/generate': { generateComparisonDraft: async () => {
    generationCalls++;
    return { draft: { title: 'Generated', content_html: html, faq: [], tier: 'mixed' }, usage: { costUsd: 0, inputTokens: 0, outputTokens: 0 } };
  } },
  cheerio: require('cheerio'),
};
const edit = load('app/api/admin/comparisons/[id]/route.ts', imports);
const gen = load('app/api/admin/comparisons/[id]/generate/route.ts', imports);
const context = { params: Promise.resolve({ id: 'entry' }) };
const req = body => ({ json: async () => body });
const start = () => gen.POST(req({ productASlug: 'a', productBSlug: 'b' }), context);
async function main() {
  reset(); denied = true;
  assert.equal((await start()).status, 401);
  assert.equal((await edit.PATCH(req({}), context)).status, 401);
  for (const extra of [{ status: 'published' }, { gen_status: 'generating' }]) {
    reset(extra); assert.equal((await start()).status, 409); assert.equal(writes.length, 0); assert.equal(jobs.length, 0);
  }
  reset(); row = null; assert.equal((await start()).status, 404);
  reset(); assert.equal((await gen.POST(req(null), context)).status, 400);
  reset(); assert.equal((await start()).status, 200); assert.equal(row.gen_status, 'generating');
  assert.equal((await edit.PATCH(req({ status: 'published', reviewed: true }), context)).status, 409);
  await jobs[0](); assert.equal(row.status, 'draft'); assert.equal(row.gen_status, 'done'); assert.equal(generationCalls, 1);
  reset(); await start(); row = { ...row, status: 'published', title: 'Human edit' };
  await jobs[0](); assert.equal(row.title, 'Human edit'); assert.equal(row.status, 'published');
  reset(); await start(); row = { ...row, updated_at: 'newer', title: 'Concurrent edit' };
  await jobs[0](); assert.equal(row.title, 'Concurrent edit');
  reset(); failWrite = { code: '42501', message: 'denied' };
  assert.equal((await start()).status, 500); assert.equal(jobs.length, 0);
  for (const body of [null, { status: 'invalid' }, { status: 'published' }, { status: 'published', reviewed: 'true' },
    { status: 'published', reviewed: true, content_html: '<p>Empty</p>' },
    { status: 'published', reviewed: true, content_html: '<p>' + 'No sources '.repeat(30) + '</p>' },
    { status: 'published', reviewed: true, product_a_slug: '' }, { faq: [{ q: 'Question', a: 42 }] }]) {
    reset(); assert.equal((await edit.PATCH(req(body), context)).status, 400); assert.equal(writes.length, 0);
  }
  reset(); assert.equal((await edit.PATCH(req({ status: 'published', reviewed: true }), context)).status, 200);
  assert.equal(row.status, 'published'); assert.ok(row.published_at);
  assert.equal((await edit.PATCH(req({ title: 'Unreviewed live update' }), context)).status, 400);
  assert.equal((await edit.PATCH(req({ status: 'draft' }), context)).status, 200);
  reset(); mutateOnWrite = () => { row.updated_at = 'concurrent'; };
  assert.equal((await edit.PATCH(req({ title: 'Stale' }), context)).status, 409); assert.equal(row.title, 'Pair');
  let prompt;
  process.env.ANTHROPIC_API_KEY = 'mock-only';
  class FakeAnthropic { messages = { create: async args => {
    prompt = args.messages[0].content;
    return { usage: { input_tokens: 0, output_tokens: 0 }, content: [{ type: 'text', text: 'TITLE: Pair\n===BODY===\n' + html }] };
  } }; }
  const generator = load('lib/comparisons/generate.ts', { '@anthropic-ai/sdk': FakeAnthropic });
  const product = { name: 'Chair', brand: 'Brand', category: 'office', priceLabel: 'UNVERIFIED_PRICE_SENTINEL', rating: 9.87654321,
    reviewCount: 987654321, specs: {}, description: '', prosFromReviews: [], consFromReviews: [], sampleReviews: [] };
  await generator.generateComparisonDraft(product, product);
  assert.doesNotMatch(prompt, /UNVERIFIED_PRICE_SENTINEL|9\.87654321|987654321|a decisive bottom line|Aggregate rating:/);
  assert.match(prompt, /unverified research leads/);
  assert.match(prompt, /private research draft/);
  console.log('PASS: auth, private generation, concurrent-write protection, review/source gates, FAQ validation and withheld price/score inputs. No live AI calls or database writes.');
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
