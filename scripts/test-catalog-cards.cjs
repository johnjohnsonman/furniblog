const assert = require('node:assert/strict');
require('dotenv').config({path:'.env.local',quiet:true});
process.env.TS_NODE_PROJECT='scripts/tsconfig.json';
require('ts-node/register/transpile-only');require('tsconfig-paths/register');
const Module=require('module'),load=Module._load;
Module._load=function(name,...args){if(name==='server-only')return {};return load.call(this,name,...args)};
const {getProducts,getReviewCounts}=require('../lib/supabase/queries');
const {getCatalogCards,loadCatalogReviewCounts:getCatalogReviewCounts}=require('../lib/supabase/catalog-cards');
(async()=>{
 const start=Date.now(),old=await getProducts(),oldMs=Date.now()-start;
 const t=Date.now(),cards=await getCatalogCards(),cardMs=Date.now()-t;
 assert.equal(cards.length,old.length);
 for(const card of cards){const prior=old.find(p=>p.id===card.id);assert(prior);for(const key of ['name','brand','brandId','category','priceUsd','price','image','rating'])assert.deepEqual(card[key],prior[key],card.id+' '+key)}
 const ids=cards.slice(0,8).map(p=>p.id),prior=await getReviewCounts(ids),counts=await getCatalogReviewCounts();
 for(const id of ids)assert.deepEqual(counts[id],prior[id],id+' review counts');
 console.log(JSON.stringify({pass:true,cards:cards.length,oldMs,cardMs,reviewCountsCompared:ids.length}));
})().catch(e=>{console.error(e.message);process.exitCode=1});
