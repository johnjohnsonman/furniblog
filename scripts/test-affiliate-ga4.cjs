const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const ts = require('typescript');
const mod = { exports: {} };
const code = ts.transpileModule(readFileSync(resolve(__dirname, '../lib/affiliate/links.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const requests = [];
const events = [];
new Function('require', 'module', 'exports', code)(id => {
  if (id.endsWith('/admin')) return { createAdminClient: () => { throw new Error('Unexpected database access'); } };
  if (id.endsWith('/queue-mapper')) return { isUuid: () => false };
  throw new Error(`Unexpected dependency ${id}`);
}, mod, mod.exports);
const oldFetch = global.fetch;
const oldWindow = global.window;
async function main() {
  try {
    global.fetch = async (url, options) => { requests.push({ url, ...options }); return { ok: true }; };
    global.window = { location: { pathname: '/compare/sihoo-m18-vs-sihoo-doro-c300', search: '?email=private@example.test' }, gtag: (...args) => events.push(args) };
    await mod.exports.trackAffiliateClick('sihoo-m18', 'Amazon.com', 'SG');
    assert.deepEqual(events, [['event', 'affiliate_click', { product_id: 'sihoo-m18', retailer: 'amazon', page_path: '/compare/sihoo-m18-vs-sihoo-doro-c300' }]]);
    assert.equal(requests.length, 1);
    assert.equal(requests[0].keepalive, true);
    assert.deepEqual(JSON.parse(requests[0].body), { productId: 'sihoo-m18', retailer: 'Amazon.com', country: 'SG' });
    assert.ok(!JSON.stringify(events).includes('private@'));
    assert.ok(!Object.hasOwn(events[0][2], 'country'));
    assert.ok(!Object.hasOwn(events[0][2], 'value'));
    delete global.window.gtag;
    await mod.exports.trackAffiliateClick('sihoo-m18', 'amazon');
    assert.equal(requests.length, 2);
    global.window.gtag = () => { throw new Error('Blocked analytics'); };
    await mod.exports.trackAffiliateClick('sihoo-m18', 'amazon');
    assert.equal(requests.length, 3);
    global.window.gtag = (...args) => events.push(args);
    global.fetch = async () => { throw new Error('Blocked first-party analytics'); };
    await mod.exports.trackAffiliateClick('sihoo-m18', 'amazon');
    assert.equal(events.length, 2);
  } finally {
    global.fetch = oldFetch;
    if (oldWindow === undefined) delete global.window;
    else global.window = oldWindow;
  }
  console.log('PASS: one GA4 intent event, normalized retailer, no query/geo/revenue payload, independent failure handling; no network writes.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
