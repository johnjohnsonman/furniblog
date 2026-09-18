const crypto = require("node:crypto");
const fs = require("node:fs");
const checked_on = "2026-09-18";
const candidates = [
  {slug:"humanscale-montreal",name:"Humanscale Montreal",country_code:"CA",city:"Montreal",region:"Quebec",address:"50 Queen Street, Building 1, Suite 202, Montreal, Quebec H3C 2N5, Canada",timezone:"America/Toronto",phone:"",source_url:"https://ca.humanscale.com/about/company-overview/locations.cfm",appointment:"required",brand:"humanscale"},
  {slug:"humanscale-toronto",name:"Humanscale Toronto",country_code:"CA",city:"Toronto",region:"Ontario",address:"555 Richmond Street West, Suite 101, Toronto, Ontario M5V 3B1, Canada",timezone:"America/Toronto",phone:"",source_url:"https://ca.humanscale.com/about/company-overview/locations.cfm",appointment:"required",brand:"humanscale"},
  {slug:"herman-miller-toronto-showroom",name:"Herman Miller Toronto Showroom",country_code:"CA",city:"Toronto",region:"Ontario",address:"109 Atlantic Avenue, Suite 200, Toronto, Ontario M6K 1X4, Canada",timezone:"America/Toronto",phone:"+14163663300",source_url:"https://www.hermanmiller.com/en_au/where-to-buy/visit-a-showroom/Herman%20Miller%20Canada%2C%20Inc./0013100001qntkEAAQ/",appointment:"required",brand:"herman-miller"},
  {slug:"haworth-toronto-showroom",name:"Haworth Toronto Showroom",country_code:"CA",city:"Toronto",region:"Ontario",address:"55 University Avenue, Toronto, Ontario M5J 2H7, Canada",timezone:"America/Toronto",phone:"+14163633486",source_url:"https://www.haworth.com/ap/en/spaces/showrooms/toronto.html",appointment:"required",brand:"haworth"},
  {slug:"dwr-toronto-king-street",name:"Design Within Reach Toronto",country_code:"CA",city:"Toronto",region:"Ontario",address:"214 King Street East, Toronto, Ontario M5A 1J7, Canada",timezone:"America/Toronto",phone:"+14169774003",source_url:"https://store.hermanmiller.com/store?StoreId=28&lang=en_CA",appointment:"walk_in",brand:"herman-miller"},
  {slug:"ergonomic-office-stockholm",name:"Ergonomic Office Stockholm",country_code:"SE",city:"Stockholm",region:"Stockholm",address:"Rosenlundsgatan 40, 118 53 Stockholm, Sweden",timezone:"Europe/Stockholm",phone:"+4686150250",source_url:"https://www.hermanmiller.com/where-to-buy/contact-a-dealer/Ergonomic%20Office/001i000000Iha2mAAB/",appointment:"unknown",brand:"herman-miller"},
];
const bounds={CA:[-141,41,-52,84],SE:[10,55,25,70]};
async function main(){
  const file="content/showrooms/registry.json",registry=JSON.parse(fs.readFileSync(file,"utf8")),existing=new Set(registry.stores.map(s=>s.slug)),research=[];let added=0;
  for(const c of candidates){
    const endpoint="https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&maxLocations=1&SingleLine="+encodeURIComponent(c.address);
    const data=await fetch(endpoint).then(r=>r.json()),m=data.candidates?.[0],b=bounds[c.country_code];
    const valid=Boolean(m&&m.score>=80&&m.location.x>=b[0]&&m.location.x<=b[2]&&m.location.y>=b[1]&&m.location.y<=b[3]);
    research.push({...c,geocode_score:m?.score||0,geocode_match:m?.address||"",latitude:m?.location.y??null,longitude:m?.location.x??null,valid,checked_on});
    if(!valid||existing.has(c.slug))continue;
    const brand=registry.catalog.brands.find(x=>x.slug===c.brand);if(!brand)throw new Error(`Missing brand ${c.brand}`);
    registry.stores.push({id:crypto.randomUUID(),slug:c.slug,name:c.name,status:"published",country_code:c.country_code,city:c.city,region:c.region,address:c.address,unit:"",latitude:m.location.y,longitude:m.location.x,timezone:c.timezone,phone:c.phone,email:"",website_url:c.source_url,booking_url:"",store_type:"retailer",appointment:c.appointment,hours:{weekly:{},exceptions:{}},visit_notes:`The official source publishes this location. Contact the team before travelling to confirm access, hours and the exact chairs available to try.`,transport_notes:`The map pin was matched to the published address (${m.address}). Confirm directions before travelling.`,photos:[],source_url:c.source_url,checked_on,brands:[{brand_id:brand.id,carried:"confirmed",official:"confirmed",source_url:c.source_url,checked_on}],models:[],updated_at:"2026-09-18T17:30:00.000Z"});existing.add(c.slug);added++;
  }
  fs.writeFileSync("research/onelink-showroom-expansion-20260918.json",JSON.stringify({checked_on,records:research},null,2)+"\n");registry.checked_on=checked_on;fs.writeFileSync(file,JSON.stringify(registry,null,2)+"\n");console.log(JSON.stringify({added,total:registry.stores.length,held:research.filter(x=>!x.valid).map(x=>x.slug)}));
}
main().catch(e=>{console.error(e);process.exit(1)});
