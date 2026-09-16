const fs=require("node:fs");
const path="content/showrooms/registry.json",r=JSON.parse(fs.readFileSync(path,"utf8"));
const bySlug=new Map(r.stores.map(x=>[x.slug,x])),models=new Map(r.catalog.models.map(x=>[x.slug,x]));
const sourceSteelcase="https://shop.steelcase.com/pages/where-to-try";
const sourceDubai="https://www.hermanmiller.com/en_eur/contact/dubai-showroom/";
const links={
  "ekobor-causeway-bay":["steelcase-karman","steelcase-leap-v2","steelcase-series-2","steelcase-series-1"],
  "ekobor-kowloon-bay":["steelcase-gesture","steelcase-leap-v2","steelcase-series-2"],
  "ekobor-kai-tak":["steelcase-gesture","steelcase-karman","steelcase-leap-v2","steelcase-think-v2","steelcase-series-2","steelcase-series-1"],
  "herman-miller-dubai":["herman-miller-cosm-high-back","herman-miller-embody"]
};
let linked=0;
for(const [storeSlug,modelSlugs] of Object.entries(links)){const store=bySlug.get(storeSlug);if(!store)throw new Error(`Missing store ${storeSlug}`);const source=storeSlug==="herman-miller-dubai"?sourceDubai:sourceSteelcase;for(const slug of modelSlugs){const model=models.get(slug);if(!model)throw new Error(`Missing model ${slug}`);if(store.models.some(x=>x.product_id===model.id))continue;store.models.push({product_id:model.id,trial:"confirmed",source_url:source,checked_on:"2026-09-17"});linked++;}store.updated_at="2026-09-17T03:30:00.000Z";}
fs.writeFileSync(path,JSON.stringify(r,null,2)+"\n");console.log(`Linked ${linked} source-confirmed store-model records.`);
