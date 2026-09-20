const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
async function main() {
  const input=JSON.parse(fs.readFileSync(path.join(root,'content/reports/product-video-coverage.json'),'utf8')).records.find(r=>r.slug==='steelcase-leap-v2');
  const rows=[];
  for(const video of input.videos) {
    try {
      const response=await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(video.url)}&format=json`,{signal:AbortSignal.timeout(12000)});
      if(!response.ok) throw new Error(`HTTP ${response.status}`);
      const data=await response.json();
      rows.push({...video,metadataStatus:'accessible',currentTitle:data.title,currentChannel:data.author_name,titleMatches:data.title===video.title,channelMatches:data.author_name===video.channel,playbackVerified:false,contentReviewed:false});
    } catch(error) { rows.push({...video,metadataStatus:'unconfirmed',reason:error.message,playbackVerified:false,contentReviewed:false}); }
  }
  const report={checkedAt:new Date().toISOString(),method:'YouTube oEmbed metadata; not a playback or content review',rows};
  fs.writeFileSync(path.join(root,'content/reports/leap-video-review.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
