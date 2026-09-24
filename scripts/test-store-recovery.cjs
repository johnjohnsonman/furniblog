const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const path = require('node:path');
require('ts-node').register({ project: path.join(__dirname, 'tsconfig.json'), compilerOptions: { lib: ['es2022', 'dom'] } });
const registry = require('../content/showrooms/registry.json');
const { storeSchema } = require('../lib/showrooms/validation.ts');
const { countryName } = require('../lib/showrooms/locations.ts');
const { VERIFIED_COMPARISON_PILOT_SLUGS } = require('../lib/comparisons/verified-pilots.ts');
// Approved deployed baseline: dpl_9SCNiwy7UGJvgfuquZySSkk1w9p3.
// Change this membership gate only after reviewing an intentional registry update.
const published = registry.stores.filter(s => s.status === 'published');
assert.equal(published.length, 3276);
assert.equal(new Set(published.map(s => s.city + ', ' + s.country_code)).size, 1702);
assert.equal(createHash('sha256').update(JSON.stringify(published.map(s => s.id).sort())).digest('hex'), '849bf35424c8b9b53e5892d963d6a1800a90a57610d5c4404fe600a0a66dd6f3');
assert.equal(registry.catalog.brands.length, 33);
for (const id of ['38c732f5-d8e6-4af5-89f6-0766b1dc9d19', '9c92f900-ce93-4e09-b417-53d3741abe37']) {
  const store = registry.stores.find(s => s.id === id);
  assert.equal(store.status, 'draft');
  assert.equal(store.latitude, null);
  assert.equal(store.longitude, null);
}
for (const store of registry.stores) storeSchema.parse(store);
assert.equal(countryName('HK'), 'Hong Kong', 'Server and browser must use the same country label');
assert.equal(new Set(VERIFIED_COMPARISON_PILOT_SLUGS).size, 15);
console.log('PASS: exact public store membership, city/brand coverage, Lamex drafts, registry schema, stable HK label and 15 comparisons coexist');
