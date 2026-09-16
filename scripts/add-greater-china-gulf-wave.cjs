const crypto = require("node:crypto");
const fs = require("node:fs");
const registryPath = "content/showrooms/registry.json";
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const candidates = JSON.parse(fs.readFileSync("content/showrooms/greater-china-gulf-wave.json", "utf8"));
const existing = new Set(registry.stores.map(x => x.slug));
const brandByName = new Map(registry.catalog.brands.map(x => [x.name.toLowerCase(), x]));
const counts = {}; let added = 0;
for (const c of candidates) {
  if (!c.valid || existing.has(c.slug)) continue;
  const brand = c.brand ? brandByName.get(c.brand.toLowerCase()) : null;
  registry.stores.push({
    id:crypto.randomUUID(), slug:c.slug, name:c.name, status:"published", country_code:c.country_code,
    city:c.city, region:c.region, address:c.address, unit:"", latitude:c.latitude, longitude:c.longitude,
    timezone:c.timezone, phone:"", email:"", website_url:c.source_url, booking_url:"", store_type:"retailer",
    appointment:c.appointment, hours:{weekly:{},exceptions:{}},
    visit_notes:c.appointment === "required" ? "Contact the showroom to book an appointment and confirm the chair you want to try before travelling." : "Contact the store before travelling to confirm chair availability and visit arrangements.",
    transport_notes:"", photos:[], source_url:c.source_url, checked_on:"2026-09-16",
    brands:brand ? [{brand_id:brand.id,carried:"confirmed",official:"confirmed",source_url:c.source_url,checked_on:"2026-09-16"}] : [],
    models:[], updated_at:"2026-09-16T15:00:00.000Z"
  });
  existing.add(c.slug); counts[c.country_code]=(counts[c.country_code]||0)+1; added++;
}
registry.checked_on="2026-09-16";
fs.writeFileSync(registryPath, JSON.stringify(registry,null,2)+"\n");
console.log(`Added ${added} verified stores.`, counts);
