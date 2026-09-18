const crypto = require("node:crypto");
const fs = require("node:fs");

const registryPath = "content/showrooms/registry.json";
const fullCatalogPath = "data/showroom-release/catalog.json";
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const fullCatalog = JSON.parse(fs.readFileSync(fullCatalogPath, "utf8"));
const checkedOn = "2026-09-18";
const updatedAt = "2026-09-18T09:00:00.000Z";

function importBrand(slug) {
  let brand = registry.catalog.brands.find((item) => item.slug === slug);
  if (brand) return brand;
  brand = fullCatalog.brands.find((item) => item.slug === slug);
  if (!brand) throw new Error(`Missing catalog brand: ${slug}`);
  registry.catalog.brands.push(brand);
  return brand;
}

function importModel(slug) {
  let model = registry.catalog.models.find((item) => item.slug === slug);
  if (model) return model;
  model = fullCatalog.models.find((item) => item.slug === slug);
  if (!model) throw new Error(`Missing catalog model: ${slug}`);
  registry.catalog.models.push(model);
  return model;
}

const hon = importBrand("hon");
const sihoo = importBrand("sihoo");
const branch = importBrand("branch");
const okamura = importBrand("okamura");
const branchModels = [importModel("branch-ergonomic-chair"), importModel("branch-verve")];

const weekdayHours = (open, close) => ({
  "0": null,
  "1": [{ open, close }],
  "2": [{ open, close }],
  "3": [{ open, close }],
  "4": [{ open, close }],
  "5": [{ open, close }],
  "6": null,
});

const records = [
  {
    slug: "sihoo-healthy-posture-chicago",
    name: "Healthy Posture Store — SIHOO Authorized Dealer",
    country_code: "US", city: "Chicago", region: "IL",
    address: "2554 W Lawrence Avenue, Chicago, IL 60625",
    latitude: 41.9686582, longitude: -87.6932316,
    timezone: "America/Chicago", phone: "+17735965625",
    website_url: "https://www.sihoo.com/pages/sihoo-dealer-locator",
    source_url: "https://www.sihoo.com/pages/sihoo-dealer-locator",
    appointment: "unknown", hours: { weekly: {}, exceptions: {} },
    visit_notes: "SIHOO lists this location as an authorized dealer where visitors can experience its ergonomic chairs. Contact the store before travelling to confirm hours and the exact SIHOO model on display.",
    transport_notes: "The map pin is based on the street address in SIHOO's official dealer locator.",
    brand: sihoo,
  },
  {
    slug: "hon-chicago-flagship", name: "HON Chicago Flagship",
    country_code: "US", city: "Chicago", region: "IL",
    address: "320 N Sangamon Street, Floor 11, Chicago, IL 60607",
    latitude: 41.8874529, longitude: -87.6513613,
    timezone: "America/Chicago", phone: "+16306346914",
    website_url: "https://www.hon.com/about/hon-showrooms/chicago",
    source_url: "https://www.hon.com/about/hon-showrooms/chicago",
    appointment: "required", hours: { weekly: weekdayHours("08:30", "17:00"), exceptions: {} },
    visit_notes: "Book an appointment with HON before visiting. The official showroom page confirms the location and hours; ask the team to confirm the exact chair and configuration you want to try.",
    transport_notes: "The showroom is on floor 11. The map pin is based on the official street address.",
    brand: hon,
  },
  {
    slug: "hon-new-york-showroom", name: "HON New York Showroom",
    country_code: "US", city: "New York", region: "NY",
    address: "245 Fifth Avenue, Suite 1200, New York, NY 10016",
    latitude: 40.7444471, longitude: -73.9872102,
    timezone: "America/New_York", phone: "+12122428903",
    website_url: "https://www.hon.com/about/hon-showrooms/new-york",
    source_url: "https://www.hon.com/about/hon-showrooms/new-york",
    appointment: "required", hours: { weekly: {}, exceptions: {} },
    visit_notes: "This showroom is open by appointment. Ask HON to confirm the exact chair and configuration you want to try when booking.",
    transport_notes: "The showroom is in suite 1200. The map pin is based on the official Manhattan street address.",
    brand: hon,
  },
  {
    slug: "hon-washington-dc-showroom", name: "HON Washington, DC Showroom",
    country_code: "US", city: "Washington", region: "DC",
    address: "1101 Connecticut Avenue NW, Suite 300, Washington, DC 20036",
    latitude: 38.9039933, longitude: -77.0398593,
    timezone: "America/New_York", phone: "+12022231411",
    website_url: "https://www.hon.com/about/hon-showrooms/washington-dc",
    source_url: "https://www.hon.com/about/hon-showrooms/washington-dc",
    appointment: "required", hours: { weekly: weekdayHours("08:30", "17:00"), exceptions: {} },
    visit_notes: "Book an appointment before visiting and confirm the exact chair and configuration you want to test.",
    transport_notes: "Farragut North is directly outside the building. The showroom is in suite 300.",
    brand: hon,
  },
  {
    slug: "hon-muscatine-headquarters-showroom", name: "HON Muscatine Headquarters & Showroom",
    country_code: "US", city: "Muscatine", region: "IA",
    address: "200 Oak Street, Muscatine, IA 52761",
    latitude: 41.424916, longitude: -91.039524,
    timezone: "America/Chicago", phone: "+15632727100",
    website_url: "https://www.hon.com/about/hon-showrooms/muscatine-hon-headquarters",
    source_url: "https://www.hon.com/about/hon-showrooms/muscatine-hon-headquarters",
    appointment: "required", hours: { weekly: {}, exceptions: {} },
    visit_notes: "The headquarters showroom is open by appointment. Confirm the exact chair and configuration you want to try when booking.",
    transport_notes: "HON lists visitor parking across from its headquarters at 200 Oak Street.",
    brand: hon,
  },
  {
    slug: "okamura-tokyo-showroom", name: "Okamura Tokyo Showroom",
    country_code: "JP", city: "Tokyo", region: "Tokyo",
    address: "Hotel New Otani Garden Court, 3rd Floor, 4-1 Kioi-cho, Chiyoda-ku, Tokyo",
    latitude: 35.6793, longitude: 139.7355,
    timezone: "Asia/Tokyo", phone: "+81352762001",
    website_url: "https://www.okamura.com/showrooms/tokyo-showroom/",
    source_url: "https://www.okamura.com/showrooms/tokyo-showroom/",
    appointment: "required", hours: { weekly: weekdayHours("10:00", "17:00"), exceptions: {} },
    visit_notes: "Contact Okamura and reserve before visiting. Confirm the exact chair model and configuration because displays can change.",
    transport_notes: "The showroom is on the third floor of the Garden Court building in the Hotel New Otani complex.",
    brand: okamura,
  },
  {
    slug: "okamura-fukuoka-showroom", name: "Okamura Fukuoka Showroom",
    country_code: "JP", city: "Fukuoka", region: "Fukuoka",
    address: "Meijiyasuda Watanabe Building, 1st Floor, 1-3-3 Hakataekimae, Hakata-ku, Fukuoka",
    latitude: 33.591722, longitude: 130.417194,
    timezone: "Asia/Tokyo", phone: "+81924828822",
    website_url: "https://www.okamura.com/showrooms/fukuoka-showroom/",
    source_url: "https://www.okamura.com/showrooms/fukuoka-showroom/",
    appointment: "required", hours: { weekly: weekdayHours("10:00", "17:00"), exceptions: {} },
    visit_notes: "Contact Okamura and reserve before visiting. Confirm the exact chair model and configuration because displays can change.",
    transport_notes: "The showroom is on the first floor of the Meijiyasuda Watanabe Building near Hakata Station.",
    brand: okamura,
  },
];

