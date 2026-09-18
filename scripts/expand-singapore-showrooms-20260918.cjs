const crypto = require("node:crypto");
const fs = require("node:fs");

const checked_on = "2026-09-18";
const candidates = [
  { slug:"haworth-singapore-showroom", name:"Haworth Singapore Showroom", address:"72 Anson Road, #01-01A Anson House, Singapore 079911", phone:"+6567351155", source_url:"https://www.haworth.com/ap/en/spaces/showrooms/singapore.html", appointment:"unknown", brand:"haworth", notes:"Haworth publishes this as its Singapore showroom. Contact the team to confirm visitor access and the seating models currently displayed." },
  { slug:"steelcase-singapore-worklife", name:"Steelcase Singapore WorkLife", address:"83 Clemenceau Avenue, #07-01 UE Square, Singapore 239920", phone:"", source_url:"https://www.steelcase.com/asia-en/find-us/locations/asia-pacific/singapore/", appointment:"required", brand:"steelcase", notes:"Steelcase welcomes clients and project partners by arrangement at this WorkLife showroom. Book ahead and ask which chairs are available to try." },
  { slug:"sihoo-singapore-showroom", name:"SIHOO Singapore Showroom", address:"1 Tampines North Drive 1, #04-02 T-Space, Singapore 528559", phone:"", source_url:"https://sihoo.sg/pages/contact", appointment:"unknown", brand:"sihoo", notes:"SIHOO Singapore publishes this showroom address and weekday opening hours. Confirm holiday hours and the exact model before travelling." },
  { slug:"serone-asia-singapore", name:"Serone Asia Singapore Showroom", address:"3 Ang Mo Kio Industrial Park 2A, #03-01, Singapore 568050", phone:"+6587721326", source_url:"https://seroneasia.com/", appointment:"required", brand:"", notes:"Serone Asia describes this as an appointment-only showroom where visitors can test its ergonomic and office chairs." },
  { slug:"henry-design-centre-singapore", name:"Henry Design Centre", address:"1 Stevens Close, #B1-01, Singapore 257939", phone:"+6567486666", source_url:"https://www.henrydesigncentre.com.sg/", appointment:"walk_in", brand:"", notes:"Henry Design Centre publishes this showroom and an office-chair range. Confirm current opening hours before travelling." },
  { slug:"desmark-furniture-singapore", name:"Desmark Furniture Showroom", address:"13 Tannery Lane, #03-01 Ois Building, Singapore 347776", phone:"+6564387767", source_url:"https://desmarkfurniture.com.sg/", appointment:"walk_in", brand:"", notes:"Desmark publishes this office-furniture showroom and sells office chairs. Contact the store to confirm the current chair display." },
  { slug:"ergotune-singapore-showroom", name:"ErgoTune Singapore Showroom", address:"101 Lorong 23 Geylang, #01-03 Prosper House, Singapore 388399", phone:"", source_url:"https://ergotune.com/pages/showroom", appointment:"walk_in", brand:"", notes:"ErgoTune invites visitors to try its ergonomic chairs at this Singapore showroom. Check its published schedule because Friday is listed as closed." },
  { slug:"hinomi-singapore-showroom", name:"Hinomi Singapore Showroom", address:"12 Kallang Avenue, #03-01 Aperia Mall, Singapore 339511", phone:"+6586709988", source_url:"https://sg.hinomi.co/pages/singapore-showroom", appointment:"walk_in", brand:"", notes:"Hinomi publishes this daily-opening showroom where visitors can try its ergonomic chair range and get fitting advice." },
  { slug:"yoke-office-equipment-singapore", name:"Yoke Office Equipment Showroom", address:"1075 Eunos Avenue 6, #01-169, Singapore 409631", phone:"+6565709590", source_url:"https://yoke.sg/pages/about-us", appointment:"walk_in", brand:"", notes:"Yoke publishes this showroom address and offers office and ergonomic seating. Confirm public-holiday hours before visiting." },
  { slug:"atlas-lifestyle-singapore", name:"Atlas Lifestyle Showroom", address:"50 Genting Lane, #01-01, Singapore 349558", phone:"+6586947930", source_url:"https://atlaslifestyle.com.sg/pages/corporate-order", appointment:"walk_in", brand:"herman-miller", notes:"Atlas Lifestyle invites visitors to try chairs at this showroom and publicly describes Herman Miller seating among its range. Confirm the exact model before travelling." },
  { slug:"xtra-marina-square-singapore", name:"XTRA Marina Square", address:"6 Raffles Boulevard, #02-48 Marina Square, Singapore 039594", phone:"+6563360688", source_url:"https://xtra.com.sg/pages/contact", appointment:"walk_in", brand:"herman-miller", notes:"XTRA identifies this as its walk-in retail showroom and publishes Herman Miller ergonomic chairs in its range. Confirm the exact chair and size before travelling." },
  { slug:"ergoworks-marina-square-singapore", name:"Ergoworks Marina Square", address:"6 Raffles Boulevard, #03-140/141 Marina Square, Singapore 039594", phone:"+6568373370", source_url:"https://corporate.ergoworks.com.sg/pages/ergonomic-talks-roadshows", appointment:"walk_in", brand:"", notes:"Ergoworks publishes this daily-opening ergonomic showroom at Marina Square. Contact the store to confirm the chair models currently displayed." },
  { slug:"comfort-design-singapore", name:"Comfort Design Showroom", address:"110 Eunos Avenue 7, Comfort Design Building, Singapore 409573", phone:"+6567474809", source_url:"https://www.comfortfurniture.com.sg/page/wp-content/uploads/2023/10/Company-Profile-2018-pages_comp.pdf", appointment:"unknown", brand:"", notes:"Comfort Design's company profile identifies a large showroom at this building and publishes an office-chair range. Confirm public access and current hours before travelling." },
];

