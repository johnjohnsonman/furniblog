const { createPrivateKey, sign } = require('node:crypto');
const { readFileSync, mkdirSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
require('dotenv').config({ path: resolve(__dirname, '../.env.gsc.local'), quiet: true });
require('dotenv').config({ path: resolve(__dirname, '../.env.local'), quiet: true });
async function main() {
  let credentials;
  if (process.env.GSC_CREDENTIALS_FILE) {
    try {
      credentials = JSON.parse(readFileSync(process.env.GSC_CREDENTIALS_FILE, 'utf8'));
    } catch { throw new Error('GSC credentials file could not be read as JSON'); }
    if (credentials.type !== 'service_account') throw new Error('GSC credentials must be a service account');
  }
  const email = credentials?.client_email || process.env.GSC_CLIENT_EMAIL;
  const pem = (credentials?.private_key || process.env.GSC_PRIVATE_KEY?.replace(/\\n/g, '\n') || '')
    .trim()
    .replace(/^["']/, '')
    .replace(/["'],?\s*$/, '');
  const site = 'sc-domain:chairpedia.com';
  if (!email || !pem || !site) throw new Error('Missing GSC environment configuration');
  let key;
  try { key = createPrivateKey(pem); } catch { throw new Error('GSC private key cannot be parsed; credentials were not sent'); }
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({
    iss: email, scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 600,
  })}`;
  const assertion = `${unsigned}.${sign('RSA-SHA256', Buffer.from(unsigned), key).toString('base64url')}`;
  const auth = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
    signal: AbortSignal.timeout(30000),
  });
  const token = await auth.json();
  if (!auth.ok || !token.access_token) throw new Error(`Google authentication failed: HTTP ${auth.status}; ${token.error || 'no token'}`);
  const request = async (url, body) => {
    const response = await fetch(url, {
      method: body ? 'POST' : 'GET',
      headers: { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(30000),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(`Search Console request failed: HTTP ${response.status}; ${data.error?.status || 'API error'}`);
    return data;
  };



 const paths=['/stores','/stores/locations','/stores/locations/mexico','/stores/locations/new-zealand','/stores/locations/india','/stores/locations/singapore','/stores/locations/malaysia','/stores/locations/thailand','/stores/locations/indonesia','/stores/locations/vietnam','/stores/locations/philippines','/stores/locations/hong-kong','/stores/locations/taiwan','/stores/locations/united-arab-emirates','/stores/locations/saudi-arabia','/stores/try/steelcase-leap-v2/hong-kong','/stores/try/herman-miller-embody/dubai'];
 const base='https://www.googleapis.com/webmasters/v3/sites/'+encodeURIComponent('sc-domain:chairpedia.com');
 const checkedAt=new Date().toISOString(),endDate=checkedAt.slice(0,10),startDate=new Date(Date.now()-28*86400000).toISOString().slice(0,10);
 const inspections=await Promise.all(paths.map(async path=>{const r=await request('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',{inspectionUrl:'https://www.chairpedia.com'+path,siteUrl:'sc-domain:chairpedia.com',languageCode:'en-US'});return {path,status:r.inspectionResult?.indexStatusResult};}));
 const analytics=await request(base+'/searchAnalytics/query',{startDate,endDate,dimensions:['page'],type:'web',dataState:'all',rowLimit:25000,dimensionFilterGroups:[{filters:[{dimension:'page',operator:'contains',expression:'/stores'}]}]});
 const sitemaps=await request(base+'/sitemaps');const dir=resolve(__dirname,'../data/search-growth/store-tracking');mkdirSync(dir,{recursive:true});let previous;try{previous=JSON.parse(readFileSync(dir+'/latest.json','utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
 const changes=inspections.map(x=>({path:x.path,previous:previous?.inspections.find(y=>y.path===x.path)?.status?.coverageState||null,current:x.status?.coverageState}));
 const result={checkedAt,site:'sc-domain:chairpedia.com',period:{startDate,endDate},inspections,analytics,sitemaps,changes,note:'On-demand snapshot, not a scheduled monitor. Search performance may be delayed. URL Inspection reads Google index state; it does not submit indexing requests.'};
 const snapshot=dir+'/'+checkedAt.replace(/[:.]/g,'-')+'.json';writeFileSync(snapshot,JSON.stringify(result,null,2));writeFileSync(dir+'/latest.json',JSON.stringify(result,null,2));console.log(JSON.stringify({snapshot,changes,analyticsRows:analytics.rows?.length||0,sitemaps}));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
