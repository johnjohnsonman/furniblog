// Submit the live sitemap's URLs to IndexNow (consumed by Bing, Yandex, Seznam, Naver).
// Usage: node scripts/indexnow-submit.cjs [--limit N] [url ...]
// With explicit urls, submits just those; otherwise fetches and submits the whole sitemap.
// The key file is served from public/<key>.txt; keys are not secrets.

const KEY = '4f43f721b9b58ffddf6bba77f7fb176c';
const HOST = 'www.furniblog.com';

async function main() {
  const args = process.argv.slice(2);
  const explicit = args.filter(a => a.startsWith('http'));
  let urls = explicit;
  if (!urls.length) {
    const res = await fetch(`https://${HOST}/sitemap.xml`, { signal: AbortSignal.timeout(60000) });
    if (!res.ok) throw new Error(`sitemap HTTP ${res.status}`);
    const xml = await res.text();
    urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  }
  const limitIdx = args.indexOf('--limit');
  if (limitIdx !== -1) urls = urls.slice(0, Number(args[limitIdx + 1]) || urls.length);
  if (!urls.length) throw new Error('no URLs to submit');
  if (urls.length > 10000) throw new Error('IndexNow caps a batch at 10,000 URLs — split the submission');

  const body = {
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList: urls,
  };
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60000),
  });
  console.log(`submitted ${urls.length} urls → HTTP ${res.status} ${res.statusText}`);
  const text = await res.text();
  if (text) console.log(text.slice(0, 500));
  if (res.status >= 400) process.exitCode = 1;
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