async function main() {
  const file = "content/showrooms/registry.json";
  const registry = JSON.parse(fs.readFileSync(file, "utf8"));
  const existing = new Set(registry.stores.map((store) => store.slug));
  const research = [];
  let added = 0;
  for (const candidate of candidates) {
    const endpoint = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&maxLocations=1&countryCode=SGP&SingleLine=" + encodeURIComponent(candidate.address);
    const data = await fetch(endpoint).then((response) => response.json());
    const match = data.candidates?.[0];
    const valid = Boolean(match && match.score >= 80 && match.location.x >= 103.55 && match.location.x <= 104.1 && match.location.y >= 1.15 && match.location.y <= 1.5);
    research.push({ ...candidate, geocode_score:match?.score || 0, geocode_match:match?.address || "", latitude:match?.location.y ?? null, longitude:match?.location.x ?? null, valid, checked_on });
    if (!valid || existing.has(candidate.slug)) continue;
    const catalogBrand = candidate.brand ? registry.catalog.brands.find((item) => item.slug === candidate.brand) : null;
    if (candidate.brand && !catalogBrand) throw new Error(`Missing brand ${candidate.brand}`);
    registry.stores.push({
      id:crypto.randomUUID(), slug:candidate.slug, name:candidate.name, status:"published", country_code:"SG", city:"Singapore", region:"Singapore",
      address:candidate.address, unit:"", latitude:match.location.y, longitude:match.location.x, timezone:"Asia/Singapore", phone:candidate.phone, email:"",
      website_url:candidate.source_url, booking_url:"", store_type:"retailer", appointment:candidate.appointment, hours:{weekly:{},exceptions:{}},
      visit_notes:candidate.notes, transport_notes:`The map pin was matched to the published address (${match.address}). Confirm directions before travelling.`, photos:[],
      source_url:candidate.source_url, checked_on,
      brands:catalogBrand ? [{brand_id:catalogBrand.id,carried:"confirmed",official:"confirmed",source_url:candidate.source_url,checked_on}] : [],
      models:[], updated_at:"2026-09-18T16:30:00.000Z"
    });
    existing.add(candidate.slug); added++;
  }
  fs.writeFileSync("research/singapore-showroom-expansion-20260918.json", JSON.stringify({checked_on,scope:"Public chair and workplace showrooms in Singapore",records:research},null,2)+"\n");
  registry.checked_on = checked_on;
  fs.writeFileSync(file, JSON.stringify(registry,null,2)+"\n");
  console.log(JSON.stringify({added,total:registry.stores.length,singapore:registry.stores.filter((store)=>store.country_code==="SG").length,held:research.filter((item)=>!item.valid).map((item)=>item.slug)}));
}
main().catch((error)=>{console.error(error);process.exit(1)});
