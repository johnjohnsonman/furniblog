import assert from "node:assert/strict"
import registry from "../content/showrooms/registry.json"
import { discoveryOrder } from "../lib/showrooms/discovery-order"
import { filterStores, type Filters } from "../lib/showrooms/domain"
import type { StorePreview } from "../lib/showrooms/types"
const stores = registry.stores.filter(s => s.status === "published") as StorePreview[]
const f: Filters = { q: "", country: "", city: "", brand: "", model: "", confirmed: false, appointment: "", type: "" }
const sorted = filterStores(stores, f)
assert.equal(sorted.length, 3276)
assert.equal(new Set(sorted.map(s => s.id)).size, 3276)
assert.deepEqual(new Set(sorted.map(s => s.id)), new Set(stores.map(s => s.id)))
assert.deepEqual(sorted.map(s => s.id), filterStores([...stores].reverse(), f).map(s => s.id))
assert.deepEqual(sorted.map(s => s.id), discoveryOrder(stores).map(s => s.id))
assert.equal(new Set(sorted.slice(0,24).map(s => s.country_code)).size, 24)
assert.deepEqual([...sorted.slice(0,24), ...sorted.slice(24,48)].map(s => s.id), sorted.slice(0,48).map(s => s.id))
for(const country of ["US","JP","SG"]){const result=filterStores(stores,{...f,country});assert.ok(result.every(s=>s.country_code===country));assert.equal(result.length,stores.filter(s=>s.country_code===country).length);assert.deepEqual(result.map(s=>s.id),filterStores([...stores].reverse(),{...f,country}).map(s=>s.id))}
assert.equal(new Set(stores.map(s=>s.city+", "+s.country_code)).size,1702)
assert.equal(registry.stores.filter(s=>s.status==="draft").length,2)
console.log(JSON.stringify({publicStores:sorted.length,cities:1702,first24Countries:sorted.slice(0,24).map(s=>s.country_code),first24Brands:[...new Set(sorted.slice(0,24).flatMap(s=>s.brands.map(b=>b.brand_id)))],first24IDs:sorted.slice(0,24).map(s=>s.id)}))
