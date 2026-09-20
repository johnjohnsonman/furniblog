const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const base = process.argv[2];
if (!base || !/^https:\/\//.test(base)) throw new Error('Provide deployment HTTPS URL');
const checks=[];
async function request(route, options={}) {
  const start=performance.now();
  if(process.argv.includes('--vercel')) {
    const dir=path.join(__dirname,'../.vercel');
    const output=path.join(dir,'smoke-response.txt');
    const headers=path.join(dir,'smoke-headers.txt');
    const args=['curl',route,'--deployment',base,'--','--silent','--show-error','--output',output,'--dump-header',headers];
    if(options.body) {
      const bodyPath=path.join(dir,'smoke-body.json'); fs.writeFileSync(bodyPath,options.body);
      args.push('--request','POST','--header','Content-Type: application/json','--data-binary',`@${bodyPath}`);
    }
    const cli=path.join(process.env.APPDATA,'npm/node_modules/vercel/dist/vc.js');
    execFileSync(process.execPath,[cli,...args],{stdio:['ignore','pipe','pipe'],timeout:90000});
    const header=fs.readFileSync(headers,'utf8');
    const status=Number([...header.matchAll(/HTTP\/[\d.]+ (\d+)/g)].at(-1)?.[1]);
    checks.push({route,status,cliMilliseconds:Math.round(performance.now()-start),serverTiming:header.match(/server-timing: (.*)/i)?.[1]?.trim()??null});
    assert.equal(status,200,`${route}: ${status}`);
    return fs.readFileSync(output,'utf8');
  }
  const response=await fetch(new URL(route,base),{...options,signal:AbortSignal.timeout(60000)});
  const body=await response.text();
  checks.push({route,status:response.status,milliseconds:Math.round(performance.now()-start),serverTiming:response.headers.get('server-timing')});
  assert.equal(response.status,200,`${route}: ${response.status}`);
  return body;
}
async function main() {
  const html=await request('/chair-fit-calculator?__analytics=off');
  assert.ok(html.includes('Find a chair that fits'));
  const product=await request('/products/steelcase-leap-v2?__analytics=off');
  assert.ok(product.includes('Before choosing'));
  await request('/stores?__analytics=off');
  const configs=JSON.parse(await request('/api/chair-fit/configurations?product=haworth-very-task&market=US'));
  assert.equal(configs.configurations.length,2);
  const empty=JSON.parse(await request('/api/chair-fit/configurations?product=haworth-zody-ii&market=US'));
  assert.equal(empty.configurations.length,0);
  const chosen=configs.configurations.find(c=>c.configuration_key==='with-forward-tilt');
  const evaluated=JSON.parse(await request('/api/chair-fit/configurations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({configurationId:chosen.id,market:'US',heightCm:175,weightKg:150,deskHeightCm:72,armrestsUnderDesk:true})}));
  assert.equal(evaluated.fit.measurements.capacityKg,147.4);
  assert.equal(evaluated.fit.components.weightCapacity,0);
  for(let i=0;i<2;i++) {
    const payload=JSON.parse(await request('/api/recommend',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({useCase:'office',heightCm:175,deskHeightCm:72,armrestsUnderDesk:true})}));
    assert.ok(payload.results.length>0);
    assert.ok(payload.standouts.length>0);
  }
  fs.writeFileSync(path.join(__dirname,'../content/reports/chair-fit-release-smoke.json'),JSON.stringify({base,checkedAt:new Date().toISOString(),browserTest:false,checks},null,2)+'\n');
  console.log(JSON.stringify({passed:true,checks},null,2));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