const existing = new Set(registry.stores.map((store) => store.slug));
let added = 0;
for (const record of records) {
  if (existing.has(record.slug)) {
    const current = registry.stores.find((store) => store.slug === record.slug);
    if (current && !current.status) current.status = "published";
    continue;
  }
  const { brand, ...store } = record;
  registry.stores.push({
    id: crypto.randomUUID(), ...store, status: "published", unit: "", email: "", booking_url: "",
    store_type: "retailer", photos: [], checked_on: checkedOn,
    brands: [{ brand_id: brand.id, carried: "confirmed", official: "confirmed", source_url: store.source_url, checked_on: checkedOn }],
    models: [], updated_at: updatedAt,
  });
  existing.add(record.slug);
  added++;
}

const branchNewYork = registry.stores.find((store) => store.slug === "branch-new-york");
if (!branchNewYork) throw new Error("Missing Branch New York showroom");
branchNewYork.website_url = "https://www.branchfurniture.com/pages/location/branch-nyc";
branchNewYork.source_url = "https://www.branchfurniture.com/pages/location/branch-nyc";
branchNewYork.updated_at = updatedAt;
const branchRelationship = branchNewYork.brands.find((item) => item.brand_id === branch.id);
if (branchRelationship) Object.assign(branchRelationship, { official: "confirmed", source_url: branchNewYork.source_url, checked_on: checkedOn });
for (const model of branchModels) {
  if (!branchNewYork.models.some((item) => item.product_id === model.id)) {
    branchNewYork.models.push({ product_id: model.id, trial: "confirmed", source_url: "https://www.branchfurniture.com/collections/nyc-showroom-branch", checked_on: checkedOn });
  }
}

registry.checked_on = checkedOn;
fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
console.log(JSON.stringify({ addedStores: added, totalStores: registry.stores.length, branchTrialLinks: branchModels.length }));
