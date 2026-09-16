const crypto = require("node:crypto");
const fs = require("node:fs");

const registryPath = "content/showrooms/registry.json";
const researchPath = "content/showrooms/asia-pacific-mexico-wave.json";
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const candidates = JSON.parse(fs.readFileSync(researchPath, "utf8"));
const existingSlugs = new Set(registry.stores.map((store) => store.slug));
const brandByName = new Map(registry.catalog.brands.map((brand) => [brand.name.toLowerCase(), brand]));
const counts = {};
let added = 0;

for (const candidate of candidates) {
  if (!candidate.valid || existingSlugs.has(candidate.slug)) continue;
  const brand = candidate.brand ? brandByName.get(candidate.brand.toLowerCase()) : null;
  const appointmentRequired = candidate.appointment === "required";
  registry.stores.push({
    id: crypto.randomUUID(), slug: candidate.slug, name: candidate.name,
    status: "published", country_code: candidate.country_code, city: candidate.city,
    region: candidate.region, address: candidate.address, unit: "",
    latitude: candidate.latitude, longitude: candidate.longitude, timezone: candidate.timezone,
    phone: "", email: "", website_url: candidate.source_url, booking_url: "",
    store_type: "retailer", appointment: candidate.appointment,
    hours: { weekly: {}, exceptions: {} },
    visit_notes: appointmentRequired
      ? "Contact the showroom to book an appointment and confirm the chair you want to try before travelling."
      : "Contact the store before travelling to confirm chair availability and visit arrangements.",
    transport_notes: "", photos: [], source_url: candidate.source_url,
    checked_on: "2026-09-16",
    brands: brand ? [{ brand_id: brand.id, carried: "confirmed", official: "confirmed", source_url: candidate.source_url, checked_on: "2026-09-16" }] : [],
    models: [], updated_at: "2026-09-16T16:00:00.000Z",
  });
  existingSlugs.add(candidate.slug);
  counts[candidate.country_code] = (counts[candidate.country_code] || 0) + 1;
  added += 1;
}

registry.checked_on = "2026-09-16";
fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n");
console.log(`Added ${added} verified stores.`, counts);
