const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { config } = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const root = path.resolve(__dirname, '..');
for (const file of [path.join(root,'.env.local'),path.resolve(root,'../..','.env.local')]) {
  if (fs.existsSync(file)) config({path:file,override:false});
}
async function main() {
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url||!key||!anonKey) throw new Error('Read audit requires service and anonymous keys; values are never logged.');
  const options={auth:{persistSession:false,autoRefreshToken:false}};
  const admin=createClient(url,key,options), anon=createClient(url,anonKey,options);
  const expected=JSON.parse(fs.readFileSync(path.join(root,'content/chair-fit-import/configurations-batch-1.json'),'utf8'));
  const products=await admin.from('products').select('id,slug').in('slug',[...new Set(expected.map(r=>r.product_slug))]);
  if(products.error) throw new Error(products.error.message);
  const ids=new Map(products.data.map(p=>[p.slug,p.id]));
  const result=await admin.from('product_fit_configurations').select('*').in('product_id',[...ids.values()]);
  if(result.error) throw new Error(result.error.message);
  let values=0;
  const verified=[];
  for(const row of expected){
    const match=result.data.find(r=>r.product_id===ids.get(row.product_slug)&&r.market_code===row.market_code&&r.configuration_key===row.configuration_key);
    assert.ok(match,`Missing configuration: ${row.product_slug}/${row.configuration_key}`);
    for(const [field,value] of Object.entries(row)) {
      if(field==='product_slug') continue;
      assert.deepEqual(typeof value==='number'?Number(match[field]):match[field],value,`${row.product_slug}/${row.configuration_key}: ${field}`);
      values++;
    }
    for(const field of ['seat_depth_fixed','armrest_floor_height_min','armrest_floor_height_max']) assert.equal(match[field],null,`Unexpected ${field}`);
    if(!('weight_capacity' in row)) assert.equal(match.weight_capacity,null,'Unknown capacity must stay null');
    verified.push(match.id);
  }
  const publicRows=await anon.from('product_fit_configurations').select('id').in('id',verified);
  if(publicRows.error) throw new Error(publicRows.error.message);
  assert.equal(publicRows.data.length,0,'Seed drafts must not be publicly visible');
  const summary={generatedAt:new Date().toISOString(),configurations:expected.length,products:ids.size,comparedFields:values,draftsHiddenFromAnonymous:true,productionWrites:0};
  const dest=path.join(root,'content/reports/fit-configurations-audit.json');
  fs.writeFileSync(dest,JSON.stringify(summary,null,2)+'\n');
  console.log(JSON.stringify(summary,null,2));
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
