const fs = require("node:fs");
const crypto = require("node:crypto");
const path = require("node:path");

const file = path.join(__dirname, "..", "content", "showrooms", "registry.json");
const registry = JSON.parse(fs.readFileSync(file, "utf8"));
const checked = "2026-09-16";
const updated = "2026-09-16T15:00:00.000Z";
const sources = [
  ["coleccion-buenos-aires", "Colección", "AR", "Buenos Aires", "", "Paraguay 1180, C1057AAR Buenos Aires", -34.598097, -58.3837667, "America/Argentina/Buenos_Aires", "https://coleccion.com/", "walk_in", ["Herman Miller"]],
  ["interieur-forma-buenos-aires", "Interieur Forma", "AR", "Buenos Aires", "", "Av. Alicia Moreau de Justo 140, 2nd floor, C1107AAD Buenos Aires", -34.5999085, -58.3674207, "America/Argentina/Buenos_Aires", "https://interieurforma.com/faqs/", "required", ["Herman Miller", "Knoll"]],
  ["brenkier-buenos-aires", "Brenkier", "AR", "Buenos Aires", "", "Av. Ángel Gallardo 613, C1405DGJ Buenos Aires", -34.6055502, -58.4395336, "America/Argentina/Buenos_Aires", "https://brenkier.com.ar/", "unknown", []],
  ["hm-chile-santiago", "HM Chile", "CL", "Santiago", "Vitacura", "Av. Padre Hurtado Norte 2252, Vitacura, Santiago", -33.3793672, -70.5554766, "America/Santiago", "https://www.hmuebles.cl/copia-de-hay", "unknown", ["Herman Miller"]],
  ["dunati-santiago", "Dunati", "CL", "Santiago", "Huechuraba", "Del Valle 932, Huechuraba, Santiago", -33.3874776, -70.6170054, "America/Santiago", "https://store.dunati.com/", "unknown", []],
  ["mobis-sao-paulo", "Mobis", "BR", "São Paulo", "SP", "Av. Lins de Vasconcelos 2106, São Paulo, SP 01538-001", -23.584973, -46.62777, "America/Sao_Paulo", "https://www.mobismoveis.com.br/showroom-de-cadeiras-para-escritorio-em-sao-paulo/", "required", []],
  ["eurekas-sao-paulo", "Eureka's", "BR", "São Paulo", "SP", "Rua do Gasômetro 380, Brás, São Paulo, SP 03004-000", -23.5444829, -46.6225283, "America/Sao_Paulo", "https://www.eurekas.com.br/", "unknown", []],
  ["vitorino-sao-paulo", "Vitorino", "BR", "São Paulo", "SP", "Av. Rudge 545, Bom Retiro, São Paulo", -23.5233612, -46.650695, "America/Sao_Paulo", "https://moveisvitorino.com.br/", "unknown", []],
  ["crusso-12-de-octubre-bogota", "Crussó 12 de Octubre", "CO", "Bogotá", "", "Carrera 30 #73-15, Bogotá", 4.6686617, -74.0729653, "America/Bogota", "https://crusso.com.co/", "walk_in", []],
  ["crusso-san-patricio-bogota", "Crussó San Patricio", "CO", "Bogotá", "", "Calle 109 #16-08, Bogotá", 4.6934173, -74.0464687, "America/Bogota", "https://crusso.com.co/", "walk_in", []],
  ["siilla-bogota", "Siilla", "CO", "Bogotá", "", "Calle 79B #51-45, Bogotá", 4.6743962, -74.0700534, "America/Bogota", "https://siilla.com/contacto/", "unknown", []],
  ["ergomotion-lima", "ErgoMotion Peru", "PE", "Lima", "", "CC Cyber Plaza 2B-138, Av. Garcilaso de la Vega 1348, Lima", -12.0568916, -77.0388153, "America/Lima", "https://ergomotionperu.com/", "unknown", []],
  ["ergouno-lima", "ErgoUno", "PE", "Lima", "Santiago de Surco", "Av. Aviación 4641, Santiago de Surco, Lima", -12.1512767, -76.9987879, "America/Lima", "https://ergouno.com/", "unknown", []],
];

const brands = new Map(registry.catalog.brands.map((brand) => [brand.name, brand]));
for (const [slug, name, country, city, region, address, latitude, longitude, timezone, source, appointment, names] of sources) {
  if (registry.stores.some((store) => store.slug === slug)) continue;
  registry.stores.push({
    id: crypto.randomUUID(), slug, name, status: "published", country_code: country,
    city, region, address, unit: "", latitude, longitude, timezone, phone: "", email: "",
    website_url: source, booking_url: appointment === "required" ? source : "",
    store_type: "retailer", appointment,
    hours: { weekly: {}, exceptions: {} },
    visit_notes: "Contact the store before travelling to confirm chair availability and visit arrangements.",
    transport_notes: "", photos: [], source_url: source, checked_on: checked,
    brands: names.map((brandName) => {
      const brand = brands.get(brandName);
      if (!brand) throw new Error(`Unknown brand: ${brandName}`);
      return { brand_id: brand.id, carried: "confirmed", official: "confirmed", source_url: source, checked_on: checked };
    }),
    models: [], updated_at: updated,
  });
}
fs.writeFileSync(file, JSON.stringify(registry, null, 2) + "\n");
console.log(`Registry now contains ${registry.stores.length} stores.`);
