const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const ts = require('typescript');
const calls = [];
let failure = false;
let offline = false;
const client = { from(table) {
  calls.push(['from', table]);
  return {
    select(value) { calls.push(['select', value]); return this; },
    in(key, value) { calls.push(['in', key, value]); return this; },
    eq(key, value) { calls.push(['eq', key, value]); return this; },
    order(key, value) { calls.push(['order', key, value]); return this; },
    async limit(value) {
      calls.push(['limit', value]);
      return { error: failure ? { message: 'test failure' } : null, data: [
        { slug: 'c300-guide', title: 'C300 guide', products: { slug: 'sihoo-doro-c300' } },
        { slug: '', title: 'Incomplete row' },
      ] };
    },
  };
} };
const js = ts.transpileModule(readFileSync(resolve(__dirname, '../lib/chairpedia/brand-guides.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const mod = { exports: {} };
new Function('require', 'module', 'exports', js)((id) => {
  assert.equal(id, '@/lib/supabase/public-server');
  return { createPublicServerClient() { if (offline) throw new Error('offline'); return client; } };
}, mod, mod.exports);
async function main() {
  const get = mod.exports.getPublishedBrandGuides;
  assert.deepEqual(await get([]), []);
  assert.equal(calls.length, 0);
  assert.deepEqual(await get(['sihoo-doro-c300', 'sihoo-doro-c300']), [{ slug: 'c300-guide', title: 'C300 guide' }]);
  assert.ok(calls.some(c => c[0] === 'select' && c[1].includes('products!inner')));
  assert.deepEqual(calls.find(c => c[0] === 'in'), ['in', 'products.slug', ['sihoo-doro-c300']]);
  assert.deepEqual(calls.find(c => c[0] === 'eq'), ['eq', 'status', 'published']);
  assert.deepEqual(calls.find(c => c[0] === 'limit'), ['limit', 6]);
  failure = true;
  assert.deepEqual(await get(['sihoo-doro-c300']), []);
  offline = true;
  assert.deepEqual(await get(['sihoo-doro-c300']), []);
  console.log('PASS: product-scoped published guides, bounded deterministic query, empty and failure states.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
