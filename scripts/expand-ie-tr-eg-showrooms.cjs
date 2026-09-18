const crypto = require("node:crypto");
const fs = require("node:fs");

const candidates = [
  { slug:"humanscale-dublin", name:"Humanscale Dublin", country_code:"IE", city:"Dublin", region:"Dublin", address:"IDA Industrial Estate, Poppintree, Finglas, Dublin 11, Ireland", timezone:"Europe/Dublin", phone:"+35318580910", source_url:"https://eu.humanscale.com/about/company-overview/locations.cfm?countrybuy=6", appointment:"required", brand:"humanscale", notes:"Humanscale lists this Dublin location and asks visitors to call ahead for an appointment." },
  { slug:"kos-ergonomics-dublin", name:"KOS Ergonomics Dublin Showroom", country_code:"IE", city:"Dublin", region:"Dublin", address:"3 Clare Street, Dublin 2, D02 KC82, Ireland", timezone:"Europe/Dublin", phone:"+35316110200", source_url:"https://www.kos.ie/kos-ergonomics-dublin-showroom-m", appointment:"required", brand:"", notes:"KOS identifies this as an appointment-only ergonomic showroom where visitors can try products." },
  { slug:"kos-ergonomics-tipperary", name:"KOS Ergonomics Tipperary Showroom", country_code:"IE", city:"Holycross", region:"Tipperary", address:"Tobins Cross, Holycross, County Tipperary, E41 TP04, Ireland", timezone:"Europe/Dublin", phone:"+35350443341", source_url:"https://www.kos.ie/kos-knowledge-centre", appointment:"required", brand:"", notes:"KOS lists this as one of its two physical ergonomic showrooms and requires an appointment." },
  { slug:"m2-dublin-showroom", name:"M2 Dublin Showroom", country_code:"IE", city:"Dublin", region:"Dublin", address:"Unit 523, Greenogue Business Park, Rathcoole, County Dublin, D24 RY89, Ireland", timezone:"Europe/Dublin", phone:"+35316111025", source_url:"https://www.m2.ie/brands/humanscale/", appointment:"required", brand:"humanscale", notes:"M2 lists this appointment-only Dublin showroom on its Humanscale brand page." },
  { slug:"code-design-istanbul", name:"Code Design", country_code:"TR", city:"Istanbul", region:"Istanbul", address:"Gazi Umur Paşa Sokak, Balmumcu Plaza 2, No. 32, D. 11-12, Beşiktaş, Istanbul 34349, Turkey", timezone:"Europe/Istanbul", phone:"+902123474052", source_url:"https://www.hermanmiller.com/en_gb/where-to-buy/contact-a-dealer/Code%20Design/0013q00002HuKqqAAF/", appointment:"unknown", brand:"herman-miller", notes:"Herman Miller lists Code Design as an accredited partner. Contact the dealer to confirm showroom access and chair availability." },
  { slug:"offixa-edge-cairo", name:"EDGE Store — Offixa Showroom", country_code:"EG", city:"Cairo", region:"Cairo", address:"17 Mostafa El Nahas Street, Nasr City, Cairo, Egypt", timezone:"Africa/Cairo", phone:"+201040980008", source_url:"https://offixa.net/pages/showrooms", appointment:"walk_in", brand:"", notes:"Offixa identifies EDGE Store as its official showroom and lists ergonomic office chairs among the products visitors can experience." },
  { slug:"flaketech-new-cairo", name:"FlakeTech New Cairo Showroom", country_code:"EG", city:"New Cairo", region:"Cairo", address:"Offlex Mall, New Cairo 1, Cairo Governorate, Egypt", timezone:"Africa/Cairo", phone:"+201024454963", source_url:"https://www.flaketech.net/ar", appointment:"unknown", brand:"", notes:"FlakeTech lists this New Cairo showroom and sells ergonomic office chairs. Contact the store before travelling to confirm hours and stock." },
  { slug:"flaketech-obour", name:"FlakeTech Obour Showroom", country_code:"EG", city:"Obour City", region:"Qalyubia", address:"Al Nada Building, First Industrial Zone, Obour City, Qalyubia, Egypt", timezone:"Africa/Cairo", phone:"+201024454963", source_url:"https://www.flaketech.net/ar", appointment:"unknown", brand:"", notes:"FlakeTech lists this Obour showroom and sells ergonomic office chairs. Contact the store before travelling to confirm directions, hours and stock." },
];
const bounds = { IE:[-11,51,-5,56], TR:[25,35,45,43], EG:[24,21,37,32] };

async function main() {
  const registryPath = "content/showrooms/registry.json";
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  const existing = new Set(registry.stores.map((store) => store.slug));
  const research = [];
  let added = 0;
  for (const candidate of candidates) {
    const url = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&maxLocations=1&SingleLine=" + encodeURIComponent(candidate.address);
    const data = await fetch(url).then((response) => response.json());
    const match = data.candidates?.[0];
    const box = bounds[candidate.country_code];
    const valid = Boolean(match && match.score >= 75 && match.location.x >= box[0] && match.location.x <= box[2] && match.location.y >= box[1] && match.location.y <= box[3]);
    research.push({ ...candidate, score:match?.score || 0, matched:match?.address || "", latitude:match?.location.y ?? null, longitude:match?.location.x ?? null, valid, checked_on:"2026-09-18" });
    if (!valid || existing.has(candidate.slug)) continue;
    const catalogBrand = candidate.brand ? registry.catalog.brands.find((item) => item.slug === candidate.brand) : null;
    if (candidate.brand && !catalogBrand) throw new Error(`Missing brand ${candidate.brand}`);
    registry.stores.push({
      id:crypto.randomUUID(), slug:candidate.slug, name:candidate.name, status:"published",
      country_code:candidate.country_code, city:candidate.city, region:candidate.region, address:candidate.address, unit:"",
      latitude:match.location.y, longitude:match.location.x, timezone:candidate.timezone, phone:candidate.phone, email:"",
      website_url:candidate.source_url, booking_url:"", store_type:"retailer", appointment:candidate.appointment,
      hours:{weekly:{},exceptions:{}}, visit_notes:candidate.notes,
      transport_notes:`The map pin was matched to the published address (${match.address}). Confirm directions before travelling.`,
      photos:[], source_url:candidate.source_url, checked_on:"2026-09-18",
      brands:catalogBrand ? [{brand_id:catalogBrand.id,carried:"confirmed",official:"confirmed",source_url:candidate.source_url,checked_on:"2026-09-18"}] : [],
      models:[], updated_at:"2026-09-18T16:00:00.000Z"
    });
    existing.add(candidate.slug); added++;
  }
  fs.writeFileSync("research/ie-tr-eg-showroom-expansion-20260918.json", JSON.stringify(research,null,2)+"\n");
  registry.checked_on = "2026-09-18";
  fs.writeFileSync(registryPath, JSON.stringify(registry,null,2)+"\n");
  console.log(JSON.stringify({added,total:registry.stores.length,held:research.filter((item)=>!item.valid).map((item)=>item.slug)}));
}
main().catch((error)=>{console.error(error);process.exit(1)});
