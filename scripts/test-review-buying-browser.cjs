const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { resolve } = require('node:path');
const { chromium } = require('playwright');
const cases = [
  ['2409644e-ce86-4b4e-9e28-d31f09d9e691', 'herman-miller-sayl', 'Herman Miller Sayl: Reddit Summary & Buying Checks'],
  ['2bbad15d-6f56-4d90-8b8b-c2ae857bd4c1', 'vitra-panton-chair', 'Vitra Panton Chair: Video Summary & US Buying Checks'],
  ['1bf8e255-9465-4eb8-8edc-c1fadf363dd9', 'hay-soft-edge', 'HAY Soft Edge P10: Review Summary & Buying Checks'],
];
async function main() {
  const base = process.argv[2] || 'https://www.furniblog.com';
  const dir = resolve(__dirname, '../data/seo-audit');
  mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    for (const width of [390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      let calls = 0;
      await context.route('**/*', route => {
        const u = new URL(route.request().url());
        if (/google-analytics\.com$|googletagmanager\.com$|clarity\.ms$|vercel-insights\.com$|amazon\.(com|sg)$/.test(u.hostname)) return route.abort();
        if (u.pathname === '/api/affiliate/track') { calls++; return route.fulfill({ status: 200, body: '{}' }); }
        if (u.pathname.startsWith('/api/track/')) return route.fulfill({ status: 200, body: '{}' });
        return route.continue();
      });
      await context.addInitScript(() => {
        document.cookie = 'x-country=US; path=/';
        document.addEventListener('click', e => { if (e.target instanceof Element && e.target.closest('a[rel~="sponsored"]')) e.preventDefault(); }, true);
      });
      const page = await context.newPage();
      for (const [id, product, title] of cases) {
        const path = '/reviews/' + id;
        const response = await page.goto(base + path, { waitUntil: 'networkidle', timeout: 90000 });
        assert.equal(response.status(), 200);
        assert.ok((await page.title()).startsWith(title));
        assert.equal(await page.locator('h1').innerText(), title);
        const description = await page.locator('meta[name="description"]').getAttribute('content');
        assert.ok(description.length <= 160 && description.endsWith('.'));
        assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://www.furniblog.com' + path);
        const schema = await page.locator('script[type="application/ld+json"]').first().textContent();
        assert.ok(schema.includes(title.replaceAll('&', '&')));
        const button = page.getByRole('link', { name: /Search on Amazon/ }).first();
        assert.equal(new URL(await button.getAttribute('href')).searchParams.get('tag'), 'furniblog0e-20');
        await button.scrollIntoViewIfNeeded();
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2);
        assert.equal(overflow, false);
        await page.screenshot({ path: resolve(dir, `review-buying-${product}-${width}.png`) });
        const before = calls;
        const logged = page.waitForResponse(r => new URL(r.url()).pathname === '/api/affiliate/track');
        await button.click();
        await logged;
        const events = await page.evaluate(() => (window.dataLayer || []).filter(e => e[0] === 'event' && e[1] === 'affiliate_click').map(e => e[2]));
        assert.equal(events.length, 1);
        assert.equal(events[0].product_id, product);
        assert.equal(calls - before, 1);
        console.log(JSON.stringify({ path, width, metadata: 'pass', overflow, oneClick: true }));
      }
      await context.close();
    }
  } finally { await browser.close(); }
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
