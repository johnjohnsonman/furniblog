const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const ts = require('typescript');
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.invalid';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only';
const writes = [];
const imports = {
  'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } },
  '@/lib/pipeline/queue-mapper': { isUuid: value => value === 'test-uuid' },
  '@/lib/supabase/admin': { createAdminClient: () => ({ from: () => ({
    select() { return this; }, eq() { return this; },
    async maybeSingle() { return { data: { id: 'test-uuid' } }; },
    async insert(row) { writes.push(row); return { error: null }; },
  }) }) },
};
const mod = { exports: {} };
const js = ts.transpileModule(readFileSync(resolve(__dirname, '../app/api/affiliate/track/route.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
new Function('require', 'module', 'exports', js)(id => { assert.ok(Object.hasOwn(imports, id)); return imports[id]; }, mod, mod.exports);
async function main() {
  for (const geo of ['US', 'KR', 'JP', 'SG', 'FR', 'GB', 'de', null, 'XX', 'ZZ', 'invalid']) {
    const headers = new Headers({ referer: 'https://www.furniblog.com/chairpedia/example' });
    if (geo) headers.set('x-vercel-ip-country', geo);
    const result = await mod.exports.POST({ headers, json: async () => ({ productId: 'example', retailer: 'Amazon', country: 'US' }) });
    assert.equal(result.status, 200);
    assert.equal(writes.at(-1).country, [null, 'XX', 'ZZ', 'invalid'].includes(geo) ? null : geo.toUpperCase());
    assert.equal(writes.at(-1).retailer_name, 'amazon');
    assert.equal(writes.at(-1).referrer, 'https://www.furniblog.com/chairpedia/example');
  }
  const count = writes.length;
  for (const body of [null, {}, { productId: 123, retailer: 'amazon' }, { productId: 'example', retailer: [] }]) {
    assert.equal((await mod.exports.POST({ headers: new Headers(), json: async () => body })).status, 400);
  }
  assert.equal(writes.length, count);
  console.log('PASS: server geolocation, unknown fallback, routing-country independence, input validation and existing click fields. No production writes.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
