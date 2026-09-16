const fs = require("node:fs");

const registryPath = "content/showrooms/registry.json";
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const stores = new Map(registry.stores.map((store) => [store.slug, store]));
const models = new Map(registry.catalog.models.map((model) => [model.slug, model]));

const links = {
  "haworth-tokyo-showroom": { source: "https://www.haworth.com/ap/en/spaces/showrooms/tokyo.html", models: ["haworth-zody-ii"] },
  "haworth-atlanta": { source: "https://www.haworth.com/na/en/spaces/haworth-spaces/atlanta.html", models: ["haworth-soji"] },
  "haworth-washington-dc": { source: "https://www.haworth.com/na/en/spaces/haworth-spaces/washington-dc.html", models: ["haworth-fern"] },
  "haworth-hyderabad": { source: "https://www.haworth.com/ap/en/spaces/showrooms/hyderabad.html", models: ["haworth-fern", "haworth-zody-ii", "haworth-soji"] },
};

let added = 0;
let upgraded = 0;
for (const [storeSlug, entry] of Object.entries(links)) {
  const store = stores.get(storeSlug);
  if (!store) throw new Error(`Missing store ${storeSlug}`);
  for (const modelSlug of entry.models) {
    const model = models.get(modelSlug);
    if (!model) throw new Error(`Missing model ${modelSlug}`);
    const existing = store.models.find((item) => item.product_id === model.id);
    if (existing) {
      if (existing.trial !== "confirmed") upgraded++;
      Object.assign(existing, { trial: "confirmed", source_url: entry.source, checked_on: "2026-09-17" });
    } else {
      store.models.push({ product_id: model.id, trial: "confirmed", source_url: entry.source, checked_on: "2026-09-17" });
      added++;
    }
  }
  store.updated_at = "2026-09-17T07:30:00.000Z";
}

registry.checked_on = "2026-09-17";
fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
console.log(`Added ${added} and upgraded ${upgraded} source-confirmed Haworth model links.`);
