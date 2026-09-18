const crypto = require("node:crypto");
const fs = require("node:fs");
const file = "content/showrooms/registry.json";
const registry = JSON.parse(fs.readFileSync(file, "utf8"));
const brand = (slug) => {
  const found = registry.catalog.brands.find((item) => item.slug === slug);
  if (!found) throw new Error(`Missing brand ${slug}`);
  return found;
};
const hermanMiller = brand("herman-miller");
const okamura = brand("okamura");
const checked_on = "2026-09-18";
const records = [
  {
    slug: "mjf-interiors-dublin-showroom", name: "MJF Interiors Dublin Showroom", country_code: "IE",
    city: "Dublin", region: "Dublin", address: "109a Baggot Street Lower, Dublin, D02 V580",
    latitude: 53.33621, longitude: -6.24862, timezone: "Europe/Dublin", phone: "+35315925050",
    website_url: "https://www.mjfinteriors.ie/get-in-touch/", source_url: "https://www.hermanmiller.com/where-to-buy/contact-a-dealer/MJF%20Interiors%20-%20Ireland/001i000000IhZyHAAV/",
    brand: hermanMiller,
    visit_notes: "MJF lists this as its Dublin showroom and Herman Miller lists MJF as an accredited dealer. Contact the showroom before travelling to confirm opening hours and the exact chair model available to try.",
    transport_notes: "The pin is based on the published Baggot Street Lower showroom address."
  },
  {
    slug: "connection-turkey-istanbul", name: "Connection Turkey", country_code: "TR",
    city: "Istanbul", region: "Istanbul", address: "Yüzbaşı Kaya Aldoğan Sokak No. 20, Engin İş Merkezi, Ground Floor, Şişli-Esentepe, Istanbul",
    latitude: 41.071552, longitude: 29.013401, timezone: "Europe/Istanbul", phone: "+902127776444",
    website_url: "https://connectionturkey.com/", source_url: "https://www.okamura.com/dealers/", brand: okamura,
    visit_notes: "Okamura lists Connection Turkey as an official dealer. Contact the dealer before travelling to confirm public showroom access, hours and the exact chair model available to try.",
    transport_notes: "The pin is approximate at street level; use the published No. 20 address and confirm directions before travelling."
  },
  {
    slug: "multi-m-group-mohm-cairo", name: "Multi M Group / MOHM Furniture", country_code: "EG",
    city: "Cairo", region: "Cairo", address: "2 Asmaa Fahmy Street, Heliopolis, Cairo 11341",
    latitude: 30.0804, longitude: 31.3331, timezone: "Africa/Cairo", phone: "+20244698991",
    website_url: "https://mohmfurniture.com/", source_url: "https://www.okamura.com/dealers/", brand: okamura,
    visit_notes: "Okamura lists Multi M Group / MOHM Furniture as an official dealer at this address. Contact the dealer before travelling to confirm public showroom access, hours and the exact chair model available to try.",
    transport_notes: "The pin is approximate near Asmaa Fahmy Street; confirm the entrance and directions before travelling."
  }
];
const existing = new Set(registry.stores.map((store) => store.slug));
let added = 0;
for (const record of records) {
  if (existing.has(record.slug)) continue;
  const { brand: itemBrand, ...store } = record;
  registry.stores.push({
    id: crypto.randomUUID(), ...store, status: "published", unit: "", email: "", booking_url: "",
    store_type: "retailer", appointment: "unknown", hours: { weekly: {}, exceptions: {} }, photos: [],
    checked_on, brands: [{ brand_id: itemBrand.id, carried: "confirmed", official: "confirmed", source_url: store.source_url, checked_on }],
    models: [], updated_at: "2026-09-18T15:00:00.000Z"
  });
  existing.add(record.slug); added++;
}
registry.checked_on = checked_on;
fs.writeFileSync(file, `${JSON.stringify(registry, null, 2)}\n`);
console.log(JSON.stringify({ added, total: registry.stores.length }));
