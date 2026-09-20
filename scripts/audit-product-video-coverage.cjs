// Anonymous read-only catalog audit. Does not claim that video content was reviewed.
const fs = require('node:fs');
const path = require('node:path');
const { config } = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const root = path.resolve(__dirname, '..');
for (const file of [path.join(root,'.env.local'),path.resolve(root,'../..','.env.local')]) if(fs.existsSync(file)) config({path:file,override:false});
async function main() {
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  async function read(table, columns, field, value) {
    const rows=[];
    for(let start=0;;start+=500) {
      const result=await client.from(table).select(columns).eq(field,value).order('id').range(start,start+499);
      if(result.error) throw new Error(result.error.message);
      rows.push(...result.data);
      if(result.data.length<500) return rows;
    }
  }
  const [products,videos]=await Promise.all([read('products','id,slug,name','published',true),read('videos','id,chair_id,youtube_id,title,channel_title,published_at,view_count','status','published')]);
  const byProduct=new Map();
  for(const video of videos) {
    if(!byProduct.has(video.chair_id)) byProduct.set(video.chair_id,[]);
    byProduct.get(video.chair_id).push(video);
  }
  const records=products.map(p=>{
    const linked=byProduct.get(p.id)||[];
    return {slug:p.slug,name:p.name,videoCount:linked.length,needsMetadataReview:linked.filter(v=>!v.title||!v.channel_title||!/^[\w-]{11}$/.test(v.youtube_id)).length,videos:linked.map(v=>({youtubeId:v.youtube_id,title:v.title,channel:v.channel_title,url:`https://www.youtube.com/watch?v=${v.youtube_id}`}))};
  }).sort((a,b)=>a.videoCount-b.videoCount||a.slug.localeCompare(b.slug));
  const productIds=new Set(products.map(p=>p.id));
  const report={generatedAt:new Date().toISOString(),productionWrites:0,contentReviewed:false,summary:{publishedProducts:products.length,publishedVideos:videos.length,productsWithVideos:records.filter(r=>r.videoCount>0).length,productsWithoutVideos:records.filter(r=>!r.videoCount).length,videosWithoutPublishedProduct:videos.filter(v=>!productIds.has(v.chair_id)).length},records};
  fs.writeFileSync(path.join(root,'content/reports/product-video-coverage.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report.summary,null,2));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
