const fs=require("node:fs"),path=require("node:path"),Module=require("node:module"),ts=require("typescript"),assert=require("node:assert/strict");
function load(file){const p=path.resolve(__dirname,"..",file),m=new Module(p,module);m.filename=p;m.paths=Module._nodeModulePaths(path.dirname(p));m.require=n=>n==="./locations"?load("lib/showrooms/locations.ts"):require(n);m._compile(ts.transpileModule(fs.readFileSync(p,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,p);return m.exports;}
const data=require("../content/showrooms/registry.json"),{trialPages}=load("lib/showrooms/trial-pages.ts");
const brands=new Map(data.catalog.brands.map(x=>[x.id,x])),models=new Map(data.catalog.models.map(x=>[x.id,x]));
const stores=data.stores.map(s=>({...s,brands:s.brands.map(b=>({...b,...brands.get(b.brand_id)})),models:s.models.map(m=>({...m,...models.get(m.product_id)}))}));
const pages=trialPages(stores);
assert(pages.length>0);assert.equal(new Set(pages.map(x=>x.path)).size,pages.length);assert(pages.every(x=>x.stores.length&&x.productSlug&&x.cityKey));
for(const page of pages)for(const store of page.stores)assert(store.models.some(m=>m.product_id===page.productId&&m.trial==="confirmed"));
assert(pages.some(x=>x.path==="/stores/try/steelcase-leap-v2/hong-kong"));
assert(pages.some(x=>x.path==="/stores/try/herman-miller-embody/dubai"));
console.log(JSON.stringify({trialPages:pages.length,linkedStores:new Set(pages.flatMap(x=>x.stores.map(s=>s.id))).size,checks:["confirmed models only","unique paths","store-model integrity","Hong Kong and Dubai routes"]}));
