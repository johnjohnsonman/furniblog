import assert from "node:assert/strict";
import { resolveStoreModel, filterStores } from "../lib/showrooms/domain";
import registry from "../content/showrooms/registry.json";
import { storeSchema } from "../lib/showrooms/validation";

const models = registry.catalog.models;
const emptySlugModel = models.find(model => model.slug === "");
assert.ok(emptySlugModel, "Regression fixture includes a model with an empty slug");
assert.equal(resolveStoreModel("", models), "", "Missing/empty model query must not select an empty slug");
assert.equal(resolveStoreModel("unknown-model", models), "");
assert.equal(resolveStoreModel(emptySlugModel.id, models), emptySlugModel.id);
const slugModel = models.find(model => model.slug);
assert.ok(slugModel);
assert.equal(resolveStoreModel(slugModel.slug, models), slugModel.id);
assert.equal(resolveStoreModel(slugModel.id, models), slugModel.id);
const published = registry.stores.map(store => storeSchema.parse(store)).filter(store => store.status === "published");
const results = filterStores(published, { q: "", brand: "", model: resolveStoreModel("", models), confirmed: false, appointment: "", type: "" });
assert.deepEqual(new Set(results.map(store => store.id)), new Set(published.map(store => store.id)), "Unfiltered results must match published source records, not a fixed count");
console.log("PASS: absent/empty/unknown model, explicit ID/slug, and unfiltered published source parity");
